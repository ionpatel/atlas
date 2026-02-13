-- =============================================================
-- Atlas ERP - Multi-Organization Support Enhancement
-- Allow users to belong to multiple organizations
-- =============================================================

-- =============================================================
-- ORG INVITATIONS
-- Invite users to join organizations
-- =============================================================

create table org_invitations (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations on delete cascade,
  email           text not null,
  role            text not null default 'member' check (role in ('owner', 'admin', 'manager', 'member', 'viewer')),
  invited_by      uuid references auth.users on delete set null,
  token           text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at      timestamptz not null default (now() + interval '7 days'),
  accepted_at     timestamptz,
  created_at      timestamptz not null default now(),
  
  unique (org_id, email)
);

create index idx_org_invitations_org on org_invitations (org_id);
create index idx_org_invitations_email on org_invitations (email);
create index idx_org_invitations_token on org_invitations (token);

-- =============================================================
-- USER ORGANIZATION PREFERENCES
-- Track user's default/active organization
-- =============================================================

create table user_org_preferences (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users on delete cascade unique,
  default_org_id  uuid references organizations on delete set null,
  last_org_id     uuid references organizations on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_user_org_prefs_user on user_org_preferences (user_id);

-- =============================================================
-- RLS POLICIES
-- =============================================================

alter table org_invitations enable row level security;
alter table user_org_preferences enable row level security;

-- Org invitations: admins can manage
create policy "Admins can view invitations" on org_invitations
  for select using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

create policy "Admins can create invitations" on org_invitations
  for insert with check (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

create policy "Admins can delete invitations" on org_invitations
  for delete using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Invitees can view their own invitations
create policy "Users can view their invitations" on org_invitations
  for select using (email = auth.jwt()->>'email');

-- User org preferences: users can manage their own
create policy "Users can view own preferences" on user_org_preferences
  for select using (user_id = auth.uid());

create policy "Users can manage own preferences" on user_org_preferences
  for all using (user_id = auth.uid());

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Get all organizations for a user
create or replace function get_user_organizations(p_user_id uuid)
returns table (
  org_id uuid,
  org_name text,
  org_slug text,
  role text,
  is_owner boolean
) language sql stable security definer as $$
  select 
    o.id as org_id,
    o.name as org_name,
    o.slug as org_slug,
    om.role,
    om.role = 'owner' as is_owner
  from org_members om
  join organizations o on o.id = om.org_id
  where om.user_id = p_user_id
  order by om.role = 'owner' desc, o.name;
$$;

-- Create invitation
create or replace function create_org_invitation(
  p_org_id uuid,
  p_email text,
  p_role text default 'member'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation_id uuid;
  v_existing_member uuid;
begin
  -- Check if user is already a member
  select om.user_id into v_existing_member
  from org_members om
  join auth.users u on u.id = om.user_id
  where om.org_id = p_org_id and u.email = p_email;
  
  if v_existing_member is not null then
    raise exception 'User is already a member of this organization';
  end if;
  
  -- Create or update invitation
  insert into org_invitations (org_id, email, role, invited_by)
  values (p_org_id, p_email, p_role, auth.uid())
  on conflict (org_id, email) do update
  set role = excluded.role,
      invited_by = excluded.invited_by,
      token = encode(gen_random_bytes(32), 'hex'),
      expires_at = now() + interval '7 days',
      accepted_at = null
  returning id into v_invitation_id;
  
  return v_invitation_id;
end;
$$;

-- Accept invitation
create or replace function accept_org_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation record;
  v_user_id uuid;
  v_member_id uuid;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Get invitation
  select * into v_invitation
  from org_invitations
  where token = p_token
    and accepted_at is null
    and expires_at > now();
  
  if v_invitation is null then
    raise exception 'Invalid or expired invitation';
  end if;
  
  -- Verify email matches
  if v_invitation.email != (select email from auth.users where id = v_user_id) then
    raise exception 'Invitation email does not match your account';
  end if;
  
  -- Add user to organization
  insert into org_members (org_id, user_id, role)
  values (v_invitation.org_id, v_user_id, v_invitation.role)
  returning id into v_member_id;
  
  -- Mark invitation as accepted
  update org_invitations
  set accepted_at = now()
  where id = v_invitation.id;
  
  return v_member_id;
end;
$$;

-- Switch active organization
create or replace function switch_organization(p_org_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_is_member boolean;
begin
  v_user_id := auth.uid();
  
  -- Verify user is member of org
  select exists (
    select 1 from org_members
    where user_id = v_user_id and org_id = p_org_id
  ) into v_is_member;
  
  if not v_is_member then
    raise exception 'Not a member of this organization';
  end if;
  
  -- Update preferences
  insert into user_org_preferences (user_id, last_org_id)
  values (v_user_id, p_org_id)
  on conflict (user_id) do update
  set last_org_id = p_org_id,
      updated_at = now();
  
  return true;
end;
$$;

-- =============================================================
-- TRIGGER: Update updated_at
-- =============================================================

create trigger user_org_preferences_updated_at
  before update on user_org_preferences
  for each row execute function update_updated_at();

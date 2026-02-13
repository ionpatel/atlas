-- =============================================================
-- Atlas ERP - Audit Logs Migration
-- Comprehensive audit logging for all write operations
-- =============================================================

-- =============================================================
-- AUDIT_LOGS TABLE
-- =============================================================

create table audit_logs (
  id             uuid primary key default uuid_generate_v4(),
  org_id         uuid not null references organizations on delete cascade,
  user_id        uuid references auth.users on delete set null,
  user_email     text,
  action         text not null check (action in ('create', 'update', 'delete')),
  table_name     text not null,
  record_id      uuid not null,
  old_values     jsonb,
  new_values     jsonb,
  ip_address     inet,
  user_agent     text,
  created_at     timestamptz not null default now()
);

-- Indexes for fast queries
create index idx_audit_logs_org_created on audit_logs (org_id, created_at desc);
create index idx_audit_logs_user on audit_logs (user_id);
create index idx_audit_logs_table on audit_logs (org_id, table_name);
create index idx_audit_logs_action on audit_logs (org_id, action);
create index idx_audit_logs_record on audit_logs (record_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table audit_logs enable row level security;

-- Members can view their org's audit logs
create policy "Members can view org audit logs"
  on audit_logs for select
  using (org_id in (select get_user_org_ids()));

-- Only authenticated users can insert audit logs for their orgs
create policy "Authenticated users can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

-- No one can update or delete audit logs (immutable)
-- This is intentional - audit logs should be append-only

-- =============================================================
-- HELPER FUNCTION: Log audit event
-- =============================================================

create or replace function log_audit_event(
  p_org_id uuid,
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_log_id uuid;
begin
  -- Get current user info
  v_user_id := auth.uid();
  
  -- Get user email from auth.users
  select email into v_user_email
  from auth.users
  where id = v_user_id;
  
  -- Insert audit log
  insert into audit_logs (
    org_id,
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) values (
    p_org_id,
    v_user_id,
    v_user_email,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent
  )
  returning id into v_log_id;
  
  return v_log_id;
end;
$$;

-- =============================================================
-- GRANTS
-- =============================================================

grant select, insert on audit_logs to authenticated;

-- =============================================================
-- Done. 🔍
-- =============================================================

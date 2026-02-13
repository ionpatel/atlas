-- =============================================================
-- Atlas ERP - Roles & Permissions Migration
-- Role-based access control (RBAC) system
-- =============================================================

-- =============================================================
-- ROLES
-- =============================================================

create table roles (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid references organizations on delete cascade,  -- NULL = system default roles
  name        text not null,
  description text,
  is_system   boolean not null default false,  -- System roles can't be deleted
  created_at  timestamptz not null default now(),
  
  unique (org_id, name)
);

create index idx_roles_org on roles (org_id);

-- =============================================================
-- PERMISSIONS
-- Module-level permissions for each role
-- =============================================================

create table permissions (
  id          uuid primary key default uuid_generate_v4(),
  role_id     uuid not null references roles on delete cascade,
  module      text not null,
  can_view    boolean not null default false,
  can_create  boolean not null default false,
  can_edit    boolean not null default false,
  can_delete  boolean not null default false,
  created_at  timestamptz not null default now(),
  
  unique (role_id, module)
);

create index idx_permissions_role on permissions (role_id);
create index idx_permissions_module on permissions (module);

-- =============================================================
-- USER ROLES
-- Assigns roles to users within an organization
-- =============================================================

create table user_roles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users on delete cascade,
  org_id      uuid not null references organizations on delete cascade,
  role_id     uuid not null references roles on delete cascade,
  assigned_by uuid references auth.users on delete set null,
  assigned_at timestamptz not null default now(),
  
  unique (user_id, org_id, role_id)
);

create index idx_user_roles_user on user_roles (user_id);
create index idx_user_roles_org on user_roles (org_id);
create index idx_user_roles_role on user_roles (role_id);

-- =============================================================
-- SEED DEFAULT SYSTEM ROLES
-- These are organization-agnostic template roles
-- =============================================================

-- Insert system roles (org_id = NULL means system-wide)
insert into roles (id, org_id, name, description, is_system) values
  ('11111111-1111-1111-1111-111111111111', null, 'admin', 'Full system access. Can manage all modules, users, and settings.', true),
  ('22222222-2222-2222-2222-222222222222', null, 'manager', 'Can manage most modules but cannot change system settings or user roles.', true),
  ('33333333-3333-3333-3333-333333333333', null, 'employee', 'Standard user access. Can view and edit assigned areas.', true),
  ('44444444-4444-4444-4444-444444444444', null, 'viewer', 'Read-only access to all modules.', true);

-- =============================================================
-- SEED DEFAULT PERMISSIONS
-- Modules: inventory, invoices, contacts, accounting, sales, 
--          purchase, crm, employees, payroll, projects, reports, 
--          settings, website, pos
-- =============================================================

-- Admin: Full access to everything
insert into permissions (role_id, module, can_view, can_create, can_edit, can_delete) values
  ('11111111-1111-1111-1111-111111111111', 'inventory', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'invoices', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'contacts', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'accounting', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'sales', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'purchase', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'crm', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'employees', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'payroll', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'projects', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'reports', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'settings', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'website', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'pos', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'dashboard', true, true, true, true),
  ('11111111-1111-1111-1111-111111111111', 'apps', true, true, true, true);

-- Manager: Full access except settings
insert into permissions (role_id, module, can_view, can_create, can_edit, can_delete) values
  ('22222222-2222-2222-2222-222222222222', 'inventory', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'invoices', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'contacts', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'accounting', true, true, true, false),
  ('22222222-2222-2222-2222-222222222222', 'sales', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'purchase', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'crm', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'employees', true, true, true, false),
  ('22222222-2222-2222-2222-222222222222', 'payroll', true, false, false, false),
  ('22222222-2222-2222-2222-222222222222', 'projects', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'reports', true, true, false, false),
  ('22222222-2222-2222-2222-222222222222', 'settings', true, false, false, false),
  ('22222222-2222-2222-2222-222222222222', 'website', true, true, true, false),
  ('22222222-2222-2222-2222-222222222222', 'pos', true, true, true, true),
  ('22222222-2222-2222-2222-222222222222', 'dashboard', true, true, true, false),
  ('22222222-2222-2222-2222-222222222222', 'apps', true, true, true, false);

-- Employee: Can view and edit most things, limited create/delete
insert into permissions (role_id, module, can_view, can_create, can_edit, can_delete) values
  ('33333333-3333-3333-3333-333333333333', 'inventory', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'invoices', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'contacts', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'accounting', true, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'sales', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'purchase', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'crm', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'employees', false, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'payroll', false, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'projects', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'reports', true, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'settings', false, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'website', true, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'pos', true, true, true, false),
  ('33333333-3333-3333-3333-333333333333', 'dashboard', true, false, false, false),
  ('33333333-3333-3333-3333-333333333333', 'apps', true, false, false, false);

-- Viewer: Read-only access to most modules
insert into permissions (role_id, module, can_view, can_create, can_edit, can_delete) values
  ('44444444-4444-4444-4444-444444444444', 'inventory', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'invoices', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'contacts', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'accounting', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'sales', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'purchase', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'crm', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'employees', false, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'payroll', false, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'projects', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'reports', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'settings', false, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'website', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'pos', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'dashboard', true, false, false, false),
  ('44444444-4444-4444-4444-444444444444', 'apps', true, false, false, false);

-- =============================================================
-- RLS POLICIES
-- =============================================================

alter table roles enable row level security;
alter table permissions enable row level security;
alter table user_roles enable row level security;

-- Roles: Users can view system roles or their org's roles
create policy "Users can view roles" on roles
  for select using (
    org_id is null  -- System roles are visible to all
    or org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );

-- Roles: Only admins can manage org roles
create policy "Admins can manage roles" on roles
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Permissions: Users can view permissions for accessible roles
create policy "Users can view permissions" on permissions
  for select using (
    role_id in (
      select id from roles where org_id is null
      union
      select r.id from roles r
      join org_members om on r.org_id = om.org_id
      where om.user_id = auth.uid()
    )
  );

-- Permissions: Only admins can manage permissions
create policy "Admins can manage permissions" on permissions
  for all using (
    role_id in (
      select r.id from roles r
      join org_members om on r.org_id = om.org_id
      where om.user_id = auth.uid() 
      and om.role in ('owner', 'admin')
    )
  );

-- User roles: Users can view their own roles
create policy "Users can view their roles" on user_roles
  for select using (
    user_id = auth.uid()
    or org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin', 'manager')
    )
  );

-- User roles: Only admins can assign roles
create policy "Admins can manage user roles" on user_roles
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Function to get user permissions for an organization
create or replace function get_user_permissions(p_user_id uuid, p_org_id uuid)
returns table (
  module text,
  can_view boolean,
  can_create boolean,
  can_edit boolean,
  can_delete boolean
) language sql stable security definer as $$
  select distinct on (p.module)
    p.module,
    bool_or(p.can_view) as can_view,
    bool_or(p.can_create) as can_create,
    bool_or(p.can_edit) as can_edit,
    bool_or(p.can_delete) as can_delete
  from user_roles ur
  join permissions p on p.role_id = ur.role_id
  where ur.user_id = p_user_id
    and ur.org_id = p_org_id
  group by p.module;
$$;

-- Function to check if user has specific permission
create or replace function has_permission(
  p_user_id uuid, 
  p_org_id uuid, 
  p_module text, 
  p_action text
) returns boolean language sql stable security definer as $$
  select exists (
    select 1
    from user_roles ur
    join permissions p on p.role_id = ur.role_id
    where ur.user_id = p_user_id
      and ur.org_id = p_org_id
      and p.module = p_module
      and case p_action
        when 'view' then p.can_view
        when 'create' then p.can_create
        when 'edit' then p.can_edit
        when 'delete' then p.can_delete
        else false
      end
  );
$$;

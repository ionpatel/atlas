-- =============================================================
-- Project Atlas - Initial Schema Migration
-- Multi-tenant business platform (Supabase/PostgreSQL)
-- =============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- ENUMS
-- =============================================================

create type org_role as enum ('owner', 'admin', 'manager', 'staff');
create type location_type as enum ('warehouse', 'store', 'office', 'other');
create type movement_type as enum ('receipt', 'transfer', 'adjustment', 'sale', 'return', 'write_off');
create type contact_type as enum ('customer', 'vendor', 'both');
create type invoice_status as enum ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void');

-- =============================================================
-- ORGANIZATIONS
-- =============================================================

create table organizations (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  created_at timestamptz not null default now()
);

create index idx_organizations_slug on organizations (slug);

-- =============================================================
-- PROFILES (extends auth.users)
-- =============================================================

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================
-- ORG MEMBERS (join table: user <-> org)
-- =============================================================

create table org_members (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  role       org_role not null default 'staff',
  invited_at timestamptz not null default now(),
  joined_at  timestamptz,

  unique (org_id, user_id)
);

create index idx_org_members_org on org_members (org_id);
create index idx_org_members_user on org_members (user_id);

-- =============================================================
-- PRODUCTS
-- =============================================================

create table products (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations on delete cascade,
  name        text not null,
  sku         text,
  barcode     text,
  category    text,
  description text,
  cost_price  numeric(12, 2) not null default 0,
  sell_price  numeric(12, 2) not null default 0,
  unit        text not null default 'pcs',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_products_org on products (org_id);
create index idx_products_sku on products (org_id, sku);
create index idx_products_barcode on products (org_id, barcode);

-- =============================================================
-- LOCATIONS
-- =============================================================

create table locations (
  id        uuid primary key default uuid_generate_v4(),
  org_id    uuid not null references organizations on delete cascade,
  name      text not null,
  address   text,
  type      location_type not null default 'warehouse',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_locations_org on locations (org_id);

-- =============================================================
-- STOCK LEVELS (product × location)
-- =============================================================

create table stock_levels (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid not null references products on delete cascade,
  location_id  uuid not null references locations on delete cascade,
  quantity     numeric(12, 2) not null default 0,
  min_quantity numeric(12, 2),
  max_quantity numeric(12, 2),
  updated_at   timestamptz not null default now(),

  unique (product_id, location_id)
);

create index idx_stock_levels_product on stock_levels (product_id);
create index idx_stock_levels_location on stock_levels (location_id);

-- =============================================================
-- STOCK MOVEMENTS
-- =============================================================

create table stock_movements (
  id               uuid primary key default uuid_generate_v4(),
  org_id           uuid not null references organizations on delete cascade,
  product_id       uuid not null references products on delete cascade,
  from_location_id uuid references locations on delete set null,
  to_location_id   uuid references locations on delete set null,
  quantity         numeric(12, 2) not null,
  type             movement_type not null,
  reference        text,
  notes            text,
  created_by       uuid references auth.users on delete set null,
  created_at       timestamptz not null default now(),

  -- At least one location must be specified
  constraint chk_movement_locations check (
    from_location_id is not null or to_location_id is not null
  )
);

create index idx_stock_movements_org on stock_movements (org_id);
create index idx_stock_movements_product on stock_movements (product_id);
create index idx_stock_movements_created on stock_movements (org_id, created_at desc);

-- =============================================================
-- CONTACTS
-- =============================================================

create table contacts (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations on delete cascade,
  name       text not null,
  email      text,
  phone      text,
  company    text,
  type       contact_type not null default 'customer',
  address    text,
  notes      text,
  created_at timestamptz not null default now()
);

create index idx_contacts_org on contacts (org_id);

-- =============================================================
-- INVOICES
-- =============================================================

create table invoices (
  id             uuid primary key default uuid_generate_v4(),
  org_id         uuid not null references organizations on delete cascade,
  contact_id     uuid references contacts on delete set null,
  invoice_number text not null,
  status         invoice_status not null default 'draft',
  issue_date     date not null default current_date,
  due_date       date,
  subtotal       numeric(12, 2) not null default 0,
  tax            numeric(12, 2) not null default 0,
  total          numeric(12, 2) not null default 0,
  notes          text,
  created_at     timestamptz not null default now(),

  unique (org_id, invoice_number)
);

create index idx_invoices_org on invoices (org_id);
create index idx_invoices_contact on invoices (contact_id);
create index idx_invoices_status on invoices (org_id, status);

-- =============================================================
-- INVOICE ITEMS
-- =============================================================

create table invoice_items (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid not null references invoices on delete cascade,
  product_id  uuid references products on delete set null,
  description text not null,
  quantity    numeric(12, 2) not null default 1,
  unit_price  numeric(12, 2) not null default 0,
  total       numeric(12, 2) not null default 0
);

create index idx_invoice_items_invoice on invoice_items (invoice_id);

-- =============================================================
-- HELPER FUNCTION: Get org IDs the current user belongs to
-- Used by all RLS policies for multi-tenant isolation
-- =============================================================

create or replace function get_user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id
  from org_members
  where user_id = auth.uid();
$$;

-- =============================================================
-- AUTO-UPDATED_AT TRIGGER
-- =============================================================

create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_products_updated_at
  before update on products
  for each row execute function handle_updated_at();

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger set_stock_levels_updated_at
  before update on stock_levels
  for each row execute function handle_updated_at();

-- =============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- Enable RLS on all tables
alter table organizations    enable row level security;
alter table profiles         enable row level security;
alter table org_members      enable row level security;
alter table products         enable row level security;
alter table locations        enable row level security;
alter table stock_levels     enable row level security;
alter table stock_movements  enable row level security;
alter table contacts         enable row level security;
alter table invoices         enable row level security;
alter table invoice_items    enable row level security;

-- ----- ORGANIZATIONS -----

create policy "Users can view orgs they belong to"
  on organizations for select
  using (id in (select get_user_org_ids()));

create policy "Authenticated users can create orgs"
  on organizations for insert
  to authenticated
  with check (true);

create policy "Org owners/admins can update their org"
  on organizations for update
  using (
    id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- PROFILES -----

create policy "Users can view any profile"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ----- ORG MEMBERS -----

create policy "Members can view fellow members"
  on org_members for select
  using (org_id in (select get_user_org_ids()));

create policy "Owners/admins can insert members"
  on org_members for insert
  to authenticated
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
    -- Also allow: the user creating the org (first member)
    or not exists (
      select 1 from org_members m where m.org_id = org_members.org_id
    )
  );

create policy "Owners/admins can update members"
  on org_members for update
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

create policy "Owners can delete members"
  on org_members for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role = 'owner'
    )
  );

-- ----- PRODUCTS -----

create policy "Members can view org products"
  on products for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org products"
  on products for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org products"
  on products for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete products"
  on products for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

-- ----- LOCATIONS -----

create policy "Members can view org locations"
  on locations for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org locations"
  on locations for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org locations"
  on locations for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete locations"
  on locations for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- STOCK LEVELS -----
-- Access through product's org

create policy "Members can view stock levels"
  on stock_levels for select
  using (
    product_id in (
      select id from products
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can insert stock levels"
  on stock_levels for insert
  to authenticated
  with check (
    product_id in (
      select id from products
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can update stock levels"
  on stock_levels for update
  using (
    product_id in (
      select id from products
      where org_id in (select get_user_org_ids())
    )
  );

-- ----- STOCK MOVEMENTS -----

create policy "Members can view org movements"
  on stock_movements for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org movements"
  on stock_movements for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

-- Movements are immutable — no update/delete policies

-- ----- CONTACTS -----

create policy "Members can view org contacts"
  on contacts for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org contacts"
  on contacts for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org contacts"
  on contacts for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete contacts"
  on contacts for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

-- ----- INVOICES -----

create policy "Members can view org invoices"
  on invoices for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org invoices"
  on invoices for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org invoices"
  on invoices for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete invoices"
  on invoices for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- INVOICE ITEMS -----
-- Access through invoice's org

create policy "Members can view invoice items"
  on invoice_items for select
  using (
    invoice_id in (
      select id from invoices
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can insert invoice items"
  on invoice_items for insert
  to authenticated
  with check (
    invoice_id in (
      select id from invoices
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can update invoice items"
  on invoice_items for update
  using (
    invoice_id in (
      select id from invoices
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can delete invoice items"
  on invoice_items for delete
  using (
    invoice_id in (
      select id from invoices
      where org_id in (select get_user_org_ids())
    )
  );

-- =============================================================
-- GRANTS (for Supabase anon/authenticated roles)
-- =============================================================

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- =============================================================
-- Done. 🚀
-- =============================================================

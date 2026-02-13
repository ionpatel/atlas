-- =============================================================
-- Atlas ERP - Complete Initial Schema Migration
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
create type account_type as enum ('asset', 'liability', 'equity', 'revenue', 'expense');
create type journal_status as enum ('draft', 'posted', 'cancelled');
create type employee_status as enum ('active', 'on_leave', 'terminated');
create type pay_type as enum ('salary', 'hourly');
create type pay_period as enum ('weekly', 'bi-weekly', 'semi-monthly', 'monthly');
create type pay_run_status as enum ('draft', 'processing', 'approved', 'paid');
create type lead_stage as enum ('new', 'qualified', 'proposition', 'won', 'lost');
create type project_status as enum ('on_track', 'at_risk', 'off_track', 'done');
create type order_status as enum ('draft', 'confirmed', 'invoiced', 'cancelled');
create type po_status as enum ('draft', 'sent', 'received', 'billed', 'cancelled');
create type bill_type as enum ('bill', 'receipt');
create type bill_status as enum ('draft', 'posted', 'cancelled');

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
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations on delete cascade,
  name            text not null,
  sku             text,
  barcode         text,
  category        text,
  description     text,
  cost_price      numeric(12, 2) not null default 0,
  sell_price      numeric(12, 2) not null default 0,
  unit            text not null default 'pcs',
  is_active       boolean not null default true,
  image_url       text,
  weight          numeric(10, 3),
  dimensions      text,
  internal_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_org on products (org_id);
create index idx_products_sku on products (org_id, sku);
create index idx_products_barcode on products (org_id, barcode);

-- =============================================================
-- LOCATIONS
-- =============================================================

create table locations (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations on delete cascade,
  name       text not null,
  address    text,
  type       location_type not null default 'warehouse',
  is_active  boolean not null default true,
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
create index idx_contacts_type on contacts (org_id, type);

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
  payment_terms  text,
  currency       text not null default 'CAD',
  created_at     timestamptz not null default now(),

  unique (org_id, invoice_number)
);

create index idx_invoices_org on invoices (org_id);
create index idx_invoices_contact on invoices (contact_id);
create index idx_invoices_status on invoices (org_id, status);
create index idx_invoices_due_date on invoices (org_id, due_date);

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
  tax_rate    numeric(5, 2) not null default 0,
  total       numeric(12, 2) not null default 0
);

create index idx_invoice_items_invoice on invoice_items (invoice_id);

-- =============================================================
-- SALES ORDERS
-- =============================================================

create table sales_orders (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references organizations on delete cascade,
  contact_id    uuid references contacts on delete set null,
  order_number  text not null,
  status        order_status not null default 'draft',
  order_date    date not null default current_date,
  delivery_date date,
  subtotal      numeric(12, 2) not null default 0,
  tax           numeric(12, 2) not null default 0,
  total         numeric(12, 2) not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),

  unique (org_id, order_number)
);

create index idx_sales_orders_org on sales_orders (org_id);
create index idx_sales_orders_contact on sales_orders (contact_id);

-- =============================================================
-- SALES ORDER LINES
-- =============================================================

create table sales_order_lines (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references sales_orders on delete cascade,
  product_id  uuid references products on delete set null,
  description text not null,
  quantity    numeric(12, 2) not null default 1,
  unit_price  numeric(12, 2) not null default 0,
  tax_rate    numeric(5, 2) not null default 0,
  total       numeric(12, 2) not null default 0
);

create index idx_sales_order_lines_order on sales_order_lines (order_id);

-- =============================================================
-- PURCHASE ORDERS
-- =============================================================

create table purchase_orders (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references organizations on delete cascade,
  vendor_id     uuid references contacts on delete set null,
  order_number  text not null,
  status        po_status not null default 'draft',
  order_date    date not null default current_date,
  expected_date date,
  subtotal      numeric(12, 2) not null default 0,
  tax           numeric(12, 2) not null default 0,
  total         numeric(12, 2) not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),

  unique (org_id, order_number)
);

create index idx_purchase_orders_org on purchase_orders (org_id);
create index idx_purchase_orders_vendor on purchase_orders (vendor_id);

-- =============================================================
-- PURCHASE ORDER LINES
-- =============================================================

create table purchase_order_lines (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references purchase_orders on delete cascade,
  product_id  uuid references products on delete set null,
  description text not null,
  quantity    numeric(12, 2) not null default 1,
  unit_price  numeric(12, 2) not null default 0,
  tax_rate    numeric(5, 2) not null default 0,
  total       numeric(12, 2) not null default 0
);

create index idx_purchase_order_lines_order on purchase_order_lines (order_id);

-- =============================================================
-- BILLS (Vendor Bills & Receipts)
-- =============================================================

create table bills (
  id               uuid primary key default uuid_generate_v4(),
  org_id           uuid not null references organizations on delete cascade,
  vendor_id        uuid references contacts on delete set null,
  type             bill_type not null default 'bill',
  bill_number      text not null,
  bill_reference   text,
  bill_date        date not null default current_date,
  accounting_date  date not null default current_date,
  due_date         date,
  payment_reference text,
  status           bill_status not null default 'draft',
  subtotal         numeric(12, 2) not null default 0,
  tax              numeric(12, 2) not null default 0,
  total            numeric(12, 2) not null default 0,
  created_at       timestamptz not null default now(),

  unique (org_id, bill_number)
);

create index idx_bills_org on bills (org_id);
create index idx_bills_vendor on bills (vendor_id);

-- =============================================================
-- BILL LINES
-- =============================================================

create table bill_lines (
  id         uuid primary key default uuid_generate_v4(),
  bill_id    uuid not null references bills on delete cascade,
  account_id uuid,
  label      text not null,
  quantity   numeric(12, 2) not null default 1,
  price      numeric(12, 2) not null default 0,
  tax_rate   numeric(5, 2) not null default 0,
  amount     numeric(12, 2) not null default 0
);

create index idx_bill_lines_bill on bill_lines (bill_id);

-- =============================================================
-- ACCOUNTS (Chart of Accounts)
-- =============================================================

create table accounts (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations on delete cascade,
  code       text not null,
  name       text not null,
  type       account_type not null,
  parent_id  uuid references accounts on delete set null,
  balance    numeric(12, 2) not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),

  unique (org_id, code)
);

create index idx_accounts_org on accounts (org_id);
create index idx_accounts_type on accounts (org_id, type);

-- =============================================================
-- JOURNAL ENTRIES
-- =============================================================

create table journal_entries (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations on delete cascade,
  entry_number text not null,
  date         date not null default current_date,
  description  text,
  status       journal_status not null default 'draft',
  created_at   timestamptz not null default now(),

  unique (org_id, entry_number)
);

create index idx_journal_entries_org on journal_entries (org_id);
create index idx_journal_entries_date on journal_entries (org_id, date desc);

-- =============================================================
-- JOURNAL LINES
-- =============================================================

create table journal_lines (
  id          uuid primary key default uuid_generate_v4(),
  entry_id    uuid not null references journal_entries on delete cascade,
  account_id  uuid not null references accounts on delete restrict,
  description text,
  debit       numeric(12, 2) not null default 0,
  credit      numeric(12, 2) not null default 0
);

create index idx_journal_lines_entry on journal_lines (entry_id);
create index idx_journal_lines_account on journal_lines (account_id);

-- =============================================================
-- TAX CONFIGS
-- =============================================================

create table tax_configs (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations on delete cascade,
  name       text not null,
  rate       numeric(5, 4) not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_tax_configs_org on tax_configs (org_id);

-- =============================================================
-- EMPLOYEES
-- =============================================================

create table employees (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations on delete cascade,
  user_id      uuid references auth.users on delete set null,
  name         text not null,
  job_title    text,
  department   text,
  email        text,
  phone        text,
  start_date   date,
  end_date     date,
  status       employee_status not null default 'active',
  tags         text[],
  avatar_color text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_employees_org on employees (org_id);
create index idx_employees_status on employees (org_id, status);

-- =============================================================
-- EMPLOYEE COMPENSATIONS
-- =============================================================

create table employee_compensations (
  id                    uuid primary key default uuid_generate_v4(),
  employee_id           uuid not null references employees on delete cascade,
  pay_type              pay_type not null default 'salary',
  annual_salary         numeric(12, 2),
  hourly_rate           numeric(10, 2),
  hours_per_week        numeric(5, 2) not null default 40,
  province              text not null default 'ON',
  federal_td1_claim     numeric(10, 2),
  provincial_td1_claim  numeric(10, 2),
  additional_tax        numeric(10, 2) not null default 0,
  bank_account          text,
  bank_transit          text,
  bank_institution      text,
  effective_date        date not null default current_date,
  created_at            timestamptz not null default now()
);

create index idx_employee_compensations_employee on employee_compensations (employee_id);

-- =============================================================
-- PAY RUNS
-- =============================================================

create table pay_runs (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references organizations on delete cascade,
  name                text not null,
  pay_period          pay_period not null default 'semi-monthly',
  period_start        date not null,
  period_end          date not null,
  pay_date            date not null,
  status              pay_run_status not null default 'draft',
  employee_count      integer not null default 0,
  total_gross         numeric(12, 2) not null default 0,
  total_deductions    numeric(12, 2) not null default 0,
  total_net           numeric(12, 2) not null default 0,
  total_employer_cost numeric(12, 2) not null default 0,
  created_at          timestamptz not null default now(),
  approved_at         timestamptz,
  paid_at             timestamptz
);

create index idx_pay_runs_org on pay_runs (org_id);
create index idx_pay_runs_status on pay_runs (org_id, status);
create index idx_pay_runs_pay_date on pay_runs (org_id, pay_date desc);

-- =============================================================
-- PAY STUBS
-- =============================================================

create table pay_stubs (
  id                 uuid primary key default uuid_generate_v4(),
  pay_run_id         uuid not null references pay_runs on delete cascade,
  employee_id        uuid not null references employees on delete cascade,
  period_start       date,
  period_end         date,
  pay_date           date,

  -- Earnings
  regular_hours      numeric(8, 2) not null default 0,
  regular_rate       numeric(10, 2) not null default 0,
  regular_pay        numeric(12, 2) not null default 0,
  overtime_hours     numeric(8, 2) not null default 0,
  overtime_rate      numeric(10, 2) not null default 0,
  overtime_pay       numeric(12, 2) not null default 0,
  bonus              numeric(12, 2) not null default 0,
  commission         numeric(12, 2) not null default 0,
  vacation_pay       numeric(12, 2) not null default 0,
  gross_pay          numeric(12, 2) not null default 0,

  -- Deductions
  federal_tax        numeric(12, 2) not null default 0,
  provincial_tax     numeric(12, 2) not null default 0,
  cpp                numeric(12, 2) not null default 0,
  ei                 numeric(12, 2) not null default 0,
  other_deductions   numeric(12, 2) not null default 0,
  total_deductions   numeric(12, 2) not null default 0,
  net_pay            numeric(12, 2) not null default 0,

  -- YTD Totals
  ytd_gross          numeric(12, 2) not null default 0,
  ytd_federal_tax    numeric(12, 2) not null default 0,
  ytd_provincial_tax numeric(12, 2) not null default 0,
  ytd_cpp            numeric(12, 2) not null default 0,
  ytd_ei             numeric(12, 2) not null default 0,
  ytd_net            numeric(12, 2) not null default 0,

  created_at         timestamptz not null default now()
);

create index idx_pay_stubs_pay_run on pay_stubs (pay_run_id);
create index idx_pay_stubs_employee on pay_stubs (employee_id);

-- =============================================================
-- LEADS (CRM)
-- =============================================================

create table leads (
  id                 uuid primary key default uuid_generate_v4(),
  org_id             uuid not null references organizations on delete cascade,
  contact_id         uuid references contacts on delete set null,
  name               text not null,
  contact_name       text,
  company            text,
  email              text,
  phone              text,
  amount             numeric(12, 2) not null default 0,
  stage              lead_stage not null default 'new',
  priority           smallint not null default 1,
  tags               text[],
  assigned_to        uuid references auth.users on delete set null,
  next_activity      text,
  next_activity_date date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_leads_org on leads (org_id);
create index idx_leads_stage on leads (org_id, stage);
create index idx_leads_assigned on leads (assigned_to);

-- =============================================================
-- PROJECTS
-- =============================================================

create table projects (
  id                 uuid primary key default uuid_generate_v4(),
  org_id             uuid not null references organizations on delete cascade,
  name               text not null,
  customer           text,
  start_date         date,
  end_date           date,
  status             project_status not null default 'on_track',
  tags               text[],
  task_count         integer not null default 0,
  milestone_progress text,
  is_favorite        boolean not null default false,
  assigned_to        uuid[],
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_projects_org on projects (org_id);
create index idx_projects_status on projects (org_id, status);

-- =============================================================
-- HELPER FUNCTION: Get org IDs the current user belongs to
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

create trigger set_employees_updated_at
  before update on employees
  for each row execute function handle_updated_at();

create trigger set_leads_updated_at
  before update on leads
  for each row execute function handle_updated_at();

create trigger set_projects_updated_at
  before update on projects
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
alter table organizations          enable row level security;
alter table profiles               enable row level security;
alter table org_members            enable row level security;
alter table products               enable row level security;
alter table locations              enable row level security;
alter table stock_levels           enable row level security;
alter table stock_movements        enable row level security;
alter table contacts               enable row level security;
alter table invoices               enable row level security;
alter table invoice_items          enable row level security;
alter table sales_orders           enable row level security;
alter table sales_order_lines      enable row level security;
alter table purchase_orders        enable row level security;
alter table purchase_order_lines   enable row level security;
alter table bills                  enable row level security;
alter table bill_lines             enable row level security;
alter table accounts               enable row level security;
alter table journal_entries        enable row level security;
alter table journal_lines          enable row level security;
alter table tax_configs            enable row level security;
alter table employees              enable row level security;
alter table employee_compensations enable row level security;
alter table pay_runs               enable row level security;
alter table pay_stubs              enable row level security;
alter table leads                  enable row level security;
alter table projects               enable row level security;

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

-- ----- SALES ORDERS -----

create policy "Members can view org sales orders"
  on sales_orders for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org sales orders"
  on sales_orders for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org sales orders"
  on sales_orders for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete sales orders"
  on sales_orders for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- SALES ORDER LINES -----

create policy "Members can view sales order lines"
  on sales_order_lines for select
  using (
    order_id in (
      select id from sales_orders
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can insert sales order lines"
  on sales_order_lines for insert
  to authenticated
  with check (
    order_id in (
      select id from sales_orders
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can update sales order lines"
  on sales_order_lines for update
  using (
    order_id in (
      select id from sales_orders
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can delete sales order lines"
  on sales_order_lines for delete
  using (
    order_id in (
      select id from sales_orders
      where org_id in (select get_user_org_ids())
    )
  );

-- ----- PURCHASE ORDERS -----

create policy "Members can view org purchase orders"
  on purchase_orders for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org purchase orders"
  on purchase_orders for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org purchase orders"
  on purchase_orders for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete purchase orders"
  on purchase_orders for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- PURCHASE ORDER LINES -----

create policy "Members can view purchase order lines"
  on purchase_order_lines for select
  using (
    order_id in (
      select id from purchase_orders
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can insert purchase order lines"
  on purchase_order_lines for insert
  to authenticated
  with check (
    order_id in (
      select id from purchase_orders
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can update purchase order lines"
  on purchase_order_lines for update
  using (
    order_id in (
      select id from purchase_orders
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can delete purchase order lines"
  on purchase_order_lines for delete
  using (
    order_id in (
      select id from purchase_orders
      where org_id in (select get_user_org_ids())
    )
  );

-- ----- BILLS -----

create policy "Members can view org bills"
  on bills for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org bills"
  on bills for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org bills"
  on bills for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete bills"
  on bills for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- BILL LINES -----

create policy "Members can view bill lines"
  on bill_lines for select
  using (
    bill_id in (
      select id from bills
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can insert bill lines"
  on bill_lines for insert
  to authenticated
  with check (
    bill_id in (
      select id from bills
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can update bill lines"
  on bill_lines for update
  using (
    bill_id in (
      select id from bills
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can delete bill lines"
  on bill_lines for delete
  using (
    bill_id in (
      select id from bills
      where org_id in (select get_user_org_ids())
    )
  );

-- ----- ACCOUNTS -----

create policy "Members can view org accounts"
  on accounts for select
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can insert accounts"
  on accounts for insert
  to authenticated
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

create policy "Admins+ can update accounts"
  on accounts for update
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

create policy "Admins+ can delete accounts"
  on accounts for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- JOURNAL ENTRIES -----

create policy "Members can view org journal entries"
  on journal_entries for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert journal entries"
  on journal_entries for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update draft journal entries"
  on journal_entries for update
  using (
    org_id in (select get_user_org_ids())
    and status = 'draft'
  );

create policy "Admins+ can delete draft journal entries"
  on journal_entries for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
    and status = 'draft'
  );

-- ----- JOURNAL LINES -----

create policy "Members can view journal lines"
  on journal_lines for select
  using (
    entry_id in (
      select id from journal_entries
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Members can insert journal lines"
  on journal_lines for insert
  to authenticated
  with check (
    entry_id in (
      select id from journal_entries
      where org_id in (select get_user_org_ids())
        and status = 'draft'
    )
  );

create policy "Members can update draft journal lines"
  on journal_lines for update
  using (
    entry_id in (
      select id from journal_entries
      where org_id in (select get_user_org_ids())
        and status = 'draft'
    )
  );

create policy "Members can delete draft journal lines"
  on journal_lines for delete
  using (
    entry_id in (
      select id from journal_entries
      where org_id in (select get_user_org_ids())
        and status = 'draft'
    )
  );

-- ----- TAX CONFIGS -----

create policy "Members can view org tax configs"
  on tax_configs for select
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can manage tax configs"
  on tax_configs for all
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- EMPLOYEES -----

create policy "Members can view org employees"
  on employees for select
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can insert employees"
  on employees for insert
  to authenticated
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

create policy "Admins+ can update employees"
  on employees for update
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

create policy "Admins+ can delete employees"
  on employees for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- EMPLOYEE COMPENSATIONS -----

create policy "Members can view compensations"
  on employee_compensations for select
  using (
    employee_id in (
      select id from employees
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Admins+ can manage compensations"
  on employee_compensations for all
  using (
    employee_id in (
      select id from employees
      where org_id in (
        select org_id from org_members
        where user_id = auth.uid()
          and role in ('owner', 'admin')
      )
    )
  );

-- ----- PAY RUNS -----

create policy "Members can view org pay runs"
  on pay_runs for select
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can insert pay runs"
  on pay_runs for insert
  to authenticated
  with check (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

create policy "Admins+ can update pay runs"
  on pay_runs for update
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ----- PAY STUBS -----

create policy "Members can view pay stubs"
  on pay_stubs for select
  using (
    pay_run_id in (
      select id from pay_runs
      where org_id in (select get_user_org_ids())
    )
  );

create policy "Admins+ can insert pay stubs"
  on pay_stubs for insert
  to authenticated
  with check (
    pay_run_id in (
      select id from pay_runs
      where org_id in (
        select org_id from org_members
        where user_id = auth.uid()
          and role in ('owner', 'admin')
      )
    )
  );

-- ----- LEADS -----

create policy "Members can view org leads"
  on leads for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org leads"
  on leads for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org leads"
  on leads for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete leads"
  on leads for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

-- ----- PROJECTS -----

create policy "Members can view org projects"
  on projects for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert org projects"
  on projects for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update org projects"
  on projects for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete projects"
  on projects for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- =============================================================
-- GRANTS
-- =============================================================

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- =============================================================
-- Done. 🚀
-- =============================================================

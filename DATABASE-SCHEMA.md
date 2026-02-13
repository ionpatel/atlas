# Atlas ERP - Database Schema Documentation

## Overview

Atlas ERP uses **Supabase (PostgreSQL)** as its backend. The schema is designed for **multi-tenant** operation using Row Level Security (RLS) policies that isolate data by organization.

**Supabase Project:** `csdjyuygnuoarkduikyd`

---

## Multi-Tenancy Strategy

All tenant-scoped tables include an `org_id` column that references `organizations`. RLS policies use a helper function `get_user_org_ids()` to determine which organizations the current user can access through their `org_members` records.

```sql
create or replace function get_user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from org_members where user_id = auth.uid();
$$;
```

---

## Tables by Module

### 🏢 Core / Multi-Tenant

| Table | Description |
|-------|-------------|
| `organizations` | Tenant accounts |
| `profiles` | User profiles (extends auth.users) |
| `org_members` | User ↔ Organization membership with roles |

### 📦 Inventory

| Table | Description |
|-------|-------------|
| `products` | Product catalog with SKU, barcode, pricing |
| `locations` | Warehouses, stores, offices |
| `stock_levels` | Product quantity per location |
| `stock_movements` | Audit trail of inventory changes |

### 👥 Contacts

| Table | Description |
|-------|-------------|
| `contacts` | Customers, vendors, or both |

### 🧾 Invoicing

| Table | Description |
|-------|-------------|
| `invoices` | Sales invoices with status tracking |
| `invoice_items` | Line items for invoices |

### 🛒 Sales

| Table | Description |
|-------|-------------|
| `sales_orders` | Sales orders (pre-invoice) |
| `sales_order_lines` | Line items for sales orders |

### 🛍️ Purchasing

| Table | Description |
|-------|-------------|
| `purchase_orders` | Orders to vendors |
| `purchase_order_lines` | Line items for POs |
| `bills` | Vendor bills and receipts |
| `bill_lines` | Line items for bills |

### 📊 Accounting

| Table | Description |
|-------|-------------|
| `accounts` | Chart of Accounts (COA) |
| `journal_entries` | Double-entry journal headers |
| `journal_lines` | Debit/credit lines for journals |
| `tax_configs` | Tax rate configurations |

### 👨‍💼 HR / Employees

| Table | Description |
|-------|-------------|
| `employees` | Employee records |
| `employee_compensations` | Salary/hourly pay details |
| `pay_runs` | Payroll run headers |
| `pay_stubs` | Individual pay stubs per employee |

### 📈 CRM

| Table | Description |
|-------|-------------|
| `leads` | Sales pipeline / opportunities |

### 📋 Projects

| Table | Description |
|-------|-------------|
| `projects` | Project tracking |

---

## Entity Relationship Diagram (Simplified)

```
organizations
    │
    ├── org_members ──→ auth.users ──→ profiles
    │
    ├── products
    │       └── stock_levels ──→ locations
    │       └── stock_movements
    │
    ├── contacts
    │       └── invoices ──→ invoice_items
    │       └── sales_orders ──→ sales_order_lines
    │       └── purchase_orders ──→ purchase_order_lines
    │       └── bills ──→ bill_lines
    │       └── leads
    │
    ├── accounts
    │       └── journal_entries ──→ journal_lines
    │
    ├── employees
    │       └── employee_compensations
    │       └── pay_stubs ──→ pay_runs
    │
    └── projects
```

---

## Detailed Table Schemas

### organizations
```sql
id          uuid PRIMARY KEY
name        text NOT NULL
slug        text NOT NULL UNIQUE
logo_url    text
created_at  timestamptz DEFAULT now()
```

**Indexes:** `idx_organizations_slug (slug)`

---

### profiles
```sql
id          uuid PRIMARY KEY → auth.users
full_name   text
avatar_url  text
created_at  timestamptz
updated_at  timestamptz
```

**Trigger:** Auto-create on user signup, auto-update `updated_at`

---

### org_members
```sql
id          uuid PRIMARY KEY
org_id      uuid NOT NULL → organizations
user_id     uuid NOT NULL → auth.users
role        org_role ('owner'|'admin'|'manager'|'staff')
invited_at  timestamptz
joined_at   timestamptz

UNIQUE (org_id, user_id)
```

**Indexes:** `idx_org_members_org`, `idx_org_members_user`

---

### products
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
name            text NOT NULL
sku             text
barcode         text
category        text
description     text
cost_price      numeric(12,2) DEFAULT 0
sell_price      numeric(12,2) DEFAULT 0
unit            text DEFAULT 'pcs'
is_active       boolean DEFAULT true
image_url       text
weight          numeric(10,3)
dimensions      text
internal_notes  text
created_at      timestamptz
updated_at      timestamptz
```

**Indexes:** `idx_products_org`, `idx_products_sku`, `idx_products_barcode`

---

### contacts
```sql
id          uuid PRIMARY KEY
org_id      uuid NOT NULL → organizations
name        text NOT NULL
email       text
phone       text
company     text
type        contact_type ('customer'|'vendor'|'both')
address     text
notes       text
created_at  timestamptz
```

**Indexes:** `idx_contacts_org`

---

### invoices
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
contact_id      uuid → contacts
invoice_number  text NOT NULL
status          invoice_status ('draft'|'sent'|'paid'|'partial'|'overdue'|'cancelled'|'void')
issue_date      date DEFAULT current_date
due_date        date
subtotal        numeric(12,2) DEFAULT 0
tax             numeric(12,2) DEFAULT 0
total           numeric(12,2) DEFAULT 0
notes           text
payment_terms   text
currency        text DEFAULT 'CAD'
created_at      timestamptz

UNIQUE (org_id, invoice_number)
```

**Indexes:** `idx_invoices_org`, `idx_invoices_contact`, `idx_invoices_status`

---

### invoice_items
```sql
id          uuid PRIMARY KEY
invoice_id  uuid NOT NULL → invoices
product_id  uuid → products
description text NOT NULL
quantity    numeric(12,2) DEFAULT 1
unit_price  numeric(12,2) DEFAULT 0
tax_rate    numeric(5,2) DEFAULT 0
total       numeric(12,2) DEFAULT 0
```

**Indexes:** `idx_invoice_items_invoice`

---

### employees
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
user_id         uuid → auth.users (optional link)
name            text NOT NULL
job_title       text
department      text
email           text
phone           text
start_date      date
end_date        date
status          employee_status ('active'|'on_leave'|'terminated')
tags            text[]
avatar_color    text
created_at      timestamptz
updated_at      timestamptz
```

**Indexes:** `idx_employees_org`, `idx_employees_status`

---

### employee_compensations
```sql
id                  uuid PRIMARY KEY
employee_id         uuid NOT NULL → employees
pay_type            pay_type ('salary'|'hourly')
annual_salary       numeric(12,2)
hourly_rate         numeric(10,2)
hours_per_week      numeric(5,2) DEFAULT 40
province            text DEFAULT 'ON'
federal_td1_claim   numeric(10,2)
provincial_td1_claim numeric(10,2)
additional_tax      numeric(10,2) DEFAULT 0
bank_account        text
bank_transit        text
bank_institution    text
effective_date      date
created_at          timestamptz
```

**Indexes:** `idx_employee_compensations_employee`

---

### pay_runs
```sql
id                  uuid PRIMARY KEY
org_id              uuid NOT NULL → organizations
name                text NOT NULL
pay_period          pay_period ('weekly'|'bi-weekly'|'semi-monthly'|'monthly')
period_start        date NOT NULL
period_end          date NOT NULL
pay_date            date NOT NULL
status              pay_run_status ('draft'|'processing'|'approved'|'paid')
employee_count      integer DEFAULT 0
total_gross         numeric(12,2) DEFAULT 0
total_deductions    numeric(12,2) DEFAULT 0
total_net           numeric(12,2) DEFAULT 0
total_employer_cost numeric(12,2) DEFAULT 0
created_at          timestamptz
approved_at         timestamptz
paid_at             timestamptz
```

**Indexes:** `idx_pay_runs_org`, `idx_pay_runs_status`

---

### pay_stubs
```sql
id              uuid PRIMARY KEY
pay_run_id      uuid NOT NULL → pay_runs
employee_id     uuid NOT NULL → employees
period_start    date
period_end      date
pay_date        date

-- Earnings
regular_hours   numeric(8,2) DEFAULT 0
regular_rate    numeric(10,2) DEFAULT 0
regular_pay     numeric(12,2) DEFAULT 0
overtime_hours  numeric(8,2) DEFAULT 0
overtime_rate   numeric(10,2) DEFAULT 0
overtime_pay    numeric(12,2) DEFAULT 0
bonus           numeric(12,2) DEFAULT 0
commission      numeric(12,2) DEFAULT 0
vacation_pay    numeric(12,2) DEFAULT 0
gross_pay       numeric(12,2) DEFAULT 0

-- Deductions
federal_tax     numeric(12,2) DEFAULT 0
provincial_tax  numeric(12,2) DEFAULT 0
cpp             numeric(12,2) DEFAULT 0
ei              numeric(12,2) DEFAULT 0
other_deductions numeric(12,2) DEFAULT 0
total_deductions numeric(12,2) DEFAULT 0
net_pay         numeric(12,2) DEFAULT 0

-- YTD Totals
ytd_gross       numeric(12,2) DEFAULT 0
ytd_federal_tax numeric(12,2) DEFAULT 0
ytd_provincial_tax numeric(12,2) DEFAULT 0
ytd_cpp         numeric(12,2) DEFAULT 0
ytd_ei          numeric(12,2) DEFAULT 0
ytd_net         numeric(12,2) DEFAULT 0

created_at      timestamptz
```

**Indexes:** `idx_pay_stubs_pay_run`, `idx_pay_stubs_employee`

---

### accounts (Chart of Accounts)
```sql
id          uuid PRIMARY KEY
org_id      uuid NOT NULL → organizations
code        text NOT NULL
name        text NOT NULL
type        account_type ('asset'|'liability'|'equity'|'revenue'|'expense')
parent_id   uuid → accounts (self-reference)
balance     numeric(12,2) DEFAULT 0
is_active   boolean DEFAULT true
created_at  timestamptz

UNIQUE (org_id, code)
```

**Indexes:** `idx_accounts_org`, `idx_accounts_type`

---

### journal_entries
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
entry_number    text NOT NULL
date            date NOT NULL
description     text
status          journal_status ('draft'|'posted'|'cancelled')
created_at      timestamptz

UNIQUE (org_id, entry_number)
```

**Indexes:** `idx_journal_entries_org`, `idx_journal_entries_date`

---

### journal_lines
```sql
id          uuid PRIMARY KEY
entry_id    uuid NOT NULL → journal_entries
account_id  uuid NOT NULL → accounts
description text
debit       numeric(12,2) DEFAULT 0
credit      numeric(12,2) DEFAULT 0
```

**Indexes:** `idx_journal_lines_entry`, `idx_journal_lines_account`

---

### tax_configs
```sql
id          uuid PRIMARY KEY
org_id      uuid NOT NULL → organizations
name        text NOT NULL
rate        numeric(5,4) NOT NULL
is_active   boolean DEFAULT true
created_at  timestamptz
```

---

### leads
```sql
id                  uuid PRIMARY KEY
org_id              uuid NOT NULL → organizations
contact_id          uuid → contacts
name                text NOT NULL
contact_name        text
company             text
email               text
phone               text
amount              numeric(12,2) DEFAULT 0
stage               lead_stage ('new'|'qualified'|'proposition'|'won'|'lost')
priority            smallint DEFAULT 1
tags                text[]
assigned_to         uuid → auth.users
next_activity       text
next_activity_date  date
created_at          timestamptz
updated_at          timestamptz
```

**Indexes:** `idx_leads_org`, `idx_leads_stage`, `idx_leads_assigned`

---

### projects
```sql
id                  uuid PRIMARY KEY
org_id              uuid NOT NULL → organizations
name                text NOT NULL
customer            text
start_date          date
end_date            date
status              project_status ('on_track'|'at_risk'|'off_track'|'done')
tags                text[]
task_count          integer DEFAULT 0
milestone_progress  text
is_favorite         boolean DEFAULT false
assigned_to         uuid[]
created_at          timestamptz
updated_at          timestamptz
```

**Indexes:** `idx_projects_org`, `idx_projects_status`

---

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| organizations | Members | Authenticated | Owner/Admin | ❌ |
| profiles | Authenticated | Own | Own | ❌ |
| org_members | Members | Owner/Admin (or first) | Owner/Admin | Owner |
| products | Members | Members | Members | Admin+ |
| locations | Members | Members | Members | Admin+ |
| stock_levels | via product org | via product org | via product org | ❌ |
| stock_movements | Members | Members | ❌ (immutable) | ❌ |
| contacts | Members | Members | Members | Admin+ |
| invoices | Members | Members | Members | Admin+ |
| invoice_items | via invoice org | via invoice org | via invoice org | via invoice org |
| employees | Members | Admin+ | Admin+ | Admin+ |
| pay_runs | Members | Admin+ | Admin+ | ❌ |
| pay_stubs | Members | via pay_run | ❌ | ❌ |
| accounts | Members | Admin+ | Admin+ | Admin+ |
| journal_entries | Members | Members | Members (draft only) | Admin+ (draft only) |
| journal_lines | via entry | via entry | via entry (draft) | via entry (draft) |
| leads | Members | Members | Members | Admin+ |
| projects | Members | Members | Members | Admin+ |

---

## Performance Indexes

All foreign key columns are indexed. Additional indexes:

- **Text search:** Consider adding GIN indexes on `products.name`, `contacts.name` for `ILIKE` searches
- **Date ranges:** `idx_invoices_due_date`, `idx_pay_runs_pay_date` for date filtering
- **Composite:** `(org_id, created_at DESC)` on high-volume tables for dashboard queries

---

## Migration Files

- `supabase/migrations/001_initial_schema.sql` - Complete schema with all tables and RLS

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://csdjyuygnuoarkduikyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

---

## Notes

1. **Demo Mode:** The client returns mock data if env vars are missing
2. **Soft Deletes:** Consider adding `deleted_at` for audit-sensitive tables
3. **Full-Text Search:** Supabase supports `tsvector` for advanced search
4. **Realtime:** Enable Supabase Realtime on tables needing live updates

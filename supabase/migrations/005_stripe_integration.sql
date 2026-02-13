-- =============================================================
-- Atlas ERP - Stripe Integration Migration
-- Payment processing and subscription billing
-- =============================================================

-- =============================================================
-- STRIPE CUSTOMERS
-- Links organizations to Stripe customer accounts
-- =============================================================

create table stripe_customers (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations on delete cascade unique,
  stripe_customer_id text not null unique,
  email           text,
  name            text,
  currency        text default 'cad',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_stripe_customers_org on stripe_customers (org_id);
create index idx_stripe_customers_stripe_id on stripe_customers (stripe_customer_id);

-- =============================================================
-- SUBSCRIPTIONS
-- Atlas ERP subscription plans for organizations
-- =============================================================

create table subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  org_id                uuid not null references organizations on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id       text,
  plan                  text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  status                text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean default false,
  trial_end             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  
  unique (org_id)
);

create index idx_subscriptions_org on subscriptions (org_id);
create index idx_subscriptions_status on subscriptions (status);

-- =============================================================
-- PAYMENT METHODS
-- Stored payment methods for organizations
-- =============================================================

create table payment_methods (
  id                    uuid primary key default uuid_generate_v4(),
  org_id                uuid not null references organizations on delete cascade,
  stripe_payment_method_id text not null unique,
  type                  text not null, -- 'card', 'bank_account', etc.
  card_brand            text,          -- 'visa', 'mastercard', etc.
  card_last4            text,
  card_exp_month        integer,
  card_exp_year         integer,
  is_default            boolean default false,
  created_at            timestamptz not null default now()
);

create index idx_payment_methods_org on payment_methods (org_id);

-- =============================================================
-- INVOICES (Atlas billing, not customer invoices)
-- Stripe invoices for Atlas subscriptions
-- =============================================================

create table billing_invoices (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references organizations on delete cascade,
  stripe_invoice_id   text unique,
  amount_due          integer not null,        -- in cents
  amount_paid         integer default 0,
  currency            text default 'cad',
  status              text not null check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf         text,
  hosted_invoice_url  text,
  due_date            timestamptz,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_billing_invoices_org on billing_invoices (org_id);
create index idx_billing_invoices_status on billing_invoices (status);

-- =============================================================
-- PAYMENT LINKS
-- Payment links for customer invoices
-- =============================================================

create table payment_links (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references organizations on delete cascade,
  invoice_id          uuid references invoices on delete cascade,
  stripe_payment_link_id text unique,
  url                 text not null,
  amount              integer not null,        -- in cents
  currency            text default 'cad',
  status              text not null default 'active' check (status in ('active', 'completed', 'expired')),
  expires_at          timestamptz,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_payment_links_org on payment_links (org_id);
create index idx_payment_links_invoice on payment_links (invoice_id);

-- =============================================================
-- WEBHOOK EVENTS
-- Log of Stripe webhook events for debugging
-- =============================================================

create table stripe_webhook_events (
  id                uuid primary key default uuid_generate_v4(),
  stripe_event_id   text not null unique,
  event_type        text not null,
  data              jsonb not null,
  processed         boolean default false,
  error             text,
  created_at        timestamptz not null default now()
);

create index idx_webhook_events_type on stripe_webhook_events (event_type);
create index idx_webhook_events_processed on stripe_webhook_events (processed) where not processed;

-- =============================================================
-- RLS POLICIES
-- =============================================================

alter table stripe_customers enable row level security;
alter table subscriptions enable row level security;
alter table payment_methods enable row level security;
alter table billing_invoices enable row level security;
alter table payment_links enable row level security;
alter table stripe_webhook_events enable row level security;

-- Stripe customers: org members can view
create policy "Members can view stripe customer" on stripe_customers
  for select using (org_id in (select get_user_org_ids()));

-- Admins can manage stripe customer
create policy "Admins can manage stripe customer" on stripe_customers
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Subscriptions: org members can view
create policy "Members can view subscription" on subscriptions
  for select using (org_id in (select get_user_org_ids()));

-- Admins can manage subscription
create policy "Admins can manage subscription" on subscriptions
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Payment methods: org admins only
create policy "Admins can view payment methods" on payment_methods
  for select using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

create policy "Admins can manage payment methods" on payment_methods
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Billing invoices: admins can view
create policy "Admins can view billing invoices" on billing_invoices
  for select using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Payment links: org members can view
create policy "Members can view payment links" on payment_links
  for select using (org_id in (select get_user_org_ids()));

-- Members can create payment links
create policy "Members can create payment links" on payment_links
  for insert with check (org_id in (select get_user_org_ids()));

-- Webhook events: service role only (no user access)
-- No RLS policy = only service role can access

-- =============================================================
-- SEED DEFAULT SUBSCRIPTION FOR DEMO ORG
-- =============================================================

insert into subscriptions (org_id, plan, status)
select id, 'pro', 'active'
from organizations
where id = '00000000-0000-0000-0000-000000000001'
on conflict (org_id) do nothing;

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Get current subscription for an org
create or replace function get_org_subscription(p_org_id uuid)
returns table (
  plan text,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean
) language sql stable security definer as $$
  select plan, status, current_period_end, cancel_at_period_end
  from subscriptions
  where org_id = p_org_id
  limit 1;
$$;

-- Check if org has active subscription
create or replace function has_active_subscription(p_org_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from subscriptions
    where org_id = p_org_id
    and status in ('active', 'trialing')
  );
$$;

-- =============================================================
-- UPDATED_AT TRIGGERS
-- =============================================================

create trigger stripe_customers_updated_at
  before update on stripe_customers
  for each row execute function update_updated_at();

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

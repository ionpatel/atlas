-- =============================================================
-- Atlas ERP - Website Pages Table
-- Persists website builder content to Supabase
-- =============================================================

-- Website pages/sites table
create table website_pages (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations on delete cascade,
  name        text not null default 'Untitled Website',
  slug        text not null default '/',
  template    text,
  elements    jsonb not null default '[]'::jsonb,
  settings    jsonb default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_website_pages_org on website_pages (org_id);
create unique index idx_website_pages_org_slug on website_pages (org_id, slug);

-- Enable RLS
alter table website_pages enable row level security;

-- RLS Policies
create policy "Members can view org website pages"
  on website_pages for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can insert website pages"
  on website_pages for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can update website pages"
  on website_pages for update
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can delete website pages"
  on website_pages for delete
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin', 'manager')
    )
  );

-- Auto-update updated_at
create trigger website_pages_updated_at
  before update on website_pages
  for each row
  execute function update_updated_at();

-- =============================================================
-- Website Assets Table (for uploaded images etc.)
-- =============================================================

create table website_assets (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations on delete cascade,
  filename    text not null,
  storage_path text not null,
  mime_type   text,
  size_bytes  bigint,
  alt_text    text,
  created_at  timestamptz not null default now()
);

create index idx_website_assets_org on website_assets (org_id);

alter table website_assets enable row level security;

create policy "Members can view org assets"
  on website_assets for select
  using (org_id in (select get_user_org_ids()));

create policy "Members can upload assets"
  on website_assets for insert
  to authenticated
  with check (org_id in (select get_user_org_ids()));

create policy "Members can delete own assets"
  on website_assets for delete
  using (org_id in (select get_user_org_ids()));

-- =============================================================
-- Website Domains Table (custom domains)
-- =============================================================

create table website_domains (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations on delete cascade,
  domain      text not null unique,
  is_verified boolean not null default false,
  verified_at timestamptz,
  ssl_enabled boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_website_domains_org on website_domains (org_id);
create index idx_website_domains_domain on website_domains (domain);

alter table website_domains enable row level security;

create policy "Members can view org domains"
  on website_domains for select
  using (org_id in (select get_user_org_ids()));

create policy "Admins+ can manage domains"
  on website_domains for all
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- Grants
grant select, insert, update, delete on website_pages to authenticated;
grant select, insert, delete on website_assets to authenticated;
grant select, insert, update, delete on website_domains to authenticated;

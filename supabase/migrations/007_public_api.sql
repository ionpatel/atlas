-- =============================================================
-- Atlas ERP - Public API Infrastructure
-- API keys, rate limiting, and access logging
-- =============================================================

-- =============================================================
-- API KEYS
-- Allow organizations to create API keys for external access
-- =============================================================

create table api_keys (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations on delete cascade,
  name            text not null,
  description     text,
  key_prefix      text not null,                    -- First 8 chars for identification
  key_hash        text not null,                    -- SHA256 hash of full key
  permissions     jsonb not null default '["read"]', -- Array of permissions
  rate_limit      integer default 1000,             -- Requests per hour
  last_used_at    timestamptz,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  created_by      uuid references auth.users on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_api_keys_org on api_keys (org_id);
create index idx_api_keys_prefix on api_keys (key_prefix);
create index idx_api_keys_hash on api_keys (key_hash);

-- =============================================================
-- API REQUEST LOGS
-- Track API usage for analytics and debugging
-- =============================================================

create table api_request_logs (
  id              uuid primary key default uuid_generate_v4(),
  api_key_id      uuid references api_keys on delete set null,
  org_id          uuid not null references organizations on delete cascade,
  method          text not null,
  endpoint        text not null,
  status_code     integer not null,
  response_time_ms integer,
  ip_address      inet,
  user_agent      text,
  request_body    jsonb,
  response_error  text,
  created_at      timestamptz not null default now()
);

-- Partition by month for performance
create index idx_api_logs_key on api_request_logs (api_key_id);
create index idx_api_logs_org_created on api_request_logs (org_id, created_at desc);
create index idx_api_logs_endpoint on api_request_logs (endpoint);

-- =============================================================
-- RATE LIMIT TRACKING
-- Track request counts for rate limiting
-- =============================================================

create table api_rate_limits (
  id              uuid primary key default uuid_generate_v4(),
  api_key_id      uuid not null references api_keys on delete cascade,
  window_start    timestamptz not null,
  request_count   integer not null default 0,
  
  unique (api_key_id, window_start)
);

create index idx_rate_limits_key_window on api_rate_limits (api_key_id, window_start);

-- =============================================================
-- WEBHOOKS
-- Allow organizations to receive event notifications
-- =============================================================

create table webhooks (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations on delete cascade,
  name            text not null,
  url             text not null,
  secret          text not null default encode(gen_random_bytes(32), 'hex'),
  events          text[] not null default '{}',     -- Array of event types
  is_active       boolean not null default true,
  last_triggered  timestamptz,
  failure_count   integer default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_webhooks_org on webhooks (org_id);
create index idx_webhooks_active on webhooks (org_id, is_active) where is_active;

-- =============================================================
-- WEBHOOK DELIVERIES
-- Log of webhook delivery attempts
-- =============================================================

create table webhook_deliveries (
  id              uuid primary key default uuid_generate_v4(),
  webhook_id      uuid not null references webhooks on delete cascade,
  event_type      text not null,
  payload         jsonb not null,
  status_code     integer,
  response_body   text,
  success         boolean not null default false,
  attempt_count   integer not null default 1,
  next_retry_at   timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_webhook_deliveries_webhook on webhook_deliveries (webhook_id);
create index idx_webhook_deliveries_retry on webhook_deliveries (next_retry_at) 
  where not success and attempt_count < 5;

-- =============================================================
-- RLS POLICIES
-- =============================================================

alter table api_keys enable row level security;
alter table api_request_logs enable row level security;
alter table api_rate_limits enable row level security;
alter table webhooks enable row level security;
alter table webhook_deliveries enable row level security;

-- API keys: admins can manage
create policy "Admins can view api keys" on api_keys
  for select using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

create policy "Admins can manage api keys" on api_keys
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- API logs: admins can view
create policy "Admins can view api logs" on api_request_logs
  for select using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Rate limits: service role only
-- No user RLS policy

-- Webhooks: admins can manage
create policy "Admins can view webhooks" on webhooks
  for select using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

create policy "Admins can manage webhooks" on webhooks
  for all using (
    org_id in (
      select org_id from org_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Webhook deliveries: admins can view
create policy "Admins can view webhook deliveries" on webhook_deliveries
  for select using (
    webhook_id in (
      select w.id from webhooks w
      join org_members om on w.org_id = om.org_id
      where om.user_id = auth.uid() 
      and om.role in ('owner', 'admin')
    )
  );

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Generate API key (returns both key and id)
create or replace function generate_api_key(
  p_org_id uuid,
  p_name text,
  p_description text default null,
  p_permissions text[] default array['read'],
  p_expires_in_days integer default null
)
returns table (api_key_id uuid, api_key text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_prefix text;
  v_hash text;
  v_id uuid;
  v_expires timestamptz;
begin
  -- Generate random key
  v_key := 'atlas_' || encode(gen_random_bytes(32), 'hex');
  v_prefix := substring(v_key from 1 for 12);
  v_hash := encode(sha256(v_key::bytea), 'hex');
  
  -- Calculate expiration
  if p_expires_in_days is not null then
    v_expires := now() + (p_expires_in_days || ' days')::interval;
  end if;
  
  -- Insert key (only hash is stored)
  insert into api_keys (org_id, name, description, key_prefix, key_hash, permissions, expires_at, created_by)
  values (p_org_id, p_name, p_description, v_prefix, v_hash, to_jsonb(p_permissions), v_expires, auth.uid())
  returning id into v_id;
  
  -- Return both id and key (key shown only once!)
  return query select v_id, v_key;
end;
$$;

-- Validate API key
create or replace function validate_api_key(p_key text)
returns table (
  api_key_id uuid,
  org_id uuid,
  permissions jsonb,
  rate_limit integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
begin
  v_hash := encode(sha256(p_key::bytea), 'hex');
  
  return query
  select ak.id, ak.org_id, ak.permissions, ak.rate_limit
  from api_keys ak
  where ak.key_hash = v_hash
    and ak.revoked_at is null
    and (ak.expires_at is null or ak.expires_at > now());
end;
$$;

-- Check rate limit
create or replace function check_rate_limit(p_api_key_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rate_limit integer;
  v_current_count integer;
  v_window_start timestamptz;
begin
  -- Get rate limit for key
  select rate_limit into v_rate_limit
  from api_keys where id = p_api_key_id;
  
  -- Current hour window
  v_window_start := date_trunc('hour', now());
  
  -- Get or create rate limit record
  insert into api_rate_limits (api_key_id, window_start, request_count)
  values (p_api_key_id, v_window_start, 1)
  on conflict (api_key_id, window_start) do update
  set request_count = api_rate_limits.request_count + 1
  returning request_count into v_current_count;
  
  -- Update last used
  update api_keys set last_used_at = now() where id = p_api_key_id;
  
  return v_current_count <= v_rate_limit;
end;
$$;

-- Log API request
create or replace function log_api_request(
  p_api_key_id uuid,
  p_org_id uuid,
  p_method text,
  p_endpoint text,
  p_status_code integer,
  p_response_time_ms integer default null,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_error text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log_id uuid;
begin
  insert into api_request_logs (
    api_key_id, org_id, method, endpoint, status_code,
    response_time_ms, ip_address, user_agent, response_error
  ) values (
    p_api_key_id, p_org_id, p_method, p_endpoint, p_status_code,
    p_response_time_ms, p_ip_address, p_user_agent, p_error
  )
  returning id into v_log_id;
  
  return v_log_id;
end;
$$;

-- =============================================================
-- TRIGGERS
-- =============================================================

create trigger webhooks_updated_at
  before update on webhooks
  for each row execute function update_updated_at();

-- =============================================================
-- CLEANUP OLD DATA (run periodically)
-- =============================================================

create or replace function cleanup_old_api_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete logs older than 90 days
  delete from api_request_logs
  where created_at < now() - interval '90 days';
  
  -- Delete rate limit records older than 24 hours
  delete from api_rate_limits
  where window_start < now() - interval '24 hours';
  
  -- Delete webhook deliveries older than 30 days
  delete from webhook_deliveries
  where created_at < now() - interval '30 days';
end;
$$;

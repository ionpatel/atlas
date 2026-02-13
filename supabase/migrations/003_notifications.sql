-- =============================================================
-- Atlas ERP - Email Notifications Schema
-- Notification preferences and email queue system
-- =============================================================

-- =============================================================
-- ENUMS
-- =============================================================

create type email_digest_frequency as enum ('instant', 'daily', 'weekly');
create type notification_status as enum ('pending', 'sent', 'failed');
create type notification_type as enum (
  'low_stock_alert',
  'invoice_reminder_7d',
  'invoice_reminder_3d',
  'invoice_overdue',
  'new_order',
  'daily_digest',
  'weekly_digest'
);

-- =============================================================
-- NOTIFICATION PREFERENCES
-- =============================================================

create table notification_preferences (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users on delete cascade,
  org_id              uuid not null references organizations on delete cascade,
  
  -- Alert preferences
  low_stock_alerts    boolean not null default true,
  invoice_reminders   boolean not null default true,
  new_orders          boolean not null default true,
  
  -- Digest settings
  email_digest        email_digest_frequency not null default 'instant',
  
  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  
  -- Each user can have one preference per org
  unique (user_id, org_id)
);

create index idx_notification_preferences_user on notification_preferences (user_id);
create index idx_notification_preferences_org on notification_preferences (org_id);

-- =============================================================
-- NOTIFICATION QUEUE
-- =============================================================

create table notification_queue (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references organizations on delete cascade,
  
  -- Email details
  type                notification_type not null,
  recipient_email     text not null,
  subject             text not null,
  body                text not null,
  
  -- Metadata (JSON for flexibility)
  metadata            jsonb default '{}',
  
  -- Status tracking
  status              notification_status not null default 'pending',
  error_message       text,
  retry_count         integer not null default 0,
  
  -- Timestamps
  scheduled_at        timestamptz not null default now(),
  sent_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_notification_queue_org on notification_queue (org_id);
create index idx_notification_queue_status on notification_queue (status);
create index idx_notification_queue_scheduled on notification_queue (scheduled_at) where status = 'pending';
create index idx_notification_queue_type on notification_queue (type);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table notification_preferences enable row level security;
alter table notification_queue enable row level security;

-- Notification preferences: users can manage their own preferences
create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own notification preferences"
  on notification_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (user_id = auth.uid());

create policy "Users can delete own notification preferences"
  on notification_preferences for delete
  using (user_id = auth.uid());

-- Notification queue: members can view notifications for their org
create policy "Org members can view notification queue"
  on notification_queue for select
  using (
    exists (
      select 1 from org_members
      where org_members.org_id = notification_queue.org_id
        and org_members.user_id = auth.uid()
    )
  );

-- Only admins/owners can insert notifications
create policy "Org admins can insert notifications"
  on notification_queue for insert
  with check (
    exists (
      select 1 from org_members
      where org_members.org_id = notification_queue.org_id
        and org_members.user_id = auth.uid()
        and org_members.role in ('owner', 'admin')
    )
  );

-- =============================================================
-- FUNCTIONS
-- =============================================================

-- Function to update notification preferences timestamp
create or replace function update_notification_preferences_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_notification_preferences_updated
  before update on notification_preferences
  for each row
  execute function update_notification_preferences_timestamp();

-- Function to get pending notifications (for edge function)
create or replace function get_pending_notifications(batch_size integer default 50)
returns setof notification_queue as $$
begin
  return query
  select *
  from notification_queue
  where status = 'pending'
    and scheduled_at <= now()
    and retry_count < 3
  order by scheduled_at asc
  limit batch_size;
end;
$$ language plpgsql security definer;

-- Function to mark notification as sent
create or replace function mark_notification_sent(notification_id uuid)
returns void as $$
begin
  update notification_queue
  set status = 'sent',
      sent_at = now()
  where id = notification_id;
end;
$$ language plpgsql security definer;

-- Function to mark notification as failed
create or replace function mark_notification_failed(notification_id uuid, error_msg text)
returns void as $$
begin
  update notification_queue
  set status = case when retry_count >= 2 then 'failed' else 'pending' end,
      error_message = error_msg,
      retry_count = retry_count + 1
  where id = notification_id;
end;
$$ language plpgsql security definer;

-- =============================================================
-- HELPER FUNCTION: Queue a notification
-- =============================================================

create or replace function queue_notification(
  p_org_id uuid,
  p_type notification_type,
  p_recipient_email text,
  p_subject text,
  p_body text,
  p_metadata jsonb default '{}',
  p_scheduled_at timestamptz default now()
)
returns uuid as $$
declare
  v_id uuid;
begin
  insert into notification_queue (org_id, type, recipient_email, subject, body, metadata, scheduled_at)
  values (p_org_id, p_type, p_recipient_email, p_subject, p_body, p_metadata, p_scheduled_at)
  returning id into v_id;
  
  return v_id;
end;
$$ language plpgsql security definer;

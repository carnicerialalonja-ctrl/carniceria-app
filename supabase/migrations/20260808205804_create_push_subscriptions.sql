create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  event_type text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
alter table public.notification_events enable row level security;
revoke all on table public.push_subscriptions from anon, authenticated;
revoke all on table public.notification_events from anon, authenticated;
grant select, insert, update, delete on table public.push_subscriptions to service_role;
grant select, insert, update, delete on table public.notification_events to service_role;

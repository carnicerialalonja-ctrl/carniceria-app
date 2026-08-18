create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  project text not null check (project in ('carniceria', 'reproductor', 'quiniela')),
  event_name text not null check (event_name in ('page_view', 'session_start', 'play', 'purchase_click')),
  anonymous_id text not null check (char_length(anonymous_id) between 8 and 100),
  session_id text not null check (char_length(session_id) between 8 and 100),
  page_url text,
  referrer text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  constraint analytics_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists analytics_events_project_occurred_at_idx
  on public.analytics_events (project, occurred_at desc);
create index if not exists analytics_events_event_occurred_at_idx
  on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_session_idx
  on public.analytics_events (session_id, occurred_at desc);

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from anon, authenticated;
grant select, insert on table public.analytics_events to service_role;

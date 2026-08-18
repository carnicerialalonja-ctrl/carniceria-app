create table if not exists public.products (
  id text primary key,
  name text not null check (char_length(trim(name)) between 2 and 120),
  category text not null check (char_length(trim(category)) between 2 and 50),
  price numeric(12,2) not null check (price > 0 and price <= 1000000),
  unit text not null check (char_length(trim(unit)) between 1 and 30),
  description text not null default '' check (char_length(description) <= 600),
  image_url text not null default '' check (char_length(image_url) <= 1000),
  emoji text not null default '📦' check (char_length(emoji) <= 16),
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_sort_idx
  on public.products (is_active, sort_order, name);

create index if not exists products_category_idx
  on public.products (category);

alter table public.products enable row level security;
revoke all on table public.products from anon, authenticated;
grant select, insert, update on table public.products to service_role;

alter table public.orders
  drop constraint if exists orders_order_channel_check;

alter table public.orders
  add constraint orders_order_channel_check
  check (order_channel = any (array['CLIP'::text, 'WHATSAPP'::text, 'POS'::text]));

create index if not exists inventory_movements_order_idx
  on public.inventory_movements (order_id)
  where order_id is not null;

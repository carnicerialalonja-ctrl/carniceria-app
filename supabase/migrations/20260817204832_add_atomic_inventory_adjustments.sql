alter table public.inventory_movements
  drop constraint if exists inventory_movements_movement_type_check,
  add constraint inventory_movements_movement_type_check
    check (movement_type in ('POS_SALE', 'STOCK_ENTRY', 'WASTE', 'CORRECTION'));

create or replace function public.adjust_product_inventory(
  p_product_id text,
  p_quantity numeric,
  p_kind text,
  p_note text default null
)
returns public.products
language plpgsql
security invoker
set search_path = ''
as $$
declare
  product_row public.products%rowtype;
  quantity_change numeric(12,3);
  new_stock numeric(12,3);
begin
  select * into product_row
    from public.products
   where id = p_product_id
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'PRODUCT_NOT_FOUND';
  end if;

  if not product_row.track_stock then
    raise exception using errcode = 'P0001', message = 'STOCK_TRACKING_DISABLED';
  end if;

  if p_kind = 'STOCK_ENTRY' then
    if p_quantity <= 0 then raise exception using errcode = '22023', message = 'INVALID_QUANTITY'; end if;
    quantity_change := p_quantity;
  elsif p_kind = 'WASTE' then
    if p_quantity <= 0 then raise exception using errcode = '22023', message = 'INVALID_QUANTITY'; end if;
    quantity_change := -p_quantity;
  elsif p_kind = 'CORRECTION' then
    quantity_change := p_quantity - coalesce(product_row.stock_quantity, 0);
  else
    raise exception using errcode = '22023', message = 'INVALID_MOVEMENT_KIND';
  end if;

  new_stock := coalesce(product_row.stock_quantity, 0) + quantity_change;
  if product_row.block_out_of_stock and new_stock < 0 then
    raise exception using errcode = 'P0001', message = 'INSUFFICIENT_STOCK:' || p_product_id;
  end if;

  update public.products
     set stock_quantity = new_stock,
         updated_at = now()
   where id = p_product_id
   returning * into product_row;

  insert into public.inventory_movements
    (product_id, quantity_change, resulting_stock, movement_type, note)
  values
    (p_product_id, quantity_change, new_stock, p_kind, nullif(trim(p_note), ''));

  return product_row;
end;
$$;

revoke execute on function public.adjust_product_inventory(text, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.adjust_product_inventory(text, numeric, text, text)
  to service_role;

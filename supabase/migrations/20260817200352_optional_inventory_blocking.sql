alter table public.products
  add column if not exists block_out_of_stock boolean not null default false;

alter table public.products
  drop constraint if exists products_stock_quantity_check;

alter table public.inventory_movements
  drop constraint if exists inventory_movements_resulting_stock_check;

create or replace function private.decrement_pos_inventory()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sold record;
  tracked boolean;
  should_block boolean;
  current_stock numeric(12,3);
  new_stock numeric(12,3);
begin
  if new.order_channel is distinct from 'POS' then
    return new;
  end if;

  for sold in
    select item->>'id' as product_id,
           sum((item->>'quantity')::numeric) as quantity
      from jsonb_array_elements(new.items) as item
     group by item->>'id'
  loop
    select p.track_stock, p.block_out_of_stock, p.stock_quantity
      into tracked, should_block, current_stock
      from public.products as p
     where p.id = sold.product_id
     for update;

    if not found or not tracked then
      continue;
    end if;

    if should_block and (current_stock is null or current_stock < sold.quantity) then
      raise exception using
        errcode = 'P0001',
        message = 'INSUFFICIENT_STOCK:' || sold.product_id;
    end if;

    new_stock := coalesce(current_stock, 0) - sold.quantity;
    update public.products
       set stock_quantity = new_stock,
           updated_at = now()
     where id = sold.product_id;

    insert into public.inventory_movements
      (product_id, order_id, quantity_change, resulting_stock, movement_type, note)
    values
      (sold.product_id, new.id, -sold.quantity, new_stock, 'POS_SALE', new.order_reference);
  end loop;

  return new;
end;
$$;

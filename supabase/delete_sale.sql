-- XIMORA Admin - funcion para eliminar ventas de prueba y restaurar stock.
-- Ejecuta este archivo en el SQL Editor de Supabase.

create or replace function public.delete_sale(p_sale_id uuid)
returns void
language plpgsql
as $$
declare
  selected_sale public.sales%rowtype;
  selected_product public.products%rowtype;
  restored_stock integer;
begin
  select *
    into selected_sale
    from public.sales
    where id = p_sale_id
    for update;

  if not found then
    raise exception 'Venta no encontrada.';
  end if;

  select *
    into selected_product
    from public.products
    where id = selected_sale.product_id
    for update;

  delete from public.sales
    where id = p_sale_id;

  if found then
    restored_stock := coalesce(selected_product.stock, 0) + selected_sale.quantity;

    update public.products
      set
        stock = restored_stock,
        status = case
          when status = 'archived' then 'archived'::product_status
          else 'active'::product_status
        end
      where id = selected_sale.product_id;
  end if;
end;
$$;

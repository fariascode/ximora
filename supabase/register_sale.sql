-- XIMORA Admin - funcion para registrar ventas y descontar stock.
-- Ejecuta este archivo en el SQL Editor de Supabase si ya corriste schema.sql antes.

create or replace function public.register_sale(
  p_product_id uuid,
  p_quantity integer,
  p_unit_sale_price numeric,
  p_payment_method text default 'cash',
  p_customer_name text default null,
  p_notes text default null
)
returns public.sales
language plpgsql
as $$
declare
  selected_product public.products%rowtype;
  new_sale public.sales%rowtype;
  new_stock integer;
begin
  if p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero.';
  end if;

  select *
    into selected_product
    from public.products
    where id = p_product_id
    for update;

  if not found then
    raise exception 'Producto no encontrado.';
  end if;

  if selected_product.status = 'archived' then
    raise exception 'No se puede vender un producto archivado.';
  end if;

  if selected_product.stock < p_quantity then
    raise exception 'Stock insuficiente. Stock disponible: %.', selected_product.stock;
  end if;

  new_stock := selected_product.stock - p_quantity;

  insert into public.sales (
    product_id,
    quantity,
    unit_sale_price,
    total_sale,
    unit_cost,
    profit,
    payment_method,
    customer_name,
    notes
  )
  values (
    p_product_id,
    p_quantity,
    p_unit_sale_price,
    p_quantity * p_unit_sale_price,
    selected_product.purchase_price,
    (p_quantity * p_unit_sale_price) - (p_quantity * selected_product.purchase_price),
    p_payment_method::payment_method,
    nullif(trim(p_customer_name), ''),
    nullif(trim(p_notes), '')
  )
  returning * into new_sale;

  update public.products
    set
      stock = new_stock,
      status = case when new_stock = 0 then 'sold_out'::product_status else 'active'::product_status end
    where id = p_product_id;

  return new_sale;
end;
$$;

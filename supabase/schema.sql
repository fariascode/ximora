-- XIMORA Admin - esquema inicial
-- Ejecuta este archivo en el SQL Editor de Supabase.

create extension if not exists "pgcrypto";

create type product_status as enum ('active', 'sold_out', 'archived');
create type payment_method as enum ('cash', 'transfer', 'card', 'other');
create type expense_category as enum ('inventory', 'packaging', 'advertising', 'transport', 'stand', 'other');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  material text not null default 'Acero inoxidable',
  description text,
  purchase_price numeric(10, 2) not null default 0 check (purchase_price >= 0),
  sale_price numeric(10, 2) not null default 0 check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 1 check (min_stock >= 0),
  image_url text,
  status product_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_sale_price numeric(10, 2) not null check (unit_sale_price >= 0),
  total_sale numeric(10, 2) not null check (total_sale >= 0),
  unit_cost numeric(10, 2) not null check (unit_cost >= 0),
  profit numeric(10, 2) not null,
  payment_method payment_method not null default 'cash',
  customer_name text,
  notes text,
  sold_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  concept text not null,
  category expense_category not null default 'other',
  amount numeric(10, 2) not null check (amount >= 0),
  notes text,
  spent_at timestamptz not null default now()
);

create index products_created_at_idx on public.products(created_at desc);
create index products_category_idx on public.products(category);
create index sales_sold_at_idx on public.sales(sold_at desc);
create index sales_product_id_idx on public.sales(product_id);
create index expenses_spent_at_idx on public.expenses(spent_at desc);
create index expenses_category_idx on public.expenses(category);

alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;

create policy "Authenticated users can read products"
  on public.products for select
  to authenticated
  using (true);

create policy "Authenticated users can insert products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete products"
  on public.products for delete
  to authenticated
  using (true);

create policy "Authenticated users can read sales"
  on public.sales for select
  to authenticated
  using (true);

create policy "Authenticated users can insert sales"
  on public.sales for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update sales"
  on public.sales for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete sales"
  on public.sales for delete
  to authenticated
  using (true);

create policy "Authenticated users can read expenses"
  on public.expenses for select
  to authenticated
  using (true);

create policy "Authenticated users can insert expenses"
  on public.expenses for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update expenses"
  on public.expenses for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete expenses"
  on public.expenses for delete
  to authenticated
  using (true);

-- Bucket sugerido para imágenes de productos.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated users can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "Authenticated users can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

create policy "Anyone can view product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

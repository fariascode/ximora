-- XIMORA Admin - acceso privado por correos autorizados.
-- Antes de ejecutar, cambia TU_CORREO@EJEMPLO.COM por el correo con el que entras a la app.

do $$
declare
  admin_email text := lower('ximorajewelry@gmail.com');
begin
  if admin_email = 'ximorajewelry@gmail.com' then
    raise exception 'Cambia TU_CORREO@EJEMPLO.COM por tu correo real antes de ejecutar este SQL.';
  end if;
end;
$$;

create table if not exists public.authorized_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

insert into public.authorized_users (email, role)
values (lower('ximorajewelry@gmail.com'), 'admin')
on conflict (email) do update
set role = excluded.role;

alter table public.authorized_users enable row level security;

create or replace function public.is_authorized_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.authorized_users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_authorized_user() to authenticated;

drop policy if exists "Authorized users can read authorized users" on public.authorized_users;
create policy "Authorized users can read authorized users"
  on public.authorized_users for select
  to authenticated
  using (public.is_authorized_user());

drop policy if exists "Authenticated users can read products" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Authorized users can read products"
  on public.products for select
  to authenticated
  using (public.is_authorized_user());

create policy "Authorized users can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_authorized_user());

create policy "Authorized users can update products"
  on public.products for update
  to authenticated
  using (public.is_authorized_user())
  with check (public.is_authorized_user());

create policy "Authorized users can delete products"
  on public.products for delete
  to authenticated
  using (public.is_authorized_user());

drop policy if exists "Authenticated users can read sales" on public.sales;
drop policy if exists "Authenticated users can insert sales" on public.sales;
drop policy if exists "Authenticated users can update sales" on public.sales;
drop policy if exists "Authenticated users can delete sales" on public.sales;

create policy "Authorized users can read sales"
  on public.sales for select
  to authenticated
  using (public.is_authorized_user());

create policy "Authorized users can insert sales"
  on public.sales for insert
  to authenticated
  with check (public.is_authorized_user());

create policy "Authorized users can update sales"
  on public.sales for update
  to authenticated
  using (public.is_authorized_user())
  with check (public.is_authorized_user());

create policy "Authorized users can delete sales"
  on public.sales for delete
  to authenticated
  using (public.is_authorized_user());

drop policy if exists "Authenticated users can read expenses" on public.expenses;
drop policy if exists "Authenticated users can insert expenses" on public.expenses;
drop policy if exists "Authenticated users can update expenses" on public.expenses;
drop policy if exists "Authenticated users can delete expenses" on public.expenses;

create policy "Authorized users can read expenses"
  on public.expenses for select
  to authenticated
  using (public.is_authorized_user());

create policy "Authorized users can insert expenses"
  on public.expenses for insert
  to authenticated
  with check (public.is_authorized_user());

create policy "Authorized users can update expenses"
  on public.expenses for update
  to authenticated
  using (public.is_authorized_user())
  with check (public.is_authorized_user());

create policy "Authorized users can delete expenses"
  on public.expenses for delete
  to authenticated
  using (public.is_authorized_user());

drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists "Authenticated users can update product images" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;

create policy "Authorized users can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_authorized_user());

create policy "Authorized users can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_authorized_user())
  with check (bucket_id = 'product-images' and public.is_authorized_user());

create policy "Authorized users can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_authorized_user());

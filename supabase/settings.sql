-- XIMORA Admin - ajustes del negocio y categorias de productos.
-- Ejecuta este archivo en el SQL Editor de Supabase.

create table if not exists public.business_settings (
  id boolean primary key default true,
  business_name text not null default 'XIMORA',
  currency text not null default 'MXN',
  instagram text,
  whatsapp text,
  notes text,
  updated_at timestamptz not null default now(),
  constraint business_settings_single_row check (id = true)
);

insert into public.business_settings (id, business_name, currency)
values (true, 'XIMORA', 'MXN')
on conflict (id) do nothing;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.product_categories (name)
values ('Aretes'), ('Anillos'), ('Pulseras'), ('Collares'), ('Sets')
on conflict (name) do nothing;

alter table public.business_settings enable row level security;
alter table public.product_categories enable row level security;

drop policy if exists "Authorized users can read business settings" on public.business_settings;
drop policy if exists "Authorized users can update business settings" on public.business_settings;
drop policy if exists "Authorized users can insert business settings" on public.business_settings;

create policy "Authorized users can read business settings"
  on public.business_settings for select
  to authenticated
  using (public.is_authorized_user());

create policy "Authorized users can update business settings"
  on public.business_settings for update
  to authenticated
  using (public.is_authorized_user())
  with check (public.is_authorized_user());

create policy "Authorized users can insert business settings"
  on public.business_settings for insert
  to authenticated
  with check (public.is_authorized_user());

drop policy if exists "Authorized users can read product categories" on public.product_categories;
drop policy if exists "Authorized users can insert product categories" on public.product_categories;
drop policy if exists "Authorized users can update product categories" on public.product_categories;
drop policy if exists "Authorized users can delete product categories" on public.product_categories;

create policy "Authorized users can read product categories"
  on public.product_categories for select
  to authenticated
  using (public.is_authorized_user());

create policy "Authorized users can insert product categories"
  on public.product_categories for insert
  to authenticated
  with check (public.is_authorized_user());

create policy "Authorized users can update product categories"
  on public.product_categories for update
  to authenticated
  using (public.is_authorized_user())
  with check (public.is_authorized_user());

create policy "Authorized users can delete product categories"
  on public.product_categories for delete
  to authenticated
  using (public.is_authorized_user());

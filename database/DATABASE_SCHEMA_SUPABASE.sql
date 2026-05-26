-- HME2 Supabase schema compatible with the current Next.js project.
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Keep updated_at fresh on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Product categories used by lib/products.ts and products filters.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  emoji text,
  created_at timestamptz not null default now()
);

-- Products are fetched directly by the public client and joined from cart/order rows.
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  category text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12, 2) not null check (price >= 0),
  original_price numeric(12, 2) check (original_price is null or original_price >= 0),
  cost numeric(12, 2) check (cost is null or cost >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  sku text unique,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  specs jsonb not null default '{}'::jsonb,
  in_stock boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_is_active on public.products(is_active);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Persistent cart for authenticated Supabase users.
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- Orders created from the cart.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text unique,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb,
  billing_address jsonb,
  payment_method text not null default 'cash_on_delivery'
    check (payment_method in ('cash_on_delivery', 'bank_transfer')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

alter table public.orders
add column if not exists payment_method text not null default 'cash_on_delivery';

alter table public.orders
add column if not exists payment_status text not null default 'pending';

alter table public.orders
add column if not exists shipping_fee numeric(12, 2) not null default 0;

create index if not exists idx_orders_payment_status on public.orders(payment_status);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_method_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_payment_method_check
    check (payment_method in ('cash_on_delivery', 'bank_transfer'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
  end if;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- Order line items. The API inserts `price`, not `unit_price`, so keep this exact column.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- Small key/value store for admin-managed runtime settings.
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

insert into public.app_settings (key, value)
values (
  'shipping',
  '{"freeThreshold":500,"hammametFee":0,"nabeulFee":10,"coastalFee":20,"otherFee":30}'::jsonb
)
on conflict (key) do nothing;

-- Transactional order creation from cart rows.
drop function if exists public.create_order_from_cart(uuid, uuid[], jsonb, jsonb, text, text);

create or replace function public.create_order_from_cart(
  p_user_id uuid,
  p_cart_item_ids uuid[] default null,
  p_shipping_address jsonb default null,
  p_billing_address jsonb default null,
  p_payment_method text default 'cash_on_delivery',
  p_payment_status text default 'pending',
  p_notes text default null,
  p_status text default 'pending'
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_subtotal numeric(12, 2);
  v_shipping_fee numeric(12, 2);
  v_shipping_settings jsonb;
  v_unavailable_products text;
  v_low_stock_products text;
begin
  if p_user_id is null then
    raise exception 'User is required';
  end if;

  if p_status not in ('pending', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid order status';
  end if;

  if p_payment_method not in ('cash_on_delivery', 'bank_transfer') then
    raise exception 'Invalid payment method';
  end if;

  if p_payment_status not in ('pending', 'paid', 'failed', 'refunded') then
    raise exception 'Invalid payment status';
  end if;

  create temporary table if not exists selected_order_cart_items (
    cart_item_id uuid primary key,
    product_id bigint not null,
    quantity integer not null,
    product_name text not null,
    price numeric(12, 2) not null,
    stock_quantity integer not null,
    in_stock boolean not null,
    is_active boolean not null
  ) on commit drop;

  truncate table selected_order_cart_items;

  insert into selected_order_cart_items (
    cart_item_id,
    product_id,
    quantity,
    product_name,
    price,
    stock_quantity,
    in_stock,
    is_active
  )
  select
    ci.id,
    ci.product_id,
    ci.quantity,
    p.name,
    p.price,
    p.stock_quantity,
    p.in_stock,
    p.is_active
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.user_id = p_user_id
    and (
      coalesce(array_length(p_cart_item_ids, 1), 0) = 0
      or ci.id = any(p_cart_item_ids)
    )
  for update of p, ci;

  if not exists (select 1 from selected_order_cart_items) then
    raise exception 'Cart is empty';
  end if;

  select string_agg(product_name, ', ')
  into v_unavailable_products
  from selected_order_cart_items
  where not is_active;

  if v_unavailable_products is not null then
    raise exception 'Unavailable products: %', v_unavailable_products;
  end if;

  select string_agg(
    product_name || ' (requested ' || quantity || ', available ' || stock_quantity || ')',
    ', '
  )
  into v_low_stock_products
  from selected_order_cart_items
  where not in_stock or stock_quantity < quantity;

  if v_low_stock_products is not null then
    raise exception 'Not enough stock: %', v_low_stock_products;
  end if;

  select coalesce(sum(price * quantity), 0)::numeric(12, 2)
  into v_subtotal
  from selected_order_cart_items;

  select coalesce(value, '{"freeThreshold":500,"hammametFee":0,"nabeulFee":10,"coastalFee":20,"otherFee":30}'::jsonb)
  into v_shipping_settings
  from public.app_settings
  where key = 'shipping';

  v_shipping_settings := coalesce(
    v_shipping_settings,
    '{"freeThreshold":500,"hammametFee":0,"nabeulFee":10,"coastalFee":20,"otherFee":30}'::jsonb
  );

  v_shipping_fee := case
    when v_subtotal >= coalesce((v_shipping_settings->>'freeThreshold')::numeric, 500) then 0
    when lower(coalesce(p_shipping_address->>'city', '')) like '%hammamet%' then coalesce((v_shipping_settings->>'hammametFee')::numeric, 0)
    when lower(coalesce(p_shipping_address->>'city', '')) in (
      'nabeul',
      'dar chaabane',
      'beni khiar',
      'mrezga',
      'bir bouregba',
      'bouficha',
      'korba',
      'kelibia',
      'soliman'
    ) then coalesce((v_shipping_settings->>'nabeulFee')::numeric, 10)
    when lower(coalesce(p_shipping_address->>'city', '')) in (
      'tunis',
      'ariana',
      'ben arous',
      'manouba',
      'sousse',
      'monastir',
      'sfax'
    ) then coalesce((v_shipping_settings->>'coastalFee')::numeric, 20)
    else coalesce((v_shipping_settings->>'otherFee')::numeric, 30)
  end;

  insert into public.orders (
    user_id,
    order_number,
    total_amount,
    shipping_fee,
    status,
    shipping_address,
    billing_address,
    payment_method,
    payment_status,
    notes
  )
  values (
    p_user_id,
    'HME-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
    v_subtotal + v_shipping_fee,
    v_shipping_fee,
    p_status,
    p_shipping_address,
    coalesce(p_billing_address, p_shipping_address),
    p_payment_method,
    p_payment_status,
    nullif(btrim(coalesce(p_notes, '')), '')
  )
  returning * into v_order;

  insert into public.order_items (order_id, product_id, quantity, price)
  select v_order.id, product_id, quantity, price
  from selected_order_cart_items;

  update public.products p
  set
    stock_quantity = p.stock_quantity - selected.quantity,
    in_stock = (p.stock_quantity - selected.quantity) > 0,
    updated_at = now()
  from selected_order_cart_items selected
  where p.id = selected.product_id;

  delete from public.cart_items ci
  using selected_order_cart_items selected
  where ci.id = selected.cart_item_id
    and ci.user_id = p_user_id;

  return to_jsonb(v_order);
exception
  when unique_violation then
    raise exception 'Could not generate a unique order number, please retry';
end;
$$;

revoke execute on function public.create_order_from_cart(uuid, uuid[], jsonb, jsonb, text, text, text, text) from public;
grant execute on function public.create_order_from_cart(uuid, uuid[], jsonb, jsonb, text, text, text, text) to service_role;

-- Optional tables matching lib/types.ts for later account features.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  profile_image_url text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.products(id),
  image_url text not null,
  is_main boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on public.product_images(product_id);
create unique index if not exists idx_product_images_one_main
on public.product_images(product_id)
where is_main;

alter table public.profiles
add column if not exists role text not null default 'client';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_role_check check (role in ('admin', 'client'));
  end if;
end $$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'client'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Enable row level security for exposed public tables.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;

-- Public catalog read access.
drop policy if exists "Categories are readable by everyone" on public.categories;
create policy "Categories are readable by everyone"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Active products are readable by everyone" on public.products;
create policy "Active products are readable by everyone"
on public.products for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Product images are readable by everyone" on public.product_images;
create policy "Product images are readable by everyone"
on public.product_images for select
to anon, authenticated
using (true);

-- Users can access only their own cart rows.
drop policy if exists "Users can read their own cart" on public.cart_items;
create policy "Users can read their own cart"
on public.cart_items for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own cart" on public.cart_items;
create policy "Users can insert their own cart"
on public.cart_items for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cart" on public.cart_items;
create policy "Users can update their own cart"
on public.cart_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own cart" on public.cart_items;
create policy "Users can delete their own cart"
on public.cart_items for delete
to authenticated
using (auth.uid() = user_id);

-- Users can access only their own orders.
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own orders" on public.orders;
create policy "Users can update their own orders"
on public.orders for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own orders" on public.orders;
create policy "Users can delete their own orders"
on public.orders for delete
to authenticated
using (auth.uid() = user_id);

-- Order items are readable/writable only through orders owned by the user.
drop policy if exists "Users can read their own order items" on public.order_items;
create policy "Users can read their own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert their own order items" on public.order_items;
create policy "Users can insert their own order items"
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own order items" on public.order_items;
create policy "Users can delete their own order items"
on public.order_items for delete
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

-- Profiles.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Grants for Supabase Data API access. RLS still controls row visibility.
grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, delete on public.order_items to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Seed categories used by the UI.
insert into public.categories (name, slug, emoji) values
  ('Cuisines', 'cuisines', '🍳'),
  ('Réfrigérateurs', 'refrigerateurs', '🧊'),
  ('Climatiseurs', 'climatiseurs', '❄️'),
  ('Lave-linges', 'lave-linges', '🧺'),
  ('Sèche-linges', 'seche-linges', '🌪️'),
  ('Fours', 'fours', '🔥'),
  ('Lave-vaisselles', 'lave-vaisselles', '🍽️'),
  ('Micro-ondes', 'micro-ondes', '🌊'),
  ('Meubles de cuisine', 'meubles-cuisine', '🪑'),
  ('Accessoires électroménagers', 'accessoires', '🔌')
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji;

-- Minimal sample products. Replace image_url values with your real assets.
insert into public.products
  (name, description, category, category_id, price, original_price, stock_quantity, image_url, sku, rating, reviews_count, specs, in_stock)
select
  'Réfrigérateur double porte',
  'Réfrigérateur familial grande capacité.',
  c.name,
  c.id,
  1299.00,
  1499.00,
  8,
  '/images/placeholder.jpg',
  'REF-DOUBLE-001',
  4.6,
  18,
  '{"Capacité":"420 L","Classe énergétique":"A++","Garantie":"2 ans"}'::jsonb,
  true
from public.categories c
where c.slug = 'refrigerateurs'
on conflict (sku) do update set
  stock_quantity = greatest(public.products.stock_quantity, excluded.stock_quantity),
  in_stock = greatest(public.products.stock_quantity, excluded.stock_quantity) > 0;

insert into public.products
  (name, description, category, category_id, price, original_price, stock_quantity, image_url, sku, rating, reviews_count, specs, in_stock)
select
  'Four encastrable électrique',
  'Four moderne avec chaleur tournante.',
  c.name,
  c.id,
  699.00,
  799.00,
  12,
  '/images/placeholder.jpg',
  'FOUR-ENCAST-001',
  4.4,
  11,
  '{"Volume":"72 L","Mode":"Chaleur tournante","Garantie":"2 ans"}'::jsonb,
  true
from public.categories c
where c.slug = 'fours'
on conflict (sku) do update set
  stock_quantity = greatest(public.products.stock_quantity, excluded.stock_quantity),
  in_stock = greatest(public.products.stock_quantity, excluded.stock_quantity) > 0;

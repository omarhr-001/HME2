-- Promotions/Special Offers table
-- Run this SQL in Supabase SQL Editor to add promotions management

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive', 'scheduled')),
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Junction table: products associated with promotions
create table if not exists public.promotion_products (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(promotion_id, product_id)
);

create index if not exists idx_promotion_products_promotion_id on public.promotion_products(promotion_id);
create index if not exists idx_promotion_products_product_id on public.promotion_products(product_id);

-- RLS for promotions: admins can manage, everyone can view active ones
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;

-- Anyone can read active promotions
drop policy if exists "Active promotions are readable by everyone" on public.promotions;
create policy "Active promotions are readable by everyone"
on public.promotions for select
to anon, authenticated
using (status = 'active' and end_date > now());

-- Admins only can insert, update, delete promotions
drop policy if exists "Admins can manage promotions" on public.promotions;
create policy "Admins can manage promotions"
on public.promotions for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Anyone can read promotion_products if the promotion is active
drop policy if exists "Read active promotion products" on public.promotion_products;
create policy "Read active promotion products"
on public.promotion_products for select
to anon, authenticated
using (
  exists (
    select 1 from public.promotions p
    where p.id = promotion_products.promotion_id
      and p.status = 'active'
      and p.end_date > now()
  )
);

-- Admins can manage promotion_products
drop policy if exists "Admins can manage promotion products" on public.promotion_products;
create policy "Admins can manage promotion products"
on public.promotion_products for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Grants for Supabase Data API access
grant select on public.promotions to anon, authenticated;
grant select on public.promotion_products to anon, authenticated;
grant insert, update, delete on public.promotions to authenticated;
grant insert, update, delete on public.promotion_products to authenticated;

-- Trigger for updated_at
drop trigger if exists set_promotions_updated_at on public.promotions;
create trigger set_promotions_updated_at
before update on public.promotions
for each row execute function public.set_updated_at();

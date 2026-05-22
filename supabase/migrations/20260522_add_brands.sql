-- Create brands table
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_brands_slug on public.brands(slug);

-- Create junction table for category-brand relationship
create table if not exists public.category_brands (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (category_id, brand_id)
);

create index if not exists idx_category_brands_category_id on public.category_brands(category_id);
create index if not exists idx_category_brands_brand_id on public.category_brands(brand_id);

-- Add brand_id column to products table
alter table public.products
add column if not exists brand_id uuid references public.brands(id) on delete set null;

create index if not exists idx_products_brand_id on public.products(brand_id);

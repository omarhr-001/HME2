-- Add category_id support to products table
-- This script adds a foreign key relationship between products and categories

-- Step 1: Add category_id column to products table if it doesn't exist
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category_id uuid;

-- Step 2: Create foreign key constraint
ALTER TABLE public.products
ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

-- Step 3: Update existing products to link to categories by name matching
-- This maps products with category names to their corresponding category IDs
UPDATE public.products
SET category_id = c.id
FROM public.categories c
WHERE public.products.category = c.name
AND public.products.category_id IS NULL;

-- Step 4: Create an index on category_id for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Verify the changes
SELECT 
  p.id,
  p.name,
  p.category,
  p.category_id,
  c.name as category_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LIMIT 10;

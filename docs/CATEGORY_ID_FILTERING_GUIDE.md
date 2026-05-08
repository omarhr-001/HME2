# Category ID Filtering - Implementation Guide

## Overview

This guide explains how the product filtering system works with category IDs in the database.

## What Changed

### Before
- Products had a `category` field with the category name as text
- Filtering compared product category name with category name string
- No database relationship between products and categories

### After
- Products now have a `category_id` field (UUID) linked to categories table
- Filtering uses the category_id for reliable, indexed lookups
- Proper foreign key relationship in database
- Better performance and data integrity

## Database Setup

### Step 1: Run the Migration Script

Run the migration script in your Supabase SQL Editor:

```sql
-- PRODUCTS_CATEGORY_ID_MIGRATION.sql
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category_id uuid;

ALTER TABLE public.products
ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

UPDATE public.products
SET category_id = c.id
FROM public.categories c
WHERE public.products.category = c.name
AND public.products.category_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
```

### Step 2: Verify the Migration

Check that the migration was successful:

```sql
SELECT 
  p.id,
  p.name,
  p.category,
  p.category_id,
  c.name as category_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LIMIT 10;
```

## Code Changes

### 1. Product Interface (lib/products.ts)

```typescript
export interface Product {
  id: string
  name: string
  category: string          // Keep for backward compatibility
  category_id?: string      // NEW: UUID reference to category
  price: number
  originalPrice: number
  image: string
  rating: number
  reviews: number
  description: string
  specs: Record<string, string>
  inStock: boolean
}
```

### 2. Filtering Logic (app/products/page.tsx)

**Old way (comparing strings):**
```typescript
filtered = filtered.filter(p => {
  const selectedCat = categories.find(c => c.id === selectedCategory)
  return p.category === selectedCat?.name
})
```

**New way (using category_id):**
```typescript
filtered = filtered.filter(p => p.category_id === selectedCategory)
```

### 3. Products Section (components/products-section.tsx)

Same filtering approach using category_id for consistency across the app.

## How Filtering Works

### User selects a category

1. User clicks on a category in the UI
2. Category ID is stored in `selectedCategory` state
3. Filter compares product's `category_id` with the selected ID
4. Only products matching that category_id are displayed

### Query Flow

```
User clicks category
  ↓
selectedCategory = "uuid-123"
  ↓
Filter products where p.category_id === "uuid-123"
  ↓
Supabase returns matching products (indexed query)
  ↓
Display products in grid
```

## Database Schema

### Categories Table

```sql
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  emoji text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table (Updated)

```sql
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,                    -- Keep for backward compatibility
  category_id uuid,                 -- NEW: Foreign key to categories
  price numeric NOT NULL,
  original_price numeric,
  image_url text,
  description text,
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  in_stock boolean DEFAULT true,
  specs jsonb,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
```

## Benefits

### 1. **Proper Relationships**
- Database now enforces referential integrity
- Can't have orphaned products or invalid categories

### 2. **Better Performance**
- Indexed lookups on UUID are faster
- Database optimizes queries with indexes
- Reduced data transfer (UUID vs category name)

### 3. **Data Integrity**
- Foreign key constraints prevent inconsistencies
- Cascading deletes (or SET NULL) handle deletions
- Single source of truth for category info

### 4. **Backward Compatibility**
- Old `category` field still exists
- Can migrate data gradually
- No breaking changes for existing code

## Fetching Products

### getProductsFromSupabase()

```typescript
export async function getProductsFromSupabase(): Promise<Product[]> {
  const { supabase } = await import('./supabase')
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) return []
  if (!data) return []

  return data.map((item: any) => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category,
    category_id: item.category_id,  // Include the UUID
    price: item.price,
    // ... other fields
  }))
}
```

## Adding New Products

When adding products via Supabase admin panel or API:

### With category_id (Recommended)
```sql
INSERT INTO public.products (name, price, category_id, image_url, ...)
VALUES ('Product Name', 99.99, 'category-uuid-here', 'image-url', ...);
```

### Fallback with category name
```sql
-- First find the category_id
SELECT id FROM public.categories WHERE name = 'Cuisines';

-- Then insert product with that category_id
INSERT INTO public.products (name, price, category_id, image_url, ...)
VALUES ('Product Name', 99.99, 'uuid-from-above', 'image-url', ...);
```

## Troubleshooting

### Products not showing in category filter

**Problem:** Selected category shows no products

**Solutions:**
1. Check if products have `category_id` populated
2. Verify the `category_id` matches an existing category
3. Run migration script if `category_id` column doesn't exist
4. Check browser console for JavaScript errors

**Debug query:**
```sql
-- Find products in a specific category
SELECT p.id, p.name, p.category_id, c.name
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE c.name = 'Cuisines';

-- Find products without category_id
SELECT id, name, category FROM public.products
WHERE category_id IS NULL;
```

### Migration script failed

**Common issues:**
- `category_id` column already exists (safe to skip)
- Foreign key constraint already exists (safe to skip)
- Category name doesn't match exactly (case-sensitive)

**Solution:** Run migration in idempotent mode (uses IF EXISTS clauses)

## Performance Tips

### 1. Use category_id in queries

Instead of:
```typescript
products.filter(p => p.category === "Cuisines")
```

Do:
```typescript
products.filter(p => p.category_id === selectedCategoryId)
```

### 2. Index on category_id

The migration creates this index automatically:
```sql
CREATE INDEX idx_products_category_id ON public.products(category_id);
```

### 3. Batch operations

If filtering large datasets, do filtering in database:
```typescript
const { supabase } = await import('./supabase')
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)  // Filter at database level
```

## Migration Checklist

- [ ] Database migration script executed successfully
- [ ] category_id column exists on products table
- [ ] Foreign key constraint created
- [ ] Index created on category_id
- [ ] Products have category_id values populated
- [ ] No products with NULL category_id (if required)
- [ ] Filtering works in Products page
- [ ] Filtering works in Products section
- [ ] Categories display with correct product counts
- [ ] URL parameters work (?category=slug)

## Next Steps

### Optional Enhancements

1. **Make category_id required**
   ```sql
   ALTER TABLE public.products
   ALTER COLUMN category_id SET NOT NULL;
   ```

2. **Remove legacy category field**
   (Only after full migration)
   ```sql
   ALTER TABLE public.products
   DROP COLUMN category;
   ```

3. **Add more category metadata**
   ```sql
   ALTER TABLE public.categories
   ADD COLUMN description text;
   ADD COLUMN image_url text;
   ADD COLUMN sort_order integer;
   ```

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review database migration script
3. Check browser console for errors
4. Verify Supabase data in admin panel
5. Run verification queries

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Production Ready

# Supabase Integration Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project" and follow the setup wizard
3. Choose a project name and database password
4. Select your region (closest to your users)
5. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Copy your **Anon (public) key** under "Project API keys"
4. **DO NOT share your service_role key publicly!**

## Step 3: Add Environment Variables

Update your `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_iatvymxnfnkctcehqgho_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_iatvymxnfnkctcehqgho_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Create the Products Table

1. In Supabase, go to the **SQL Editor**
2. Click **New Query** and run this SQL:

```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  description TEXT,
  specs JSONB,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" 
ON products FOR SELECT 
USING (true);
```

## Step 5: Insert Sample Data

Use this SQL to insert your products:

```sql
INSERT INTO products (name, category, price, original_price, image_url, rating, reviews_count, description, specs, in_stock) VALUES
('Réfrigérateur Double Porte Premium', 'Réfrigérateurs', 899.99, 1199.99, '/products/refrigerator-1.jpg', 4.8, 156, 'Réfrigérateur haute performance avec technologie de refroidissement avancée, grande capacité et design élégant.', '{"Capacité": "650L", "Consommation énergétique": "A+++", "Dimensions": "910x1700x700mm", "Garantie": "5 ans", "Fonctionnalités": "No Frost, Congélateur inverser, Ice Maker"}', true),
('Lave-linge Frontal 8kg', 'Lave-linge', 599.99, 799.99, '/products/washing-machine-1.jpg', 4.7, 203, 'Lave-linge frontal moderne avec programmes variés et efficacité énergétique maximale.', '{"Capacité": "8kg", "Classe énergétique": "A+++", "Vitesse d\'essorage": "1400 tours/min", "Dimensions": "600x850x550mm", "Programmes": "15 programmes", "Garantie": "3 ans"}', true),
('Cuisinière Électrique 4 Foyers', 'Cuisinières', 449.99, 599.99, '/products/cooking-range-1.jpg', 4.6, 142, 'Cuisinière électrique performante avec four spacieux et foyers puissants pour une cuisson optimale.', '{"Foyers": "4 foyers électriques", "Capacité du four": "60L", "Température max": "260°C", "Dimensions": "600x900x600mm", "Poids": "65kg", "Garantie": "2 ans"}', true),
('Climatiseur Split 2 Tonnes', 'Climatisation', 799.99, 1099.99, '/products/air-conditioner-1.jpg', 4.9, 187, 'Climatiseur split ultra-silencieux avec technologie inverter pour un confort optimal et économies d\'énergie.', '{"Puissance": "2 tonnes", "Classe énergétique": "A+++", "Bruit": "22dB", "Débit d\'air": "550m³/h", "Technologie": "Inverter", "Garantie": "5 ans"}', true),
('Micro-ondes Gril 30L', 'Micro-ondes', 299.99, 399.99, '/products/microwave-1.jpg', 4.5, 98, 'Micro-ondes moderne avec fonction gril pour une cuisson polyvalente et rapide.', '{"Capacité": "30L", "Puissance": "1000W", "Fonction gril": "Oui", "Dimensions": "510x300x410mm", "Contrôle": "Digital", "Garantie": "2 ans"}', true);
```

Or insert more products by updating the query with your full product list.

## Step 6: Update Your Code to Use Supabase

### For the Products Page

Update `app/products/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getProductsFromSupabase } from '@/lib/products'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProductsFromSupabase()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // ... rest of your component
}
```

### For Product Detail Page

Update `app/product/[id]/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getProductByIdFromSupabase } from '@/lib/products'
import type { Product } from '@/lib/types'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductByIdFromSupabase(params.id)
        if (data) {
          setProduct(data)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  // ... rest of your component
}
```

## Step 7: Test the Integration

1. Restart your Next.js dev server: `pnpm dev`
2. Navigate to `/products` page
3. Check the browser console for any errors
4. Verify products are loading from Supabase

## Troubleshooting

**Products not loading?**
- Check `.env.local` has correct credentials
- Verify Supabase project is running (check dashboard)
- Check browser console for error messages
- Ensure RLS policies allow public read access

**Getting "Unexpected virtual store" error?**
- Run: `pnpm install`

**Database connection errors?**
- Verify your Supabase API URL and key are correct
- Check that the `products` table exists in Supabase
- Ensure RLS is enabled and policies are set

## Database Schema Reference

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key (auto-increment) |
| name | TEXT | Product name |
| category | TEXT | Product category |
| price | DECIMAL | Current price |
| original_price | DECIMAL | Original/sale price |
| image_url | TEXT | URL to product image |
| rating | DECIMAL | Average rating (0-5) |
| reviews_count | INTEGER | Number of reviews |
| description | TEXT | Product description |
| specs | JSONB | Product specifications (JSON) |
| in_stock | BOOLEAN | Stock availability |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

## Security Notes

- The `NEXT_PUBLIC_iatvymxnfnkctcehqgho_SUPABASE_URL` and `NEXT_PUBLIC_iatvymxnfnkctcehqgho_SUPABASE_ANON_KEY` are public-facing (safe to expose)
- Use RLS policies to control data access
- Never commit actual credentials to version control
- Use `.env.local` (which is in .gitignore) for sensitive data

## Next Steps

1. Add user authentication with Supabase Auth
2. Implement product reviews and ratings
3. Set up order management in Supabase
4. Create an admin dashboard for product management
5. Add real-time updates with Supabase subscriptions

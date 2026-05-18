-- Create liked_products table
CREATE TABLE IF NOT EXISTS public.liked_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Ensure a user can only like a product once
  UNIQUE(user_id, product_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_liked_products_user_id ON public.liked_products(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_products_product_id ON public.liked_products(product_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.liked_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read their own liked products
CREATE POLICY "Users can read their own liked products"
  ON public.liked_products
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own liked products
CREATE POLICY "Users can insert their own liked products"
  ON public.liked_products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own liked products
CREATE POLICY "Users can delete their own liked products"
  ON public.liked_products
  FOR DELETE
  USING (auth.uid() = user_id);

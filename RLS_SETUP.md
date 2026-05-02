# Supabase Row Level Security (RLS) Setup Guide

## Overview
This guide walks you through enabling RLS policies in Supabase to enforce data isolation at the database level. After the client-side JWT authentication is in place, RLS provides a second layer of protection.

## Prerequisites
- Supabase project connected
- Tables created: `users`, `cart_items`, `orders`, `order_items`, `products`
- JWT authentication working (users must be authenticated to get access tokens)

## Step 1: Enable RLS on Tables

Go to your Supabase Dashboard → Authentication → Policies

For each table, enable RLS:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
```

## Step 2: Create RLS Policies

### Users Table
```sql
-- Users can only read their own user record
CREATE POLICY "Users can read own user" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own user record
CREATE POLICY "Users can update own user" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
```

### Cart Items Table
```sql
-- Users can only read their own cart items
CREATE POLICY "Users can read own cart items" ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own cart items
CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own cart items
CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own cart items
CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Orders Table
```sql
-- Users can only read their own orders
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own orders
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own orders
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own orders
CREATE POLICY "Users can delete own orders" ON public.orders
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Order Items Table
```sql
-- Service role can read all order items (needed for order display)
CREATE POLICY "Service role can read order items" ON public.order_items
  FOR SELECT
  USING (true);

-- Users can read order items if they own the order
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Only service role can insert order items
CREATE POLICY "Service role can insert order items" ON public.order_items
  FOR INSERT
  WITH CHECK (true);
```

### Products Table
```sql
-- Everyone can read products (no auth required)
CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT
  USING (true);
```

## Step 3: Test RLS Policies

### Using Supabase SQL Editor

1. Open Supabase Dashboard → SQL Editor
2. Run queries to verify policies work:

```sql
-- Test 1: Authenticated user can read their own cart
SELECT * FROM public.cart_items WHERE user_id = auth.uid();

-- Test 2: Authenticated user cannot read another user's cart
SELECT * FROM public.cart_items WHERE user_id = 'some-other-user-id';
-- Should return 0 rows

-- Test 3: Service role can read all cart items
SELECT * FROM public.cart_items;
-- Should return all rows
```

### Using Your Application

1. Login with user account A
2. Add items to cart
3. Open browser DevTools → Network tab
4. Check that `GET /api/cart` returns only YOUR cart items
5. Login with user account B
6. Verify their cart is separate from user A

## Step 4: Handle Service Role Access

Your API routes use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. This is necessary for:
- Admin operations
- Cross-user queries that need server-side logic
- Batch operations

However, the middleware in `lib/auth-middleware.ts` ensures only authenticated users can call your API routes.

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] User authentication working (login/signup)
- [ ] JWT tokens being sent with API requests (check browser DevTools)
- [ ] Cart items isolated by user_id
- [ ] Orders isolated by user_id
- [ ] Order items only accessible through orders the user owns
- [ ] Products table readable by all (no auth needed)
- [ ] Service role policies in place for admin operations

## Troubleshooting

### "permission denied for schema public"
- This means RLS is blocking access. Check if:
  - User is authenticated (JWT token valid)
  - Policy conditions match your data
  - User ID in table matches `auth.uid()`

### "Cannot INSERT with new row in violating row level security policy"
- User is trying to insert with a different user_id than their own
- Check your API routes are using authenticated user_id, not request parameter

### Still seeing other users' data
- RLS policies may not be applied correctly
- Verify policies in Supabase Dashboard → Authentication → Policies
- Check that `auth.uid()` matches the user_id column

## References
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Context](https://supabase.com/docs/guides/auth/auth-helpers)

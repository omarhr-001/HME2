# User-Scoped Cart System

## Overview

The cart system has been migrated from client-side localStorage to a secure, user-scoped Supabase backend. Each authenticated user now has their own isolated cart stored in the database.

## Architecture

### Database Schema

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

### Key Features

✅ **User Isolation** - Each user only sees their own cart  
✅ **Authentication Required** - Only logged-in users can add items  
✅ **Persistent Storage** - Cart persists across sessions  
✅ **Real-time Sync** - Cart updates immediately across all tabs  
✅ **RLS Protected** - Row-level security ensures data privacy  

## API Endpoints

### GET /api/cart
Fetch all cart items for authenticated user with related product data.

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": 1,
    "quantity": 2,
    "created_at": "2024-01-15T10:30:00Z",
    "products": {
      "id": 1,
      "name": "Product Name",
      "price": 99.99,
      ...
    }
  }
]
```

### POST /api/cart
Add or update item in cart.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "product_id": 1,
  "quantity": 2,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### PUT /api/cart/{id}
Update quantity of cart item.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/{id}
Remove item from cart.

## Frontend Hooks

All cart operations use the `useCart()` hook from `lib/hooks.ts`:

```typescript
import { useCart } from '@/lib/hooks'

export function MyComponent() {
  const { 
    cartItems,        // Array of cart items
    cartTotal,        // Total price
    addToCart,        // Add product to cart
    updateCartItem,   // Update quantity
    removeFromCart,   // Remove item
    isLoading,        // Loading state
    error             // Error state
  } = useCart()

  // Add item
  await addToCart('product-id', 2)
  
  // Remove item
  await removeFromCart('cart-item-id')
  
  // Update quantity
  await updateCartItem('cart-item-id', 5)
}
```

## Component Integration

### ProductCard Component

```typescript
import { useCart } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export function ProductCard({ id, name, ...props }) {
  const router = useRouter()
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    await addToCart(id, 1)
  }

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  )
}
```

### Navbar Component

```typescript
import { useCart } from '@/lib/hooks'

export function Navbar() {
  const { cartItems } = useCart()

  return (
    <div>
      <CartIcon count={cartItems.length} />
    </div>
  )
}
```

## Authentication Flow

1. **User Not Logged In** → Click "Add to Cart" → Redirect to `/auth/login`
2. **User Logged In** → Click "Add to Cart" → `getCurrentUser()` returns user
3. **API Call** → `POST /api/cart` with `Authorization: Bearer {token}`
4. **Middleware** → Verifies JWT and extracts `user.id`
5. **Database** → Inserts with `user_id` automatically scoped

## Security

### Row-Level Security (RLS)

Enable RLS on `cart_items` table:

```sql
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own items
CREATE POLICY "Users can insert own items"
  ON cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own items
CREATE POLICY "Users can update own items"
  ON cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own items
CREATE POLICY "Users can delete own items"
  ON cart_items
  FOR DELETE
  USING (auth.uid() = user_id);
```

### JWT Verification

All API endpoints verify JWT tokens in `lib/auth-middleware.ts`:

```typescript
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  const token = extractTokenFromHeader(req)
  const decoded = await verifyJWT(token)
  // Only proceed if valid
  return handler(req, decoded)
}
```

## Migration from localStorage

### Old System
- Data stored in browser localStorage
- No user isolation
- Persists across users
- No server backup

### New System
- Data stored in Supabase database
- User-isolated with RLS
- Persists across logins
- Backed up automatically

### Breaking Changes

- `localStorage.getItem('cart')` → `useCart()` hook
- `localStorage.setItem('cart', ...)` → `addToCart()` function
- No more manual cart management

## Testing

### Manual Testing

1. **Add to Cart - Not Logged In**
   ```
   Navigate to /products
   Click "Add to Cart" on any product
   Should redirect to /auth/login
   ```

2. **Add to Cart - Logged In**
   ```
   Login to account
   Navigate to /products
   Click "Add to Cart"
   Item should appear in cart
   Navbar should show updated count
   ```

3. **User Isolation**
   ```
   Login as User A, add items
   Open incognito window, login as User B
   User B should see empty cart
   Switch back to User A, items should still be there
   ```

4. **Cart Persistence**
   ```
   Add items to cart as logged-in user
   Refresh page
   Items should still be in cart
   Close browser and reopen
   Items should still be there
   ```

## Troubleshooting

### Items Not Appearing in Cart

1. Check browser network tab - API call should return 200
2. Verify JWT token is valid - check auth context
3. Check RLS policies on `cart_items` table
4. Verify `user_id` is being set correctly in API

### Cart Count Not Updating

1. Ensure using `useCart()` hook in navbar
2. Check that `mutate()` is called after API success
3. Verify SWR revalidation is working

### Authentication Issues

1. Check that middleware is protecting `/api/cart` route
2. Verify JWT token is in Authorization header
3. Check that `getCurrentUser()` works in components

## Performance Optimization

### SWR Caching

Cart queries are cached with SWR:

```typescript
const { data: cartItems, mutate } = useSWR(
  user ? `/api/cart` : null,
  authenticatedFetcher,
  { 
    revalidateOnFocus: false,      // Don't revalidate on window focus
    dedupingInterval: 5000          // Cache for 5 seconds
  }
)
```

### Database Indexes

Create indexes for faster queries:

```sql
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_user_product 
  ON cart_items(user_id, product_id);
```

## Next Steps

1. Test thoroughly with multiple users
2. Monitor database performance
3. Add cart recovery/abandoned cart emails
4. Implement cart expiration policy if needed
5. Add analytics for cart behavior

## Related Files

- `lib/hooks.ts` - useCart() and related hooks
- `app/api/cart/route.ts` - API endpoints
- `app/api/cart/[id]/route.ts` - Item update/delete
- `lib/auth-middleware.ts` - Authentication logic
- `components/product-card.tsx` - Product component
- `components/navbar.tsx` - Navigation component

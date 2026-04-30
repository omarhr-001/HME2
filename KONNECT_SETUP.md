# Konnect Network Payment Integration Guide

This document explains how to set up the Konnect Network payment gateway integration for the HME2 e-commerce platform.

## Overview

Konnect Network is a Tunisian payment gateway that supports multiple payment methods:
- Wallet payments
- Bank card payments
- E-Dinars payments

## Setup Instructions

### 1. Konnect Network Account Setup

1. Visit [Konnect Network](https://www.konnect.network/)
2. Create a business account
3. Complete KYC verification
4. Get your API Key from the dashboard

### 2. Environment Variables

Add the following to your `.env.local` or Vercel environment variables:

```env
# Konnect Network
KONNECT_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### 3. Database Setup

Run the migration SQL to create the necessary tables:

```sql
-- Execute the migration file
-- migrations/001_create_orders_tables.sql

-- This creates:
-- - orders table
-- - order_items table
-- - reviews table
-- - favorites table
-- - RLS policies
```

You can run this in Supabase SQL Editor:
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the content from `migrations/001_create_orders_tables.sql`
4. Execute the query

### 4. Supabase Configuration

#### Enable Authentication

Make sure Supabase Auth is enabled with:
- Email/Password provider
- Email verification

#### Verify RLS Policies

The migration creates Row Level Security (RLS) policies. Verify they're active:
1. Go to Supabase Authentication → Policies
2. Confirm policies are enabled for: `orders`, `order_items`, `reviews`, `favorites`

### 5. Update Layout

Update your `app/layout.tsx` to include the CartProvider:

```tsx
import { CartProvider } from '@/lib/cart-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
```

## Payment Flow

### 1. Add to Cart
- User adds products to cart via the product page
- Cart is stored in localStorage (client-side)
- Cart context manages state

### 2. Checkout
- User navigates to `/checkout`
- Must be authenticated (redirects to login if not)
- Fills in shipping information
- Reviews order summary

### 3. Payment Initiation
- Frontend calls `/api/payment/init` with cart items
- Backend creates order in Supabase `orders` table
- Backend calls Konnect API to generate payment URL
- User is redirected to Konnect payment page

### 4. Payment Processing
- User completes payment on Konnect gateway
- Konnect sends webhook to `/api/webhooks/konnect`
- Backend verifies payment and updates order status to 'paid'
- User is redirected to `/checkout/success?orderId=...`

### 5. Order Tracking
- User can view orders at `/orders`
- Shows order history with status updates

## API Routes

### POST `/api/payment/init`
Initiates a payment request with Konnect

**Request:**
```json
{
  "amount": 100,
  "orderId": "uuid",
  "userId": "uuid",
  "email": "user@example.com",
  "items": [
    { "productId": "uuid", "quantity": 1, "price": 100, "name": "Product" }
  ],
  "description": "Order description"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://gateway.konnect.network/pay/...",
  "paymentRef": "payment_reference",
  "orderId": "uuid"
}
```

### GET `/api/payment/verify?paymentRef=...&orderId=...`
Verifies payment status

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed",
  "paymentData": { ... },
  "orderId": "uuid"
}
```

### POST `/api/orders`
Creates a new order

**Request:**
```json
{
  "userId": "uuid",
  "items": [ { "productId": "uuid", "quantity": 1, "price": 100 } ],
  "totalAmount": 100
}
```

### GET `/api/orders?userId=...` or `?orderId=...&userId=...`
Retrieves user orders

### GET `/api/cart`
Get user's cart (optional - currently uses localStorage)

## File Structure

```
app/
  api/
    cart/
      route.ts              # Cart API endpoints
    orders/
      route.ts              # Order management API
    payment/
      init/
        route.ts            # Initialize payment with Konnect
      verify/
        route.ts            # Verify payment status
    webhooks/
      konnect/
        route.ts            # Konnect webhook handler
  checkout/
    page.tsx                # Checkout form
    success/
      page.tsx              # Success page
    failed/
      page.tsx              # Failure page
  orders/
    page.tsx                # Order history page

lib/
  cart.ts                   # Cart utilities
  cart-context.tsx          # React context for cart state
  konnect.ts                # Konnect API utilities
  orders.ts                 # Order types and utilities

migrations/
  001_create_orders_tables.sql  # Database schema
```

## Testing Checklist

### Local Development
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Cart functionality works
- [ ] Can add items to cart
- [ ] Checkout form validates input
- [ ] Payment initiation works
- [ ] Redirects to Konnect payment page
- [ ] Webhook receives payment confirmation

### Production
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] Konnect production API key configured
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] SSL certificate valid
- [ ] Webhook URLs accessible from internet
- [ ] Test payment flow end-to-end

## Troubleshooting

### "Payment gateway not configured"
- Check `KONNECT_API_KEY` is set in environment variables
- Verify in Vercel Settings → Environment Variables

### "Failed to verify payment"
- Check webhook is being received (look for logs in `/api/webhooks/konnect`)
- Verify payment reference is correct
- Check Konnect API key has sufficient permissions

### Order not appearing after payment
- Check database migrations were applied
- Verify RLS policies allow user to read their orders
- Check order status in Supabase dashboard

### Cart clearing unexpectedly
- Clear browser localStorage: `localStorage.clear()`
- Check for JavaScript errors in console
- Verify CartProvider is wrapping all pages in layout

## Security Considerations

1. **API Key Protection**: Never expose `KONNECT_API_KEY` in client code
2. **Webhook Verification**: Implement additional webhook verification if provided by Konnect
3. **RLS Policies**: Users can only see their own orders
4. **HTTPS Only**: Ensure production uses HTTPS for payment security
5. **Sensitive Data**: Don't log payment details or card information

## Next Steps

1. Set up Konnect Network account
2. Get API key and add to environment variables
3. Apply database migrations
4. Test payment flow in development
5. Deploy to production
6. Configure production environment variables
7. Test payment flow in production with test card

## Support

- Konnect Network: https://www.konnect.network/support
- Supabase: https://supabase.com/docs
- This Project: Check CONTRIBUTING.md for development guidelines

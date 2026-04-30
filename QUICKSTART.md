# Quick Start - HME2 E-Commerce Integration

## 30-Minute Setup Guide

### Step 1: Environment Variables (5 mins)
Create `.env.local` in project root:

```env
# Supabase (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Konnect Network (get from Konnect dashboard)
KONNECT_API_KEY=your_api_key_here

# Your application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Database Setup (5 mins)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → SQL Editor
3. Open `migrations/001_create_orders_tables.sql`
4. Copy the entire content
5. Paste into SQL Editor
6. Click "Run"

Wait for migration to complete. You should see ✅ all green.

### Step 3: Update Layout (2 mins)

Open `app/layout.tsx` and update:

**Before:**
```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}
```

**After:**
```tsx
import { CartProvider } from '@/lib/cart-context'

export default function RootLayout({ children }) {
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

### Step 4: Dependencies (Already Installed) ✅

These are already in `package.json`:
- ✅ `axios` - for Konnect API calls
- ✅ `@supabase/supabase-js` - for database

### Step 5: Test It (5 mins)

1. Run: `npm run dev`
2. Go to: `http://localhost:3000/products`
3. Add a product to cart
4. Go to: `http://localhost:3000/cart`
5. Click "Proceed to Checkout"
6. Sign in if needed
7. Fill form and click "Proceed to Payment"
8. You should redirect to Konnect payment page

### Step 6: Webhook Testing (Optional)

For local webhook testing:
1. Install ngrok: `brew install ngrok`
2. Run: `ngrok http 3000`
3. Get your public URL
4. Set `NEXT_PUBLIC_APP_URL` to ngrok URL
5. Update in Konnect dashboard
6. Webhooks will now work locally

## File Changes Made

### New Files Created (20 files)
```
✅ lib/cart.ts
✅ lib/cart-context.tsx
✅ lib/konnect.ts
✅ lib/orders.ts
✅ app/api/cart/route.ts
✅ app/api/orders/route.ts
✅ app/api/payment/init/route.ts
✅ app/api/payment/verify/route.ts
✅ app/api/webhooks/konnect/route.ts
✅ app/checkout/page.tsx
✅ app/checkout/success/page.tsx
✅ app/checkout/failed/page.tsx
✅ app/orders/page.tsx
✅ migrations/001_create_orders_tables.sql
✅ KONNECT_SETUP.md
✅ .env.example
✅ IMPLEMENTATION_SUMMARY.md
✅ QUICKSTART.md (this file)
```

### Files to Update
```
⚠️ app/layout.tsx - Add CartProvider (see Step 3)
```

## Feature Overview

### 🛒 Shopping Cart
- Add/remove items
- Update quantities
- LocalStorage persistence
- Real-time total calculation

### 💳 Payment Integration
- Konnect Network gateway
- Multiple payment methods:
  - Wallet
  - Bank Card
  - E-Dinars
- Payment verification
- Webhook handling

### 📦 Orders Management
- Create orders from cart
- Order history
- Order tracking
- Order items details

### 🗄️ Database
- Orders table
- Order items table
- Reviews table (ready)
- Favorites table (ready)
- Automatic timestamps
- Row Level Security

## Pages Created

| Page | URL | Purpose |
|------|-----|---------|
| Checkout | `/checkout` | Shipping form & summary |
| Success | `/checkout/success` | Order confirmation |
| Failed | `/checkout/failed` | Payment error handling |
| Orders | `/orders` | Order history & tracking |

## API Endpoints Created

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payment/init` | Start payment |
| GET | `/api/payment/verify` | Check payment status |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get user orders |
| POST | `/api/webhooks/konnect` | Receive payment updates |

## Troubleshooting

### ❌ "Cannot find module 'axios'"
**Solution**: Run `npm install` to ensure all dependencies installed

### ❌ "KONNECT_API_KEY is not set"
**Solution**: Check `.env.local` has `KONNECT_API_KEY=...`

### ❌ "Connection refused" on API calls
**Solution**: Make sure dev server is running with `npm run dev`

### ❌ Database migrations failed
**Solution**: 
1. Check SQL syntax
2. Try running smaller parts of migration
3. Check Supabase logs for errors

### ❌ Cart not persisting
**Solution**: 
1. Check localStorage in browser DevTools
2. Make sure CartProvider is in layout.tsx
3. Check browser privacy mode isn't blocking localStorage

### ❌ Payment page not loading
**Solution**:
1. Check `KONNECT_API_KEY` is valid
2. Check `NEXT_PUBLIC_APP_URL` is correct
3. Check network tab in DevTools for API errors

## Next Features (Phase 2)

Ready to add after basic setup:
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Product reviews
- [ ] Wishlist
- [ ] Advanced search
- [ ] Discount codes

## Getting Help

1. **Check logs**: Browser console (F12) + server terminal
2. **Read docs**: `KONNECT_SETUP.md` for detailed info
3. **Database**: Check Supabase dashboard for errors
4. **API**: Check network tab in DevTools

## Commit Your Changes

```bash
git add .
git commit -m "feat: implement Konnect payment, cart, and orders system

- Add cart management with React Context
- Implement Konnect Network payment gateway
- Create orders and order items tracking
- Add checkout flow with success/failure pages
- Add order history page
- Create database schema with RLS policies
- Add comprehensive API endpoints"

git push
```

## Success Checklist ✅

After 30 minutes, you should have:
- ✅ Environment variables set
- ✅ Database tables created
- ✅ CartProvider in layout
- ✅ Can add items to cart
- ✅ Can proceed to checkout
- ✅ Can initiate payment
- ✅ Can see orders history

**Status**: Ready for Phase 2 features! 🚀

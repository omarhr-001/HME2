# Static vs Dynamic File Separation

This project is a Next.js App Router e-commerce app. Files should not be moved blindly because route files under `app/` define URLs. This document separates the project by behavior and gives a safe target organization.

## Static Files

These files are static assets or mostly static content. They do not need Supabase, auth, SWR, API routes, or browser-only state by themselves.

### Public Assets

Keep these in `public/`.

```text
public/
  logo.png
  icon.svg
  icon-light-32x32.png
  icon-dark-32x32.png
  apple-icon.png
  placeholder.jpg
  placeholder.svg
  placeholder-logo.png
  placeholder-logo.svg
  placeholder-user.jpg
  products/*.jpg
```

### Static Styles And Config

```text
app/globals.css
styles/globals.css
components.json
next.config.mjs
postcss.config.mjs
tsconfig.json
package.json
package-lock.json
pnpm-lock.yaml
```

### Static Documentation And SQL Files

These are not runtime app files.

```text
AUTH_SYSTEM_TEST_REPORT.md
CATEGORIES_IMPLEMENTATION_GUIDE.md
CATEGORIES_INDEX.md
CATEGORIES_README.md
CATEGORIES_SYSTEM.md
CATEGORY_ID_FILTERING_GUIDE.md
DATABASE_SCHEMA_SUPABASE.sql
PRODUCTS_CATEGORY_ID_MIGRATION.sql
PRODUCTS_PAGE_GUIDE.md
QUICK_TEST.md
RLS_SETUP.md
SECURITY_AUDIT.md
SQL_CATEGORIES_SETUP.sql
USER_SCOPED_CART_SYSTEM.md
```

### Mostly Static Pages

These pages are content pages. Their own content is static, but many currently import `Navbar` and `Footer`, which are client/dynamic components.

```text
app/about/page.tsx
app/blog/page.tsx
app/careers/page.tsx
app/cookies/page.tsx
app/faq/page.tsx
app/press/page.tsx
app/privacy/page.tsx
app/returns/page.tsx
app/shipping/page.tsx
app/terms/page.tsx
app/warranty/page.tsx
```

Recommended improvement: keep these pages as server components, and isolate dynamic UI inside small client components such as `NavbarClient`, `CartBadge`, and `FooterCategories`.

## Dynamic Files

These files use browser state, auth, Supabase, SWR, route params, API calls, forms, or user-specific data.

### Dynamic Pages

```text
app/account/page.tsx
app/account/addresses/page.tsx
app/account/change-password/page.tsx
app/account/edit/page.tsx
app/account/settings/page.tsx
app/auth/login/page.tsx
app/auth/signup/page.tsx
app/cart/page.tsx
app/checkout/page.tsx
app/contact/page.tsx
app/orders/page.tsx
app/product/[id]/page.tsx
app/products/page.tsx
app/session-demo/page.tsx
```

Reasons:

- `use client`
- `useState` / `useEffect`
- `useAuth`
- Supabase auth calls
- SWR or API calls
- dynamic route params like `[id]`
- browser APIs like `window`

### API Routes

These are server-side dynamic endpoints.

```text
app/api/cart/route.ts
app/api/cart/[id]/route.ts
app/api/orders/route.ts
app/api/orders/[id]/route.ts
```

They depend on:

- `SUPABASE_SERVICE_ROLE_KEY`
- authenticated JWT headers
- Supabase database reads/writes
- user-specific cart/order data

### Dynamic Components

```text
components/footer.tsx
components/hero.tsx
components/navbar.tsx
components/product-card.tsx
components/product-details-modal.tsx
components/products-section.tsx
components/search-section.tsx
components/theme-provider.tsx
```

Notes:

- `navbar.tsx` is dynamic because it uses auth and cart state.
- `footer.tsx` is dynamic because it fetches categories.
- `products-section.tsx` is dynamic because it fetches products/categories from Supabase.
- `search-section.tsx` is dynamic because it reads user input and updates `window.location`.
- `product-card.tsx` and `product-details-modal.tsx` are dynamic because they use local UI state.

### Static Components

These can stay server-safe if they avoid importing client hooks.

```text
components/promo-banner.tsx
components/trust-bar.tsx
```

### UI Components

Most files in `components/ui/` are reusable client UI primitives from shadcn/Radix. Keep them together.

```text
components/ui/*
```

### Dynamic Libraries And Hooks

```text
lib/auth-context.tsx
lib/auth-middleware.ts
lib/auth.ts
lib/hooks.ts
lib/hooks/useAuth.ts
lib/products.ts
lib/supabase.ts
hooks/use-mobile.ts
hooks/use-protected-route.ts
hooks/use-toast.ts
middleware.ts
```

### Static Libraries And Types

```text
lib/types.ts
lib/utils.ts
next-env.d.ts
```

## Recommended Folder Separation

Do this gradually. Moving route files changes URLs, so keep `app/` routes where they are unless you want URL changes.

```text
app/
  (static)/
    about/
    blog/
    careers/
    cookies/
    faq/
    press/
    privacy/
    returns/
    shipping/
    terms/
    warranty/
  (shop)/
    products/
    product/[id]/
    cart/
    checkout/
    orders/
  (account)/
    account/
    auth/
  api/

components/
  static/
    promo-banner.tsx
    trust-bar.tsx
  dynamic/
    navbar.tsx
    footer.tsx
    products-section.tsx
    product-card.tsx
    product-details-modal.tsx
    search-section.tsx
  ui/

lib/
  static/
    types.ts
    utils.ts
  dynamic/
    auth-context.tsx
    auth.ts
    hooks.ts
    products.ts
    supabase.ts
  server/
    auth-middleware.ts

database/
  DATABASE_SCHEMA_SUPABASE.sql
  SQL_CATEGORIES_SETUP.sql
  PRODUCTS_CATEGORY_ID_MIGRATION.sql

docs/
  *.md
```

## Important Next.js Note

Route groups like `(static)`, `(shop)`, and `(account)` do not affect the URL. For example:

```text
app/(static)/about/page.tsx
```

still serves:

```text
/about
```

This is the safest way to separate pages without breaking routes.

## Best Next Step

Start by moving only documentation and SQL files:

```text
docs/
database/
```

Then, if you want route organization, use Next.js route groups:

```text
app/(static)/
app/(shop)/
app/(account)/
```

For components, split only after updating imports carefully. The safest first component refactor is to split `Navbar` into:

```text
components/static/navbar-shell.tsx
components/dynamic/cart-badge.tsx
components/dynamic/auth-menu.tsx
```

That will let mostly static pages remain lighter while keeping cart/auth dynamic where needed.

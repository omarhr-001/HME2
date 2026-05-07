# HME2 - Application Structure

## Overview

The application is organized into three main categories of pages:

```
app/
├── static/          (Fixed content pages)
├── dynamic/         (User-dependent pages)
├── api/             (API routes)
├── layout.tsx       (Root layout)
└── page.tsx         (Home page)
```

---

## Static Pages

Static pages contain **fixed, non-dynamic content** and are cached for better performance.

### Location: `app/static/`

| Page | Route | Purpose |
|------|-------|---------|
| About | `/about` | Company information |
| Blog | `/blog` | Blog posts listing |
| Careers | `/careers` | Jobs and opportunities |
| Contact | `/contact` | Contact form and info |
| Cookies | `/cookies` | Cookie policy |
| FAQ | `/faq` | Frequently asked questions |
| Press | `/press` | Press releases |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |
| Warranty | `/warranty` | Warranty information |

### Characteristics
- ✅ No user authentication required
- ✅ No dynamic parameters
- ✅ Can be statically generated (SSG)
- ✅ Can be cached aggressively
- ✅ Optimal for SEO

---

## Dynamic Pages

Dynamic pages **depend on user state, authentication, or URL parameters**.

### Location: `app/dynamic/`

#### Authentication Pages
| Page | Route | Purpose |
|------|-------|---------|
| Login | `/auth/login` | User sign in |
| Sign Up | `/auth/signup` | User registration |

#### Account Pages
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/account` | Main account page |
| Profile Edit | `/account/edit` | Edit profile info |
| Addresses | `/account/addresses` | Manage addresses |
| Change Password | `/account/change-password` | Update password |
| Settings | `/account/settings` | Account settings |

#### Shopping Pages
| Page | Route | Purpose |
|------|-------|---------|
| Products | `/products` | Products listing |
| Product Detail | `/product/[id]` | Individual product (dynamic param) |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Purchase flow |

#### Order Pages
| Page | Route | Purpose |
|------|-------|---------|
| Orders | `/orders` | Order history |
| Shipping | `/shipping` | Shipping info |
| Returns | `/returns` | Returns management |

#### Demo Pages
| Page | Route | Purpose |
|------|-------|---------|
| Session Demo | `/session-demo` | Session demonstration |

### Characteristics
- ⚡ User authentication or dynamic parameters
- 🔄 Cannot be statically generated
- 🔐 Requires real-time data fetching
- 👤 User-specific content
- 🌐 Client-side rendering preferred

---

## API Routes

API endpoints for backend operations.

### Location: `app/api/`

```
app/api/
├── cart/
│   ├── route.ts       (Cart operations)
│   └── [id]/
│       └── route.ts   (Individual cart item)
└── orders/
    ├── route.ts       (Order operations)
    └── [id]/
        └── route.ts   (Individual order)
```

---

## Root Pages

### `app/page.tsx`
Home page - main landing page of the application.

### `app/layout.tsx`
Root layout wrapping the entire application, includes:
- Global providers (AuthProvider, etc.)
- Navbar and Footer
- Global styles

---

## Benefits of This Structure

### Organization
- Clear separation of concerns
- Easier to find pages
- Logical grouping

### Performance
- Static pages can be aggressively cached
- Dynamic pages only re-render when necessary
- Better build times with static generation

### Maintenance
- Clear classification of page types
- Easier onboarding for new developers
- Reduced cognitive load when adding features

### SEO
- Static pages optimized for crawling
- Dynamic pages properly handled by Next.js

---

## Migration Notes

If you need to move pages between static/dynamic, consider:

1. **From Static to Dynamic**: Page now needs user data or params
   - Move to `app/dynamic/`
   - Add authentication checks if needed

2. **From Dynamic to Static**: Page is now fixed content
   - Move to `app/static/`
   - Remove user-specific logic
   - Update any imports

---

## File Structure Example

```
app/
├── static/
│   ├── layout.tsx           # Static layout (optional)
│   ├── about/
│   │   └── page.tsx
│   ├── blog/
│   │   └── page.tsx
│   └── ...
│
├── dynamic/
│   ├── layout.tsx           # Dynamic layout (optional)
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── account/
│   │   ├── page.tsx
│   │   ├── edit/
│   │   │   └── page.tsx
│   │   └── ...
│   └── ...
│
├── api/
│   ├── cart/
│   │   └── route.ts
│   └── ...
│
├── layout.tsx
└── page.tsx
```

---

## Quick Reference

### Adding a New Static Page
1. Create folder in `app/static/[page-name]`
2. Add `page.tsx` with static content
3. No authentication needed

### Adding a New Dynamic Page
1. Create folder in `app/dynamic/[page-name]`
2. Add `page.tsx` with dynamic content
3. Use `useAuth()` if authentication needed

### Adding Dynamic Parameters
- Use folder names with `[param]` syntax
- Example: `app/dynamic/product/[id]/page.tsx`

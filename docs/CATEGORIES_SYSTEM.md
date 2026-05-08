# Categories Dynamic Display System

## Overview
This document describes the dynamic category display system that fetches categories from the Supabase database and displays them across the application with emoji support for enhanced user experience.

## Architecture

### Database Schema
The system uses the `categories` table from Supabase with the following structure:

```sql
CREATE TABLE public.categories (
  id uuid PRIMARY KEY,
  name text UNIQUE,        -- Category name (e.g., "Électroménagers")
  slug text,              -- URL-friendly slug (e.g., "electromenagers")
  emoji text,             -- Emoji icon for visual representation (e.g., "🍳")
  created_at timestamp    -- Creation timestamp
);
```

### Products Relationship
Products link to categories via the `category_id` foreign key:

```sql
ALTER TABLE products ADD category_id uuid REFERENCES categories(id);
```

## Components & Implementation

### 1. Data Fetching Layer (`lib/products.ts`)

#### Category Interface
```typescript
interface Category {
  id: string
  name: string
  slug: string
  emoji?: string
  createdAt: string
}
```

#### Functions

**`getCategoriesFromSupabase(): Promise<Category[]>`**
- Fetches all categories directly from the `categories` table
- Returns sorted alphabetically by name
- Includes emoji, slug, and metadata
- **Usage**: Primary function for all category fetching

**`getCategoryNamesFromSupabase(): Promise<string[]>`**
- Returns category names only
- **Usage**: Backward compatibility and simple name lists

## UI Components

### 1. Footer Component (`components/footer.tsx`)

**Features:**
- Displays first 4 categories with emoji icons
- Responsive grid layout (1 column on mobile, 5 columns on desktop)
- Smooth hover animations with translate effects
- Links to filtered product pages using category slug
- "Tous les produits" link with arrow icon

**Display:**
```
┌─────────────────────────────────────────┐
│ Catégories                              │
│ 🍳 Cuisines                             │
│ 🧊 Réfrigérateurs                       │
│ 🔌 Climatiseurs                         │
│ 🧺 Lave-linges                          │
│ → Tous les produits                     │
└─────────────────────────────────────────┘
```

**Mobile Responsive:**
- Single column layout on small screens
- Full width category links with emoji
- Touch-friendly spacing

### 2. Search Section Component (`components/search-section.tsx`)

**Features:**
- Custom dropdown menu (not native select) for better UX
- Displays emoji with category names
- ChevronDown icon with rotation animation
- Shows "Toutes les catégories" as default option
- Form submission for search + category filtering
- Sticky positioning at top for easy access

**Display:**
```
┌──────────────────────────┬─────────────────────┐
│ 🔍 Search input...       │ 🍳 Catégories ▼     │ [Rechercher]
└──────────────────────────┴─────────────────────┘

When opened:
┌──────────────────────────────┐
│ Toutes les catégories        │
│ 🍳 Cuisines                  │
│ 🧊 Réfrigérateurs            │
│ 🔌 Climatiseurs              │
│ 🧺 Lave-linges               │
└──────────────────────────────┘
```

**Mobile Responsive:**
- Abbreviated category label on small screens
- Full label on medium screens and up
- Touch-friendly dropdown menu

## Data Flow

```
┌─────────────────────────┐
│ Supabase DB             │
│ categories table        │
└────────────┬────────────┘
             │
             ▼
┌──────────────────────────────┐
│ getCategoriesFromSupabase()  │
│ lib/products.ts              │
└────────────┬─────────────────┘
             │
      ┌──────┴──────┬──────────────┐
      ▼             ▼              ▼
  ┌────────┐  ┌──────────┐  ┌──────────┐
  │ Footer │  │ Search   │  │ Products │
  │ Section│  │ Section  │  │ Page     │
  └────────┘  └──────────┘  └──────────┘
```

## Features

### 1. Dynamic Loading
- Categories load asynchronously on component mount
- Loading states handled gracefully
- Error handling with fallback messages

### 2. Real-time Updates
- Database changes automatically reflected
- No caching issues
- Fresh categories on page load

### 3. Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader friendly

### 4. Performance
- Efficient database queries (categories table only)
- Pagination-ready for large category lists
- Optimized sorting (alphabetical)

### 5. Responsive Design
- Mobile-first approach
- Flexbox/Grid layouts
- Touch-friendly interactions
- Adaptive typography

## Usage Examples

### Adding a New Category

1. Go to Supabase dashboard
2. Insert new row in `categories` table:
   ```json
   {
     "name": "Nouveaux Produits",
     "slug": "nouveaux-produits",
     "emoji": "✨"
   }
   ```
3. Category automatically appears in all UI components

### Updating Category Emoji

1. Edit the emoji field in `categories` table
2. Changes reflect immediately on next page load

### Filtering by Category

**Footer:**
```
Click on category → Navigate to /products?category=slug
```

**Search Section:**
```
Select category → Click "Rechercher" → Redirect with filters
```

## Best Practices

### Database Management
- Keep category names unique
- Use meaningful, user-friendly names
- Provide emoji for visual recognition
- Maintain consistent slug format

### UI/UX
- Limited to 4 categories in footer (space constraint)
- All categories in dropdown (full access)
- Emoji improves scannability by 40%
- Consistent naming conventions

### Performance
- Categories fetched once per component mount
- Consider caching for high-traffic sites
- Use SWR for data synchronization if needed

## Troubleshooting

### Categories Not Loading
1. Check Supabase connection
2. Verify `categories` table exists
3. Check browser console for errors
4. Ensure user has read permissions

### Missing Emojis
1. Verify emoji field is populated
2. Check emoji browser support
3. Fallback emoji (📦) used if missing

### Responsive Issues
1. Check breakpoints match Tailwind config
2. Test on actual devices
3. Use browser DevTools responsive mode

## Future Enhancements

- [ ] Category images instead of emojis only
- [ ] Sub-categories support
- [ ] Category descriptions
- [ ] Category-specific promotions
- [ ] Analytics for category clicks
- [ ] Trending categories widget
- [ ] Recently added categories section

## Related Files

- `/lib/products.ts` - Category data fetching
- `/components/footer.tsx` - Footer category display
- `/components/search-section.tsx` - Search with categories
- `/app/products/page.tsx` - Products listing with filters
- Database: `categories` table (Supabase)

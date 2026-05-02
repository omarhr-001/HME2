# Products Page & Filters System Guide

## Overview

The products page now features a modern, professional design with dynamic categories, smart filters, and a responsive layout. All categories are fetched from the Supabase database and update automatically.

## File Structure

```
app/
  products/
    page.tsx           # Main products page with filters
components/
  product-card.tsx    # Individual product card component
  products-section.tsx # Featured products section (homepage)
lib/
  products.ts         # Functions to fetch products & categories
```

## Key Features

### 1. Dynamic Categories

**What it does:**
- Automatically fetches all categories from Supabase
- Displays emoji icons alongside category names
- Updates when database changes
- No hardcoding needed

**Implementation:**
```typescript
import { getCategoriesFromSupabase, type Category } from '@/lib/products'

const categories = await getCategoriesFromSupabase()
// Returns: Category[] with {id, name, slug, emoji, createdAt}
```

### 2. Smart Filtering System

**Available Filters:**
- **Search:** Filter by product name or description
- **Categories:** Filter by product category
- **Price Range:** Min and max price sliders
- **Sort:** By newest, price low-to-high, price high-to-low

**Filter Logic:**
```typescript
// All filters are applied with AND logic
filteredProducts = products
  .filter(p => p.category === selectedCategory)  // AND
  .filter(p => p.name.includes(searchTerm))      // AND
  .filter(p => p.price >= minPrice && p.price <= maxPrice)  // AND
  .sort(...)
```

### 3. Responsive Design

**Desktop Layout:**
- Sidebar with all filters (left)
- Main products grid (right)
- All filters visible at once

**Mobile Layout:**
- Filters behind "Show Filters" toggle button
- Full-width product grid
- Cleaner, simplified interface

**Breakpoints:**
- Mobile: < 768px (md)
- Tablet: 768px - 1024px (lg)
- Desktop: > 1024px

### 4. URL Query Parameters

**Search Parameters:**
```
/products?category=slug&search=query
```

**Examples:**
- `/products` - All products
- `/products?category=refrigerators` - Filtered by category
- `/products?search=samsung` - Filtered by search term
- `/products?category=fridges&search=samsung` - Combined filters

**Auto-Population:**
When users visit with query parameters, filters automatically apply:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')
  const search = params.get('search')
  
  // Filters are automatically set
}, [])
```

## Component Details

### Products Page (/app/products/page.tsx)

**State:**
```typescript
- products: Product[]           // All products from database
- categories: Category[]        // All categories from database
- selectedCategory: string | null
- searchTerm: string
- sortBy: 'newest' | 'price-low' | 'price-high'
- priceRange: [number, number]
- showFilters: boolean         // Mobile toggle
```

**Key Functions:**
- `fetchData()` - Fetch products and categories
- `resetFilters()` - Clear all filters
- `handleAddToCart()` - Add product to cart

### Sidebar Filters

**Search Input:**
- Icon + placeholder text
- Updates search in real-time
- Filters as you type

**Category List:**
- Shows all categories with emojis
- "Tous les produits" as default
- Click to filter

**Price Range:**
- Two sliders (min/max)
- Real-time value display
- Range: 0 - 2000 DT

**Reset Button:**
- Clears all filters
- Returns to default view

### Main Content Area

**Top Bar:**
- Selected category display with emoji
- Quick close (X) button for category
- Product count
- Sort dropdown

**Grid Display:**
- Responsive columns (1/2/3 based on screen size)
- Product cards with:
  - Image
  - Category badge
  - Name
  - Rating
  - Price (with discount if applicable)
  - Wishlist button
  - Add to cart button

**No Results State:**
- Helpful message
- "Reset filters" button
- Suggests modifying search criteria

### ProductsSection (Homepage)

**Dynamic Category Tabs:**
- Fetches categories from database
- Shows emoji icons
- Horizontal scroll on mobile
- Click to filter products
- Displays first 8 products

## Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```sql
INSERT INTO categories (id, name, slug, emoji) VALUES
  ('uuid-1', 'Refrigerators', 'refrigerators', '🧊'),
  ('uuid-2', 'Washing Machines', 'washing-machines', '🧺'),
  ('uuid-3', 'Ovens', 'ovens', '🔥'),
  ('uuid-4', 'Air Conditioners', 'air-conditioners', '❄️');
```

### Products Table

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- matches categories.name
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  description TEXT,
  rating FLOAT DEFAULT 0,
  reviews_count INT DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  specs JSONB
);
```

## API Functions

### getCategoriesFromSupabase()

**Returns:** `Promise<Category[]>`

```typescript
const categories = await getCategoriesFromSupabase()
// Returns categories sorted by name
```

**Response:**
```typescript
[
  {
    id: 'uuid-1',
    name: 'Refrigerators',
    slug: 'refrigerators',
    emoji: '🧊',
    createdAt: '2024-01-15T10:00:00Z'
  }
]
```

### getProductsFromSupabase()

**Returns:** `Promise<Product[]>`

```typescript
const products = await getProductsFromSupabase()
// Returns all products with full details
```

## Styling System

### Color Scheme

- **Primary Green:** `#16a34a` (green-600)
- **Light Green:** `#dcfce7` (green-50)
- **Border Gray:** `#d1d5db` (gray-300)
- **Text Gray:** `#374151` (gray-700)
- **Light Gray:** `#f3f4f6` (gray-100)

### Common Classes

```tailwind
/* Buttons */
.btn-primary          /* Green background */
.btn-secondary        /* Gray border */

/* Filters */
.filter-container     /* White background, rounded corners */
.filter-selected      /* Green background */
.filter-hover         /* Light gray background */

/* Grid */
.products-grid        /* Responsive columns */
.product-card         /* Individual product display */
```

## Performance Optimization

### Current Optimizations

1. **Parallel Data Fetching:**
   ```typescript
   const [products, categories] = await Promise.all([
     getProductsFromSupabase(),
     getCategoriesFromSupabase()
   ])
   ```

2. **Memoization:**
   ```typescript
   const filteredProducts = useMemo(() => {
     // Complex filtering logic
   }, [products, selectedCategory, searchTerm, sortBy, priceRange])
   ```

3. **Lazy Loading:**
   - Only load data on mount
   - Update filters without fetching

### Future Optimizations

- Add pagination (show 12 products, load more)
- Implement search debouncing
- Cache categories in localStorage
- Virtual scrolling for large product lists

## Common Tasks

### Task: Add a New Category

1. **Supabase Dashboard:**
   - Open categories table
   - Click "Insert" or "Add row"
   - Enter: name, slug, emoji
   - Save

2. **Automatic Update:**
   - Refresh the page
   - New category appears in filters
   - No code changes needed

**Example:**
```sql
INSERT INTO categories (name, slug, emoji)
VALUES ('Microwave Ovens', 'microwave-ovens', '🍕');
```

### Task: Filter by Category

**User Flow:**
1. Click category in sidebar
2. Products grid updates
3. URL changes to include category
4. Close button appears next to category name

**URL Example:**
`/products?category=refrigerators`

### Task: Search Products

1. Type in search input
2. Products update in real-time
3. Shows matching products only
4. Works with category filter too

### Task: Combine Filters

**Example:** Find cheap fridges
1. Select "Refrigerators" category
2. Set max price to 500
3. Click sort "Price: Bas à Haut"
4. Results show filtered, sorted products

**URL:** `/products?category=refrigerators`

## Mobile Considerations

### Responsive Behavior

**Mobile (< 768px):**
- Filters behind toggle button
- Single column product grid
- Full-width inputs
- Emoji only on category tabs

**Tablet (768px - 1024px):**
- Filters visible
- 2 column product grid
- Side-by-side layout

**Desktop (> 1024px):**
- All filters visible
- 3 column product grid
- Full sidebar layout

### Touch-Friendly

- Large tap targets (44px minimum)
- Smooth scrolling
- Quick filter toggles
- Mobile-optimized modals

## Troubleshooting

### Categories Not Showing

**Check:**
1. Supabase connection active?
2. Categories exist in database?
3. Emoji field populated?
4. Network request succeeding?

**Debug:**
```typescript
// Open browser console
const cats = await getCategoriesFromSupabase()
console.log(cats)  // Should show array of categories
```

### Filters Not Working

**Check:**
1. Product data loaded?
2. Category names match between tables?
3. Search term correct?
4. Price range valid?

**Debug:**
```typescript
console.log('Filtered:', filteredProducts.length)
console.log('Selected category:', selectedCategory)
console.log('Search term:', searchTerm)
```

### Products Not Updating

**Check:**
1. Hard refresh page (Ctrl+Shift+R)
2. Clear browser cache
3. Verify Supabase connection
4. Check console for errors

## Testing Checklist

- [ ] All categories load with emojis
- [ ] Search filters products correctly
- [ ] Category filter works
- [ ] Price range filters work
- [ ] Sort by price works (both directions)
- [ ] Reset filters clears everything
- [ ] URL parameters populate filters
- [ ] Mobile filters toggle works
- [ ] Grid responsive on all screens
- [ ] Add to cart works from cards
- [ ] Wishlist button works
- [ ] No results state displays

## Future Enhancements

1. **Advanced Filtering:**
   - Filter by brand
   - Filter by rating
   - Filter by availability

2. **Pagination:**
   - Load 12 products initially
   - "Load more" button
   - URL-based page parameter

3. **Saved Filters:**
   - Save favorite filters
   - Quick access to saved searches
   - Shareable filter URLs

4. **Analytics:**
   - Track most searched terms
   - Track popular categories
   - Track filter combinations

5. **Performance:**
   - Implement virtual scrolling
   - Add search debouncing
   - Cache categories locally

## Support & Resources

**Related Files:**
- `CATEGORIES_README.md` - Categories system overview
- `CATEGORIES_SYSTEM.md` - Technical architecture
- `lib/products.ts` - API functions
- `app/products/page.tsx` - Page implementation

**Questions?**
- Check existing product implementations
- Review filter logic in page.tsx
- Inspect database schema
- Check browser console for errors

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Production Ready

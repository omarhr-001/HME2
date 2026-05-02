# Categories System - Implementation Guide

## Quick Start

### 1. Database Setup (5 minutes)

Run the SQL file to populate categories:
```bash
# In Supabase dashboard:
1. Go to SQL Editor
2. Create new query
3. Copy contents of SQL_CATEGORIES_SETUP.sql
4. Execute
```

Or manually insert a category:
```sql
INSERT INTO public.categories (name, slug, emoji) 
VALUES ('Électroménagers', 'electromenagers', '⚡');
```

### 2. Verify Data in Supabase

Go to Table Editor and check `categories` table:
- ✅ Categories visible
- ✅ Emojis displaying correctly
- ✅ Slugs are URL-friendly
- ✅ Created_at timestamps auto-generated

### 3. Test in Application

Navigate to homepage and verify:
- ✅ Footer shows 4 categories with emojis
- ✅ Search section dropdown shows all categories
- ✅ Clicking categories filters products
- ✅ Responsive on mobile

## Component Architecture

### Footer Component Flow

```
User views homepage
         ↓
Footer component loads
         ↓
useEffect hooks fires
         ↓
getCategoriesFromSupabase() called
         ↓
Query: SELECT * FROM categories ORDER BY name
         ↓
First 4 categories returned
         ↓
Display with emojis in 3-column grid
         ↓
User clicks category → Navigate to /products?category=slug
```

### Search Section Component Flow

```
User views homepage
         ↓
SearchSection loads
         ↓
useEffect fetches all categories
         ↓
Query: SELECT * FROM categories ORDER BY name
         ↓
All categories stored in state
         ↓
User clicks dropdown button
         ↓
Display custom menu with categories
         ↓
User selects category
         ↓
Dropdown closes, category name shown
         ↓
User clicks "Rechercher"
         ↓
Form submits with search + category params
         ↓
Navigate: /products?search=term&category=id
```

## Design System

### Colors
- **Primary**: Green (#22C55E - `bg-green-600`)
- **Background**: White (#FFFFFF - `bg-white`)
- **Text**: Gray-800 (#1F2937)
- **Border**: Gray-200 (#E5E7EB)
- **Hover**: Green-700 (#16A34A)

### Typography
- **Headers**: Bold, Tailwind font-bold
- **Body**: Regular, Tailwind text-sm
- **Accents**: Semibold for interactive elements

### Spacing
- **Gap**: 3px-4px (gap-1 to gap-4)
- **Padding**: 3px-6px (px-3 to px-6, py-2 to py-3)
- **Border Radius**: 3xl (24px) for buttons/inputs

### Icons & Emoji
- **Size**: Large emoji (text-lg)
- **Fallback**: 📦 if no emoji provided
- **Animation**: Smooth 300ms transitions

## Responsive Breakpoints

### Mobile (< 768px)
```
Footer:
- Single column layout
- Full-width category links

Search:
- Hidden category labels (show abbreviation)
- Touch-friendly spacing
```

### Tablet (768px - 1024px)
```
Footer:
- 2-3 column grid

Search:
- Full labels visible
- Adequate spacing
```

### Desktop (> 1024px)
```
Footer:
- 5 column grid (Brand, Categories, Support, Company, Contact)

Search:
- Optimal spacing
- Full-featured dropdown
```

## Data Structure

### Categories Table
```typescript
type Category = {
  id: string              // UUID primary key
  name: string           // "Électroménagers"
  slug: string           // "electromenagers"
  emoji: string          // "⚡"
  created_at: string     // ISO 8601 timestamp
}
```

### API Response
```typescript
// GET /categories
[
  {
    id: "uuid-1",
    name: "Électroménagers",
    slug: "electromenagers",
    emoji: "⚡",
    createdAt: "2024-01-15T10:30:00Z"
  },
  // ... more categories
]
```

## Performance Optimization

### Current Implementation
- ✅ Query runs once on component mount
- ✅ Results cached in component state
- ✅ No API overhead

### Future Optimization
- [ ] Add Redis caching (TTL: 1 hour)
- [ ] Implement SWR for automatic revalidation
- [ ] Add pagination for 100+ categories
- [ ] Optimize query with indexes

## Testing Checklist

### Functional Tests
- [ ] Categories load correctly
- [ ] Emojis display properly
- [ ] Clicking category filters products
- [ ] All categories appear in dropdown
- [ ] Search + category filtering works
- [ ] Mobile responsive

### UI/UX Tests
- [ ] Footer looks good on all devices
- [ ] Dropdown animation smooth
- [ ] Hover states visible
- [ ] Touch targets adequate size (min 44px)
- [ ] Contrast ratio passes WCAG AA

### Performance Tests
- [ ] Categories load < 500ms
- [ ] No layout shift
- [ ] Smooth animations (60fps)
- [ ] Mobile performance good

### Browser Compatibility
- [ ] Chrome/Edge 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Mobile Safari 14+

## Common Issues & Solutions

### Issue: Categories not loading
**Solution:**
1. Check Supabase connection
2. Verify categories table exists
3. Check user permissions
4. Look at browser console for errors

### Issue: Emojis not displaying
**Solution:**
1. Verify emoji field populated
2. Check browser emoji support
3. Try different emoji
4. Fallback to icon font if needed

### Issue: Dropdown menu hidden
**Solution:**
1. Check z-index: dropdown uses z-50
2. Verify parent container overflow visible
3. Check for absolute/fixed positioning conflicts
4. Test in different browsers

### Issue: Slow category loading
**Solution:**
1. Check database performance
2. Add index to categories table
3. Implement caching layer
4. Consider pagination for large lists

## Adding New Features

### Add Category Images
```typescript
// Extend Category interface
interface Category {
  // ... existing fields
  image_url?: string
  description?: string
}

// Update SQL
ALTER TABLE categories ADD COLUMN image_url text;
ALTER TABLE categories ADD COLUMN description text;
```

### Add Category Filters
```typescript
// Example: Filter by popularity
const trendingCategories = categories
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 6)
```

### Add Search Within Categories
```typescript
// Example: Search categories by name
const searchCategories = (query: string) => {
  return categories.filter(cat =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  )
}
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Supabase RLS policies configured
- [ ] Environment variables set
- [ ] Categories data seeded
- [ ] Components updated
- [ ] Tested on staging
- [ ] Mobile responsive verified
- [ ] Performance monitored
- [ ] Error tracking enabled
- [ ] Documentation updated

## Resources

- SQL Setup: `SQL_CATEGORIES_SETUP.sql`
- System Documentation: `CATEGORIES_SYSTEM.md`
- Code Files:
  - `lib/products.ts` - Data fetching
  - `components/footer.tsx` - Footer display
  - `components/search-section.tsx` - Search display

## Support

For issues or questions:
1. Check `CATEGORIES_SYSTEM.md` documentation
2. Review `CATEGORIES_IMPLEMENTATION_GUIDE.md` (this file)
3. Check browser console for errors
4. Review Supabase dashboard for data issues
5. Test with sample data from `SQL_CATEGORIES_SETUP.sql`

-- Categories System - Sample Data
-- This SQL demonstrates how to populate the categories table with sample data

-- Insert sample categories with emojis
INSERT INTO public.categories (id, name, slug, emoji, created_at) VALUES
  (gen_random_uuid(), 'Cuisines', 'cuisines', '🍳', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Réfrigérateurs', 'refrigerateurs', '🧊', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Climatiseurs', 'climatiseurs', '❄️', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Lave-linges', 'lave-linges', '🧺', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Sèche-linges', 'seche-linges', '🌪️', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Fours', 'fours', '🔥', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Lave-vaisselles', 'lave-vaisselles', '🍽️', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Micro-ondes', 'micro-ondes', '🌊', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Meubles de cuisine', 'meubles-cuisine', '🪑', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Accessoires électroménagers', 'accessoires', '🔌', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- To update an emoji later:
-- UPDATE public.categories SET emoji = '🆕' WHERE name = 'New Category';

-- To add a new category:
-- INSERT INTO public.categories (name, slug, emoji) VALUES 
-- ('Chauffage', 'chauffage', '🔥');

-- To view all categories:
-- SELECT id, name, slug, emoji, created_at FROM public.categories ORDER BY name;

-- To delete a category (be careful!):
-- DELETE FROM public.categories WHERE slug = 'category-slug';

-- Notes:
-- - Keep emoji unique and recognizable
-- - Keep slug lowercase with hyphens (no spaces)
-- - Names are unique and user-friendly
-- - Created_at is auto-populated with CURRENT_TIMESTAMP

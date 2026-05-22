-- Insert brands for different categories
-- Réfrigérateurs
INSERT INTO brands (name, slug, description) VALUES
('Samsung', 'samsung', 'Électroménagers de haute technologie'),
('LG', 'lg', 'Appareils innovants et efficaces'),
('Whirlpool', 'whirlpool', 'Qualité et durabilité'),
('Arçelik', 'arcelik', 'Marque turque réputée'),
('Beko', 'beko', 'Électroménagers européens')
ON CONFLICT (slug) DO NOTHING;

-- Lave-linge
INSERT INTO brands (name, slug, description) VALUES
('Bosch', 'bosch', 'Technologie allemande premium'),
('Electrolux', 'electrolux', 'Innovation suédoise'),
('Haier', 'haier', 'Appareils modernes'),
('Indesit', 'indesit', 'Marque fiable et abordable'),
('Candy', 'candy', 'Design italien')
ON CONFLICT (slug) DO NOTHING;

-- Micro-ondes
INSERT INTO brands (name, slug, description) VALUES
('Panasonic', 'panasonic', 'Technologie japonaise'),
('Sharp', 'sharp', 'Équipements professionnels'),
('Midea', 'midea', 'Marque asiatique'),
('Russell Hobbs', 'russell-hobbs', 'Petit électroménager')
ON CONFLICT (slug) DO NOTHING;

-- Climatiseurs
INSERT INTO brands (name, slug, description) VALUES
('Daikin', 'daikin', 'Expert en climatisation'),
('Fujitsu', 'fujitsu', 'Technologie avancée'),
('Trane', 'trane', 'Solutions professionnelles')
ON CONFLICT (slug) DO NOTHING;

-- Téléviseurs
INSERT INTO brands (name, slug, description) VALUES
('Sony', 'sony', 'Technologie audiovisuelle'),
('TCL', 'tcl', 'Écrans haute résolution'),
('Hisense', 'hisense', 'Téléviseurs 4K'),
('Philips', 'philips', 'Innovation hollandaise')
ON CONFLICT (slug) DO NOTHING;

-- Associate brands with categories
-- First, get category IDs and brand IDs, then create associations
-- This is a helper query - you may need to adjust the logic based on your category names

-- Réfrigérateurs
INSERT INTO category_brands (category_id, brand_id)
SELECT c.id, b.id FROM categories c, brands b
WHERE c.name = 'Réfrigérateurs' AND b.slug IN ('samsung', 'lg', 'whirlpool', 'arcelik', 'beko')
ON CONFLICT (category_id, brand_id) DO NOTHING;

-- Lave-linge
INSERT INTO category_brands (category_id, brand_id)
SELECT c.id, b.id FROM categories c, brands b
WHERE c.name = 'Lave-linge' AND b.slug IN ('bosch', 'electrolux', 'haier', 'indesit', 'candy')
ON CONFLICT (category_id, brand_id) DO NOTHING;

-- Micro-ondes
INSERT INTO category_brands (category_id, brand_id)
SELECT c.id, b.id FROM categories c, brands b
WHERE c.name = 'Micro-ondes' AND b.slug IN ('panasonic', 'sharp', 'midea', 'russell-hobbs')
ON CONFLICT (category_id, brand_id) DO NOTHING;

-- Climatiseurs
INSERT INTO category_brands (category_id, brand_id)
SELECT c.id, b.id FROM categories c, brands b
WHERE c.name = 'Climatiseurs' AND b.slug IN ('daikin', 'fujitsu', 'trane')
ON CONFLICT (category_id, brand_id) DO NOTHING;

-- Téléviseurs
INSERT INTO category_brands (category_id, brand_id)
SELECT c.id, b.id FROM categories c, brands b
WHERE c.name = 'Téléviseurs' AND b.slug IN ('sony', 'tcl', 'hisense', 'philips')
ON CONFLICT (category_id, brand_id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Marques créées:' as info, COUNT(*) as count FROM brands;
SELECT 'Associations créées:' as info, COUNT(*) as count FROM category_brands;

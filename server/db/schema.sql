-- Abu Al-Saj Supabase schema and seed data.
-- Run with: psql "$DATABASE_URL" -f server/db/schema.sql

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  name_ar VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description_ar TEXT,
  description_en TEXT,
  price NUMERIC(12, 0) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO categories (name_ar, name_en, sort_order)
SELECT 'ألبان وأجبان', 'Dairy & Cheeses', 10
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_ar = 'ألبان وأجبان');

INSERT INTO categories (name_ar, name_en, sort_order)
SELECT 'الدسم', 'Savory / Al-Dasm', 20
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_ar = 'الدسم');

INSERT INTO categories (name_ar, name_en, sort_order)
SELECT 'الحلو بدو حلو', 'Sweets', 30
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_ar = 'الحلو بدو حلو');

WITH dairy AS (
  SELECT id FROM categories WHERE name_ar = 'ألبان وأجبان' LIMIT 1
)
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT dairy.id, item.name_ar, item.name_en, item.price, item.sort_order
FROM dairy
CROSS JOIN (VALUES
  ('جبنة حلوم', 'Halloumi Cheese', 250000, 10),
  ('جبنة عكاوي', 'Akkawi Cheese', 200000, 20),
  ('جبنة حرة', 'Spicy Cheese', 250000, 30),
  ('قشقوان', 'Kashkaval', 300000, 40),
  ('٣ أجبان', 'Three Cheeses', 300000, 50),
  ('كشك', 'Kishk', 170000, 60),
  ('جبنة و كشك', 'Cheese & Kishk', 250000, 70),
  ('فيتا', 'Feta', 170000, 80),
  ('كوكتيل', 'Cocktail', 150000, 90),
  ('صحن لبنة بلدية', 'Village Labneh Plate', 300000, 100),
  ('زعتر', 'Zaatar', 70000, 110)
) AS item(name_ar, name_en, price, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items
  WHERE menu_items.category_id = dairy.id AND menu_items.name_ar = item.name_ar
);

WITH savory AS (
  SELECT id FROM categories WHERE name_ar = 'الدسم' LIMIT 1
)
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT savory.id, item.name_ar, item.name_en, item.price, item.sort_order
FROM savory
CROSS JOIN (VALUES
  ('خلطة ابو الصاج الحرة', 'Abu Al-Saj Spicy Mix', 350000, 10),
  ('خلطة ابو الصاج', 'Abu Al-Saj Mix', 350000, 20),
  ('حبش و قشقوان', 'Turkey & Kashkaval', 350000, 30),
  ('حبش و موزاريلا', 'Turkey & Mozzarella', 300000, 40),
  ('موزاريلا و مرتديلا', 'Mozzarella & Mortadella', 250000, 50)
) AS item(name_ar, name_en, price, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items
  WHERE menu_items.category_id = savory.id AND menu_items.name_ar = item.name_ar
);

WITH sweets AS (
  SELECT id FROM categories WHERE name_ar = 'الحلو بدو حلو' LIMIT 1
)
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT sweets.id, item.name_ar, item.name_en, item.price, item.sort_order
FROM sweets
CROSS JOIN (VALUES
  ('قريشة بلدية و عسل', 'Village Qarisheh & Honey', 300000, 10),
  ('قشطة بلدية و عسل', 'Village Ashta & Honey', 300000, 20),
  ('بيستاشيو', 'Pistachio', 250000, 30),
  ('نوتيلا او لوتوس', 'Nutella or Lotus', 200000, 40)
) AS item(name_ar, name_en, price, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items
  WHERE menu_items.category_id = sweets.id AND menu_items.name_ar = item.name_ar
);


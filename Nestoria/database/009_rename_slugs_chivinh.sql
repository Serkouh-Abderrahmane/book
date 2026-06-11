-- Non-destructive migration to rename seed slugs and update demo host to Vietnamese variants
BEGIN;

-- Update hotels: slug, name, address (addresses set to TP. Hồ Chí Minh for demo hotels)
UPDATE hotels SET slug = 'chi-vinh-house', name = 'Chi Vinh House', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'marigold-house';

-- Update any foreign keys or references that use the hotel slug in storage paths (if applicable)
-- Example: hotel_images, rooms use hotel_id foreign key so no change required. If you use slug in external storage paths, handle them separately.

-- Update seed image references stored as URLs (if they reference the old slug path)
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/marigold-house/', '/chi-vinh-house/') WHERE hero_image_url LIKE '%/marigold-house/%';
UPDATE hotel_images SET url = REPLACE(url, '/marigold-house/', '/chi-vinh-house/') WHERE url LIKE '%/marigold-house/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/marigold-house/', '/chi-vinh-house/') WHERE image_url LIKE '%/marigold-house/%';

-- Update hotel_coords mapping if present
UPDATE hotels SET latitude = 10.8231, longitude = 106.6297 WHERE slug = 'chi-vinh-house';

-- Update demo host emails
-- hosts table uses business_name column (not business)
UPDATE hosts SET email = 'vikram@chivinhland.vn', business_name = 'Chi Vinh Hospitality' WHERE email = 'vikram@marigold.in';

COMMIT;

-- Notes:
-- 1) This migration updates the slug for the seed hotel non-destructively.
-- 2) If other application code stores slug strings in external systems (Supabase Storage paths etc.), run the corresponding storage renames or update references manually.
-- 3) After running, rebuild the frontend and redeploy so built assets reflect the new names.

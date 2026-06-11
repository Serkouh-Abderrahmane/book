-- Fix hotel names that are broken (stored as removed-chi-vinh-* or similar slugs)
-- Maps them to proper Vietnamese property names.
-- Idempotent — safe to run on every boot.

-- 1. Replace known removed-chi-vinh-* names with proper property names
UPDATE hotels SET name = 'Căn hộ Quận 7'         WHERE name = 'removed-chi-vinh-pamparo';
UPDATE hotels SET name = 'Căn hộ Bình Thạnh'     WHERE name = 'removed-chi-vinh-cardamom';
UPDATE hotels SET name = 'Căn hộ Thủ Đức'        WHERE name = 'removed-chi-vinh-silk';
UPDATE hotels SET name = 'Phòng trọ Quận 3'       WHERE name LIKE 'removed-chi-vinh-%' AND property_type = 'Phòng trọ';
UPDATE hotels SET name = 'Nhà nguyên căn Gò Vấp'  WHERE name LIKE 'removed-chi-vinh-%' AND description LIKE '%Gò Vấp%';
UPDATE hotels SET name = 'Studio Phú Nhuận'       WHERE name LIKE 'removed-chi-vinh-%' AND property_type = 'Căn hộ studio';

-- 2. Catch-all: any remaining name with "removed-" gets a generic but readable name
UPDATE hotels
SET name = 'Căn hộ'
WHERE name LIKE 'removed-%' AND name NOT IN (
  'Căn hộ Quận 7', 'Căn hộ Bình Thạnh', 'Căn hộ Thủ Đức',
  'Phòng trọ Quận 3', 'Nhà nguyên căn Gò Vấp', 'Studio Phú Nhuận'
);

-- 3. Also replace names that are NULL, empty, or literal [REMOVED]
UPDATE hotels SET name = COALESCE(slug, 'Nhà cho thuê')
WHERE name IS NULL OR name = '' OR name = '[REMOVED]';

-- 4. Normalize property_type to the 7 allowed categories
UPDATE hotels SET property_type = 'Căn hộ 2N2W' WHERE property_type IN ('Căn hộ 2PN 2WC', 'Căn hộ 1PN');
UPDATE hotels SET property_type = 'Căn hộ 3N2W' WHERE property_type IN ('Căn hộ 3PN 2WC', 'Căn hộ 3PN 1WC');
UPDATE hotels SET property_type = 'Căn hộ 2N1W' WHERE property_type = 'Căn hộ 2PN 1WC';
UPDATE hotels SET property_type = 'Căn hộ 1N' WHERE property_type = 'Căn hộ 1N';
UPDATE hotels SET property_type = 'Căn hộ studio' WHERE property_type ILIKE 'Căn hộ Studio';
UPDATE hotels SET property_type = 'Căn hộ chung cư mini' WHERE property_type IN ('Căn hộ', 'Căn hộ mini', 'Căn hộ chung cư');
UPDATE hotels SET property_type = 'Căn hộ 1N' WHERE property_type NOT IN ('Phòng trọ','Căn hộ 3N2W','Căn hộ 2N2W','Căn hộ 2N1W','Căn hộ 1N','Căn hộ studio','Căn hộ chung cư mini');

-- 5. Replace "Villa" names with proper Vietnamese names
UPDATE hotels SET name = 'Căn hộ Bình Chánh' WHERE slug = 'can-ho-binh-chanh';
UPDATE hotels SET name = REPLACE(name, 'Villa ', 'Căn hộ ') WHERE name ILIKE 'Villa %';

-- 6. Backfill rooms.property_type from updated hotels
UPDATE rooms r
SET property_type = h.property_type
FROM hotels h
WHERE r.hotel_id = h.id AND r.property_type IS DISTINCT FROM h.property_type;

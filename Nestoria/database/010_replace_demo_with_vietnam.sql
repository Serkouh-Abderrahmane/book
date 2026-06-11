BEGIN;

-- Non-destructive updates: rename demo slugs to Vietnamese variants and set addresses to TP. Hồ Chí Minh

-- house-of-cardamom -> chi-vinh-cardamom
UPDATE hotels SET slug = 'chi-vinh-cardamom', name = 'Nhà Chi Vinh - Cardamom', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'house-of-cardamom';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/house-of-cardamom/', '/chi-vinh-cardamom/') WHERE hero_image_url LIKE '%/house-of-cardamom/%';
UPDATE hotel_images SET url = REPLACE(url, '/house-of-cardamom/', '/chi-vinh-cardamom/') WHERE url LIKE '%/house-of-cardamom/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/house-of-cardamom/', '/chi-vinh-cardamom/') WHERE image_url LIKE '%/house-of-cardamom/%';

-- casa-pamparo -> chi-vinh-pamparo
UPDATE hotels SET slug = 'chi-vinh-pamparo', name = 'Nhà Chi Vinh - Pamparo', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'casa-pamparo';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/casa-pamparo/', '/chi-vinh-pamparo/') WHERE hero_image_url LIKE '%/casa-pamparo/%';
UPDATE hotel_images SET url = REPLACE(url, '/casa-pamparo/', '/chi-vinh-pamparo/') WHERE url LIKE '%/casa-pamparo/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/casa-pamparo/', '/chi-vinh-pamparo/') WHERE image_url LIKE '%/casa-pamparo/%';

-- silk-route-inn -> chi-vinh-silk
UPDATE hotels SET slug = 'chi-vinh-silk', name = 'Nhà Chi Vinh - Silk', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'silk-route-inn';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/silk-route-inn/', '/chi-vinh-silk/') WHERE hero_image_url LIKE '%/silk-route-inn/%';
UPDATE hotel_images SET url = REPLACE(url, '/silk-route-inn/', '/chi-vinh-silk/') WHERE url LIKE '%/silk-route-inn/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/silk-route-inn/', '/chi-vinh-silk/') WHERE image_url LIKE '%/silk-route-inn/%';

-- aravali-retreat -> chi-vinh-aravali
UPDATE hotels SET slug = 'chi-vinh-aravali', name = 'Nhà Chi Vinh - Aravali', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'aravali-retreat';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/aravali-retreat/', '/chi-vinh-aravali/') WHERE hero_image_url LIKE '%/aravali-retreat/%';
UPDATE hotel_images SET url = REPLACE(url, '/aravali-retreat/', '/chi-vinh-aravali/') WHERE url LIKE '%/aravali-retreat/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/aravali-retreat/', '/chi-vinh-aravali/') WHERE image_url LIKE '%/aravali-retreat/%';

-- postcard-munnar -> chi-vinh-postcard
UPDATE hotels SET slug = 'chi-vinh-postcard', name = 'Nhà Chi Vinh - Munnar', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'postcard-munnar';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/postcard-munnar/', '/chi-vinh-postcard/') WHERE hero_image_url LIKE '%/postcard-munnar/%';
UPDATE hotel_images SET url = REPLACE(url, '/postcard-munnar/', '/chi-vinh-postcard/') WHERE url LIKE '%/postcard-munnar/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/postcard-munnar/', '/chi-vinh-postcard/') WHERE image_url LIKE '%/postcard-munnar/%';

-- the-salt-house -> chi-vinh-salt
UPDATE hotels SET slug = 'chi-vinh-salt', name = 'Nhà Chi Vinh - Salt House', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'the-salt-house';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/the-salt-house/', '/chi-vinh-salt/') WHERE hero_image_url LIKE '%/the-salt-house/%';
UPDATE hotel_images SET url = REPLACE(url, '/the-salt-house/', '/chi-vinh-salt/') WHERE url LIKE '%/the-salt-house/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/the-salt-house/', '/chi-vinh-salt/') WHERE image_url LIKE '%/the-salt-house/%';

-- indigo-lodge -> chi-vinh-indigo
UPDATE hotels SET slug = 'chi-vinh-indigo', name = 'Nhà Chi Vinh - Indigo', city = 'TP. Hồ Chí Minh', region = 'Việt Nam', address = 'Quận 1, TP. Hồ Chí Minh, Việt Nam' WHERE slug = 'indigo-lodge';
UPDATE hotels SET hero_image_url = REPLACE(hero_image_url, '/indigo-lodge/', '/chi-vinh-indigo/') WHERE hero_image_url LIKE '%/indigo-lodge/%';
UPDATE hotel_images SET url = REPLACE(url, '/indigo-lodge/', '/chi-vinh-indigo/') WHERE url LIKE '%/indigo-lodge/%';
UPDATE rooms SET image_url = REPLACE(image_url, '/indigo-lodge/', '/chi-vinh-indigo/') WHERE image_url LIKE '%/indigo-lodge/%';

COMMIT;

-- Notes: This updates hotel metadata in-place and rewrites stored image URLs that include the old slugs.

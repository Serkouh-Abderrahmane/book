-- Real-world latitude/longitude for each seed property so the Detail screen
-- can render an OpenStreetMap embed centred on the actual location.

ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

UPDATE hotels SET latitude=24.5781, longitude=73.6829 WHERE slug='marigold-house';
UPDATE hotels SET latitude=25.1525, longitude=73.5836 WHERE slug='aravali-retreat';
UPDATE hotels SET latitude=15.6033, longitude=73.7508 WHERE slug='casa-pamparo';
UPDATE hotels SET latitude=10.0889, longitude=77.0595 WHERE slug='postcard-munnar';
UPDATE hotels SET latitude=15.6797, longitude=73.7124 WHERE slug='the-salt-house';
UPDATE hotels SET latitude=26.9124, longitude=70.9128 WHERE slug='silk-route-inn';
UPDATE hotels SET latitude=12.4244, longitude=75.7382 WHERE slug='house-of-cardamom';
UPDATE hotels SET latitude=12.0095, longitude=79.8094 WHERE slug='indigo-lodge';

-- Per-room display name + free-text special amenities (comma-separated).
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS name              TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS special_amenities TEXT;

-- Backfill: existing seeded rooms used `type` as their de-facto name.
UPDATE rooms SET name = type WHERE name IS NULL;

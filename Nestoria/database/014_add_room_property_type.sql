-- Add per-room property_type column and backfill from hotels when possible
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Backfill rooms.property_type from hotels.property_type when rooms don't have a value
UPDATE rooms r
SET property_type = h.property_type
FROM hotels h
WHERE r.hotel_id = h.id AND (r.property_type IS NULL OR r.property_type = '');

-- Note: This is additive and safe for existing installs. To make property_type required
-- for new rows, an application-level change is preferred rather than forcing DB constraints.

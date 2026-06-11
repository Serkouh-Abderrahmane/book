-- =============================================================
-- Migration 010 — Admin extras: room detail fields, hotel 
-- description fields, viewing appointments table.
-- Idempotent (all ADD COLUMN use IF NOT EXISTS).
-- =============================================================

-- -----------------------------------------------------------------
-- 1. Structured description fields on hotels
-- -----------------------------------------------------------------
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS nearby_places TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS road_type      TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS neighborhood   TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS ward           TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS district       TEXT;

-- Cost fallback fields on hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS electricity_price INTEGER;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS water_price       INTEGER;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS management_fee    INTEGER;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS parking_fee       INTEGER;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS has_window        BOOLEAN;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS has_mattress      BOOLEAN;

-- Equipment fallback fields on hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS toilet_type    TEXT;      -- Riêng / Chung
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS hour_rule      TEXT;      -- Tự do / Giờ giấc
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS washing_machine TEXT;     -- Chung / Riêng / Không
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS has_balcony    BOOLEAN;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS allow_pets     BOOLEAN;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS parking_type   TEXT;      -- Chung / Riêng / Không
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS ev_charger     BOOLEAN;

-- -----------------------------------------------------------------
-- 2. Room-level detail fields
-- -----------------------------------------------------------------
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS electricity_price INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS water_price       INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS management_fee    INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS parking_fee       INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS has_window        BOOLEAN;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS has_mattress      BOOLEAN;

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS toilet_type    TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS hour_rule      TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS washing_machine TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS has_balcony    BOOLEAN;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS allow_pets     BOOLEAN;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS parking_type   TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS ev_charger     BOOLEAN;

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS structure_desc_title     TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS structure_desc_vi_tri    TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS structure_desc_tien_ich_xq TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS structure_desc_thuc_te   TEXT;

-- Index for room-level lookups on the new boolean fields for filtering
CREATE INDEX IF NOT EXISTS idx_rooms_has_window   ON rooms(has_window)   WHERE has_window = true;
CREATE INDEX IF NOT EXISTS idx_rooms_has_balcony  ON rooms(has_balcony)  WHERE has_balcony = true;
CREATE INDEX IF NOT EXISTS idx_rooms_allow_pets   ON rooms(allow_pets)   WHERE allow_pets = true;
CREATE INDEX IF NOT EXISTS idx_rooms_ev_charger   ON rooms(ev_charger)   WHERE ev_charger = true;

-- -----------------------------------------------------------------
-- 3. Viewing appointments
-- -----------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'viewing_status') THEN
    CREATE TYPE viewing_status AS ENUM ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS viewings (
    id              SERIAL PRIMARY KEY,
    hotel_id        INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id         INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    customer_name   TEXT NOT NULL,
    customer_phone  TEXT NOT NULL,
    customer_email  TEXT,
    preferred_date  DATE NOT NULL,
    preferred_time  TIME NOT NULL,
    note            TEXT,
    internal_notes  TEXT,
    status          viewing_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (preferred_date >= CURRENT_DATE - interval '1 day')
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_viewings_touch' AND tgrelid = 'viewings'::regclass) THEN
    CREATE TRIGGER trg_viewings_touch BEFORE UPDATE ON viewings
      FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_viewings_hotel  ON viewings(hotel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON viewings(status);
CREATE INDEX IF NOT EXISTS idx_viewings_date   ON viewings(preferred_date);

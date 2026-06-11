-- =============================================================
-- Migration 011 — Loại phòng (room category).
-- Strict enum: CAN_HO / PHONG_TRO
-- =============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loai_phong') THEN
    CREATE TYPE loai_phong AS ENUM ('CAN_HO', 'PHONG_TRO');
  END IF;
END $$;

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS loai_phong loai_phong;

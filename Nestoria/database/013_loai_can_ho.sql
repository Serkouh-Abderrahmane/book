-- Rename loai_phong → loai_phong_chinh; add loai_can_ho sub-type enum for Căn hộ

DO $$ BEGIN
  CREATE TYPE loai_can_ho AS ENUM ('CH_3N2W', 'CH_2N2W', 'CH_2N1W', 'STUDIO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS loai_can_ho loai_can_ho;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'loai_phong'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'loai_phong_chinh'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN loai_phong TO loai_phong_chinh;
  END IF;
END $$;

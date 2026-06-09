-- Admin table + seed account
-- Run after 001_schema.sql and 004_seed.sql

CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    full_name     TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION touch_admin_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admins_touch ON admins;
CREATE TRIGGER trg_admins_touch BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION touch_admin_updated_at();

-- Admin demo account
-- Email: admin@example.com
-- Password: Admin1234
INSERT INTO admins (email, password_hash, full_name)
VALUES ('admin@example.com', '$2b$10$aybSUJOvPaZUTATCQZ8C7uoEn2/ddLdNAwzIWgeKhVlDuCn0EM6mu', 'Admin User')
ON CONFLICT (email) DO NOTHING;

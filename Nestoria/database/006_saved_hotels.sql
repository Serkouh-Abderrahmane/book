-- Saved (favourited) hotels per user. Shared between customer and host roles —
-- (user_id, role) uniquely identifies a saver since the two user types live in
-- separate tables with their own id sequences.
CREATE TABLE IF NOT EXISTS saved_hotels (
  user_id    INTEGER     NOT NULL,
  role       TEXT        NOT NULL CHECK (role IN ('customer','host')),
  hotel_id   INTEGER     NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role, hotel_id)
);
CREATE INDEX IF NOT EXISTS saved_hotels_user_idx ON saved_hotels (user_id, role);

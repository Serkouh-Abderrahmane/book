-- Admin settings table (singleton row)
CREATE TABLE IF NOT EXISTS admin_settings (
  id          INT  PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  site_name   VARCHAR(100) DEFAULT 'Nestoria',
  contact_email VARCHAR(255),
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  require_approval BOOLEAN DEFAULT false,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO admin_settings (site_name, contact_email)
VALUES ('Chi Vinh Land', 'admin@chivinhland.com')
ON CONFLICT (id) DO NOTHING;

// Auto-init the Postgres database on backend boot.
//
// Idempotent: if the `hotels` table already exists we exit immediately, so this
// is safe to run on every deploy. Only the very first boot against a fresh
// Render database (or any empty Postgres) loads the schema + seed.
//
// Wired into `npm start` so Render's startCommand picks it up with no extra
// config. Locally you can either run it manually (`node init-db.js`) or keep
// using the `psql -f database/*.sql` flow documented in docs/SETUP.md.

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const DATABASE_DIR = path.join(__dirname, '..', 'database');

function createClient() {
  if (process.env.DATABASE_URL) {
    return new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });
  }
  return new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });
}

async function runInit() {
  const client = createClient();
  await client.connect();

  async function runSqlFile(filename) {
    const full = path.join(DATABASE_DIR, filename);
    if (!fs.existsSync(full)) {
      console.log(`  skip ${filename} (file missing)`);
      return;
    }
    const sql = fs.readFileSync(full, 'utf8');
    await client.query(sql);
    console.log(`  ✓ ${filename}`);
  }

  async function tableExists(name) {
    const { rows } = await client.query(
      `SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = $1`,
      [name],
    );
    return rows.length > 0;
  }

  if (!process.env.DB_HOST && !process.env.DATABASE_URL) {
    console.log('init-db: DB_HOST/DATABASE_URL unset — skipping.');
    await client.end();
    return;
  }

  // Files that run only on first boot (create tables/enums/seed data)
  const SQL_ORDER = [
    '001_schema.sql',
    '002_triggers.sql',
    '006_saved_hotels.sql',
    '007_hotel_coords.sql',
    '008_room_extras.sql',
    '004_seed.sql',
    '005_seed_images.sql',
    '009_admin_seed.sql',
  ];

  // Idempotent migrations that run on every boot
  const ALWAYS_RUN = [
    '010_admin_extras.sql',
    '011_loai_phong.sql',
    '012_admin_settings.sql',
    '013_loai_can_ho.sql',
    '014_add_room_property_type.sql',
    '015_fix_hotel_data.sql',
    '016_fix_real_images.sql',
  ];

  if (await tableExists('hotels')) {
    console.log('init-db: schema present, nothing to do.');
    for (const file of ALWAYS_RUN) {
      await runSqlFile(file);
    }
  } else {
    console.log('init-db: empty database — loading schema + seed…');
    for (const file of SQL_ORDER) {
      await runSqlFile(file);
    }
    for (const file of ALWAYS_RUN) {
      await runSqlFile(file);
    }
  }

  await client.end();
  console.log('init-db: done.');
}

runInit().catch(async (err) => {
  console.error('init-db FAILED:', err.message || err);
  process.exit(1);
});

// Quick debug runner that applies each ALWAYS_RUN SQL file and reports which one fails.
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const ALWAYS_RUN = [
  '010_admin_extras.sql',
  '011_loai_phong.sql',
  '012_admin_settings.sql',
  '013_loai_can_ho.sql',
  '014_add_room_property_type.sql',
];

const DATABASE_DIR = path.join(__dirname, '..', 'database');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

(async () => {
  console.log(`DB: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  for (const file of ALWAYS_RUN) {
    const full = path.join(DATABASE_DIR, file);
    if (!fs.existsSync(full)) {
      console.log(`skip ${file} (missing)`);
      continue;
    }
    const sql = fs.readFileSync(full, 'utf8');
    console.log(`--> running ${file}`);
    try {
      await pool.query(sql);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`FAILED on ${file}:`, err.message || err);
      await pool.end();
      process.exit(1);
    }
  }
  console.log('all done');
  await pool.end();
})();

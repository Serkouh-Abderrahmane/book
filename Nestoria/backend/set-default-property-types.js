// Set a safe default for existing hotels and rooms where property_type is empty.
// This is a one-off idempotent script — safe to re-run.
const { Pool } = require('pg');
require('dotenv').config();

const DEFAULT = 'Căn hộ 1N';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    const h = await pool.query(
      `UPDATE hotels SET property_type = $1 WHERE property_type IS NULL OR property_type = '' RETURNING id`,
      [DEFAULT]
    );
    console.log(`hotels updated: ${h.rowCount}`);

    const r = await pool.query(
      `UPDATE rooms SET property_type = $1 WHERE property_type IS NULL OR property_type = '' RETURNING id`,
      [DEFAULT]
    );
    console.log(`rooms updated: ${r.rowCount}`);
  } catch (err) {
    console.error('set-default-property-types FAILED:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

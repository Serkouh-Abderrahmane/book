// Idempotent helper to add rooms.property_type and backfill from hotels.property_type.
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function run() {
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='property_type'`);
    if (rows.length === 0) {
      console.log('Adding column rooms.property_type');
      await pool.query(`ALTER TABLE rooms ADD COLUMN property_type TEXT;`);
      console.log('Added column');
    } else {
      console.log('Column rooms.property_type already exists');
    }

    // Ensure hotels.property_type exists (it may be missing on older DBs)
    const hotelCol = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name='hotels' AND column_name='property_type'`
    );
    if (hotelCol.rows.length === 0) {
      console.log('Adding column hotels.property_type (missing)');
      await pool.query(`ALTER TABLE hotels ADD COLUMN property_type TEXT;`);
      console.log('Added hotels.property_type');
    } else {
      console.log('Column hotels.property_type already exists');
    }

    console.log('Backfilling rooms.property_type from hotels.property_type when empty');
    const res = await pool.query(`
      UPDATE rooms r
      SET property_type = h.property_type
      FROM hotels h
      WHERE r.hotel_id = h.id AND (r.property_type IS NULL OR r.property_type = '');
    `);
    console.log('Backfill complete');
  } catch (err) {
    console.error('apply-014 FAILED:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();

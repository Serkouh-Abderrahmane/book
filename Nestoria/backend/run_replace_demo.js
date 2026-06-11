// Run the demo-to-Vietnam replacement migration
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });
const pool = require('./config/db');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'database', '010_replace_demo_with_vietnam.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    console.log('Running replacement migration:', sqlPath);
    await pool.query(sql);
    console.log('Replacement migration applied successfully');
  } catch (err) {
    console.error('Replacement migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

// One-off migration runner — executes the SQL in ../database/009_rename_slugs_chivinh.sql
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'database', '009_rename_slugs_chivinh.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    console.log('Running migration:', sqlPath);
    await pool.query(sql);
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

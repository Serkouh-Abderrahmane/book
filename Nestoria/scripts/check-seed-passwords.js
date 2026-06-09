#!/usr/bin/env node
// Verify every seeded host + customer can log in with `password123`.
//
//   NODE_PATH=backend/node_modules node scripts/check-seed-passwords.js
//
// Reads DB_* + (optionally) the SEED_PASSWORD env var from backend/.env.
// Prints PASS / FAIL per row and exits non-zero if anything fails.
//
// Google-only accounts (`password_hash IS NULL`) are reported as SKIP — they
// can't log in with email+password by design.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const PASSWORD = process.env.SEED_PASSWORD || 'password123';

async function main() {
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT || 5432),
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME     || 'nestoria_db',
  });
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT 'host'     AS role, email, password_hash FROM hosts
      UNION ALL
      SELECT 'customer' AS role, email, password_hash FROM customers
      ORDER BY role, email
    `);
    let pass = 0, fail = 0, skip = 0;
    for (const r of rows) {
      if (!r.password_hash) {
        console.log(`SKIP  ${r.role.padEnd(8)} ${r.email}  (no password — Google sign-in)`);
        skip++;
        continue;
      }
      const ok = bcrypt.compareSync(PASSWORD, r.password_hash);
      console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.role.padEnd(8)} ${r.email}`);
      if (ok) pass++; else fail++;
    }
    console.log(`\n${pass} pass · ${fail} fail · ${skip} skipped (Google-only)`);
    process.exit(fail === 0 ? 0 : 1);
  } finally {
    await client.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });

#!/usr/bin/env node
/**
 * Validation script for demo data — ensures no old hotel/demo content remains
 * and replaces any offending entries with Vietnamese Chi Vinh Land data.
 * It operates in two ways:
 *  - If a local Postgres is available (via backend config), it will run SQL replacements.
 *  - Otherwise it will scan frontend build/seed JSON files and fix them in-place.
 */
const fs = require('fs');
const path = require('path');
let Client;
try {
  Client = require('pg').Client;
} catch (err) {
  Client = null;
}

const BAD_WORDS = [
  'House of Cardamom','Casa Pamparo','Silk Route Inn','The Marigold House',
  'Postcard from Munnar','The Salt House','Indigo Lodge','Aravali Retreat',
  'Goa','India','Rajasthan','Karnataka','Kerala'
];

const vietnamSamples = [
  'Căn hộ Quận 7','Căn hộ Bình Thạnh','Căn hộ Thủ Đức','Phòng trọ Quận 3',
  'Nhà nguyên căn Gò Vấp','Studio Phú Nhuận'
];

function containsBad(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return BAD_WORDS.some(w => t.includes(w.toLowerCase()));
}

async function tryDbFix() {
  if (!process.env.DB_HOST) return false;
  if (!Client) {
    console.log('pg driver not available, skipping DB fixes');
    return false;
  }
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  try {
    await client.connect();
    console.log('Connected to DB — scanning hotels...');
    const res = await client.query('SELECT id, name, slug, city, region, address FROM hotels');
    let changed = 0;
    for (const r of res.rows) {
      const fields = [r.name, r.city, r.region, r.address, r.slug].join(' ');
      if (containsBad(fields)) {
        const newName = `Nhà Chi Vinh - ${r.slug.split('-').slice(-1)[0] || 'Bình Thạnh'}`;
        const newCity = 'TP. Hồ Chí Minh';
        const newRegion = 'Việt Nam';
        const newAddress = 'Quận 1, TP. Hồ Chí Minh, Việt Nam';
        await client.query('UPDATE hotels SET name=$1, city=$2, region=$3, address=$4 WHERE id=$5', [newName, newCity, newRegion, newAddress, r.id]);
        changed++;
        console.log(`Replaced DB hotel id=${r.id} -> ${newName}`);
      }
    }
    await client.end();
    console.log(`DB fix complete. ${changed} rows changed.`);
    return changed >= 0;
  } catch (err) {
    console.warn('DB fix skipped:', err.message || err);
    try { await client.end(); } catch (_) {}
    return false;
  }
}

function fixFrontendFiles() {
  // Fix frontend built JSON or inline demo files
  const possible = [
    path.join(__dirname, '..', '..', 'backend_hotels.json'),
    path.join(__dirname, '..', '..', 'backend_hotels_after.json'),
    path.join(__dirname, '..', 'frontend', 'build', 'index.html'),
    path.join(__dirname, '..', 'frontend', 'src', 'lib', 'content.js'),
  ];
  let total = 0;
  for (const p of possible) {
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    if (containsBad(s)) {
      // Replace known hotel names with Vietnamese placeholders
      BAD_WORDS.forEach((b, i) => {
        const rep = vietnamSamples[i % vietnamSamples.length];
        const re = new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        s = s.replace(re, rep);
      });
      fs.writeFileSync(p, s, 'utf8');
      console.log(`Fixed file ${p}`);
      total++;
    }
  }
  console.log(`Frontend fix complete. ${total} files changed.`);
  return total > 0;
}

(async function main(){
  console.log('Running data validator/fixer...');
  let dbDone = await tryDbFix();
  let feDone = fixFrontendFiles();
  if (!dbDone && !feDone) {
    console.warn('No fixes applied — please ensure DB is reachable or demo files exist.');
    process.exit(1);
  }
  // Final scan to ensure no bad words remain in key files
  const checkPaths = [
    path.join(__dirname, '..', 'frontend', 'build', 'index.html'),
    path.join(__dirname, '..', 'frontend', 'src', 'lib', 'content.js'),
    path.join(__dirname, '..', '..', 'backend_hotels.json'),
  ];
  for (const cp of checkPaths) {
    if (!fs.existsSync(cp)) continue;
    const s = fs.readFileSync(cp, 'utf8');
    if (containsBad(s)) {
      console.error('Validation failed: found old/demo data in', cp);
      process.exit(1);
    }
  }
  console.log('Validation passed: no bad demo content found.');
  process.exit(0);
})();

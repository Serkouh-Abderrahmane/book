const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

(async () => {
  console.log('DB env:', { DB_HOST: process.env.DB_HOST, DB_PORT: process.env.DB_PORT, DB_NAME: process.env.DB_NAME, DB_USER: process.env.DB_USER, DB_PASSWORD: typeof process.env.DB_PASSWORD });
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1560184897-6c3e3b5f3a8f?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154516-6d85b0a7b6d7?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549187774-b4f9b9f9f3e1?w=1600&q=80&auto=format&fit=crop',
  ];
  // Some Unsplash IDs may return 404 intermittently. Use a small backup list we know works.
  const BACKUP_IMAGES = [
    'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505691723518-36a1b3f0f7a3?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1600&q=80&auto=format&fit=crop',
  ];

  const https = require('https');
  function isUrlOk(url, timeout = 5000) {
    return new Promise((res) => {
      try {
        const req = https.request(url, { method: 'GET', timeout }, (r) => {
          const ok = r.statusCode >= 200 && r.statusCode < 400;
          r.destroy();
          res(ok);
        });
        req.on('error', () => res(false));
        req.on('timeout', () => { req.destroy(); res(false); });
        req.end();
      } catch (e) { res(false); }
    });
  }
  try {
    const { rows } = await pool.query('SELECT id, slug FROM hotels ORDER BY id');
    let i = 0;
    for (const r of rows) {
      // pick a candidate and ensure it is reachable; otherwise rotate to a backup
      let candidate = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
      const ok = await isUrlOk(candidate).catch(() => false);
      if (!ok) {
        // try backups
        let found = false;
        for (const b of BACKUP_IMAGES) {
          if (await isUrlOk(b).catch(() => false)) { candidate = b; found = true; break; }
        }
        if (!found) {
          // final fallback: use the first fallback without params (may still work)
          candidate = FALLBACK_IMAGES[0].split('?')[0];
        }
      }
      await pool.query('UPDATE hotels SET hero_image_url = $1 WHERE id = $2', [candidate, r.id]);
      // Clear existing gallery and insert 3 gallery images (same as hero variations)
      await pool.query('DELETE FROM hotel_images WHERE hotel_id = $1', [r.id]);
      for (let g = 0; g < 3; g++) {
      let url = FALLBACK_IMAGES[(i + g) % FALLBACK_IMAGES.length];
      if (!await isUrlOk(url).catch(() => false)) {
        // try backups
        const b = BACKUP_IMAGES[(i + g) % BACKUP_IMAGES.length];
        url = (await isUrlOk(b).catch(() => false)) ? b : FALLBACK_IMAGES[0].split('?')[0];
      }
      await pool.query('INSERT INTO hotel_images (hotel_id, url, position, caption) VALUES ($1,$2,$3,$4)', [r.id, url, g, null]);
    }
    // Update any rooms for this hotel that lack images
    // ensure room image URL is valid too
    let roomImg = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
    if (!await isUrlOk(roomImg).catch(() => false)) {
      roomImg = (await isUrlOk(BACKUP_IMAGES[0]).catch(() => false)) ? BACKUP_IMAGES[0] : FALLBACK_IMAGES[0].split('?')[0];
    }
    await pool.query("UPDATE rooms SET image_url = $1 WHERE hotel_id = $2 AND (image_url IS NULL OR trim(image_url) = '')", [roomImg, r.id]);
    i++;
  }
    console.log('Demo images applied to', rows.length, 'hotels');
  } catch (err) {
    console.error('Failed to set demo images:', err.message || err);
  } finally {
    try { await pool.end(); } catch (_) {}
  }
})();

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');
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

const BACKUP_IMAGES = [
  'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691723518-36a1b3f0f7a3?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1600&q=80&auto=format&fit=crop',
];

(async () => {
  try {
    const { rows } = await pool.query('SELECT id, name, hero_image_url FROM hotels ORDER BY id');
    let fixed = 0;
    for (const h of rows) {
      if (!h.hero_image_url) continue;
      const ok = await isUrlOk(h.hero_image_url).catch(() => false);
      if (!ok) {
        // find a backup that works
        let chosen = null;
        for (const b of BACKUP_IMAGES) {
          if (await isUrlOk(b).catch(() => false)) { chosen = b; break; }
        }
        if (!chosen) chosen = BACKUP_IMAGES[0];
        await pool.query('UPDATE hotels SET hero_image_url = $1 WHERE id = $2', [chosen, h.id]);
        fixed++;
        console.log('Replaced hero for', h.id, h.name);
      }

      // fix hotel_images
      const imgs = await pool.query('SELECT id, url FROM hotel_images WHERE hotel_id = $1 ORDER BY position', [h.id]);
      for (const img of imgs.rows) {
        const okImg = await isUrlOk(img.url).catch(() => false);
        if (!okImg) {
          let chosen = null;
          for (const b of BACKUP_IMAGES) if (await isUrlOk(b).catch(() => false)) { chosen = b; break; }
          if (!chosen) chosen = BACKUP_IMAGES[0];
          await pool.query('UPDATE hotel_images SET url = $1 WHERE id = $2', [chosen, img.id]);
          console.log('Replaced gallery image', img.id, 'for hotel', h.id);
        }
      }

      // fix rooms
      const rooms = await pool.query('SELECT id, image_url FROM rooms WHERE hotel_id = $1', [h.id]);
      for (const r of rooms.rows) {
        if (!r.image_url) {
          await pool.query('UPDATE rooms SET image_url = $1 WHERE id = $2', [BACKUP_IMAGES[0], r.id]);
        } else {
          const okRoom = await isUrlOk(r.image_url).catch(() => false);
          if (!okRoom) await pool.query('UPDATE rooms SET image_url = $1 WHERE id = $2', [BACKUP_IMAGES[0], r.id]);
        }
      }
    }
    console.log('Fixed hero/gallery images for', fixed, 'hotels');
  } catch (e) {
    console.error('Error fixing images:', e.message || e);
  } finally {
    try { await pool.end(); } catch (e) {}
  }
})();

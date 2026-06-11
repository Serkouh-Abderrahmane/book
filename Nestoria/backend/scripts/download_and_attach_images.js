const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

function download(url, dest) {
  return new Promise((res, rej) => {
    const parsed = new URL(url);
    const req = https.get(parsed, (r) => {
      if (r.statusCode !== 200) return rej(new Error('status ' + r.statusCode));
      const ws = fs.createWriteStream(dest);
      r.pipe(ws);
      ws.on('finish', () => ws.close(res));
      ws.on('error', rej);
    });
    req.on('error', rej);
  });
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560184897-6c3e3b5f3a8f?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154516-6d85b0a7b6d7?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549187774-b4f9b9f9f3e1?w=1600&q=80&auto=format&fit=crop',
];

(async () => {
  try {
    const { rows } = await pool.query('SELECT id, slug FROM hotels ORDER BY id');
    const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads', 'hotels');
    if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
    let i = 0;
    for (const h of rows) {
      const dir = path.join(uploadsRoot, h.slug.replace(/[^a-z0-9-_]/gi, '-'));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      // for hero + 3 gallery images
      const images = [];
      for (let k = 0; k < 4; k++) images.push(FALLBACK_IMAGES[(i + k) % FALLBACK_IMAGES.length]);
      let pos = 0;
      for (const img of images) {
        const ext = '.jpg';
        const fname = `img-${pos}${ext}`;
        const dest = path.join(dir, fname);
        try {
          await download(img, dest);
        } catch (e) {
          // ignore and continue
          console.error('download failed', img, e.message || e);
          continue;
        }
        const publicUrl = `/uploads/hotels/${path.basename(dir)}/${fname}`;
        if (pos === 0) {
          await pool.query('UPDATE hotels SET hero_image_url = $1 WHERE id = $2', [publicUrl, h.id]);
        }
        // insert gallery rows, skip existing ones
        await pool.query('INSERT INTO hotel_images (hotel_id, url, position, caption) VALUES ($1,$2,$3,$4)', [h.id, publicUrl, pos, null]);
        pos++;
      }
      // update rooms lacking image_url with hero
      await pool.query("UPDATE rooms SET image_url = $1 WHERE hotel_id = $2 AND (image_url IS NULL OR trim(image_url) = '')", [`/uploads/hotels/${path.basename(dir)}/img-0.jpg`, h.id]);
      i++;
    }
    console.log('Downloaded and attached local images for', rows.length, 'hotels');
  } catch (e) {
    console.error('Error downloading images:', e.message || e);
  } finally {
    try { await pool.end(); } catch (_) {}
  }
})();

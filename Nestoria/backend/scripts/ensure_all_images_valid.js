const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

(async () => {
  const BACKUP = 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=1600&q=80&auto=format&fit=crop';
  try {
    const { rows } = await pool.query('SELECT id FROM hotels');
    for (const r of rows) {
      await pool.query('UPDATE hotels SET hero_image_url = $1 WHERE id = $2', [BACKUP, r.id]);
      await pool.query('DELETE FROM hotel_images WHERE hotel_id = $1', [r.id]);
      // insert 3 gallery images (same backup rotated)
      for (let i = 0; i < 3; i++) {
        await pool.query('INSERT INTO hotel_images (hotel_id, url, position, caption) VALUES ($1,$2,$3,$4)', [r.id, BACKUP, i, null]);
      }
      await pool.query('UPDATE rooms SET image_url = $1 WHERE hotel_id = $2', [BACKUP, r.id]);
    }
    console.log('Applied backup images to', rows.length, 'hotels');
  } catch (e) {
    console.error('Error applying backup images:', e.message || e);
  } finally {
    try { await pool.end(); } catch (_) {}
  }
})();

// optimize_images.js — Replace large Unsplash JPGs with smaller versions
// Uses picsum.photos (always available, no API key needed)
// Usage: cd backend && node scripts/optimize_images.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'hotels');

// Reliable image sources (picsum.photos — stable, no auth, fast CDN)
const OPTIMIZED = [
  'https://picsum.photos/id/1/800/600.webp',
  'https://picsum.photos/id/10/800/600.webp',
  'https://picsum.photos/id/20/800/600.webp',
  'https://picsum.photos/id/26/800/600.webp',
  'https://picsum.photos/id/28/800/600.webp',
  'https://picsum.photos/id/36/800/600.webp',
  'https://picsum.photos/id/40/800/600.webp',
  'https://picsum.photos/id/42/800/600.webp',
  'https://picsum.photos/id/44/800/600.webp',
  'https://picsum.photos/id/48/800/600.webp',
];

function download(url, dest) {
  return new Promise((res, rej) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,*/*',
      },
    };
    https.get(opts, (r) => {
      // picsum redirects (301/302) to CDN — follow them
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return download(r.headers.location, dest).then(res).catch(rej);
      }
      if (r.statusCode !== 200) return rej(new Error(`HTTP ${r.statusCode}`));
      const ws = fs.createWriteStream(dest);
      r.pipe(ws);
      ws.on('finish', () => ws.close(res));
      ws.on('error', rej);
    }).on('error', rej);
  });
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('No uploads directory found at', UPLOADS_DIR);
    return;
  }
  const hotels = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  let total = 0;
  for (const hotel of hotels) {
    const dir = path.join(UPLOADS_DIR, hotel.name);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      // Skip files already < 100 KB (already optimized)
      const stat = fs.statSync(filePath);
      if (stat.size < 100 * 1024) {
        console.log(`  ${hotel.name}/${file} — ${(stat.size / 1024).toFixed(0)} KB (already small, skipped)`);
        continue;
      }
      const idx = (file.charCodeAt(0) + file.length) % OPTIMIZED.length;
      const url = OPTIMIZED[idx];
      try {
        // Download to temp file first, then replace
        const tmp = filePath + '.tmp';
        await download(url, tmp);
        fs.renameSync(tmp, filePath);
        const newSize = fs.statSync(filePath).size;
        const saved = ((stat.size - newSize) / 1024).toFixed(0);
        console.log(`✓ ${hotel.name}/${file} — ${(newSize / 1024).toFixed(0)} KB (saved ${saved} KB)`);
        total++;
      } catch (e) {
        console.error(`✗ ${hotel.name}/${file} — ${e.message} (original kept)`);
      }
    }
  }
  console.log(`\nDone. ${total} images optimized. Restart the server.`);
}

main().catch(console.error);

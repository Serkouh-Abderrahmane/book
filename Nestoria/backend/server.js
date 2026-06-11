require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded demo images from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/auth',     require('./modules/auth/route'));
app.use('/api/hotels',   require('./modules/hotels/route'));
app.use('/api/rooms',    require('./modules/rooms/route'));
app.use('/api/bookings', require('./modules/bookings/route'));
app.use('/api/reviews',  require('./modules/reviews/route'));
app.use('/api/profile',  require('./modules/profile/route'));
app.use('/api/host',     require('./modules/host/route'));
app.use('/api/upload',   require('./modules/upload/route'));
app.use('/api/viewings', require('./modules/viewings/route'));
app.use('/api/admin',    require('./modules/admin/route'));

// Serve the built frontend as static files (when present)
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(frontendBuild)) {
  console.log('Serving frontend from', frontendBuild);
  app.use(express.static(frontendBuild));
  // SPA catch-all for page navigations (not API, not uploads, not file requests)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    if (req.path.startsWith('/uploads/')) return next();
    if (/\.\w+$/.test(req.path)) return next();
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
} else {
  console.warn('Frontend build not found at', frontendBuild, '- API only');
}

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Nestoria server on :${port}${fs.existsSync(frontendBuild) ? ' (API + frontend)' : ' (API only)'}`);
});

const bcrypt = require('bcryptjs');
const pool = require('../../config/db');
const { userRepo } = require('../../lib/userRepo');
const { asyncHandler, badRequest, notFound, unauthorized } = require('../../lib/http');

function withOnboarded(user, role) {
  const onboarded = role === 'host'
    ? Boolean(user?.business_name && user?.phone)
    : true;
  return { ...user, onboarded };
}

const get = asyncHandler(async (req, res) => {
  const repo = userRepo(req.user.role);
  const user = await repo.getById(req.user.id);
  if (!user) throw notFound();
  res.json({ user: withOnboarded(user, req.user.role) });
});

const update = asyncHandler(async (req, res) => {
  const repo = userRepo(req.user.role);
  const user = await repo.update(req.user.id, req.body);
  res.json({ user: withOnboarded(user, req.user.role) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 8) throw badRequest('new_password must be at least 8 characters');

  const repo = userRepo(req.user.role);
  const record = await repo.getByEmail((await repo.getById(req.user.id)).email);
  if (!record) throw notFound();
  if (record.password_hash) {
    if (!current_password) throw badRequest('current_password is required');
    const ok = await bcrypt.compare(current_password, record.password_hash);
    if (!ok) throw unauthorized('Current password is incorrect');
  }
  const hash = await bcrypt.hash(new_password, 10);
  await repo.setPassword(req.user.id, hash);
  res.json({ updated: true });
});

const listSaved = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT h.id, h.slug, h.name, h.city, h.region, h.hue, h.hero_image_url,
            h.price_from, h.rating_avg, h.rating_count, h.badge
       FROM saved_hotels s
       JOIN hotels h ON h.id = s.hotel_id
      WHERE s.user_id = $1 AND s.role = $2
      ORDER BY s.created_at DESC`,
    [req.user.id, req.user.role]
  );
  res.json({ ids: rows.map((r) => r.id), hotels: rows });
});

const addSaved = asyncHandler(async (req, res) => {
  const hotelId = Number(req.params.hotelId);
  if (!hotelId) throw badRequest('hotelId required');
  await pool.query(
    `INSERT INTO saved_hotels (user_id, role, hotel_id)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [req.user.id, req.user.role, hotelId]
  );
  res.json({ saved: true });
});

const removeSaved = asyncHandler(async (req, res) => {
  const hotelId = Number(req.params.hotelId);
  if (!hotelId) throw badRequest('hotelId required');
  await pool.query(
    `DELETE FROM saved_hotels WHERE user_id = $1 AND role = $2 AND hotel_id = $3`,
    [req.user.id, req.user.role, hotelId]
  );
  res.json({ saved: false });
});

module.exports = { get, update, changePassword, listSaved, addSaved, removeSaved };

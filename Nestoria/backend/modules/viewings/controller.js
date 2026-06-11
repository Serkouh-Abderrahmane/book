const pool = require('../../config/db');
const { asyncHandler, notFound, badRequest } = require('../../lib/http');

// ---------- POST /viewings  (public — submit a viewing request) ----------
const create = asyncHandler(async (req, res) => {
  const { hotel_id, room_id, customer_name, customer_phone, customer_email, preferred_date, preferred_time, note } = req.body;

  if (!hotel_id || !customer_name || !customer_phone || !preferred_date || !preferred_time) {
    throw badRequest('hotel_id, customer_name, customer_phone, preferred_date, preferred_time are required');
  }

  const { rows } = await pool.query(
    `INSERT INTO viewings (hotel_id, room_id, customer_name, customer_phone, customer_email, preferred_date, preferred_time, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [hotel_id, room_id || null, customer_name, customer_phone, customer_email || null, preferred_date, preferred_time, note || null]
  );

  res.status(201).json({ viewing: rows[0] });
});

// ---------- GET /viewings  (admin/host — list with filters) ----------
const list = asyncHandler(async (req, res) => {
  const user = req.user;

  const params = [];
  const where = [];

  if (user.role === 'host') {
    where.push('h.host_id = $' + (params.length + 1));
    params.push(user.id);
  } else if (user.role === 'admin') {
    // admins see all
  } else {
    throw badRequest('Not authorized');
  }

  if (req.query.status) {
    where.push('v.status = $' + (params.length + 1));
    params.push(req.query.status);
  }
  if (req.query.hotel_id) {
    where.push('v.hotel_id = $' + (params.length + 1));
    params.push(Number(req.query.hotel_id));
  }
  if (req.query.from_date) {
    where.push('v.preferred_date >= $' + (params.length + 1));
    params.push(req.query.from_date);
  }
  if (req.query.to_date) {
    where.push('v.preferred_date <= $' + (params.length + 1));
    params.push(req.query.to_date);
  }

  const { rows } = await pool.query(`
    SELECT v.*,
           h.name AS hotel_name, h.slug AS hotel_slug,
           r.name AS room_name, r.type AS room_type
      FROM viewings v
      JOIN hotels h ON h.id = v.hotel_id
      LEFT JOIN rooms r ON r.id = v.room_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY v.created_at DESC
     LIMIT 200
  `, params);

  res.json({ viewings: rows.map((r) => ({
    ...r,
    preferred_date: r.preferred_date.toISOString().slice(0, 10),
    preferred_time: r.preferred_time.toISOString().slice(11, 16),
  })) });
});

// ---------- GET /viewings/:id  (admin/host — get single) ----------
const detail = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(`
    SELECT v.*,
           h.name AS hotel_name, h.slug AS hotel_slug,
           r.name AS room_name, r.type AS room_type
      FROM viewings v
      JOIN hotels h ON h.id = v.hotel_id
      LEFT JOIN rooms r ON r.id = v.room_id
     WHERE v.id = $1
  `, [id]);

  const viewing = rows[0];
  if (!viewing) throw notFound('Viewing not found');

  // Hosts can only see their own viewings
  if (req.user.role === 'host') {
    const { rows: hostCheck } = await pool.query('SELECT 1 FROM hotels WHERE id = $1 AND host_id = $2', [viewing.hotel_id, req.user.id]);
    if (!hostCheck.length) throw notFound('Viewing not found');
  }

  res.json({
    viewing: {
      ...viewing,
      preferred_date: viewing.preferred_date.toISOString().slice(0, 10),
      preferred_time: viewing.preferred_time.toISOString().slice(11, 16),
    }
  });
});

// ---------- PUT /viewings/:id/status  (admin/host — approve/reject/reschedule) ----------
const updateStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { status, internal_notes } = req.body;
  const allowedStatuses = ['confirmed', 'rescheduled', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw badRequest(`Status must be one of: ${allowedStatuses.join(', ')}`);
  }

  const { rows: existing } = await pool.query('SELECT * FROM viewings WHERE id = $1', [id]);
  if (!existing.length) throw notFound('Viewing not found');

  // Hosts can only update their own
  if (req.user.role === 'host') {
    const { rows: hostCheck } = await pool.query('SELECT 1 FROM hotels WHERE id = $1 AND host_id = $2', [existing[0].hotel_id, req.user.id]);
    if (!hostCheck.length) throw notFound('Viewing not found');
  }

  const updates = ['status = $1'];
  const vals = [status];
  let idx = 2;

  if (internal_notes !== undefined) {
    if (req.user.role !== 'admin') throw badRequest('Only admins can set internal notes');
    updates.push(`internal_notes = $${idx++}`);
    vals.push(internal_notes);
  }

  vals.push(id);
  const { rows } = await pool.query(`UPDATE viewings SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, vals);

  res.json({ viewing: rows[0] });
});

// ---------- DELETE /viewings/:id  (admin only) ----------
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query('DELETE FROM viewings WHERE id = $1 RETURNING id', [id]);
  if (!rows.length) throw notFound('Viewing not found');
  res.status(204).end();
});

module.exports = { create, list, detail, updateStatus, remove };

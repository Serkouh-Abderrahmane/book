const pool = require('../../config/db');
const { asyncHandler, badRequest } = require('../../lib/http');

const dashboard = asyncHandler(async (_req, res) => {
  const [
    hotelsRes, roomsRes, bookingsRes, customersRes, hostsRes,
    viewingsRes, reviewsRes, revenueRes
  ] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM hotels'),
    pool.query('SELECT COUNT(*)::int AS total FROM rooms'),
    pool.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status IN (\'pending\',\'confirmed\'))::int AS active FROM bookings'),
    pool.query('SELECT COUNT(*)::int AS total FROM customers'),
    pool.query('SELECT COUNT(*)::int AS total FROM hosts'),
    pool.query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = \'pending\')::int AS pending FROM viewings'),
    pool.query('SELECT COUNT(*)::int AS total, ROUND(AVG(rating)::numeric, 1)::float AS avg_rating FROM hotel_reviews'),
    pool.query(`SELECT COALESCE(SUM(total_amount), 0)::float AS total_revenue FROM bookings WHERE status != 'cancelled'`),
  ]);

  res.json({
    hotels: hotelsRes.rows[0].total,
    rooms: roomsRes.rows[0].total,
    bookings: bookingsRes.rows[0].total,
    activeBookings: bookingsRes.rows[0].active,
    customers: customersRes.rows[0].total,
    hosts: hostsRes.rows[0].total,
    viewings: viewingsRes.rows[0].total,
    pendingViewings: viewingsRes.rows[0].pending,
    reviews: reviewsRes.rows[0].total,
    avgRating: reviewsRes.rows[0].avg_rating || 0,
    totalRevenue: revenueRes.rows[0].total_revenue,
  });
});

const listHotels = asyncHandler(async (req, res) => {
  const { limit, offset, search } = req.query;
  const params = [];
  const where = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(h.name ILIKE $${params.length} OR h.city ILIKE $${params.length} OR h.region ILIKE $${params.length})`);
  }
  const limitVal = Math.min(Number(limit) || 50, 200);
  const offsetVal = Number(offset) || 0;
  params.push(limitVal, offsetVal);
  const { rows: hotels } = await pool.query(
    `SELECT h.id, h.slug, h.name, h.region, h.city, h.address, h.hue, h.hero_image_url,
            h.price_from, h.rating_avg, h.rating_count, h.score, h.created_at,
            host.full_name AS host_name, host.business_name AS host_business
       FROM hotels h
       JOIN hosts host ON host.id = h.host_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY h.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM hotels h
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`,
    where.length ? params.slice(0, -2) : []
  );

  res.json({ hotels, total: countRes.rows[0].total });
});

const listRooms = asyncHandler(async (req, res) => {
  const { limit, offset, loai_phong_chinh, status, hotel_id } = req.query;
  const params = [];
  const where = [];

  if (loai_phong_chinh) { params.push(loai_phong_chinh); where.push(`r.loai_phong_chinh = $${params.length}::loai_phong_chinh`); }
  if (status) { params.push(status); where.push(`r.status = $${params.length}::room_status`); }
  if (hotel_id) { params.push(Number(hotel_id)); where.push(`r.hotel_id = $${params.length}`); }

  const limitVal = Math.min(Number(limit) || 50, 200);
  const offsetVal = Number(offset) || 0;
  params.push(limitVal, offsetVal);

  const { rows: rooms } = await pool.query(
    `SELECT r.*, h.name AS hotel_name, h.slug AS hotel_slug, h.city, h.region,
            h.hue AS hotel_hue, h.hero_image_url AS hotel_image
       FROM rooms r
       JOIN hotels h ON h.id = r.hotel_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY r.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM rooms r
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`,
    where.length ? params.slice(0, -2) : []
  );

  res.json({ rooms, total: countRes.rows[0].total });
});

const listBookings = asyncHandler(async (req, res) => {
  const { limit, offset, status } = req.query;
  const params = [];
  const where = [];

  if (status) { params.push(status); where.push(`b.status = $${params.length}`); }

  const limitVal = Math.min(Number(limit) || 50, 200);
  const offsetVal = Number(offset) || 0;
  params.push(limitVal, offsetVal);

  const { rows: bookings } = await pool.query(
    `SELECT b.*, h.name AS hotel_name, h.slug AS hotel_slug,
            r.type AS room_type, r.name AS room_name,
            c.full_name AS guest_name, c.email AS guest_email, c.phone AS guest_phone
       FROM bookings b
       JOIN hotels h ON h.id = b.hotel_id
       JOIN rooms r ON r.id = b.room_id
       LEFT JOIN customers c ON c.id = b.customer_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY b.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM bookings b
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`,
    where.length ? params.slice(0, -2) : []
  );

  res.json({ bookings, total: countRes.rows[0].total });
});

const listReviews = asyncHandler(async (req, res) => {
  const { limit, offset } = req.query;
  const limitVal = Math.min(Number(limit) || 50, 200);
  const offsetVal = Number(offset) || 0;

  const { rows: reviews } = await pool.query(
    `SELECT hr.*, h.name AS hotel_name, h.slug AS hotel_slug,
            c.full_name AS customer_name, c.email AS customer_email
       FROM hotel_reviews hr
       JOIN hotels h ON h.id = hr.hotel_id
       JOIN customers c ON c.id = hr.customer_id
      ORDER BY hr.created_at DESC
      LIMIT $1 OFFSET $2`,
    [limitVal, offsetVal]
  );

  const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM hotel_reviews');
  res.json({ reviews, total: countRes.rows[0].total });
});

const listUsers = asyncHandler(async (req, res) => {
  const customersRes = await pool.query(
    `SELECT id, full_name, email, phone, created_at, 'customer' AS role FROM customers ORDER BY created_at DESC`
  );
  const hostsRes = await pool.query(
    `SELECT id, full_name, email, phone, business_name, created_at, 'host' AS role FROM hosts ORDER BY created_at DESC`
  );

  const users = [
    ...customersRes.rows.map((r) => ({ ...r, type: 'customer' })),
    ...hostsRes.rows.map((r) => ({ ...r, type: 'host' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ users, total: users.length });
});

const getSettings = asyncHandler(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM admin_settings LIMIT 1');
  res.json({ settings: rows[0] || {} });
});

const updateSettings = asyncHandler(async (req, res) => {
  const allowed = ['site_name', 'contact_email', 'commission_rate', 'require_approval', 'maintenance_mode'];
  const fields = allowed.filter((f) => req.body[f] !== undefined);
  if (!fields.length) throw badRequest('No valid fields to update');

  await pool.query(
    `INSERT INTO admin_settings (${fields.join(', ')})
     VALUES (${fields.map((_, i) => `$${i + 1}`).join(', ')})
     ON CONFLICT (id) DO UPDATE SET ${fields.map((f, i) => `${f} = $${i + 1}`).join(', ')}`,
    fields.map((f) => req.body[f])
  );

  const { rows } = await pool.query('SELECT * FROM admin_settings LIMIT 1');
  res.json({ settings: rows[0] });
});

module.exports = { dashboard, listHotels, listRooms, listBookings, listReviews, listUsers, getSettings, updateSettings };

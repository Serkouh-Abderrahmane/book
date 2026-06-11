const pool = require('../../config/db');
const { asyncHandler, notFound, forbidden, badRequest } = require('../../lib/http');

const LOAI_CAN_HO_VALUES = ['CH_3N2W', 'CH_2N2W', 'CH_2N1W', 'STUDIO'];

// ---------- GET /rooms  (list with filters) ----------
const list = asyncHandler(async (req, res) => {
  // Validate that only known params are provided
  const allowedParams = new Set(['loai_phong_chinh', 'loai_can_ho', 'hotel_id', 'status', 'min_price', 'max_price', 'amenities']);
  for (const key of Object.keys(req.query)) {
    if (!allowedParams.has(key)) {
      throw badRequest(`Unknown filter parameter: ${key}`);
    }
  }

  const params = [];
  const where = [];

  if (req.query.loai_phong_chinh) {
    params.push(req.query.loai_phong_chinh);
    where.push(`r.loai_phong_chinh = $${params.length}::loai_phong`);
  }
  if (req.query.loai_can_ho) {
    params.push(req.query.loai_can_ho);
    where.push(`r.loai_can_ho = $${params.length}::loai_can_ho`);
  }
  if (req.query.hotel_id) {
    params.push(Number(req.query.hotel_id));
    where.push(`r.hotel_id = $${params.length}`);
  }
  if (req.query.status) {
    params.push(req.query.status);
    where.push(`r.status = $${params.length}::room_status`);
  }
  if (req.query.min_price) {
    params.push(Number(req.query.min_price));
    where.push(`r.price_per_night >= $${params.length}`);
  }
  if (req.query.max_price) {
    params.push(Number(req.query.max_price));
    where.push(`r.price_per_night <= $${params.length}`);
  }
  // TODO: Implement amenities filtering

  const { rows } = await pool.query(`
    SELECT r.*, h.name AS hotel_name, h.slug AS hotel_slug, h.city, h.region, h.hero_image_url AS hotel_image, h.hue, r.property_type
      FROM rooms r JOIN hotels h ON h.id = r.hotel_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY r.created_at DESC
     LIMIT 100
  `, params);

  res.json({ rooms: rows });
});

// ---------- GET /rooms/:id ----------
const detail = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(
    `SELECT r.*, h.slug AS hotel_slug, h.name AS hotel_name
       FROM rooms r JOIN hotels h ON h.id = r.hotel_id
      WHERE r.id = $1`, [id]
  );
  const room = rows[0];
  if (!room) throw notFound('Room not found');
  const [amenitiesRes, imagesRes] = await Promise.all([
    pool.query(`SELECT a.key, a.label, a.icon FROM room_amenities ra
                JOIN amenities a ON a.id = ra.amenity_id WHERE ra.room_id = $1 ORDER BY a.id`, [id]),
    pool.query(`SELECT url, caption, position FROM room_images WHERE room_id = $1 ORDER BY position`, [id]),
  ]);
  room.amenities = amenitiesRes.rows;
  room.gallery   = imagesRes.rows;
  res.json({ room });
});

// ---------- GET /rooms/:id/availability?checkin=&checkout= ----------
const availability = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { checkin, checkout } = req.query;
  if (!checkin || !checkout) throw badRequest('checkin and checkout are required');

  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS conflicts
       FROM bookings
      WHERE room_id = $1
        AND status NOT IN ('cancelled')
        AND NOT (checkout_date <= $2 OR checkin_date >= $3)`,
    [id, checkin, checkout]
  );
  res.json({ available: rows[0].conflicts === 0 });
});

async function assertRoomOwner(roomId, hostId) {
  const { rows } = await pool.query(
    `SELECT h.host_id FROM rooms r JOIN hotels h ON h.id = r.hotel_id WHERE r.id = $1`, [roomId]
  );
  if (!rows[0]) throw notFound('Room not found');
  if (rows[0].host_id !== hostId) throw forbidden('You do not own this room');
}

async function assertHotelOwner(hotelId, hostId) {
  const { rows } = await pool.query('SELECT host_id FROM hotels WHERE id = $1', [hotelId]);
  if (!rows[0]) throw notFound('Hotel not found');
  if (rows[0].host_id !== hostId) throw forbidden('You do not own this hotel');
}

// ---------- POST /rooms ----------
const create = asyncHandler(async (req, res) => {
  const {
    hotel_id, loai_phong_chinh, loai_can_ho, name, type, view, beds, size_sqm, price_per_night, image_url, hue,
    property_type,
    amenities, special_amenities,
    electricity_price, water_price, management_fee, parking_fee, has_window, has_mattress,
    toilet_type, hour_rule, washing_machine, has_balcony, allow_pets, parking_type, ev_charger,
    structure_desc_title, structure_desc_vi_tri, structure_desc_tien_ich_xq, structure_desc_thuc_te,
  } = req.body;
  if (!hotel_id || !type || !price_per_night) throw badRequest('hotel_id, type, price_per_night required');
  if (!loai_phong_chinh || !['CAN_HO', 'PHONG_TRO'].includes(loai_phong_chinh)) {
    throw badRequest('loai_phong_chinh must be one of: CAN_HO, PHONG_TRO');
  }
  if (loai_phong_chinh === 'CAN_HO') {
    if (!loai_can_ho || !LOAI_CAN_HO_VALUES.includes(loai_can_ho)) {
      throw badRequest('loai_can_ho is required when loai_phong_chinh is CAN_HO. Must be one of: ' + LOAI_CAN_HO_VALUES.join(', '));
    }
  } else if (loai_can_ho) {
    throw badRequest('loai_can_ho must be null when loai_phong_chinh is PHONG_TRO');
  }
  await assertHotelOwner(Number(hotel_id), req.user.id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO rooms (
        hotel_id, loai_phong_chinh, loai_can_ho, name, type, view, beds, size_sqm, price_per_night, image_url, hue, special_amenities,
        electricity_price, water_price, management_fee, parking_fee, has_window, has_mattress,
        toilet_type, hour_rule, washing_machine, has_balcony, allow_pets, parking_type, ev_charger,
        structure_desc_title, structure_desc_vi_tri, structure_desc_tien_ich_xq, structure_desc_thuc_te
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,
        $26,$27,$28,$29
      ) RETURNING *`,
      [
      hotel_id, loai_phong_chinh, loai_can_ho || null, name || type, type, view, beds, size_sqm, price_per_night, image_url, hue || 'sand', property_type || null, special_amenities || null,
        electricity_price ?? null, water_price ?? null, management_fee ?? null, parking_fee ?? null, has_window ?? null, has_mattress ?? null,
        toilet_type ?? null, hour_rule ?? null, washing_machine ?? null, has_balcony ?? null, allow_pets ?? null, parking_type ?? null, ev_charger ?? null,
        structure_desc_title ?? null, structure_desc_vi_tri ?? null, structure_desc_tien_ich_xq ?? null, structure_desc_thuc_te ?? null,
      ]
    );
    const room = rows[0];
    if (Array.isArray(amenities) && amenities.length) {
      await client.query(
        `INSERT INTO room_amenities (room_id, amenity_id)
           SELECT $1, a.id FROM amenities a WHERE a.key = ANY($2::text[])`,
        [room.id, amenities]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ room });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ---------- PUT /rooms/:id ----------
const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await assertRoomOwner(id, req.user.id);
  const allowed = [
    'name', 'loai_phong_chinh', 'loai_can_ho', 'type', 'view', 'beds', 'size_sqm', 'price_per_night', 'image_url', 'hue', 'status', 'special_amenities',
    'property_type',
    'electricity_price', 'water_price', 'management_fee', 'parking_fee', 'has_window', 'has_mattress',
    'toilet_type', 'hour_rule', 'washing_machine', 'has_balcony', 'allow_pets', 'parking_type', 'ev_charger',
    'structure_desc_title', 'structure_desc_vi_tri', 'structure_desc_tien_ich_xq', 'structure_desc_thuc_te',
  ];
  const fields = allowed.filter((f) => req.body[f] !== undefined);
  if (!fields.length) return res.json({ updated: false });

  const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const vals = fields.map((f) => req.body[f]);
  vals.push(id);
  const { rows } = await pool.query(`UPDATE rooms SET ${set} WHERE id = $${vals.length} RETURNING *`, vals);
  res.json({ room: rows[0] });
});

// ---------- DELETE /rooms/:id ----------
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await assertRoomOwner(id, req.user.id);

  const { rows: bookingCheck } = await pool.query(
    `SELECT 1 FROM bookings WHERE room_id = $1 AND status IN ('pending','confirmed') LIMIT 1`, [id]
  );
  if (bookingCheck.length > 0) throw badRequest('Cannot delete room with active bookings');

  await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
  res.status(204).end();
});

module.exports = { list, detail, availability, create, update, remove };

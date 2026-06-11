const pool = require('../../config/db');
const { asyncHandler, badRequest, notFound, forbidden } = require('../../lib/http');

// Helper: amenity rows for any hotel id list — single round trip.
async function loadAmenities(hotelIds) {
  if (hotelIds.length === 0) return new Map();
  const { rows } = await pool.query(
    `SELECT ha.hotel_id, a.key, a.label, a.icon
       FROM hotel_amenities ha JOIN amenities a ON a.id = ha.amenity_id
      WHERE ha.hotel_id = ANY($1::int[])
      ORDER BY a.id`,
    [hotelIds]
  );
  const map = new Map(hotelIds.map((id) => [id, []]));
  rows.forEach((r) => map.get(r.hotel_id).push({ key: r.key, label: r.label, icon: r.icon }));
  return map;
}

// ---------- GET /hotels  (search / list) ----------
const search = asyncHandler(async (req, res) => {
  const { location, property_type, min_price, max_price, amenities, sort = 'score' } = req.query;
  
  // Validate that only known params are provided
  const allowedParams = new Set(['location', 'property_type', 'min_price', 'max_price', 'amenities', 'sort']);
  for (const key of Object.keys(req.query)) {
    if (!allowedParams.has(key)) {
      throw badRequest(`Unknown filter parameter: ${key}`);
    }
  }

  const params = [];
  const where = [];

  if (location) {
    params.push(`%${location}%`);
    where.push(`(h.city ILIKE $${params.length} OR h.region ILIKE $${params.length} OR h.name ILIKE $${params.length})`);
  }
  if (min_price) { params.push(Number(min_price)); where.push(`h.price_from >= $${params.length}`); }
  if (max_price) { params.push(Number(max_price)); where.push(`h.price_from <= $${params.length}`); }

  const ORDER = {
    score:      'h.score DESC, h.rating_avg DESC',
    rating:     'h.rating_avg DESC, h.score DESC',
    price_asc:  'h.price_from ASC NULLS LAST',
    price_desc: 'h.price_from DESC NULLS LAST',
    newest:     'h.created_at DESC',
  }[sort] || 'h.score DESC';

  const { rows: hotels } = await pool.query(
    `SELECT h.id, h.slug, h.name, h.region, h.city, h.address, h.description,
            h.hero_image_url, h.hue, h.badge, h.price_from, h.property_type,
            h.rating_avg, h.rating_count, h.score,
            h.checkin_time, h.checkout_time
       FROM hotels h
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ${ORDER}
      LIMIT 100`,
    params
  );

  // Normalize property_type before filtering so the filter operates on
  // the same values the frontend sees and sends back.
  const ALLOWED_TYPES = new Set(['Phòng trọ', 'Căn hộ 3N2W', 'Căn hộ 2N2W', 'Căn hộ 2N1W', 'Căn hộ 1N', 'Căn hộ studio', 'Căn hộ chung cư mini']);
  hotels.forEach((h) => {
    if (!h.property_type || !ALLOWED_TYPES.has(h.property_type)) h.property_type = 'Căn hộ 1N';
  });

  // Filter by property_type (in-memory since we already fetch it)
  let filtered = hotels;
  if (property_type) {
    if (property_type === 'CAN_HO') {
      filtered = hotels.filter((h) => h.property_type.startsWith('Căn hộ'));
    } else {
      filtered = hotels.filter((h) => h.property_type === property_type);
    }
  }

  // TODO: Implement amenities filtering when amenities schema is fully mapped to hotels

const amenitiesMap = await loadAmenities(filtered.map((h) => h.id));
  filtered.forEach((h) => { h.amenities = amenitiesMap.get(h.id) || []; });
  function makeAbsolute(u) {
    if (!u) return u;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('/images')) return u;
    const proto = req.protocol || 'https';
    const host = req.get('host') || 'render-server';
    return `${proto}://${host}${u}`;
  }

  // Ensure every hotel has a usable hero image — fall back to curated apartment/interior images
  // Use local demo images (SVGs) stored in frontend/public/images so demos never 404
  const FALLBACK_IMAGES = [
    '/images/apartment-1.svg',
    '/images/apartment-2.svg',
    '/images/room-1.svg',
    '/images/kitchen-1.svg',
    '/images/bedroom-1.svg',
    '/images/livingroom-1.svg',
  ];
  filtered.forEach((h, i) => {
    if (!h.hero_image_url || h.hero_image_url.trim() === '' || h.hero_image_url.includes('supabase.co')) {
      h.hero_image_url = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
    }
    // if gallery missing, provide a small gallery based on hero
    if (!h.hero_image_url) h.hero_image_url = FALLBACK_IMAGES[0];
    // make hero absolute if it's a local upload path
    h.hero_image_url = makeAbsolute(h.hero_image_url);
    // Ensure name is never null, placeholder text, or a slug-like value
    if (!h.name || h.name.includes('[REMOVED]') || h.name.startsWith('removed-')) {
      h.name = 'Nhà cho thuê';
    }
  });
  res.json({ hotels: filtered });
});

// ---------- GET /hotels/destinations  (home page list) ----------
const destinations = asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT city AS name, region, COUNT(*) AS stays,
           (ARRAY_AGG(hue))[1] AS hue,
           (ARRAY_AGG(hero_image_url) FILTER (WHERE hero_image_url IS NOT NULL))[1] AS hero_image_url
      FROM hotels
     WHERE city IS NOT NULL
     GROUP BY city, region
     ORDER BY stays DESC, city
  `);
  res.json({ destinations: rows.map((r) => ({ ...r, stays: Number(r.stays) })) });
});

// ---------- GET /hotels/:slug  (full detail) ----------
const detail = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { rows } = await pool.query(
    `SELECT h.*, host.full_name AS host_name, host.business_name AS host_business,
            host.superhost AS host_superhost
       FROM hotels h JOIN hosts host ON host.id = h.host_id
      WHERE h.slug = $1`,
    [slug]
  );
  const hotel = rows[0];
  if (!hotel) throw notFound('Hotel not found');

  const [amenitiesRes, roomsRes, reviewsRes, imagesRes] = await Promise.all([
    pool.query(`SELECT a.key, a.label, a.icon FROM hotel_amenities ha
                JOIN amenities a ON a.id = ha.amenity_id WHERE ha.hotel_id = $1 ORDER BY a.id`, [hotel.id]),
    pool.query(`SELECT r.* FROM rooms r WHERE r.hotel_id = $1 ORDER BY r.price_per_night`, [hotel.id]),
    pool.query(`SELECT hr.id, hr.rating, hr.comment, hr.created_at,
                       c.full_name AS customer_name
                  FROM hotel_reviews hr JOIN customers c ON c.id = hr.customer_id
                 WHERE hr.hotel_id = $1
                 ORDER BY hr.created_at DESC LIMIT 20`, [hotel.id]),
    pool.query(`SELECT url, caption, position FROM hotel_images
                 WHERE hotel_id = $1 ORDER BY position`, [hotel.id]),
  ]);

  hotel.amenities = amenitiesRes.rows;
  hotel.rooms     = roomsRes.rows;
  hotel.reviews   = reviewsRes.rows;
  hotel.gallery   = imagesRes.rows;
  const ALLOWED_TYPES = new Set(['Phòng trọ', 'Căn hộ 3N2W', 'Căn hộ 2N2W', 'Căn hộ 2N1W', 'Căn hộ 1N', 'Căn hộ studio', 'Căn hộ chung cư mini']);
  if (!hotel.property_type || !ALLOWED_TYPES.has(hotel.property_type)) hotel.property_type = 'Căn hộ 1N';
  if (!hotel.name || hotel.name.includes('[REMOVED]') || hotel.name.startsWith('removed-')) hotel.name = 'Nhà cho thuê';
  if (!hotel.hero_image_url || hotel.hero_image_url.trim() === '' || hotel.hero_image_url.includes('supabase.co')) {
    hotel.hero_image_url = '/images/room-1.svg';
  }
  res.json({ hotel });
});

// ---------- POST /hotels  (host creates) ----------
const create = asyncHandler(async (req, res) => {
  const {
    name, slug, region, city, address, description,
    checkin_time, checkout_time, phone, hero_image_url, hue, badge,
    amenities, latitude, longitude,
    nearby_places, road_type, neighborhood, ward, district,
    electricity_price, water_price, management_fee, parking_fee, has_window, has_mattress,
    toilet_type, hour_rule, washing_machine, has_balcony, allow_pets, parking_type, ev_charger,
  } = req.body;
  if (!name || !slug) throw badRequest('name and slug are required');

  // Hosts must complete their business profile before listing.
  const { rows: hostRows } = await pool.query(
    'SELECT business_name, phone FROM hosts WHERE id = $1',
    [req.user.id]
  );
  const host = hostRows[0];
  if (!host || !host.business_name || !host.phone) {
    throw badRequest('Complete your business details (business name + phone) before listing a property');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO hotels (
        host_id, name, slug, region, city, address, description,
        checkin_time, checkout_time, phone, hero_image_url, hue, badge,
        property_type,
        latitude, longitude,
        nearby_places, road_type, neighborhood, ward, district,
        electricity_price, water_price, management_fee, parking_fee, has_window, has_mattress,
        toilet_type, hour_rule, washing_machine, has_balcony, allow_pets, parking_type, ev_charger
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,
        $27,$28,$29,$30,$31,$32,$33
      ) RETURNING *`,
      [
        req.user.id, name, slug, region, city, address, description,
        checkin_time, checkout_time, phone, hero_image_url, hue || 'sand', badge,
        // property_type comes from the basics form; allow null
        req.body.property_type ?? null,
        latitude ?? null, longitude ?? null,
        nearby_places ?? null, road_type ?? null, neighborhood ?? null, ward ?? null, district ?? null,
        electricity_price ?? null, water_price ?? null, management_fee ?? null, parking_fee ?? null, has_window ?? null, has_mattress ?? null,
        toilet_type ?? null, hour_rule ?? null, washing_machine ?? null, has_balcony ?? null, allow_pets ?? null, parking_type ?? null, ev_charger ?? null,
      ]
    );
    const hotel = rows[0];
    if (Array.isArray(amenities) && amenities.length) {
      await client.query(
        `INSERT INTO hotel_amenities (hotel_id, amenity_id)
           SELECT $1, a.id FROM amenities a WHERE a.key = ANY($2::text[])`,
        [hotel.id, amenities]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ hotel });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') throw badRequest('A hotel with that slug already exists');
    throw err;
  } finally {
    client.release();
  }
});

async function assertOwner(hotelId, hostId) {
  const { rows } = await pool.query('SELECT host_id FROM hotels WHERE id = $1', [hotelId]);
  if (!rows[0]) throw notFound('Hotel not found');
  if (rows[0].host_id !== hostId) throw forbidden('You do not own this hotel');
}

// ---------- PUT /hotels/:id ----------
const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await assertOwner(id, req.user.id);
  const allowed = [
    'name', 'region', 'city', 'address', 'description', 'checkin_time', 'checkout_time',
    'phone', 'hero_image_url', 'hue', 'badge', 'latitude', 'longitude',
    'property_type',
    'nearby_places', 'road_type', 'neighborhood', 'ward', 'district',
    'electricity_price', 'water_price', 'management_fee', 'parking_fee', 'has_window', 'has_mattress',
    'toilet_type', 'hour_rule', 'washing_machine', 'has_balcony', 'allow_pets', 'parking_type', 'ev_charger',
  ];
  const fields = allowed.filter((f) => req.body[f] !== undefined);
  if (!fields.length) return res.json({ updated: false });
  const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const vals = fields.map((f) => req.body[f]);
  vals.push(id);
  const { rows } = await pool.query(`UPDATE hotels SET ${set} WHERE id = $${vals.length} RETURNING *`, vals);
  res.json({ hotel: rows[0] });
});

// ---------- DELETE /hotels/:id ----------
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await assertOwner(id, req.user.id);

  // Prevent deleting hotels with active bookings
  const { rows: bookingCheck } = await pool.query(
    `SELECT 1 FROM bookings WHERE hotel_id = $1 AND status IN ('pending','confirmed') LIMIT 1`, [id]
  );
  if (bookingCheck.length > 0) throw badRequest('Cannot delete hotel with active bookings');

  await pool.query('DELETE FROM hotels WHERE id = $1', [id]);
  res.status(204).end();
});

module.exports = { search, destinations, detail, create, update, remove };

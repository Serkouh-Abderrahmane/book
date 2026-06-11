-- =============================================================
-- Nestoria — Seed data
-- Vietnamese rental marketplace focused on Ho Chi Minh City
-- Passwords: all dev accounts have password "password123"
-- bcrypt hash ($2b$10, 10 rounds): produced once and reused.
-- =============================================================

-- A single bcrypt hash of "password123" (cost 10) reused across seed accounts.
-- Generated with: bcrypt.hashSync('password123', 10)
-- $2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK

-- -------------------------------------------------------------
-- Amenities (Vietnamese labels for HCMC market)
-- -------------------------------------------------------------
INSERT INTO amenities (key, label, icon) VALUES
    ('wifi',      'Wi-Fi',               'wifi'),
    ('pool',      'Bể bơi',              'pool'),
    ('spa',       'Spa & massage',       'spa'),
    ('utensils',  'Nhà hàng & bar',      'utensils'),
    ('ac',        'Điều hòa',            'ac'),
    ('car',       'Dịch vụ đưa đón',     'car'),
    ('concierge', 'Lễ tân 24/7',         'concierge'),
    ('coffee',    'Cà phê trong ngày',   'coffee'),
    ('tv',        'TV thông minh',       'tv'),
    ('gym',       'Phòng tập thể dục',   'dumbbell');

-- -------------------------------------------------------------
-- Hosts (3 hosts owning properties in HCMC)
-- -------------------------------------------------------------
INSERT INTO hosts (email, password_hash, full_name, phone, business_name, kyc_verified, superhost, profile_image_url) VALUES
    ('owner1@chivinh.vn',  '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Nguyễn Văn An',   '+84912345001', 'Chi Vinh Q7',       TRUE, TRUE,  NULL),
    ('owner2@chivinh.vn','$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Trần Thị Mai Linh','+84912345002', 'Chi Vinh Bình Thạnh', TRUE, FALSE, NULL),
    ('owner3@chivinh.vn',   '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Vũ Đình Hùng', '+84912345003', 'Chi Vinh Thủ Đức',TRUE,TRUE, NULL),
    ('owner4@chivinh.vn',   '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Phạm Thị Lan',  '+84912345004', 'Chi Vinh Bình Chánh',TRUE,FALSE, NULL),
    ('owner5@chivinh.vn',   '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Lê Văn Tùng',  '+84912345005', 'Chi Vinh Gò Vấp',TRUE,FALSE, NULL),
    ('owner6@chivinh.vn',   '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Hoàng Thị Mai', '+84912345006', 'Chi Vinh Phạm Ngũ Lão',TRUE,FALSE, NULL),
    ('owner7@chivinh.vn',   '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Đặng Văn Sơn',  '+84912345007', 'Chi Vinh Thủ Đức 2',TRUE,FALSE, NULL),
    ('owner8@chivinh.vn',   '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Ngô Thị Hoa',   '+84912345008', 'Chi Vinh Thủ Đức 3',TRUE,FALSE, NULL);

-- -------------------------------------------------------------
-- Hotels — Properties in Ho Chi Minh City
-- -------------------------------------------------------------
INSERT INTO hotels (host_id, slug, name, region, city, address, description, checkin_time, checkout_time, phone, hue, badge, property_type) VALUES
    (1, 'apartmen-q7-tan-thuan', 'Căn hộ Quận 7',     'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',     '123 Nguyễn Thị Thập, Phường Tân Thuận Tây, Quận 7, TP. Hồ Chí Minh',
         'Căn hộ 2 phòng ngủ, sạch sẽ, có ban công. Gần tiện ích và giao thông công cộng.',
         '15:00', '11:00', '+84912345001', 'ocean', 'Được chọn', 'Căn hộ 2N2W'),
    (1, 'phong-tro-q3-xuan-dieu', 'Phòng trọ Quận 3',        'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Đường Xuân Diệu, Quận 3, TP. Hồ Chí Minh',
        'Phòng trọ sạch sẽ, có ban công, Wi-Fi miễn phí. Khu vực an toàn, đóng cửa 22h. 5 phút đi bộ tới quán ăn.',
        '14:00', '11:00', '+84912345001', 'sand', 'Mới', 'Phòng trọ'),
    (2, 'apartment-binh-thanh-nguyen-xi', 'Căn hộ Bình Thạnh',           'Thành phố Hồ Chí Minh',       'TP. Hồ Chí Minh',     '45 Điện Biên Phủ, Phường 15, Bình Thạnh, TP. Hồ Chí Minh',
        '3 phòng ngủ, ban công rộng, gần công viên. Tòa nhà có hệ thống an ninh 24/7, thang máy, bãi xe rộng rãi.',
         '15:00', '11:00', '+84912345002', 'forest', NULL, 'Căn hộ 3N2W'),
    (2, 'phong-tro-q1-nguyen-thai-binh',     'Phòng trọ Quận 1',   'Thành phố Hồ Chí Minh',    'TP. Hồ Chí Minh',      '78 Nguyễn Văn Đậu, Phường 5, Quận Bình Thạnh, TP. Hồ Chí Minh',
        'Phòng 20m², gần trung tâm, đủ tiện ích, chủ nhân thân thiện. Hợp lệ đầy đủ.',
        '14:00', '10:30', '+84912345002', 'sand', NULL, 'Phòng trọ'),
    (3, 'apartment-thu-duc-linh-trung',      'Căn hộ Thủ Đức',         'Thành phố Hồ Chí Minh',       'TP. Hồ Chí Minh',     'Phường Linh Trung, Thủ Đức, TP. Hồ Chí Minh',
        'Chung cư 2 phòng ngủ, giá hợp lý, khu vực phát triển, gần Đại học Công nghệ. Chính chủ, không trung gian.',
         '15:00', '11:00', '+84912345003', 'forest', 'Được chọn', 'Căn hộ 2N1W'),
    (3, 'phong-tro-q10-pham-nguu-lao',      'Phòng trọ Quận 10',         'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',     'Phường 1, Quận 10, TP. Hồ Chí Minh',
        'Phòng 25m² sạch sẽ, yên tĩnh, đủ tiện nghi. Gần trường ĐH, bệnh viện, nơi làm việc. Chủ nhân hỗ trợ tốt.',
        '13:00', '11:00', '+84912345003', 'sand', NULL, 'Phòng trọ'),
    (1, 'apartment-q4-thao-dien',   'Căn hộ Quận 4',      'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',    'Phường Thảo Điền, Quận 4, TP. Hồ Chí Minh',
        '3 phòng ngủ, ban công view sông Sài Gòn, nội thất hiện đại. Tháp cao 30 tầng, hình thức căn hộ cao cấp.',
        '14:00', '11:00', '+84912345001', 'ocean', NULL, 'Căn hộ 3N2W'),
    (2, 'phong-tro-go-vap-hoa-thanh',        'Nhà nguyên căn Gò Vấp',           'Thành phố Hồ Chí Minh','TP. Hồ Chí Minh',   'Phường Hòa Thanh, Gò Vấp, TP. Hồ Chí Minh',
        'Nhà nguyên căn 20m² nằm trong khu an toàn, nóng lạnh, tủ lạnh. Chủ nhân chăm sóc, vệ sinh định kỳ.',
        '15:00', '11:00', '+84912345002', 'sand', NULL, 'Căn hộ chung cư mini'),
    (4, 'can-ho-binh-chanh',        'Căn hộ Bình Chánh',           'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',    'Phường An Phú Đông, Quận Bình Chánh, TP. Hồ Chí Minh',
        'Nhà nguyên căn 4 phòng ngủ, sân vườn, hồ bơi. Khu dân cư cao cấp, an ninh 24/7, gần trung tâm hành chính.',
        '15:00', '11:00', '+84912345004', 'warm', NULL, 'Căn hộ 3N2W'),
    (5, 'apartment-thu-duc-khanh-binh',     'Căn hộ Thủ Đức - Khánh Bình',    'Thành phố Hồ Chí Minh',    'TP. Hồ Chí Minh',      'Phường Khánh Bình, Thủ Đức, TP. Hồ Chí Minh',
        'Căn hộ 2 phòng ngủ, thiết kế hiện đại, gần chợ, siêu thị. Chủ nhà hỗ trợ check-in/out nhanh chóng.',
        '14:00', '11:00', '+84912345004', 'ocean', NULL, 'Căn hộ 2N2W'),
    (6, 'apartment-go-vap-binh-loi',   'Căn hộ Gò Vấp - Bình Lợi',    'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',    'Phường Bình Lợi, Gò Vấp, TP. Hồ Chí Minh',
        'Căn hộ Studio, vị trí đẹp, gần công viên. Nội thất đầy đủ, an ninh tốt. Chủ nhà thân thiện.',
        '15:00', '11:00', '+84912345005', 'forest', NULL, 'Căn hộ studio'),
    (7, 'apartment-pham-nguu-lao-khanh-binh',   'Căn hộ Phạm Ngũ Lão - Khánh Bình',    'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',    'Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
        'Căn hộ 1 phòng ngủ, gần trung tâm thành phố, tiện ích đầy đủ. Giá hợp lý, có thể xem nhà.',
        '14:00', '11:00', '+84912345005', 'sand', NULL, 'Căn hộ 1N'),
    (8, 'phong-tro-thu-duc-binh-chanh',   'Phòng trọ Thủ Đức - Bình Chánh',        'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',    'Phường Bình Chánh, Thủ Đức, TP. Hồ Chí Minh',
        'Phòng trọ sạch sẽ, yên tĩnh, có Wi-Fi. Gần trường học, bệnh viện. Phù hợp cho sinh viên và người đi làm.',
        '13:30', '11:00', '+84912345006', 'sand', NULL, 'Phòng trọ'),
    (1, 'studio-phu-nhuan',   'Studio Phú Nhuận',        'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh',    'Phường 1, Quận Phú Nhuận, TP. Hồ Chí Minh',
        'Studio hiện đại, nội thất cao cấp, gần trung tâm. Phù hợp cho người độc thân hoặc cặp đôi.',
        '14:00', '11:00', '+84912345007', 'lavender', 'Mới', 'Căn hộ studio');

-- -------------------------------------------------------------
-- Rooms
-- -------------------------------------------------------------
INSERT INTO rooms (hotel_id, type, view, beds, size_sqm, price_per_night, hue) VALUES
    -- Q7 Tân Thuận (3 rooms)
    (1, 'Căn hộ 2 phòng',  'Ban công sông',              'Giường đôi + sofa',          65, 1500000, 'ocean'),
    (1, 'Căn hộ 1 phòng',     'Ban công khu dân cư',         'Giường đôi',         35,  800000, 'forest'),
    (1, 'Căn hộ Studio',  'Ban công chính',   'Giường đôi', 25, 550000, 'sand'),
    -- Q3 Xuân Diệu (2)
    (2, 'Phòng trọ A',      'Cửa sổ phố',          'Giường đơn',         20, 5500000, 'forest'),
    (2, 'Phòng trọ B', 'Ban công',       'Giường đôi',          22, 6000000, 'sand'),
    -- Bình Thạnh (2)
    (3, 'Căn hộ 3 phòng',      'Ban công công viên',         'Giường đôi + sofa',         85,  1800000, 'forest'),
    (3, 'Căn hộ 2 phòng',     'Ban công tập thể',          'Giường đôi',         50,  1200000, 'ocean'),
    -- Q1 Nguyễn Thái Bình (2)
    (4, 'Phòng trọ tiêu chuẩn',       'Cửa sổ phố',      'Giường đôi',          20,  4500000, 'sand'),
    (4, 'Phòng trọ rộng',            'Ban công khu trọ',            'Giường đôi',          25, 5200000, 'sand'),
    -- Thủ Đức Linh Trung (2)
    (5, 'Căn hộ 2 phòng',       'Ban công Linh Trung',            'Giường đôi + sofa',          70, 1400000, 'forest'),
    (5, 'Căn hộ Studio',     'Cửa sổ thoáng',         'Giường đôi',         30, 600000, 'sand'),
    -- Q10 Phạm Ngũ Lão (3)
    (6, 'Phòng trọ A',    'Cửa sổ phố chính',          'Giường đôi',         25, 6500000, 'sand'),
    (6, 'Phòng trọ B',   'Ban công trong hẻm',       'Giường đôi',          22, 5800000, 'sand'),
    (6, 'Phòng trọ C', 'Cửa sổ phía bắc',       'Giường đôi + sofa', 30, 7500000, 'forest'),
    -- Q4 Thảo Điền (2)
    (7, 'Căn hộ 3 phòng',     'Ban công view sông',          'Giường đôi + sofa',         90, 2000000, 'ocean'),
    (7, 'Căn hộ 2 phòng',    'Ban công tòa nhà',              'Giường đôi',          55, 1300000, 'forest'),
    -- Gò Vấp Hòa Thạnh (2)
    (8, 'Phòng trọ tiêu chuẩn', 'Cửa sổ khu trọ',          'Giường đôi',         20, 5000000, 'sand'),
    (8, 'Phòng trọ VIP',    'Ban công riêng',              'Giường đôi',          24, 6200000, 'sand');

-- Studio Phú Nhuận (1 room) — uses SELECT to match by slug regardless of ID
INSERT INTO rooms (hotel_id, type, view, beds, size_sqm, price_per_night, hue)
SELECT h.id, 'Studio cao cấp', 'Cửa sổ trung tâm', 'Giường đôi', 30, 4500000, 'lavender'
FROM hotels h WHERE h.slug = 'studio-phu-nhuan';

-- Rename to use Vietnamese room type terminology
ALTER TABLE rooms RENAME COLUMN type TO room_name;

-- -------------------------------------------------------------
-- Hotel ↔ Amenity junctions
-- -------------------------------------------------------------
-- Hotel ↔ Amenity junctions
INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id
FROM hotels h
JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','coffee','tv','gym'])
WHERE h.slug = 'apartmen-q7-tan-thuan';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','tv','coffee'])
WHERE h.slug = 'phong-tro-q3-xuan-dieu';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','gym','pool','tv'])
WHERE h.slug = 'apartment-binh-thanh-nguyen-xi';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','tv','coffee'])
WHERE h.slug = 'phong-tro-q1-nguyen-thai-binh';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','gym','pool','tv'])
WHERE h.slug = 'apartment-thu-duc-linh-trung';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','tv','coffee'])
WHERE h.slug = 'phong-tro-q10-pham-nguu-lao';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','pool','gym','tv'])
WHERE h.slug = 'apartment-q4-thao-dien';

INSERT INTO hotel_amenities (hotel_id, amenity_id)
SELECT h.id, a.id FROM hotels h JOIN amenities a ON a.key = ANY(ARRAY['wifi','ac','tv','coffee'])
WHERE h.slug = 'phong-tro-go-vap-hoa-thanh';

-- Room amenities: every room gets wifi + ac, suites also get tv
INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id
FROM rooms r CROSS JOIN amenities a
WHERE a.key IN ('wifi','ac');

INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id
FROM rooms r JOIN amenities a ON a.key = 'tv'
WHERE r.room_name ILIKE '%suite%' OR r.room_name ILIKE '%căn hộ%';

-- Demo account (password: password123)
INSERT INTO customers (email, password_hash, full_name, phone)
VALUES ('demo@example.com', '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK', 'Khách hàng Demo', '+84912345678')
ON CONFLICT (email) DO NOTHING;

-- Customers — 50 Vietnamese mock accounts
INSERT INTO customers (email, password_hash, full_name, phone)
SELECT
    'customer' || i || '@chivinhland.vn',
    '$2b$10$R/BokQK3A3VqA6amtJlYUepO5dIf4x9e8ZHYZc9UOmiRXZSifX5CK',
    (ARRAY['Nguyễn Văn An','Trần Thị Bảo','Phạm Minh Châu','Vũ Đức Hùng','Đỗ Quỳnh Anh',
           'Hoàng Thị Hương','Lý Văn Kiệt','Mai Hồng Hạnh','Ngô Văn Hải','Tô Thị Kim Liên',
           'Đặng Văn Lực','Bùi Thị Mộng','Phan Văn Minh','Trương Thị Nhi','Dương Văn Phương',
           'Cao Thị Quyên','Tạ Văn Sỹ','Khổng Thị Tâm','Bình Văn Uyên','Giáp Thị Vân',
           'Hứa Văn Xuân','Ưu Thị Yên','Vương Văn Zealot','Giang Thị Ánh','Hà Văn Bắc',
           'Chúa Thị Cúc','Kỳ Văn Dương','Oanh Thị Ế','Nhan Văn Phục','Quốc Thị Giang',
           'Lam Văn Hạnh','Pêtrô Thị Liên','Xuân Văn Mai','Tế Thị Nho','Nối Văn Ối',
           'Quyết Thị Pháp','Rồng Văn Quyết','Sơn Thị Ruy','Tuấn Văn Sáu','Uyển Thị Tú',
           'Vinh Văn Vân','Xuyến Thị Vy','Yên Văn Xã','Ý Thị Yến','Công Văn Xích',
           'Thanh Thị Thúy','Hiệp Văn Hợp','Mương Thị Mến','Khoa Văn Khôi','Loan Thị Lương'])[i],
    '+849' || lpad((10000 + i)::text, 6, '0')
FROM generate_series(1, 50) i;

-- -------------------------------------------------------------
-- Bookings — 80 mixed bookings
-- -------------------------------------------------------------
INSERT INTO bookings (customer_id, room_id, hotel_id, checkin_date, checkout_date, guests, base_amount, tax_amount, total_amount, status, payment_status)
SELECT
    1 + (i % 50)::int                                            AS customer_id,
    1 + (i % 18)::int                                            AS room_id,
    (SELECT hotel_id FROM rooms WHERE id = 1 + (i % 18)::int)    AS hotel_id,
    (CURRENT_DATE - ((i * 3) || ' days')::interval)::date        AS checkin_date,
    (CURRENT_DATE - ((i * 3 - 3 - (i % 4)) || ' days')::interval)::date AS checkout_date,
    1 + (i % 4),
    base.amt,
    ROUND(base.amt * 0.18, 2),
    ROUND(base.amt * 1.18, 2),
    (ARRAY['completed','completed','completed','confirmed','pending','cancelled']::booking_status[])[1 + (i % 6)],
    'paid'::payment_status
FROM generate_series(1, 80) i
CROSS JOIN LATERAL (
    SELECT (price_per_night * (3 + (i % 4)))::numeric AS amt
    FROM rooms WHERE id = 1 + (i % 18)::int
) base;

-- A few future-dated bookings so the host dashboard "upcoming" view has data
INSERT INTO bookings (customer_id, room_id, hotel_id, checkin_date, checkout_date, guests, base_amount, tax_amount, total_amount, status, payment_status)
SELECT
    1 + (i % 50)::int,
    1 + (i % 18)::int,
    (SELECT hotel_id FROM rooms WHERE id = 1 + (i % 18)::int),
    (CURRENT_DATE + ((i * 2) || ' days')::interval)::date,
    (CURRENT_DATE + ((i * 2 + 3) || ' days')::interval)::date,
    2,
    base.amt,
    ROUND(base.amt * 0.18, 2),
    ROUND(base.amt * 1.18, 2),
    'confirmed'::booking_status,
    'paid'::payment_status
FROM generate_series(1, 20) i
CROSS JOIN LATERAL (
    SELECT (price_per_night * 3)::numeric AS amt
    FROM rooms WHERE id = 1 + (i % 18)::int
) base;

-- -------------------------------------------------------------
-- Reviews — 120 hotel + 100 room reviews on completed bookings
-- -------------------------------------------------------------
INSERT INTO hotel_reviews (customer_id, hotel_id, booking_id, rating, comment, sentiment_score)
SELECT
    b.customer_id,
    b.hotel_id,
    b.id,
    (3.5 + (random() * 1.5))::numeric(2,1),
    (ARRAY[
        'Phòng sạch sẽ, chủ nhân thân thiện, tiện nghi đầy đủ.',
        'Vị trí tốt, gần các tiếp cận chính, dễ đi lại.',
        'Nơi ở tuyệt vời với giá hợp lý, chắc chắn sẽ quay lại.',
        'Yên tĩnh, an toàn, tốt cho du lịch hoặc công tác dài hạn.',
        'Chủ nhân chu đáo, hỗ trợ nhanh chóng, giải quyết vấn đề ngay.',
        'Phòng rộng, thoáng mát, tiện ích hiện đại.',
        'Giá cả công bằng, phòng sạch sẽ, chuyên nghiệp.',
        'Đúng như mô tả, rất hài lòng với dịch vụ.'
    ])[1 + (b.id % 8)],
    65 + (random() * 30)::int
FROM bookings b
WHERE b.status = 'completed'
LIMIT 120;

INSERT INTO room_reviews (customer_id, room_id, booking_id, rating, comment, sentiment_score)
SELECT
    b.customer_id,
    b.room_id,
    b.id,
    (3.8 + (random() * 1.2))::numeric(2,1),
    (ARRAY[
        'Giường thoải mái, ngủ ngon.',
        'Ban công đẹp, nhìn ra khu vực yên tĩnh.',
        'Phòng nhỏ gọn nhưng sử dụng không gian tốt.',
        'Phòng tắm hiện đại, tiện nghi tốt.',
        'Yên tĩnh, tối, ngủ được, rất tốt.'
    ])[1 + (b.id % 5)],
    70 + (random() * 25)::int
FROM bookings b
WHERE b.status = 'completed'
LIMIT 100;

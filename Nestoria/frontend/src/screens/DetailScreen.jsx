import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import HotelMap from '../components/HotelMap.jsx';
import { SkeletonDetail } from '../components/Skeleton.jsx';
import { hotelsAPI } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSavedHotels } from '../hooks/useSavedHotels.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const FMT = (n) => Number(n).toLocaleString('vi-VN');



const ROOM_AMENITIES = [
  { key: 'bed',      label: 'Giường',      icon: 'bed' },
  { key: 'mattress', label: 'Nệm',         icon: 'moon' },
  { key: 'wardrobe', label: 'Tủ quần áo',  icon: 'grid' },
  { key: 'elevator', label: 'Thang máy',   icon: 'arrow-up-right' },
  { key: 'wifi',     label: 'Wifi',        icon: 'wifi' },
  { key: 'ac',       label: 'Máy lạnh',    icon: 'ac' },
  { key: 'kitchen',  label: 'Kệ bếp',      icon: 'utensils' },
  { key: 'hotwater', label: 'Nước nóng',   icon: 'sun' },
  { key: 'fridge',   label: 'Tủ lạnh',     icon: 'coffee' },
  { key: 'loft',     label: 'Gác',         icon: 'home' },
];

const COST_ITEMS = [
  { key: 'electricity', label: 'Điện sinh hoạt', icon: 'sparkle', unit: 'kWh' },
  { key: 'water',       label: 'Nước sinh hoạt', icon: 'wind',    unit: 'ng' },
  { key: 'management',  label: 'Phí quản lý',    icon: 'shield',  unit: 'ph' },
  { key: 'parking',     label: 'Giữ xe máy',     icon: 'car',     unit: '' },
  { key: 'window',      label: 'Cửa sổ',         icon: 'maximize', unit: '' },
  { key: 'mattress',    label: 'Nệm ngủ sẵn',    icon: 'moon',    unit: '' },
];

const EQUIPMENT_ITEMS = [
  { key: 'toilet',      label: 'Toilet' },
  { key: 'hours',       label: 'Giờ giấc' },
  { key: 'washing',     label: 'Máy giặt' },
  { key: 'window',      label: 'Cửa sổ' },
  { key: 'balcony',     label: 'Ban công' },
  { key: 'pets',        label: 'Thú cưng' },
  { key: 'parking',     label: 'Sân xe' },
  { key: 'charger',     label: 'Sạc xe điện' },
];

function hasAmenity(room, hotel, key) {
  if (!room && !hotel) return false;

  if (room?.special_amenities && typeof room.special_amenities === 'string') {
    const tags = room.special_amenities.split(',').map((s) => s.trim().toLowerCase());
    const map = {
      bed: ['giường', 'bed'],
      mattress: ['nệm', 'mattress', 'đệm'],
      wardrobe: ['tủ quần áo', 'wardrobe', 'tủ áo', 'tủ'],
      elevator: ['thang máy', 'elevator', 'lift'],
      wifi: ['wifi', 'wi-fi', 'internet'],
      ac: ['máy lạnh', 'ac', 'điều hòa', 'aircon', 'air conditioner'],
      kitchen: ['kệ bếp', 'bếp', 'kitchen', 'nhà bếp'],
      hotwater: ['nước nóng', 'hot water', 'bình nóng lạnh'],
      fridge: ['tủ lạnh', 'fridge', 'refrigerator'],
      loft: ['gác', 'loft', 'gác lửng'],
    };
    const keywords = map[key] || [key];
    return keywords.some((kw) => tags.some((t) => t.includes(kw)));
  }

  if (hotel?.amenities && Array.isArray(hotel.amenities)) {
    const hotelKeys = hotel.amenities.map((a) => a.key);
    if (key === 'wifi' && hotelKeys.includes('wifi')) return true;
    if (key === 'ac' && (hotelKeys.includes('ac') || hotelKeys.includes('aircon'))) return true;
  }

  return false;
}

function getCostValue(room, hotel, key) {
  const r = room || {};
  const h = hotel || {};
  switch (key) {
    case 'electricity': return r.electricity_price ?? h.electricity_price;
    case 'water':       return r.water_price ?? h.water_price;
    case 'management':  return r.management_fee ?? h.management_fee;
    case 'parking':     return r.parking_fee ?? h.parking_fee;
    case 'window':      return r.has_window ?? h.has_window;
    case 'mattress':    return r.has_mattress ?? h.has_mattress;
    default: return null;
  }
}

function formatCostValue(value, unit) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (value === 0 || value === '0') return 'Miễn phí';
  const num = Number(value);
  if (!isNaN(num)) {
    if (unit === 'kWh') return `${num}k/kWh`;
    if (unit === 'ng') return `${num}k/ng`;
    if (unit === 'ph') return `${num}k/ph`;
    return `${FMT(num)}₫`;
  }
  return String(value);
}

function getEquipmentValue(room, hotel, key) {
  const r = room || {};
  const h = hotel || {};
  switch (key) {
    case 'toilet':   return r.toilet_type ?? h.toilet_type ?? 'Riêng';
    case 'hours':    return r.hour_rule ?? h.hour_rule ?? 'Tự do';
    case 'washing':  return r.washing_machine ?? h.washing_machine ?? 'Chung';
    case 'window':   return r.has_window ?? h.has_window ? 'Có' : 'Không';
    case 'balcony':  return r.has_balcony ?? h.has_balcony ? 'Có' : 'Không';
    case 'pets':     return r.allow_pets ?? h.allow_pets ? 'Có' : 'Không';
    case 'parking':  return r.parking_type ?? h.parking_type ?? 'Chung';
    case 'charger':  return r.ev_charger ?? h.ev_charger ? 'Có' : 'Không';
    default: return '—';
  }
}

export default function DetailScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const { isSaved, toggle: toggleSave } = useSavedHotels();
  const [shareLabel, setShareLabel] = useState('Chia sẻ');
  const [currentImage, setCurrentImage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [otherOpen, setOtherOpen] = useState(true);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    note: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const onSave = (id) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(routerLocation.pathname + routerLocation.search)}`);
      return;
    }
    toggleSave(id);
  };

  const share = async (hotel) => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: hotel.name, text: hotel.description?.slice(0, 140), url }); return; }
      catch { }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel('Đã sao chép');
      setTimeout(() => setShareLabel('Chia sẻ'), 1800);
    } catch {
      setShareLabel('Sao chép thất bại');
      setTimeout(() => setShareLabel('Chia sẻ'), 1800);
    }
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
    setFormSubmitted(false);
  };

  const submitAppointment = (e) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      setFormError('Vui lòng nhập số điện thoại để chúng tôi liên hệ.');
      return;
    }
    if (!form.date || !form.time) {
      setFormError('Vui lòng chọn ngày và giờ xem phòng.');
      return;
    }
    setFormSubmitted(true);
    setFormError('');
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: () => hotelsAPI.detail(slug).then((d) => d.hotel),
  });
  usePageTitle(data?.name || '');

  if (isLoading) return <SkeletonDetail />;
  if (isError) return (
    <div className="container-wide" style={{ padding: '120px 0', textAlign: 'center' }}>
      <h2 className="h-2">Không thể tải thông tin nhà.</h2>
      <p className="text-muted mt-3">Vui lòng kiểm tra kết nối và thử lại.</p>
      <button className="btn btn-primary mt-6" onClick={() => refetch()}>Thử lại</button>
    </div>
  );
  if (!data) return <div className="container-wide" style={{ padding: '120px 0', textAlign: 'center' }}><h2 className="h-2">Không tìm thấy nhà cho thuê</h2></div>;

  const hotel = data;
  const gallery = [hotel.hero_image_url, ...(hotel.gallery || []).map((g) => g.url)].filter(Boolean);
  const baseRoom = hotel.rooms?.[0];

  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);

  const otherRooms = (hotel.rooms || []).filter((r) => r.id !== baseRoom?.id);

  return (
    <div className="vi-root">
      {/* ==================== 1. HEADER ==================== */}
      <div className="container-wide">
        <header className="vi-header">
          <div className="vi-header-top">
            <button className="vi-back" onClick={() => navigate(-1)}>
              <Icon name="chevron-left" size={18} />
            </button>
            <div className="vi-header-actions">
              <button className="vi-header-btn" onClick={() => onSave(hotel.id)} aria-pressed={isSaved(hotel.id)}>
                <Icon name={isSaved(hotel.id) ? 'heart-fill' : 'heart'} size={17} />
              </button>
              <button className="vi-header-btn" onClick={() => share(hotel)}>
                <Icon name="arrow-up-right" size={17} />
              </button>
            </div>
          </div>
          <div className="vi-header-info">
            <h1 className="vi-title">{hotel.name}</h1>
            {(baseRoom?.property_type || hotel.property_type) && (
              <span className="property-badge-detail" style={{ fontSize: 11 }}>
                {baseRoom?.property_type || hotel.property_type}
              </span>
            )}
            <div className="vi-location">
              <Icon name="pin" size={13} />
              <span>{hotel.address || `${hotel.city}, ${hotel.region}`}</span>
            </div>
            <div className="vi-header-meta">
              <span className="vi-price-badge">
                <span className="vi-price-val">{FMT(baseRoom?.price_per_night || hotel.price_from || 0)}₫</span>
                <span className="vi-price-unit">/tháng</span>
              </span>
              <span className="vi-status-badge">
                <span className="vi-status-dot" />
                {(baseRoom?.status === 'unavailable') ? 'Đã thuê' : 'Còn phòng'}
              </span>
              {(hotel.badge || hotel.verified) && (
                <span className="vi-verified-badge">
                  <Icon name="shield" size={12} />
                  Đã xác thực
                </span>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* ==================== 2. IMAGE GALLERY ==================== */}
      <section className="container-wide">
        <div className="vi-gallery">
          <div className="vi-gallery-main">
            {gallery.map((src, i) => (
              <div key={i} className={`vi-gallery-slide ${i === currentImage ? 'is-active' : ''}`}>
                <Photo src={src} hue={hotel.hue} />
              </div>
            ))}
          </div>
          <div className="vi-gallery-counter">{currentImage + 1}/{gallery.length}</div>
          {gallery.length > 1 && (
            <div className="vi-gallery-thumbs">
              {gallery.map((src, i) => (
                <button key={i} className={`vi-thumb ${i === currentImage ? 'is-active' : ''}`} onClick={() => setCurrentImage(i)}>
                  <Photo src={src} hue={hotel.hue} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== MAIN + SIDEBAR WRAPPER ==================== */}
      <div className="vi-shell container-wide">
        <main className="vi-main">

          {/* 3. ROOM AMENITIES — Tiện ích phòng trọ */}
          <section className="vi-section">
            <h2 className="vi-section-title">Tiện ích phòng trọ</h2>
            <div className="vi-amenity-grid">
              {ROOM_AMENITIES.map((a) => {
                const on = hasAmenity(baseRoom, hotel, a.key);
                return (
                  <div key={a.key} className={`vi-amenity-chip ${on ? 'is-on' : 'is-off'}`}>
                    <span className="vi-amenity-chip-icon">
                      <Icon name={a.icon} size={15} />
                    </span>
                    <span className="vi-amenity-chip-label">{a.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. DETAILED DESCRIPTION — Mô tả chi tiết */}
          <section className="vi-section">
            <h2 className="vi-section-title">Mô tả chi tiết</h2>
            <div className="vi-desc-card">
              <h3 className="vi-desc-title">
                {hotel.city || hotel.region} – {baseRoom?.type || hotel.hotel_type || 'PHÙ HỢP GIA ĐÌNH'}
              </h3>
              <div className="vi-desc-body">
                <div className="vi-desc-block">
                  <strong>Vị trí:</strong>
                  <ul>
                    <li>{hotel.address || `${hotel.ward ? hotel.ward + ', ' : ''}${hotel.district ? hotel.district + ', ' : ''}${hotel.city || hotel.region || 'Đang cập nhật'}`}</li>
                  </ul>
                </div>
                <div className="vi-desc-block">
                  <strong>Tiện ích xung quanh:</strong>
                  <ul>
                    {hotel.nearby_places ? (
                      String(hotel.nearby_places).split(',').map((p, i) => <li key={i}>{p.trim()}</li>)
                    ) : (
                      <li>Gần chợ, siêu thị, trường học, bệnh viện — đầy đủ tiện ích sinh hoạt</li>
                    )}
                  </ul>
                </div>
                <div className="vi-desc-block">
                  <strong>Thực tế:</strong>
                  <ul>
                    {hotel.road_type && <li>Đường {hotel.road_type}</li>}
                    {hotel.neighborhood && <li>Khu {hotel.neighborhood}</li>}
                    <li>An ninh tốt, dân trí cao</li>
                    <li>Gần trường học, chợ dân sinh</li>
                  </ul>
                </div>
              </div>
              {hotel.description && (
                <div className="vi-desc-note">
                  {hotel.description.split('\n').filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 5. COSTS & CONDITIONS — Chi phí & Điều kiện */}
          <section className="vi-section">
            <h2 className="vi-section-title">Chi phí & Điều kiện</h2>
            <div className="vi-cost-grid">
              {COST_ITEMS.map((c) => {
                const val = getCostValue(baseRoom, hotel, c.key);
                return (
                  <div key={c.key} className="vi-cost-card">
                    <div className="vi-cost-card-icon"><Icon name={c.icon} size={16} /></div>
                    <div className="vi-cost-card-label">{c.label}</div>
                    <div className="vi-cost-card-value">{formatCostValue(val, c.unit)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. EQUIPMENT DETAILS — Chi tiết trang thiết bị */}
          <section className="vi-section">
            <h2 className="vi-section-title">Chi tiết trang thiết bị</h2>
            <div className="vi-equip-grid">
              {EQUIPMENT_ITEMS.map((e) => {
                const val = getEquipmentValue(baseRoom, hotel, e.key);
                return (
                  <div key={e.key} className="vi-equip-row">
                    <span className="vi-equip-label">{e.label}</span>
                    <span className="vi-equip-value">{val}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. LOCATION */}
          <section className="vi-section">
            <h2 className="vi-section-title">Vị trí</h2>
            <div className="vi-map-card">
              {hotel.latitude != null && hotel.longitude != null ? (
                <HotelMap lat={hotel.latitude} lng={hotel.longitude} label={hotel.name} height={200} />
              ) : (
                <div className="vi-map-placeholder">
                  <Icon name="map" size={24} />
                  <p>Không có bản đồ</p>
                </div>
              )}
              <div className="vi-map-footer">
                <div className="vi-map-address">
                  <Icon name="pin" size={13} />
                  <span>{hotel.address || `${hotel.city}, ${hotel.region}`}</span>
                </div>
                {hotel.latitude != null && (
                  <a href={`https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=15/${hotel.latitude}/${hotel.longitude}`} target="_blank" rel="noreferrer" className="vi-map-link">
                    Xem bản đồ lớn <Icon name="arrow-up-right" size={10} />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* 8. OTHER AVAILABLE ROOMS — Danh sách phòng trống khác */}
          <section className="vi-section">
            <button className="vi-other-toggle" onClick={() => setOtherOpen(!otherOpen)} aria-expanded={otherOpen}>
              <span className="vi-section-title" style={{ margin: 0 }}>
                Danh sách phòng trống khác ({otherRooms.length})
              </span>
              <Icon name={otherOpen ? 'chevron-down' : 'chevron-right'} size={16} />
            </button>
            {otherOpen && (
              otherRooms.length > 0 ? (
                <div className="vi-other-grid">
                  {otherRooms.slice(0, 4).map((r) => (
                    <div className="vi-other-card" key={r.id}>
                      <div className="vi-other-img">
                        <Photo src={r.image_url} hue={r.hue} />
                      </div>
                      <div className="vi-other-body">
                        <h3 className="vi-other-name">{r.name || r.type}</h3>
                        <div className="vi-other-meta">
                          <span>{r.size_sqm && `${r.size_sqm} m²`}</span>
                          <span className="vi-other-price">{FMT(r.price_per_night)}₫/tháng</span>
                        </div>
                        <button className="vi-other-view" onClick={() => navigate(`/hotel/${hotel.slug}?room=${r.id}`)}>
                          Xem chi tiết <Icon name="arrow-right" size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="vi-other-empty">Không có phòng trống khác.</p>
              )
            )}
          </section>
        </main>

        {/* ==================== VIEWING APPOINTMENT FORM (SIDEBAR) ==================== */}
        <aside className="vi-aside">
          <div className="vi-appointment">
            <div className="vi-appt-header">
              <h3 className="vi-appt-title">Đặt lịch xem phòng</h3>
              <p className="vi-appt-sub">Chọn ngày và giờ phù hợp, chúng tôi sẽ liên hệ xác nhận.</p>
            </div>
            {formSubmitted ? (
              <div className="vi-appt-success">
                <div className="vi-appt-success-icon"><Icon name="check" size={28} /></div>
                <h4>Yêu cầu đã gửi!</h4>
                <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch xem phòng.</p>
                <button className="vi-appt-reset" onClick={() => { setFormSubmitted(false); setForm({ name: '', phone: '', email: '', date: '', time: '', note: '' }); }}>
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form className="vi-appt-form" onSubmit={submitAppointment}>
                <div className="vi-field">
                  <label htmlFor="appt-name">Họ và tên</label>
                  <input id="appt-name" name="name" value={form.name} onChange={handleFormChange} placeholder="Nhập họ và tên" />
                </div>
                <div className="vi-field">
                  <label htmlFor="appt-phone">Số điện thoại <span className="vi-required">*</span></label>
                  <input id="appt-phone" name="phone" value={form.phone} onChange={handleFormChange} placeholder="Nhập số điện thoại" type="tel" required />
                </div>
                <div className="vi-field">
                  <label htmlFor="appt-email">Email (không bắt buộc)</label>
                  <input id="appt-email" name="email" value={form.email} onChange={handleFormChange} placeholder="Nhập email" type="email" />
                </div>
                <div className="vi-field-row">
                  <div className="vi-field">
                    <label htmlFor="appt-date">Ngày xem <span className="vi-required">*</span></label>
                    <input id="appt-date" name="date" value={form.date} onChange={handleFormChange} type="date" min={minDate} required />
                  </div>
                  <div className="vi-field">
                    <label htmlFor="appt-time">Giờ xem <span className="vi-required">*</span></label>
                    <input id="appt-time" name="time" value={form.time} onChange={handleFormChange} type="time" required />
                  </div>
                </div>
                <div className="vi-field">
                  <label htmlFor="appt-note">Ghi chú (không bắt buộc)</label>
                  <textarea id="appt-note" name="note" value={form.note} onChange={handleFormChange} placeholder="VD: Tôi rảnh sau 6 giờ chiều" rows={2} />
                </div>
                {formError && <p className="vi-appt-error">{formError}</p>}
                <button type="submit" className="vi-appt-cta">
                  <Icon name="calendar" size={15} />
                  Đặt lịch xem phòng
                </button>
                <p className="vi-appt-note">
                  <Icon name="lock" size={11} />
                  Miễn phí • Không yêu cầu thanh toán
                </p>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* ==================== MOBILE BOTTOM BAR ==================== */}
      <div className="vi-bar" role="region" aria-label="Đặt lịch xem phòng">
        <div>
          <span className="vi-bar-price">{FMT(baseRoom?.price_per_night || hotel.price_from || 0)}₫<span className="text-muted" style={{ fontSize: 12, marginLeft: 4 }}>/tháng</span></span>
        </div>
        <button className="vi-bar-cta" onClick={() => setShowForm(true)}>
          <Icon name="calendar" size={14} />
          Đặt lịch xem phòng
        </button>
      </div>

      {/* ==================== MOBILE FORM SHEET ==================== */}
      {showForm && (
        <div className="vi-sheet-overlay" onClick={() => setShowForm(false)}>
          <div className="vi-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vi-sheet-handle" />
            <div className="vi-sheet-header">
              <h3>Đặt lịch xem phòng</h3>
              <button className="vi-sheet-close" onClick={() => setShowForm(false)}><Icon name="x" size={18} /></button>
            </div>
            {formSubmitted ? (
              <div className="vi-appt-success">
                <div className="vi-appt-success-icon"><Icon name="check" size={28} /></div>
                <h4>Yêu cầu đã gửi!</h4>
                <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch xem phòng.</p>
                <button className="vi-appt-reset" onClick={() => { setFormSubmitted(false); setForm({ name: '', phone: '', email: '', date: '', time: '', note: '' }); setShowForm(false); }}>
                  Đóng
                </button>
              </div>
            ) : (
              <form className="vi-appt-form" onSubmit={(e) => { submitAppointment(e); if (!formError) setTimeout(() => setShowForm(false), 500); }}>
                <div className="vi-field">
                  <label htmlFor="m-name">Họ và tên</label>
                  <input id="m-name" name="name" value={form.name} onChange={handleFormChange} placeholder="Nhập họ và tên" />
                </div>
                <div className="vi-field">
                  <label htmlFor="m-phone">Số điện thoại <span className="vi-required">*</span></label>
                  <input id="m-phone" name="phone" value={form.phone} onChange={handleFormChange} placeholder="Nhập số điện thoại" type="tel" required />
                </div>
                <div className="vi-field">
                  <label htmlFor="m-email">Email (không bắt buộc)</label>
                  <input id="m-email" name="email" value={form.email} onChange={handleFormChange} placeholder="Nhập email" type="email" />
                </div>
                <div className="vi-field-row">
                  <div className="vi-field">
                    <label htmlFor="m-date">Ngày xem <span className="vi-required">*</span></label>
                    <input id="m-date" name="date" value={form.date} onChange={handleFormChange} type="date" min={minDate} required />
                  </div>
                  <div className="vi-field">
                    <label htmlFor="m-time">Giờ xem <span className="vi-required">*</span></label>
                    <input id="m-time" name="time" value={form.time} onChange={handleFormChange} type="time" required />
                  </div>
                </div>
                <div className="vi-field">
                  <label htmlFor="m-note">Ghi chú (không bắt buộc)</label>
                  <textarea id="m-note" name="note" value={form.note} onChange={handleFormChange} placeholder="VD: Tôi rảnh sau 6 giờ chiều" rows={2} />
                </div>
                {formError && <p className="vi-appt-error">{formError}</p>}
                <button type="submit" className="vi-appt-cta">
                  <Icon name="calendar" size={15} />
                  Đặt lịch xem phòng
                </button>
                <p className="vi-appt-note">
                  <Icon name="lock" size={11} />
                  Miễn phí • Không yêu cầu thanh toán
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

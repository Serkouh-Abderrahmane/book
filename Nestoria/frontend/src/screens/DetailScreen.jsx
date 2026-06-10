import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import Stepper from '../components/Stepper.jsx';
import HotelMap from '../components/HotelMap.jsx';
import { SkeletonDetail } from '../components/Skeleton.jsx';
import { hotelsAPI } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSavedHotels } from '../hooks/useSavedHotels.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const ORIENTATIONS = {
  Đ: { full: 'Hướng Đông', emoji: '🌅', desc: 'Đón nắng sáng' },
  T: { full: 'Hướng Tây', emoji: '🌇', desc: 'Chiều đẹp nhất' },
  N: { full: 'Hướng Nam', emoji: '☀️', desc: 'Mát mẻ quanh năm' },
  B: { full: 'Hướng Bắc', emoji: '❄️', desc: 'Tránh nắng gắt' },
  ĐB: { full: 'Hướng Đông Bắc', emoji: '🌤️', desc: 'Sáng mát nhẹ' },
  ĐN: { full: 'Hướng Đông Nam', emoji: '🌥️', desc: 'Đón gió biển' },
  TB: { full: 'Hướng Tây Bắc', emoji: '⛅', desc: 'Chiều lộng gió' },
  TN: { full: 'Hướng Tây Nam', emoji: '🌆', desc: 'Hoàng hôn đẹp' },
};

const FMT = (n) => Number(n).toLocaleString('vi-VN');

function Rating({ value, size = 13 }) {
  return (
    <span className="dr-rating">
      <Icon name="star" size={size} />
      <span>{Number(value).toFixed(1)}</span>
    </span>
  );
}

function InfoCard({ icon, label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="dr-infocard">
      <div className="dr-infocard-icon"><Icon name={icon} size={17} /></div>
      <div className="dr-infocard-label">{label}</div>
      <div className="dr-infocard-value">{value}</div>
    </div>
  );
}

export default function DetailScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const { isSaved, toggle: toggleSave } = useSavedHotels();
  const [shareLabel, setShareLabel] = useState('Chia sẻ');
  const [reserveError, setReserveError] = useState(null);

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

  const today    = new Date();
  const inDate   = new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10);
  const outDate  = new Date(today.getTime() + 17 * 86400000).toISOString().slice(0, 10);

  const [checkin, setCheckin]       = useState(inDate);
  const [checkout, setCheckout]     = useState(outDate);
  const [guests, setGuests]         = useState(2);
  const [rooms, setRooms]           = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [currentImage, setCurrentImage]     = useState(0);

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
  const nights = Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / 86400000));
  const subtotal = baseRoom ? baseRoom.price_per_night * nights * rooms : 0;
  const taxes    = Math.round(subtotal * 0.18);
  const total    = subtotal + taxes;

  const reserve = (roomId = selectedRoomId || baseRoom?.id) => {
    if (user?.role === 'host') {
      setReserveError("Chủ nhà không thể thuê nhà. Hãy đăng xuất và sử dụng tài khoản người thuê để đặt nhà.");
      return;
    }
    setReserveError(null);
    const params = new URLSearchParams();
    params.set('room',     roomId);
    params.set('hotel',    hotel.slug);
    params.set('checkin',  checkin);
    params.set('checkout', checkout);
    params.set('guests',   guests);
    const target = `/booking?${params.toString()}`;
    if (!user) { navigate(`/login?next=${encodeURIComponent(target)}`); return; }
    navigate(target);
  };

  const orientationKey = hotel.orientation || hotel.facing || hotel.balcony_direction;
  const orientation = orientationKey ? ORIENTATIONS[orientationKey] || { full: `Hướng ${orientationKey}`, emoji: '🧭', desc: '' } : null;

  const infoRows = [
    { icon: 'home', label: 'Loại nhà', value: baseRoom?.type || hotel.hotel_type || '—' },
    { icon: 'maximize', label: 'Diện tích', value: baseRoom?.size_sqm ? `${baseRoom.size_sqm} m²` : '—' },
    { icon: 'bed', label: 'Phòng ngủ', value: baseRoom?.beds || '—' },
    { icon: 'users', label: 'Sức chứa', value: baseRoom?.max_guests || '—' },
    { icon: 'calendar', label: 'Nhận phòng', value: String(hotel.checkin_time || '07:00').slice(0, 5) },
    { icon: 'calendar', label: 'Trả phòng', value: String(hotel.checkout_time || '22:00').slice(0, 5) },
  ];

  return (
    <div className="dr-root">
      {/* ==================== HERO ==================== */}
      <section className="dr-hero">
        {gallery.map((src, i) => (
          <div key={i} className={`dr-hero-slide ${i === currentImage ? 'is-active' : ''}`}>
            <Photo src={src} hue={hotel.hue} />
          </div>
        ))}

        <div className="dr-hero-overlay" />

        <div className="dr-hero-top">
          <button className="dr-hero-back" onClick={() => navigate('/')}>
            <Icon name="chevron-left" size={18} />
          </button>
          <div className="dr-hero-top-right">
            <button className="dr-hero-btn" onClick={() => onSave(hotel.id)} aria-pressed={isSaved(hotel.id)}>
              <Icon name={isSaved(hotel.id) ? 'heart-fill' : 'heart'} size={17} />
            </button>
            <button className="dr-hero-btn" onClick={() => share(hotel)}>
              <Icon name="arrow-up-right" size={17} />
            </button>
          </div>
        </div>

        <div className="dr-hero-info">
          <div className="dr-hero-tags">
            {hotel.badge && <span className="tag">{hotel.badge}</span>}
            <span className="dr-hero-region">{hotel.hotel_type || hotel.region}</span>
          </div>
          <h1 className="dr-hero-title">{hotel.name}</h1>
          <div className="dr-hero-meta">
            <span><Icon name="pin" size={12} /> {hotel.address || `${hotel.city}, ${hotel.region}`}</span>
            {hotel.rating_avg > 0 && <Rating value={hotel.rating_avg} />}
            <span className="dr-hero-review-count">({hotel.rating_count} đánh giá)</span>
          </div>
        </div>

        <div className="dr-hero-counter">{currentImage + 1}/{gallery.length}</div>

        {gallery.length > 1 && (
          <div className="dr-hero-thumbs">
            {gallery.map((src, i) => (
              <button key={i} className={`dr-thumb ${i === currentImage ? 'is-active' : ''}`} onClick={() => setCurrentImage(i)}>
                <Photo src={src} hue={hotel.hue} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ==================== SHELL ==================== */}
      <div className="dr-shell container-wide">
        <main className="dr-main">
          {/* OVERVIEW */}
          <section className="dr-section">
            <h2 className="dr-section-title">Tổng quan</h2>
            <div className="dr-infogrid">
              {infoRows.map((item) => <InfoCard key={item.label} {...item} />)}
              {hotel.host_name && (
                <div className="dr-infocard dr-infocard--host">
                  <div className="dr-infocard-icon"><Icon name="user" size={17} /></div>
                  <div className="dr-infocard-label">Chủ nhà</div>
                  <div className="dr-infocard-value">{hotel.host_business || hotel.host_name}</div>
                </div>
              )}
            </div>
          </section>

          {/* DESCRIPTION */}
          {hotel.description && (
            <section className="dr-section">
              <h2 className="dr-section-title">Mô tả</h2>
              <div className="dr-desc">
                <p>{hotel.description}</p>
              </div>
            </section>
          )}

          {/* ORIENTATION */}
          {orientation && (
            <section className="dr-section">
              <h2 className="dr-section-title">
                <Icon name="compass" size={16} /> Hướng nhà
              </h2>
              <div className="dr-orientation">
                <div className="dr-orientation-badge">
                  <span className="dr-orientation-emoji">{orientation.emoji}</span>
                  <span className="dr-orientation-name">{orientation.full}</span>
                </div>
                {orientation.desc && <p className="dr-orientation-desc">{orientation.desc}</p>}
              </div>
            </section>
          )}

          {/* AMENITIES */}
          {(hotel.amenities || []).length > 0 && (
            <section className="dr-section">
              <h2 className="dr-section-title">Tiện nghi</h2>
              <div className="dr-amenities">
                {hotel.amenities.map((a) => (
                  <div className="dr-amenity" key={a.key}>
                    <span className="dr-amenity-icon"><Icon name={a.icon} size={16} /></span>
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* LOCATION */}
          <section className="dr-section">
            <h2 className="dr-section-title">Vị trí</h2>
            <div className="dr-map-card">
              {hotel.latitude != null && hotel.longitude != null ? (
                <HotelMap lat={hotel.latitude} lng={hotel.longitude} label={hotel.name} height={240} />
              ) : (
                <div className="dr-map-placeholder">
                  <Icon name="map" size={28} />
                  <p>Không có bản đồ</p>
                </div>
              )}
              <div className="dr-map-footer">
                <div className="dr-map-address">
                  <Icon name="pin" size={14} />
                  <span>{hotel.address || `${hotel.city}, ${hotel.region}`}</span>
                </div>
                {hotel.latitude != null && (
                  <a href={`https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=15/${hotel.latitude}/${hotel.longitude}`} target="_blank" rel="noreferrer" className="dr-map-link">
                    Xem bản đồ lớn <Icon name="arrow-up-right" size={11} />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* REVIEWS */}
          <section className="dr-section">
            <h2 className="dr-section-title">
              Đánh giá
              {hotel.rating_avg > 0 && <span className="dr-section-badge">{Number(hotel.rating_avg).toFixed(1)}</span>}
            </h2>

            {(hotel.reviews || []).length > 0 && (
              <div className="dr-rating-bar">
                <div className="dr-rating-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon key={s} name="star" size={15} style={{ color: s <= Math.round(hotel.rating_avg || 0) ? 'var(--accent)' : 'var(--line-strong)' }} />
                  ))}
                </div>
                <span className="text-muted" style={{ fontSize: 13 }}>{hotel.rating_count} đánh giá đã xác thực</span>
              </div>
            )}

            <div className="dr-reviews">
              {(hotel.reviews || []).slice(0, 4).map((rv) => (
                <div className="dr-review" key={rv.id}>
                  <div className="dr-review-head">
                    <span className="dr-review-avatar">{rv.customer_name?.[0] || '·'}</span>
                    <div>
                      <div className="dr-review-name">{rv.customer_name}</div>
                      <div className="dr-review-date">{new Date(rv.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</div>
                    </div>
                    <Rating value={rv.rating} size={11} />
                  </div>
                  <p className="dr-review-text">"{rv.comment}"</p>
                </div>
              ))}
              {(!hotel.reviews || hotel.reviews.length === 0) && (
                <p className="text-muted" style={{ fontSize: 14 }}>Chưa có đánh giá nào.</p>
              )}
            </div>
          </section>

          {/* ROOMS */}
          {(hotel.rooms || []).length > 0 && (
            <section className="dr-section">
              <h2 className="dr-section-title">Phòng trống</h2>
              <div className="dr-roomgrid">
                {hotel.rooms.map((r) => (
                  <div className="dr-room" key={r.id}>
                    <div className="dr-room-img">
                      <Photo hue={r.hue} src={r.image_url} />
                      <div className="dr-room-price">
                        <span className="dr-room-price-val">{FMT(r.price_per_night)}₫</span>
                        <span className="dr-room-price-unit">/tháng</span>
                      </div>
                    </div>
                    <div className="dr-room-body">
                      <h3 className="dr-room-name">{r.name || r.type}</h3>
                      <div className="dr-room-meta">
                        <span>{r.size_sqm && `${r.size_sqm} m²`}</span>
                        <span>{r.beds && `${r.beds}`}</span>
                        <span>{r.view}</span>
                      </div>
                      <div className="dr-room-chips">
                        {(r.special_amenities ? String(r.special_amenities).split(',').map((s) => s.trim()).filter(Boolean) : []).slice(0, 3).map((a) => (
                          <span key={a} className="chip">{a}</span>
                        ))}
                        <span className="chip">Hủy miễn phí</span>
                      </div>
                      <button className="dr-room-cta" onClick={() => { setSelectedRoomId(r.id); reserve(r.id); }}>
                        Thuê ngay <Icon name="arrow-right" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ============ BOOKING ASIDE ============ */}
        <aside className="dr-aside">
          <div className="dr-book">
            <div className="dr-book-header">
              <div className="dr-book-price">
                <span className="dr-book-price-val">{FMT(baseRoom?.price_per_night || hotel.price_from || 0)}₫</span>
                <span className="dr-book-price-unit">/ tháng</span>
              </div>
              {hotel.rating_avg > 0 && (
                <div className="dr-book-rating">
                  <Icon name="star" size={13} />
                  {Number(hotel.rating_avg).toFixed(1)}
                </div>
              )}
            </div>

            <div className="dr-book-micro">
              <span><Icon name="check" size={12} /> Hủy miễn phí</span>
              <span><Icon name="shield" size={12} /> Xác nhận ngay</span>
            </div>

            <div className="dr-book-dates">
              <div className="dr-book-date">
                <label>Nhận phòng</label>
                <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
              </div>
              <div className="dr-book-date-arr"><Icon name="arrow-right" size={13} /></div>
              <div className="dr-book-date">
                <label>Trả phòng</label>
                <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
              </div>
            </div>

            <div className="dr-book-steppers">
              <Stepper label="Khách" value={guests} min={1} max={8} onChange={setGuests} />
              <hr className="divider" />
              <Stepper label="Phòng" value={rooms} min={1} max={4} onChange={setRooms} />
            </div>

            <div className="dr-book-summary">
              <div className="dr-book-row"><span>{FMT(baseRoom?.price_per_night || 0)}₫ × {nights} tháng</span><span>{FMT(subtotal)}₫</span></div>
              <div className="dr-book-row"><span>Thuế & phí</span><span>{FMT(taxes)}₫</span></div>
              <div className="dr-book-row dr-book-row--total"><span>Tổng cộng</span><span>{FMT(total)}₫</span></div>
            </div>

            <button className="dr-book-cta" onClick={() => reserve()}>
              Đặt ngay <Icon name="arrow-right" size={15} />
            </button>
            {reserveError ? (
              <p className="dr-book-error">{reserveError}</p>
            ) : (
              <p className="dr-book-note">Bạn chưa bị tính phí.</p>
            )}
          </div>
        </aside>
      </div>

      {/* ==================== MOBILE BOTTOM BAR ==================== */}
      <div className="reserve-bar" role="region" aria-label="Thuê nhà">
        <div>
          <span className="dr-bar-price">{FMT(baseRoom?.price_per_night || hotel.price_from || 0)}₫<span className="text-muted" style={{ fontSize: 12, marginLeft: 4 }}>/tháng</span></span>
          <span className="text-muted" style={{ fontSize: 12, display: 'block' }}>{FMT(total)}₫ tổng cộng</span>
        </div>
        <button className="dr-bar-cta" onClick={() => reserve()}>
          Đặt ngay <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </div>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import SearchBar from '../components/SearchBar.jsx';
import HotelCard from '../components/HotelCard.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { hotelsAPI } from '../lib/api.js';
import { useSavedHotels } from '../hooks/useSavedHotels.js';
import { useScrollRevealAll } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isSaved, toggle: toggleSave } = useSavedHotels();
  usePageTitle('');

  const onSave = (id) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    toggleSave(id);
  };

  const destinationsQ = useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelsAPI.destinations().then((d) => d.destinations),
  });
  const featuredQ = useQuery({
    queryKey: ['hotels', 'featured'],
    queryFn: () => hotelsAPI.search({ sort: 'score' }).then((d) => d.hotels.slice(0, 8)),
  });

  const goSearch = (q) => {
    const params = new URLSearchParams();
    if (q.location) params.set('location', q.location);
    if (q.checkin)  params.set('checkin',  q.checkin);
    if (q.checkout) params.set('checkout', q.checkout);
    if (q.guests)   params.set('guests',   q.guests);
    navigate(`/hotels?${params.toString()}`);
  };

  useScrollRevealAll('.reveal');
  useScrollRevealAll('.stagger-group');

  const POPULAR = ['Hà Nội', 'Huế', 'Đà Nẵng', 'Nha Trang', 'Phú Quốc'];

  return (
    <div>
      {/* HERO — Full immersive */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="h-display hero-title">Khám phá chỗ nghỉ< br />tuyệt nhất Việt Nam</h1>
          <p className="hero-sub">Từ những ngôi nhà cổ kính đến khu nghỉ dưỡng đương đại — nơi mỗi kỳ nghỉ đều trở thành kỷ niệm.</p>
          <SearchBar onSubmit={goSearch} />
          <div className="row mt-4" style={{ justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Phổ biến:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                className="chip"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                onClick={() => goSearch({ location: p })}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats reveal">
        <div className="container-wide">
          <div className="stats-grid">
            <div><div className="stat-num">{featuredQ.data ? '8+' : '—'}</div><div className="stat-label">Chỗ nghỉ</div></div>
            <div><div className="stat-num">{destinationsQ.data?.length ?? '—'}</div><div className="stat-label">Điểm đến</div></div>
            <div><div className="stat-num">4.8<span style={{fontSize:24,opacity:.5}}>/5</span></div><div className="stat-label">Đánh giá trung bình</div></div>
            <div><div className="stat-num">2024</div><div className="stat-label">Thành lập</div></div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS — Horizontal pills */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="section-head">
            <div>
              <h2 className="h-2">Khám phá theo điểm đến</h2>
              <p className="section-subtitle">Chọn một vùng đất để bắt đầu hành trình</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/hotels')}>
              Xem tất cả <Icon name="arrow-right" size={14} />
            </button>
          </div>
          <div className="dest-pills">
            {(destinationsQ.data || []).map((d) => (
              <button
                key={d.name}
                className="dest-pill"
                onClick={() => navigate(`/hotels?location=${encodeURIComponent(d.name)}`)}
              >
                <Icon name="pin" size={14} />
                {d.name}
              </button>
            ))}
          </div>
          <div className="scroll-x mt-4 stagger-group">
            {(destinationsQ.data || []).slice(0, 6).map((d) => (
              <div
                key={d.name}
                className="hcard-h"
                onClick={() => navigate(`/hotels?location=${encodeURIComponent(d.name)}`)}
              >
                <div className="hcard-img">
                  <Photo hue={d.hue || 'sand'} src={d.hero_image_url} alt={d.name} />
                </div>
                <div className="hcard-body">
                  <div className="hcard-head">
                    <h3 className="hcard-name">{d.name}</h3>
                  </div>
                  <span className="hcard-loc">{d.region}</span>
                  <div className="hcard-foot">
                    <span className="hcard-price">{d.stays || '—'} chỗ nghỉ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED — Horizontal scroll */}
      <section className="section reveal" style={{ paddingTop: 0 }}>
        <div className="container-wide">
          <div className="section-head">
            <div>
              <h2 className="h-2">Chỗ nghỉ nổi bật</h2>
              <p className="section-subtitle">Những nơi được khách yêu thích nhất tháng này</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/hotels')}>
              Xem tất cả <Icon name="arrow-right" size={14} />
            </button>
          </div>
          <div className="scroll-x stagger-group">
            {featuredQ.isLoading
              ? <SkeletonCard count={4} />
              : (featuredQ.data || []).map((h) => (
                  <div key={h.id} style={{ width: 300 }} className="fade-up">
                    <HotelCard hotel={h} saved={isSaved(h.id)} onSave={() => onSave(h.id)} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* HOST CTA */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="card cta-card">
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>— Đối tác</span>
              <h2 className="h-1" style={{ maxWidth: 580, color: 'white', marginTop: 8 }}>
                Bạn có một chỗ nghỉ tuyệt vời? Hãy cùng hợp tác.
              </h2>
              <p className="section-subtitle mt-2" style={{ maxWidth: 480, color: 'rgba(255,255,255,0.7)' }}>
                Chúng tôi hợp tác với các chủ khách sạn và nhà nghỉ độc lập, những người coi trọng lòng hiếu khách như một nghệ thuật.
              </p>
            </div>
            <div className="stack" style={{ '--gap': '12px' }}>
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/login?role=host')}>
                Đăng ký làm đối tác <Icon name="arrow-right" size={14} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/become-host')}>Tiêu chuẩn của chúng tôi</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

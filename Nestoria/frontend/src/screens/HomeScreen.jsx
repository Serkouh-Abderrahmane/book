import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import RoomCard from '../components/RoomCard.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';
import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { hotelsAPI } from '../lib/api.js';
import { DISTRICTS } from '../lib/filterConstants.js';
import { useSavedHotels } from '../hooks/useSavedHotels.js';
import { useScrollRevealAll } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/AuthContext.jsx';

const VALUES = [
  { icon: 'home', title: 'Nhà chọn lọc', body: 'Mỗi căn nhà đều được đội ngũ chúng tôi kiểm tra — không có niêm yết ồ ạt, chỉ có những không gian thực sự đáng ở.' },
  { icon: 'star', title: 'Chất lượng đảm bảo', body: 'Đánh giá 4.8/5 từ người thuê thực. Chúng tôi đứng sau từng căn nhà trong danh sách.' },
  { icon: 'shield', title: 'Giao dịch an toàn', body: 'Thanh toán được bảo vệ. Thông tin cá nhân được mã hóa. Hỗ trợ tận tâm 24/7.' },
  { icon: 'map', title: 'Tập trung tại Sài Gòn', body: 'Từ Quận 1 đến Thủ Đức — chúng tôi có nhà cho thuê trên khắp TP. Hồ Chí Minh.' },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { user } = useAuth();
  const { isSaved, toggle: toggleSave } = useSavedHotels();
  usePageTitle('Chi Vinh Land');

  const onSave = (id) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(routerLocation.pathname + routerLocation.search)}`);
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

  useScrollRevealAll('.reveal');
  useScrollRevealAll('.stagger-group');

  const POPULAR = DISTRICTS['Thành phố Hồ Chí Minh'] || [];

  return (
    <div>
      {/* HERO — Brand showcase */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content" style={{ maxWidth: 720 }}>
          <div className="hero-badge">
            <Icon name="home" size={14} />
            Chi Vinh Land
          </div>
          <h1 className="h-display hero-title" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)' }}>
            Nhà thuê,<br />
            <em>có câu chuyện.</em>
          </h1>
          <p className="hero-sub" style={{ fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: 560 }}>
            Nơi mỗi căn nhà đều có linh hồn — và một chủ nhà biết chăm sóc nó.
            Nhà thuê và căn hộ chất lượng tại TP. Hồ Chí Minh.
          </p>

          <div className="row mt-6" style={{ gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-accent btn-lg" onClick={() => navigate('/')}>
              Khám phá nhà cho thuê <Icon name="arrow-right" size={16} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/about')}>
              Về Chi Vinh Land
            </button>
          </div>

          <div className="hero-districts row mt-5" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Khu vực phổ biến:</span>
            {POPULAR.slice(0, 6).map((p) => (
              <button
                key={p}
                className="chip"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12 }}
                onClick={() => navigate(`/?district=${encodeURIComponent(p)}`)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY STORY */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="about-intro" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 48, alignItems: 'center' }}>
            <div style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
              <Photo hue="forest" src="" alt="Chi Vinh Land" />
            </div>
            <div>
              <span className="eyebrow">— Câu chuyện</span>
              <h2 className="h-1 mt-3" style={{ maxWidth: 500 }}>Hơn cả một nền tảng cho thuê nhà.</h2>
              <p className="text-muted mt-4" style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 540 }}>
                Chi Vinh Land ra đời từ niềm tin rằng một căn nhà không chỉ là nơi ở — mà là nơi kết nối.
                Chúng tôi tự hào giới thiệu những căn nhà cho thuê chất lượng trên khắp TP. Hồ Chí Minh,
                mỗi nơi đều được chọn lọc bởi đội ngũ của chính chúng tôi.
              </p>
              <div className="row mt-5" style={{ gap: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/about')}>
                  Đọc thêm <Icon name="arrow-right" size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHI VINH LAND — Values */}
      <section className="section reveal" style={{ background: 'var(--bg-inset)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container-wide">
          <div className="section-head">
            <div>
              <div className="eyebrow mb-3">— Tại sao chọn chúng tôi</div>
              <h2 className="h-1">Bốn lý do người thuê tin tưởng<br />Chi Vinh Land.</h2>
            </div>
          </div>
          <div className="grid-features-4 stagger-group">
            {VALUES.map((v) => (
              <div key={v.title} className="card" style={{ padding: 28 }}>
                <span className="detail-info-icon" style={{ marginBottom: 14, background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                  <Icon name={v.icon} size={20} />
                </span>
                <h3 className="h-3" style={{ fontSize: 20, lineHeight: 1.2 }}>{v.title}</h3>
                <p className="text-muted mt-3" style={{ fontSize: 14, lineHeight: 1.6 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats reveal">
        <div className="container-wide">
          <div className="stats-grid">
            <div><div className="stat-num">{featuredQ.data ? '8+' : '—'}</div><div className="stat-label">Nhà cho thuê</div></div>
            <div><div className="stat-num">{destinationsQ.data?.length ?? '—'}</div><div className="stat-label">Khu vực</div></div>
            <div><div className="stat-num">4.8<span style={{fontSize:24,opacity:.5}}>/5</span></div><div className="stat-label">Đánh giá trung bình</div></div>
            <div><div className="stat-num">2024</div><div className="stat-label">Thành lập</div></div>
          </div>
        </div>
      </section>

      {/* FEATURED — Horizontal scroll */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="section-head">
            <div>
              <h2 className="h-2">Nhà cho thuê nổi bật</h2>
              <p className="section-subtitle">Những ngôi nhà được người thuê yêu thích nhất trên Chi Vinh Land</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
              Xem tất cả <Icon name="arrow-right" size={14} />
            </button>
          </div>
          <div className="scroll-x stagger-group">
            {featuredQ.isLoading ? (
              <SkeletonCard count={4} />
            ) : featuredQ.isError ? (
              <div style={{ width: '100%', textAlign: 'center', padding: 40, color: 'var(--ink-3)', fontSize: 13 }}>
                Không thể tải danh sách nhà cho thuê.{' '}
                <button onClick={() => featuredQ.refetch()} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)', background: 'none', border: 'none', font: 'inherit' }}>
                  Thử lại
                </button>
              </div>
            ) : (
              (featuredQ.data || []).map((h) => (
                <div key={h.id} style={{ width: 300 }} className="fade-up">
                  <RoomCard hotel={h} saved={isSaved(h.id)} onSave={() => onSave(h.id)} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* AREAS — Service areas */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="section-head">
            <div>
              <h2 className="h-2">Khu vực phổ biến tại TP. Hồ Chí Minh</h2>
              <p className="section-subtitle">Chọn khu vực bạn muốn tìm nhà</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
              Xem tất cả <Icon name="arrow-right" size={14} />
            </button>
          </div>
          {destinationsQ.isError ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>
              Không thể tải danh sách khu vực.{' '}
              <button onClick={() => destinationsQ.refetch()} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)', background: 'none', border: 'none', font: 'inherit' }}>
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="dest-pills">
                {(destinationsQ.data || []).map((d) => (
                  <button
                    key={d.name}
                    className="dest-pill"
                    onClick={() => navigate(`/?location=${encodeURIComponent(d.name)}`)}
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
                    onClick={() => navigate(`/?location=${encodeURIComponent(d.name)}`)}
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
                        <span className="hcard-price">{d.stays || '—'} nhà cho thuê</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA — Go to store */}
      <section className="section reveal" style={{ paddingTop: 0 }}>
        <div className="container-wide">
          <div className="card cta-card" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>— Sẵn sàng tìm nhà mới?</div>
            <h2 className="h-1" style={{ maxWidth: 580, color: 'white', margin: '12px auto 0' }}>
              Hơn 8 căn nhà đang chờ bạn.
            </h2>
            <p className="mt-3" style={{ maxWidth: 400, margin: '12px auto 0', color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
              Từ căn hộ Quận 1 đến nhà nguyên căn Thủ Đức — tìm không gian sống phù hợp với bạn.
            </p>
            <button className="btn btn-accent btn-lg mt-5" onClick={() => navigate('/')}>
              Khám phá nhà cho thuê <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="card" style={{ padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h3 className="h-3">Bạn có nhà muốn cho thuê?</h3>
              <p className="text-muted mt-2" style={{ fontSize: 14, maxWidth: 480 }}>
                Chi Vinh Land giúp chủ nhà tìm người thuê phù hợp nhanh chóng và an toàn.
              </p>
            </div>
            <div className="row" style={{ gap: 12 }}>
              <button className="btn btn-primary" onClick={() => navigate('/login?role=host')}>
                Đăng tin cho thuê <Icon name="arrow-right" size={14} />
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/become-host')}>Tìm hiểu thêm</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

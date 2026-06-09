import { Link } from 'react-router-dom';
import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { useScrollRevealAll } from '../hooks/useScrollReveal.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const WHY = [
  { icon: 'sparkle',    title: 'Giới thiệu biên tập', body: 'Chỗ nghỉ của bạn được trình bày với nhiếp ảnh chuyên nghiệp và văn phong được viết bởi người đã từng ở đó.' },
  { icon: 'compass',    title: 'Khách hàng chất lượng', body: 'Du khách chọn Phong Cảnh Việt tìm kiếm những chỗ lưu trú có chiều sâu. Tỷ lệ hủy dưới 4%.' },
  { icon: 'shield',     title: 'Phí cố định 10%',      body: 'Không phí niêm yết, không phụ phí mỗi lần lưu trú, không tăng giá đột biến. Phép tính luôn rõ ràng.' },
  { icon: 'calendar',   title: 'Thanh toán hàng tháng', body: 'Thanh toán vào ngày 1, sau khi trừ hoàn tiền. Chuyển khoản ngân hàng.' },
];

const STEPS = [
  { n: 1, title: 'Đăng ký',     body: 'Kể cho chúng tôi về chỗ nghỉ của bạn qua một biểu mẫu ngắn. Chúng tôi trả lời trong vòng một tuần với câu trả lời đồng ý, chưa sẵn sàng hoặc một cuộc trò chuyện.' },
  { n: 2, title: 'Tiếp nhận',   body: 'Biên tập viên của chúng tôi đến thăm (hoặc sắp xếp chụp ảnh từ xa), viết nội dung niêm yết cùng bạn và giúp bạn thiết lập phòng.' },
  { n: 3, title: 'Đi vào hoạt động',   body: 'Danh sách của bạn được xuất bản. Bạn quản lý đặt phòng, lịch và giá từ không gian đối tác — chúng tôi xử lý thanh toán.' },
];

export default function BecomeHostScreen() {
  useScrollRevealAll('.reveal');
  useScrollRevealAll('.stagger-group');
  usePageTitle('Trở thành chủ nhà');
  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container-wide">
          <div className="hero-grid">
            <div className="fade-up">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-line" />
                <span className="eyebrow">Dành cho đối tác</span>
              </div>
              <h1 className="h-display hero-title">
                Nếu bạn đã xây dựng<br/>
                <em>một điều gì đó tốt đẹp,</em><br/>
                chúng tôi rất muốn gặp bạn.
              </h1>
              <p className="hero-sub">
                Phong Cảnh Việt hợp tác với các chủ khách sạn độc lập và chủ nhà coi trọng ngành hiếu khách như một nghề thủ công. Không niêm yết ồ ạt, không chạy đua xuống đáy — chỉ một danh sách nhỏ, được chụp ảnh đẹp về những chỗ nghỉ đáng để bay đến.
              </p>
              <div className="row mt-6" style={{ gap: 12, flexWrap: 'wrap' }}>
                <Link to="/login?role=host" className="btn btn-accent btn-lg">
                  Đăng ký làm đối tác <Icon name="arrow-right" size={14} />
                </Link>
                <a href="#how" className="btn btn-ghost btn-lg">Cách hoạt động</a>
              </div>
            </div>
            <div className="fade-up d2">
              <div className="hero-image-frame">
                <Photo hue="forest" src="https://twsdesejcimvmrbopdwj.supabase.co/storage/v1/object/public/hotel-images/hotels/house-of-cardamom/hero.jpg" alt="House of Cardamom" />
                <div className="hero-photo-meta">
                  <div>
                    <div style={{ fontSize: 22, lineHeight: 1.1 }}>House of Cardamom</div>
                    <div className="mono mt-2">Đà Lạt · Việt Nam</div>
                  </div>
                  <div className="mono">thành lập 1934</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container-wide">
          <div className="stats-grid">
            <div><div className="stat-num">10%</div><div className="stat-label">Hoa hồng cố định</div></div>
            <div><div className="stat-num">4<span style={{fontSize:24,opacity:.5}}>%</span></div><div className="stat-label">Tỷ lệ hủy</div></div>
            <div><div className="stat-num">24h</div><div className="stat-label">Thời gian thanh toán</div></div>
            <div><div className="stat-num">4.8</div><div className="stat-label">Đánh giá trung bình</div></div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="section-head">
            <div className="section-title">
              <div className="eyebrow mb-3">— Tại sao chọn Phong Cảnh Việt</div>
              <h2 className="h-1">Bốn lý do đối tác gắn bó với chúng tôi.</h2>
            </div>
          </div>
          <div className="grid-features-4 stagger-group">
            {WHY.map((w) => (
              <div key={w.title} className="card" style={{ padding: 24 }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-inset)', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={w.icon} size={18} />
                </span>
                <h3 className="h-3" style={{ fontSize: 20, lineHeight: 1.2 }}>{w.title}</h3>
                <p className="text-muted mt-2" style={{ fontSize: 13, lineHeight: 1.55 }}>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="section reveal" style={{ paddingTop: 0 }}>
        <div className="container-wide">
          <div className="section-head">
            <div className="section-title">
              <div className="eyebrow mb-3">— Cách hoạt động</div>
              <h2 className="h-1">Ba bước. Khoảng sáu tuần.</h2>
            </div>
          </div>
          <div className="grid-features-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card" style={{ padding: 32, position: 'relative' }}>
                <div style={{ fontSize: 64, lineHeight: 1, color: 'var(--accent)', opacity: 0.85 }}>0{s.n}</div>
                <h3 className="h-3" style={{ fontSize: 24, lineHeight: 1.2 }}>{s.title}</h3>
                <p className="text-muted mt-3" style={{ fontSize: 14, lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="section reveal" style={{ background: 'var(--bg-inset)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container" style={{ maxWidth: 880, textAlign: 'center' }}>
          <div className="eyebrow mb-3">— Từ một đối tác</div>
          <p style={{ fontSize: 36, lineHeight: 1.25, color: 'var(--ink)', maxWidth: 760, margin: '0 auto' }}>
            "Phong Cảnh Việt gửi ít khách hơn các trang lớn — và đánh giá của chúng tôi chưa bao giờ tốt hơn. Khách họ gửi đến thực sự muốn ở đây."
          </p>
          <div className="row mt-6" style={{ justifyContent: 'center', gap: 12 }}>
            <span className="avatar">V</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Vikram Singh</div>
              <div className="text-muted" style={{ fontSize: 12 }}>The Marigold House, Huế · Đối tác từ 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section reveal">
        <div className="container-wide">
          <div className="card cta-card">
            <div>
              <div className="eyebrow mb-3">— Sẵn sàng khi bạn</div>
              <h2 className="h-1" style={{ maxWidth: 580 }}>Niêm yết chỗ nghỉ trong khoảng một giờ.</h2>
              <p className="section-sub mt-3" style={{ maxWidth: 480 }}>
                Đăng ký, điền biểu mẫu, tải ảnh lên. Chúng tôi lo phần còn lại.
              </p>
            </div>
            <div className="stack" style={{ '--gap': '12px' }}>
              <Link to="/login?role=host" className="btn btn-accent btn-lg">
                Đăng ký làm đối tác <Icon name="arrow-right" size={14} />
              </Link>
              <Link to="/contact" className="btn btn-ghost btn-lg">Nói chuyện với chúng tôi trước</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

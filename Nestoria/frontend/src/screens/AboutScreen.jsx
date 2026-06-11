import { Link } from 'react-router-dom';
import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useScrollRevealAll } from '../hooks/useScrollReveal.js';

const VALUES = [
  { title: 'Chọn lọc kỹ càng', body: 'Chúng tôi chỉ hợp tác với những nhà cho thuê có câu chuyện riêng — nơi chủ nhà biết tên từng người thuê và không gian sống được chăm chút đến từng chi tiết.' },
  { title: 'Không gian đích thực', body: 'Không có trải nghiệm "đóng gói". Mỗi căn nhà đều phản ánh văn hóa, kiến trúc và nhịp sống của vùng đất nơi nó tọa lạc.' },
  { title: 'Dịch vụ tận tâm', body: 'Đội ngũ của chúng tôi am hiểu từng căn nhà. Gọi cho chúng tôi và bạn sẽ nói chuyện với người đã từng đặt chân đến nơi đó.' },
  { title: 'Cộng đồng bền vững', body: 'Chúng tôi ưu tiên các nhà cho thuê có trách nhiệm với môi trường và cộng đồng địa phương.' },
];

const TEAM = [
  { name: 'Minh Hoàng', role: 'Người sáng lập & CEO' },
  { name: 'Lan Chi', role: 'Giám đốc Trải nghiệm' },
  { name: 'Đức Anh', role: 'Giám đốc Quan hệ Đối tác' },
  { name: 'Hương Ly', role: 'Giám đốc Nội dung' },
];

const BUILDER = {
  name: 'Rajesh Bhatia',
  role: 'Kỹ sư trưởng',
};

export default function AboutScreen() {
  usePageTitle('Giới thiệu');
  useScrollRevealAll('.reveal');

  return (
    <div className="container-wide" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <section className="reveal" style={{ maxWidth: 720, marginBottom: 64 }}>
        <span className="eyebrow">— Giới thiệu</span>
        <h1 className="h-1 mt-3">Chi Vinh Land là nơi kết nối những căn nhà cho thuê với người thuê.</h1>
        <p className="text-muted mt-4" style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 580 }}>
          Chúng tôi tin rằng một căn nhà tuyệt vời không nằm ở số lượng tiện nghi, mà ở cảm giác khi bạn bước qua ngưỡng cửa. Mỗi căn nhà trong bộ sưu tập của chúng tôi đều có một linh hồn — và một chủ nhà biết chăm sóc nó.
        </p>
      </section>

      <section className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 40, alignItems: 'start', marginBottom: 64 }}>
        <div style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
          <Photo hue="forest" src="" alt="Chi Vinh House" />
        </div>
        <div>
          <span className="eyebrow">— Câu chuyện</span>
          <h2 className="h-2 mt-3">Bắt đầu từ một chuyến đi.</h2>
          <p className="text-muted mt-4" style={{ fontSize: 15, lineHeight: 1.7 }}>
            Chi Vinh Land ra đời từ niềm tin rằng một căn nhà không chỉ là nơi ở — mà là nơi kết nối. Chúng tôi tự hào giới thiệu những căn nhà cho thuê chất lượng trên khắp Việt Nam — mỗi nơi đều được chọn lọc bởi đội ngũ của chính chúng tôi.
          </p>
        </div>
      </section>

      <section className="reveal" style={{ marginBottom: 64 }}>
        <span className="eyebrow">— Giá trị cốt lõi</span>
        <h2 className="h-2 mt-3 mb-6">Điều chúng tôi tin tưởng.</h2>
        <div className="grid-split-2">
          {VALUES.map((v) => (
            <div className="card" key={v.title} style={{ padding: 28 }}>
              <h3 className="h-3">{v.title}</h3>
              <p className="text-muted mt-3" style={{ fontSize: 14, lineHeight: 1.6 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal" style={{ marginBottom: 64 }}>
        <span className="eyebrow">— Đội ngũ</span>
        <h2 className="h-2 mt-3 mb-6">Những người tạo nên Chi Vinh Land.</h2>
        <div className="grid-split-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {TEAM.map((m) => (
            <div key={m.name}>
              <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', marginBottom: 12 }}>
                <Photo hue="cool" src="" alt={m.name} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal">
        <div className="card" style={{ padding: 36, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
          <span className="eyebrow">— Thông tin</span>
          <h3 className="h-2 mt-3">{BUILDER.name}</h3>
          <p className="text-muted mt-2" style={{ fontSize: 13 }}>{BUILDER.role}</p>
          <p className="text-muted mt-4" style={{ fontSize: 13, lineHeight: 1.6 }}>
            Đội ngũ của chúng tôi làm việc từ Sài Gòn, Hà Nội và nhiều tỉnh thành khác trên khắp Việt Nam.
          </p>
          <div className="row mt-4" style={{ gap: 12 }}>
            <Link to="/contact" className="btn btn-primary btn-sm">
              Liên hệ <Icon name="arrow-right" size={12} />
            </Link>
            <Link to="/become-host" className="btn btn-ghost btn-sm">
              Trở thành chủ nhà
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

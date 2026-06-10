import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const schema = z.object({
  name:    z.string().min(2, 'Vui lòng nhập tên'),
  email:   z.string().email('Email không hợp lệ'),
  subject: z.string().min(2, 'Chọn chủ đề'),
  message: z.string().min(10, 'Nhập vài dòng để chúng tôi hỗ trợ bạn tốt hơn'),
});

export default function ContactScreen() {
  const [sent, setSent] = useState(false);
  usePageTitle('Liên hệ');
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = () => {
    // Demo: no backend send. Just acknowledge.
    setSent(true);
    setTimeout(() => { setSent(false); reset(); }, 4000);
  };

  return (
    <div className="container-wide" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div className="mb-8">
        <div className="eyebrow mb-3">— Liên hệ</div>
        <h1 className="h-1" style={{ maxWidth: 720 }}>Gửi lời chào.</h1>
        <p className="section-sub mt-3" style={{ maxWidth: 540, fontSize: 16 }}>
          Thắc mắc về thuê nhà, nhà cho thuê hoặc hợp tác — chúng tôi thường trả lời trong vòng một ngày.
        </p>
      </div>

      <div className="contact-shell">
        {/* Info column */}
        <aside className="stack" style={{ '--gap': '16px', alignSelf: 'start' }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow mb-2">— Email</div>
            <a href="mailto:hello@chivinhland.example" style={{ fontSize: 22, borderBottom: '1px solid var(--line-strong)' }}>
              hello@chivinhland.example
            </a>
            <p className="text-muted mt-3" style={{ fontSize: 13 }}>Thuê nhà, hỗ trợ và thắc mắc chung. Phản hồi trong vòng 24 giờ.</p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow mb-2">— Chủ nhà</div>
            <a href="mailto:chunha@chivinhland.example" style={{ fontSize: 22, borderBottom: '1px solid var(--line-strong)' }}>
              chunha@chivinhland.example
            </a>
            <p className="text-muted mt-3" style={{ fontSize: 13 }}>Để niêm yết nhà cho thuê hoặc liên hệ bộ phận chủ nhà.</p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow mb-2">— Điện thoại</div>
            <div style={{ fontSize: 22 }}>+84 28 4567 8910</div>
            <p className="text-muted mt-3" style={{ fontSize: 13 }}>Ngày trong tuần, 8h – 17h (GMT+7).</p>
          </div>

          <div className="card" style={{ padding: 24, background: 'var(--bg-inset)' }}>
            <div className="eyebrow mb-2">— Văn phòng</div>
            <div style={{ fontSize: 18, lineHeight: 1.35 }}>
              Chi Vinh Land<br/>
              Quận 1 · Thành phố Hồ Chí Minh<br/>
              Việt Nam
            </div>
          </div>
        </aside>

        {/* Form column */}
        <form className="card" style={{ padding: 36 }} onSubmit={handleSubmit(onSubmit)}>
          <h2 className="h-3 mb-6">Gửi tin nhắn</h2>

          {sent ? (
            <div className="fade-up" style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon name="check" size={28} />
              </div>
              <div style={{ fontSize: 26 }}>Cảm ơn — chúng tôi sẽ phản hồi trong vòng một ngày.</div>
              <p className="text-muted mt-3">Theo dõi hộp thư của bạn nhé.</p>
            </div>
          ) : (
            <>
              <div className="form-row-2">
                <div className="field">
                  <label className="field-label">Họ tên</label>
                  <input className="input" placeholder="Tên của bạn" {...register('name')} />
                  {errors.name && <small style={{ color: 'var(--danger)' }}>{errors.name.message}</small>}
                </div>
                <div className="field">
                  <label className="field-label">Email</label>
                  <input className="input" type="email" placeholder="ban@example.com" {...register('email')} />
                  {errors.email && <small style={{ color: 'var(--danger)' }}>{errors.email.message}</small>}
                </div>
              </div>
              <div className="field mt-3">
                <label className="field-label">Chủ đề</label>
                <select className="select" {...register('subject')}>
                  <option value="">Chọn…</option>
                  <option value="booking">Thắc mắc về thuê nhà</option>
                  <option value="property">Câu hỏi về nhà cho thuê</option>
                  <option value="hosting">Tôi muốn niêm yết nhà cho thuê</option>
                  <option value="press">Báo chí / hợp tác</option>
                  <option value="other">Vấn đề khác</option>
                </select>
                {errors.subject && <small style={{ color: 'var(--danger)' }}>{errors.subject.message}</small>}
              </div>
              <div className="field mt-3">
                <label className="field-label">Tin nhắn</label>
                <textarea className="input" rows={6} placeholder="Vài dòng về nhu cầu của bạn." {...register('message')} />
                {errors.message && <small style={{ color: 'var(--danger)' }}>{errors.message.message}</small>}
              </div>
              <div className="row mt-6" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: 12 }}>Chúng tôi không bao giờ chia sẻ thông tin của bạn.</span>
                <button type="submit" className="btn btn-accent">
                  Gửi tin nhắn <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

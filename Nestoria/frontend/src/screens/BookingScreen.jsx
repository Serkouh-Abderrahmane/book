import { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { roomsAPI, bookingsAPI, hotelsAPI } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const TAX = 0.18;

function nightsBetween(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function formatCardNumber(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}
function cvvOnly(raw) {
  return String(raw).replace(/\D/g, '').slice(0, 4);
}

function PaymentTerminal({ method, onDone, onCancel }) {
  const stages = method === 'card'
    ? ['Đang xác thực thẻ…', 'Đang liên hệ ngân hàng…', 'Đã chấp thuận']
    : ['Đang tạo yêu cầu…', 'Đang chờ xác nhận trên ứng dụng…', 'Đã xác nhận'];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timings = [800, 1100, 600];
    const t = setTimeout(() => {
      if (stage < stages.length - 1) setStage((s) => s + 1);
      else onDone?.();
    }, timings[stage] || 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const last = stage === stages.length - 1;

  return createPortal(
    <div className="terminal-backdrop" role="dialog" aria-modal="true">
      <div className="terminal-card fade-up">
        <div className="terminal-brand">
          <Icon name="lock" size={14} /> Cổng thanh toán bảo mật
        </div>
        <div className="terminal-stage">
          {last ? (
            <div className="terminal-tick">
              <Icon name="check" size={32} />
            </div>
          ) : (
            <div className="terminal-spinner" aria-hidden />
          )}
          <div className="terminal-stage-label">{stages[stage]}</div>
          <div className="terminal-trail">
            {stages.map((s, i) => (
              <span key={s} className={`terminal-dot ${i <= stage ? 'is-done' : ''}`} />
            ))}
          </div>
        </div>
        {!last && onCancel && (
          <button type="button" className="btn btn-ghost btn-sm terminal-cancel" onClick={onCancel}>Hủy</button>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function BookingScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const roomId  = Number(params.get('room'));
  const slug    = params.get('hotel');
  const checkin  = params.get('checkin');
  const checkout = params.get('checkout');
  const guestsQ  = Number(params.get('guests') || 2);

  const [step, setStep] = useState(0);
  usePageTitle('Đặt phòng');
  const [bookingId, setBookingId] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    email:    user?.email || '',
    phone:    user?.phone || '',
    note:     '',
    method:   'card',
    card: '', expiry: '', cvv: '', name: '',
  });
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const roomQ  = useQuery({ queryKey: ['room', roomId], queryFn: () => roomsAPI.detail(roomId).then((d) => d.room), enabled: !!roomId });
  const hotelQ = useQuery({ queryKey: ['hotel', slug],  queryFn: () => hotelsAPI.detail(slug).then((d) => d.hotel), enabled: !!slug });

  const createMut = useMutation({
    mutationFn: () => bookingsAPI.create({ room_id: roomId, checkin_date: checkin, checkout_date: checkout, guests: guestsQ }),
    onSuccess: (data) => { setBookingId(data.booking.id); setStep(2); },
  });

  if (user?.role === 'host') {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', maxWidth: 720 }}>
        <h2 className="h-2">Đối tác không thể đặt phòng.</h2>
        <p className="text-muted mt-3">Đặt phòng được thực hiện từ tài khoản khách hàng. Hãy đăng xuất và đăng nhập với vai trò khách để tiếp tục.</p>
        <button className="btn btn-primary mt-6" onClick={() => { logout(); navigate('/login'); }}>Đăng xuất</button>
      </div>
    );
  }

  if (!roomId || !checkin || !checkout) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', maxWidth: 800 }}>
        <h2 className="h-2">Vui lòng chọn chỗ nghỉ trước.</h2>
        <p className="text-muted mt-3">Chọn khách sạn và ngày, sau đó chúng tôi sẽ lo phần còn lại.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/hotels')}>Tìm chỗ nghỉ</button>
      </div>
    );
  }
  if (roomQ.isLoading || hotelQ.isLoading) return <div className="container" style={{ padding: 80, textAlign: 'center' }}>Đang tải…</div>;

  const room  = roomQ.data;
  const hotel = hotelQ.data;
  const nights = nightsBetween(checkin, checkout);
  const subtotal = (room?.price_per_night || 0) * nights;
  const taxes    = Math.round(subtotal * TAX);
  const total    = subtotal + taxes;

  const steps = [
    { id: 0, label: 'Thông tin khách' },
    { id: 1, label: 'Thanh toán' },
    { id: 2, label: 'Xác nhận' },
  ];

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 1100 }}>
      <button onClick={() => navigate(`/hotel/${hotel.slug}`)} className="text-muted mb-4" style={{ fontSize: 13 }}>
        ← Quay lại {hotel.name}
      </button>
      <h1 className="h-1 mb-6">Đặt chỗ nghỉ của bạn.</h1>

      <div className="book-steps">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            <div className={`book-step ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-done' : ''}`}>
              <span className="book-step-num">{step > s.id ? <Icon name="check" size={12} /> : s.id + 1}</span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <span className="book-step-line" />}
          </Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        <main className="card" style={{ padding: 24 }}>
          {step === 0 && (
            <div className="fade-up">
              <h2 className="h-3 mb-4">Ai sẽ ở?</h2>
              <div className="form-row-2">
                <div className="field"><label className="field-label">Họ và tên</label>
                  <input className="input" value={form.fullName} onChange={(e) => upd('fullName', e.target.value)} /></div>
                <div className="field"><label className="field-label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} /></div>
                <div className="field"><label className="field-label">Số điện thoại</label>
                  <input className="input" value={form.phone} onChange={(e) => upd('phone', e.target.value)} /></div>
                <div className="field"><label className="field-label">Giờ đến</label>
                  <select className="select" defaultValue="evening">
                    <option value="afternoon">Chiều (15:00–17:00)</option>
                    <option value="evening">Tối (17:00–20:00)</option>
                    <option value="late">Khuya (20:00+)</option>
                  </select></div>
              </div>
              <div className="field mt-4">
                <label className="field-label">Có gì chúng tôi cần biết?</label>
                <textarea className="input" rows={3} value={form.note} onChange={(e) => upd('note', e.target.value)}
                          placeholder="Nhu cầu ăn uống, kỷ niệm đặc biệt, lưu ý khi đến..." />
              </div>

              <div className="row mt-8" style={{ justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => navigate(`/hotel/${hotel.slug}`)}>Quay lại</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(1)} disabled={!form.fullName || !form.email}>
                  Tiếp tục thanh toán <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="fade-up">
              <h2 className="h-3 mb-4">Phương thức thanh toán</h2>
              <div className="row mb-4" style={{ gap: 8 }}>
                {['card','upi','paylater'].map((m) => (
                  <button key={m} className={`chip ${form.method === m ? 'is-active' : ''}`} onClick={() => upd('method', m)}>
                    {m === 'card' ? 'Thẻ' : m === 'upi' ? 'Chuyển khoản' : 'Trả tại khách sạn'}
                  </button>
                ))}
              </div>

              {form.method === 'card' && (
                <>
                  <div className="field"><label className="field-label">Số thẻ</label>
                    <input className="input text-mono" placeholder="1234 5678 9012 3456" inputMode="numeric"
                           value={form.card} onChange={(e) => upd('card', formatCardNumber(e.target.value))} /></div>
                  <div className="form-row-2" style={{ marginTop: 16 }}>
                    <div className="field"><label className="field-label">Hết hạn</label>
                      <input className="input text-mono" placeholder="MM / YY" inputMode="numeric"
                             value={form.expiry} onChange={(e) => upd('expiry', formatExpiry(e.target.value))} /></div>
                    <div className="field"><label className="field-label">CVV</label>
                      <input className="input text-mono" placeholder="•••" inputMode="numeric" type="password"
                             value={form.cvv} onChange={(e) => upd('cvv', cvvOnly(e.target.value))} /></div>
                  </div>
                  <div className="field mt-4"><label className="field-label">Tên trên thẻ</label>
                    <input className="input" placeholder="Như trên thẻ" value={form.name} onChange={(e) => upd('name', e.target.value)} /></div>
                </>
              )}

              {form.method === 'upi' && (
                <div className="field"><label className="field-label">Số tài khoản</label>
                  <input className="input" placeholder="stk@nganhang" value={form.upi || ''} onChange={(e) => upd('upi', e.target.value)} /></div>
              )}

              {form.method === 'paylater' && (
                <div className="card" style={{ padding: 20 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <Icon name="sparkle" size={18} />
                    <div>
                      <div style={{ fontWeight: 500 }}>Thanh toán khi nhận phòng.</div>
                      <p className="text-muted mt-2" style={{ fontSize: 13 }}>Thẻ của bạn được giữ để đảm bảo đặt phòng. Khách sạn sẽ tính phí khi bạn nhận phòng.</p>
                    </div>
                  </div>
                </div>
              )}

              <hr className="divider mt-6" />
              <div className="row mt-4" style={{ gap: 12 }}>
                <Icon name="shield" size={18} />
                <span className="text-muted" style={{ fontSize: 13 }}>Mã hóa khi truyền. Hủy miễn phí trong vòng 48 giờ trước khi nhận phòng.</span>
              </div>

              {createMut.isError && (
                <p style={{ color: 'var(--danger)', marginTop: 16, fontSize: 13 }}>
                  {createMut.error?.response?.data?.error || 'Đặt phòng thất bại. Vui lòng thử lại.'}
                </p>
              )}

              <div className="row mt-8" style={{ justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)}>Quay lại</button>
                <button className="btn btn-accent btn-lg" onClick={() => {
                  if (form.method === 'paylater') createMut.mutate();
                  else setTerminalOpen(true);
                }} disabled={createMut.isPending || terminalOpen}>
                  {createMut.isPending ? 'Đang xác nhận…' : `Xác nhận đặt phòng · ${total.toLocaleString('vi-VN')}₫`}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="success-dots" style={{ marginBottom: 24 }}>
                <span className="success-dot" />
                <span className="success-dot" />
                <span className="success-dot" />
              </div>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Icon name="check" size={32} />
              </div>
              <h2 className="h-1">Đặt phòng thành công!</h2>
              <p className="text-muted mt-3" style={{ maxWidth: 380, margin: '12px auto 0' }}>
                Xác nhận đang được gửi đến {form.email}. Đội ngũ {hotel.name} sẽ liên hệ với bạn trước một ngày nhận phòng.
              </p>
              <div className="card mt-6" style={{ padding: 20, textAlign: 'left', maxWidth: 400, margin: '32px auto 0' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="eyebrow">Mã đặt phòng</div>
                    <div className="text-mono mt-2" style={{ fontSize: 16 }}>PCV-{String(bookingId).padStart(6, '0')}</div>
                  </div>
                  <Icon name="arrow-up-right" size={20} />
                </div>
              </div>
              <div className="row mt-8" style={{ justifyContent: 'center', gap: 12 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/reservations/${bookingId}`)}>
                  Xem đặt phòng <Icon name="arrow-right" size={14} />
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>Về trang chủ</button>
              </div>
            </div>
          )}
        </main>

        <aside className="summary" style={{ position: 'sticky', top: 96 }}>
          <div style={{ display: 'flex', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
            <div style={{ width: 88, height: 88, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              <Photo hue={hotel.hue} src={hotel.hero_image_url} />
            </div>
            <div>
              <div className="h-3" style={{ lineHeight: 1.15 }}>{hotel.name}</div>
              <div className="text-muted mt-2" style={{ fontSize: 12 }}>{hotel.city}, {hotel.region}</div>
              {hotel.rating_avg > 0 && (
                <div className="row mt-2" style={{ gap: 4 }}>
                  <Icon name="star" size={11} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 12 }}>{Number(hotel.rating_avg).toFixed(1)} · {hotel.rating_count}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-row"><span className="text-muted">Phòng</span><span className="text-mono">{room.type}</span></div>
          <div className="summary-row"><span className="text-muted">Nhận phòng</span><span className="text-mono">{checkin}</span></div>
          <div className="summary-row"><span className="text-muted">Trả phòng</span><span className="text-mono">{checkout}</span></div>
          <div className="summary-row"><span className="text-muted">Đêm</span><span className="text-mono">{nights}</span></div>
          <div className="summary-row"><span className="text-muted">Khách</span><span className="text-mono">{guestsQ}</span></div>

          <hr className="divider mt-3 mb-3" />
          <div className="summary-row"><span className="text-muted">Tạm tính</span><span className="text-mono">{subtotal.toLocaleString('vi-VN')}₫</span></div>
          <div className="summary-row"><span className="text-muted">Thuế</span><span className="text-mono">{taxes.toLocaleString('vi-VN')}₫</span></div>
          <div className="summary-row total"><span>Tổng cộng</span><span className="text-mono">{total.toLocaleString('vi-VN')}₫</span></div>
        </aside>
      </div>

      {terminalOpen && (
        <PaymentTerminal
          method={form.method}
          onDone={() => { setTerminalOpen(false); createMut.mutate(); }}
          onCancel={() => setTerminalOpen(false)}
        />
      )}
    </div>
  );
}

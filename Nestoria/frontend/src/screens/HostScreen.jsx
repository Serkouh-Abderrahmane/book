import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import { hostAPI, profileAPI } from '../lib/api.js';
import { hostProfileSchema } from '../lib/schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useScrollRevealAll } from '../hooks/useScrollReveal.js';

function RevenueChart({ months }) {
  const data = (months || []).map((m) => m.revenue);
  if (data.length === 0) return <p className="text-muted">Chưa có dữ liệu doanh thu.</p>;
  const max = Math.max(...data, 1);
  const W = 600, H = 200, pad = 8;
  const bw = (W - pad * (data.length + 1)) / data.length;
  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" height="220" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1="0" x2={W} y1={H - H*t} y2={H - H*t} stroke="var(--line)" strokeDasharray="2 4" strokeWidth="1" />
        ))}
        {data.map((v, i) => {
          const x = pad + i * (bw + pad);
          const h = (v / max) * (H - 20);
          const y = H - h;
          const isLast = i === data.length - 1;
          return <rect key={i} x={x} y={y} width={bw} height={h} rx="3"
                       fill={isLast ? 'var(--accent)' : 'var(--ink)'} opacity={isLast ? 1 : 0.18} />;
        })}
        {(months || []).map((m, i) => (i % 3 === 0) && (
          <text key={'l'+i} x={pad + i*(bw+pad) + bw/2} y={H + 18} textAnchor="middle"
                fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-3)">{m.month.slice(5)}</text>
        ))}
      </svg>
    </div>
  );
}

function BookingsTable({ bookings }) {
  if (!bookings.length) return <p className="text-muted" style={{ padding: 20 }}>Chưa có yêu cầu thuê.</p>;
  return (
    <div className="bookings-table">
      <div className="bookings-row bookings-head">
        <div>Người thuê</div><div>Nhà · Loại</div><div>Ngày</div><div>Trạng thái</div><div style={{ textAlign: 'right' }}>Tổng</div>
      </div>
      {bookings.map((b) => (
        <div className="bookings-row" key={b.id}>
          <div className="row" style={{ gap: 10 }}>
            <span className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{(b.guest_name || '·')[0]}</span>
            <div>
              <div style={{ fontSize: 14 }}>{b.guest_name}</div>
              <div className="text-muted text-mono" style={{ fontSize: 11 }}>CVL-{String(b.id).padStart(6,'0')}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13 }}>{b.hotel_name}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{b.room_type} · {b.guests} người</div>
          </div>
          <div className="text-mono" style={{ fontSize: 12 }}>
            <div>{new Date(b.checkin_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</div>
            <div className="text-muted">→ {new Date(b.checkout_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</div>
          </div>
          <div><span className={`status-pill ${b.status === 'pending' ? 'upcoming' : 'confirmed'}`}>{b.status}</span></div>
          <div style={{ textAlign: 'right' }} className="text-mono">{Number(b.total_amount).toLocaleString('vi-VN')}₫</div>
        </div>
      ))}
    </div>
  );
}

export default function HostScreen({ tab: initialTab }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState(params.get('tab') || initialTab || 'overview');
  usePageTitle('Quản lý nhà cho thuê');

  useEffect(() => {
    const next = params.get('tab') || initialTab || 'overview';
    if (next !== tab) setTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const propertiesQ = useQuery({ queryKey: ['host','properties'], queryFn: () => hostAPI.properties().then((d) => d.properties) });
  const statsQ      = useQuery({ queryKey: ['host','stats'],      queryFn: () => hostAPI.stats() });
  const bookingsQ   = useQuery({ queryKey: ['host','bookings'],   queryFn: () => hostAPI.bookings().then((d) => d.bookings) });
  const earningsQ   = useQuery({ queryKey: ['host','earnings'],   queryFn: () => hostAPI.earnings() });
  const profileQ    = useQuery({ queryKey: ['profile'],           queryFn: () => profileAPI.get().then((d) => d.user), enabled: tab === 'profile' });

  useScrollRevealAll('.reveal');

  const anyError = propertiesQ.isError || statsQ.isError || bookingsQ.isError || earningsQ.isError;

  const stats = statsQ.data || { revenue: 0, revenue_delta: 0, bookings: 0, bookings_delta: 0, rating: 0, rating_delta: 0, occupancy: 0 };
  const properties = propertiesQ.data || [];
  const upcoming = (bookingsQ.data || []).filter((b) => b.status === 'confirmed' || b.status === 'pending').slice(0, 8);

  const KPI = [
    { label: 'Doanh thu (T)', value: `${(stats.revenue/100000).toFixed(2)}tr`, delta: stats.revenue_delta, icon: 'sparkle' },
    { label: 'Yêu cầu thuê',  value: stats.bookings,                            delta: stats.bookings_delta, icon: 'calendar' },
    { label: 'Công suất',    value: `${stats.occupancy}%`,                     delta: stats.occupancy_delta, icon: 'compass' },
    { label: 'Đánh giá TB',  value: Number(stats.rating).toFixed(2),           delta: stats.rating_delta, icon: 'star' },
  ];

  return (
    <div className="container-wide" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div className="host-dashboard-head">
        <div>
          <span className="eyebrow">— Không gian đối tác</span>
          <h1 className="h-1 mt-2">Chào buổi sáng, {user?.full_name?.split(' ')[0] || 'đối tác'}.</h1>
          <p className="text-muted mt-2">Tình hình hoạt động tháng này của bạn.</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm">
            <Icon name="calendar" size={14} /> {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(user?.onboarded === false ? '/host/profile' : '/host/add-rooms')}
            title={user?.onboarded === false ? 'Complete your profile first' : undefined}
          >
            <Icon name="plus" size={14} /> Thêm nhà cho thuê
          </button>
        </div>
      </div>

      {anyError && (
        <div className="card" style={{ padding: 16, marginBottom: 24, borderColor: '#EF4444', background: '#FEF2F2' }}>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#EF4444', fontSize: 13 }}>Không thể tải dữ liệu từ máy chủ. Một số thông tin có thể không chính xác.</span>
            <button className="btn btn-sm" style={{ background: '#EF4444', color: '#fff', border: 0, borderRadius: 8, padding: '6px 16px', cursor: 'pointer', marginLeft: 'auto' }}
                    onClick={() => { propertiesQ.refetch(); statsQ.refetch(); bookingsQ.refetch(); earningsQ.refetch(); profileQ.refetch(); }}>
              Thử lại
            </button>
          </div>
        </div>
      )}

      {user?.onboarded === false && (
        <div className="card reveal" style={{ padding: 20, marginBottom: 24, borderColor: 'color-mix(in oklab, var(--accent) 30%, var(--line))', background: 'color-mix(in oklab, var(--accent) 6%, var(--bg-elev))' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="eyebrow">— Hoàn thiện hồ sơ</span>
              <p className="h-3 mt-2">Thêm tên doanh nghiệp và số điện thoại lễ tân để bắt đầu niêm yết.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/host/profile')}>
              Mở hồ sơ <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="stats-grid-4 reveal">
        {KPI.map((k) => (
          <div className="stat-card" key={k.label}>
            <div className="stat-card-icon"><Icon name={k.icon} size={16} /></div>
            <div className="stat-card-value">{k.value}</div>
            <div className="stat-card-label">{k.label}</div>
            <div className={`stat-card-trend ${k.delta >= 0 ? 'up' : 'down'}`}>
              {k.delta >= 0 ? '↑' : '↓'} {Math.abs(k.delta)}{k.label === 'Avg rating' ? '' : '%'} so với tháng trước
            </div>
          </div>
        ))}
      </div>

      <div className="tabs-bar">
        {[['overview','Tổng quan'],['properties','Nhà cho thuê'],['bookings','Yêu cầu thuê'],['earnings','Doanh thu'],['profile','Hồ sơ']].map(([k,l]) => (
          <button key={k} className={tab === k ? 'is-active' : ''} onClick={() => { setTab(k); setParams({ tab: k }, { replace: true }); }}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 28 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <span className="eyebrow">— Doanh thu theo tháng</span>
                <div className="h-2 mt-2">{(stats.revenue/100000).toFixed(2)}tr <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 400 }}>tháng này</span></div>
              </div>
            </div>
            <RevenueChart months={earningsQ.data?.monthly} />
          </div>

          <div className="card" style={{ padding: 28 }}>
            <span className="eyebrow">— Công suất theo chỗ nghỉ</span>
            <div className="h-2 mt-2 mb-4">{stats.occupancy}% <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 400 }}>trung bình</span></div>
            <div className="stack" style={{ '--gap': '16px' }}>
              {properties.map((p) => (
                <div key={p.id}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{p.name}</span>
                    <span className="text-mono" style={{ fontSize: 13 }}>{p.occupancy}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-inset)', borderRadius: 999 }}>
                    <div style={{ width: `${p.occupancy}%`, height: '100%', background: 'var(--accent)', borderRadius: 999, transition: 'width .6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 28, gridColumn: 'span 2' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <span className="eyebrow">— Sắp đến</span>
                <div className="h-2 mt-2">{upcoming.length} người thuê tháng này</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('bookings')}>Xem tất cả <Icon name="arrow-right" size={12} /></button>
            </div>
            <BookingsTable bookings={upcoming.slice(0, 4)} />
          </div>
        </div>
      )}

      {tab === 'properties' && (
        <div className="reveal stack" style={{ '--gap': '20px' }}>
          {properties.map((p) => (
            <div key={p.id} className="card property-row">
              <div style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                <Photo hue={p.hue} src={p.hero_image_url} />
              </div>
              <div>
                <div className="row" style={{ gap: 10 }}>
                  <span className="status-pill confirmed">hoạt động</span>
                  <span className="text-muted" style={{ fontSize: 12 }}>{p.rooms_count} phòng · {p.region}</span>
                </div>
                <div className="h-3 mt-2">{p.name}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>{p.city}, {p.region}</div>
                <div className="row mt-3" style={{ gap: 24 }}>
                  <div><span className="eyebrow">Công suất</span><div className="text-mono" style={{ fontSize: 18, marginTop: 2 }}>{p.occupancy}%</div></div>
                  <div><span className="eyebrow">DT / tháng</span><div className="text-mono" style={{ fontSize: 18, marginTop: 2 }}>{(Number(p.revenue_mtd)/1000).toFixed(0)}tr</div></div>
                  <div><span className="eyebrow">Đánh giá</span><div className="text-mono" style={{ fontSize: 18, marginTop: 2 }}>{Number(p.rating_avg).toFixed(1)}</div></div>
                </div>
              </div>
              <div className="stack" style={{ '--gap': '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/host/add-rooms?hotel=${p.id}`)}>
                  <Icon name="plus" size={12} /> Thêm phòng
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/hotel/${p.slug}`)}>
                  <Icon name="arrow-up-right" size={12} /> Xem trước
                </button>
              </div>
            </div>
          ))}
          <button className="card" style={{ padding: 36, textAlign: 'center', border: '1px dashed var(--line-strong)', cursor: 'pointer' }}
                  onClick={() => navigate('/host/add-rooms')}>
            <Icon name="plus" size={20} />
            <div className="h-3 mt-3">Niêm yết nhà cho thuê mới</div>
            <p className="text-muted mt-2" style={{ fontSize: 13 }}>Hoàn tất đăng ký trong khoảng 8 phút.</p>
          </button>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="reveal">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <BookingsTable bookings={bookingsQ.data || []} />
          </div>
        </div>
      )}

      {tab === 'earnings' && (
        <div className="reveal">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <span className="eyebrow">— Doanh thu năm nay</span>
              <div className="h-1 mt-2">
                {((earningsQ.data?.monthly || []).reduce((a, m) => a + Number(m.revenue), 0) / 100000).toFixed(2)}tr
              </div>
              <p className="text-muted mt-2">{properties.length} nhà cho thuê</p>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <span className="eyebrow">— Kỳ thanh toán tới</span>
              <div className="h-1 mt-2">
                {((earningsQ.data?.monthly?.at(-1)?.revenue || 0) * 0.9 / 100000).toFixed(2)}tr
              </div>
              <p className="text-muted mt-2" style={{ fontSize: 13 }}>Dự kiến cuối tháng</p>
            </div>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <span className="eyebrow">— Giao dịch gần đây</span>
            <div className="stack mt-4" style={{ '--gap': '0px' }}>
              {(earningsQ.data?.transactions || []).map((t, i, arr) => (
                <div key={t.id} className="row" style={{ justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14 }}>CVL-{String(t.id).padStart(6, '0')}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{t.guest_name} · {t.hotel_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-mono" style={{ fontSize: 14, color: 'var(--success)' }}>+ {Number(t.total_amount).toLocaleString('vi-VN')}₫</div>
                    <span className="eyebrow mt-1">{t.status}</span>
                  </div>
                </div>
              ))}
              {(!earningsQ.data?.transactions || earningsQ.data.transactions.length === 0) && (
                <p className="text-muted">Chưa có giao dịch.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'profile' && <HostProfileTab profile={profileQ.data} onSaved={(u) => { setUser({ ...user, ...u }); qc.invalidateQueries({ queryKey: ['profile'] }); }} />}
    </div>
  );
}

function HostProfileTab({ profile, onSaved }) {
  const updateMut = useMutation({
    mutationFn: (data) => profileAPI.update(data),
    onSuccess: (d) => onSaved(d.user),
  });
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(hostProfileSchema),
    defaultValues: {
      full_name:      profile?.full_name || '',
      phone:          profile?.phone || '',
      business_name:  profile?.business_name || '',
      gst_number:     profile?.gst_number || '',
      payout_account: profile?.payout_account || '',
    },
  });
  if (!profile) return <p className="text-muted">Đang tải…</p>;
  return (
    <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
      <form className="card" style={{ padding: 24 }} onSubmit={handleSubmit((d) => updateMut.mutate(d))}>
        <h2 className="h-3 mb-2">Thông tin doanh nghiệp</h2>
        <p className="text-muted mb-6" style={{ fontSize: 13 }}>
          Các trường đánh dấu <span style={{ color: 'var(--danger)' }}>*</span> là bắt buộc trước khi niêm yết.
        </p>
        <div className="form-row-2">
          <div className="field">
            <label className="field-label">Tên pháp lý <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="input" placeholder="Tên trên hồ sơ" {...register('full_name')} />
            {errors.full_name && <small style={{ color: 'var(--danger)' }}>{errors.full_name.message}</small>}
          </div>
          <div className="field">
            <label className="field-label">Doanh nghiệp / thương hiệu <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="input" placeholder="Ví dụ: Nhà cho thuê Biển Xanh" {...register('business_name')} />
            {errors.business_name && <small style={{ color: 'var(--danger)' }}>{errors.business_name.message}</small>}
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" defaultValue={profile.email} disabled />
            <small className="text-muted" style={{ fontSize: 11 }}>Email liên kết với tài khoản và không thể thay đổi ở đây.</small>
          </div>
          <div className="field">
            <label className="field-label">Số điện thoại lễ tân <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="input" placeholder="+84 …" {...register('phone')} />
            {errors.phone && <small style={{ color: 'var(--danger)' }}>{errors.phone.message}</small>}
          </div>
          <div className="field">
            <label className="field-label">Mã số thuế</label>
            <input className="input" placeholder="MST" {...register('gst_number')} />
            {errors.gst_number && <small style={{ color: 'var(--danger)' }}>{errors.gst_number.message}</small>}
          </div>
          <div className="field">
            <label className="field-label">Tài khoản thanh toán</label>
            <input className="input" placeholder="Số tài khoản ngân hàng" {...register('payout_account')} />
            {errors.payout_account && <small style={{ color: 'var(--danger)' }}>{errors.payout_account.message}</small>}
          </div>
        </div>
        {updateMut.isError && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 16 }}>
            {updateMut.error?.response?.data?.error || 'Không thể lưu. Vui lòng thử lại.'}
          </p>
        )}
        {updateMut.isSuccess && <p className="text-muted mt-4" style={{ fontSize: 12 }}>Đã lưu.</p>}
        <div className="row mt-8" style={{ justifyContent: 'flex-end', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

      <aside className="stack" style={{ '--gap': '16px' }}>
        <div className="card" style={{ padding: 24 }}>
          <span className="eyebrow">— Trạng thái đối tác</span>
          <div className="h-2 mt-2">{profile.kyc_verified ? 'Đã xác thực' : 'Chờ xác thực'}</div>
          <p className="text-muted mt-2" style={{ fontSize: 13 }}>Thành viên từ {new Date(profile.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}.</p>
        </div>
        {profile.superhost && (
          <div className="card" style={{ padding: 24, background: 'var(--bg-inset)' }}>
            <span className="eyebrow">— Hạng mục</span>
            <div className="h-2 mt-2">Đối tác cao cấp</div>
            <p className="text-muted mt-2" style={{ fontSize: 12 }}>Duy trì đánh giá 4.8+ và tỷ lệ phản hồi 95% để duy trì hạng mục.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

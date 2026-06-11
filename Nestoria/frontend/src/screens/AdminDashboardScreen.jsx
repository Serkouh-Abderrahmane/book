import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const KPI_CONFIG = [
  { key: 'hotels',       label: 'Nhà cho thuê',    icon: 'map',       color: 'var(--primary)' },
  { key: 'rooms',        label: 'Phòng',            icon: 'bed',       color: 'var(--accent)' },
  { key: 'bookings',     label: 'Đặt phòng',        icon: 'calendar',  color: 'var(--success)' },
  { key: 'activeBookings', label: 'Đang hoạt động', icon: 'shield',   color: 'var(--primary)' },
  { key: 'viewings',     label: 'Xem phòng',        icon: 'eye',       color: 'var(--warn)' },
  { key: 'pendingViewings', label: 'Chờ xác nhận',  icon: 'x',        color: 'var(--danger)' },
  { key: 'customers',    label: 'Khách hàng',       icon: 'users',     color: 'var(--ink)' },
  { key: 'hosts',        label: 'Đối tác',          icon: 'user',      color: 'var(--primary-soft)' },
];

export default function AdminDashboardScreen() {
  const navigate = useNavigate();
  usePageTitle('Admin — Tổng quan');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminAPI.dashboard(),
  });

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Admin</span>
          <h1 className="h-1 mt-2">Tổng quan hệ thống</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/home')}>
          <Icon name="home" size={14} /> Về trang chủ
        </button>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}
      {isError && <p className="text-muted" style={{ color: 'var(--danger)' }}>Không thể tải dữ liệu.</p>}

      {data && (
        <>
          <div className="stats-grid-4">
            {KPI_CONFIG.map((k) => {
              const val = data[k.key] ?? 0;
              return (
                <div className="stat-card" key={k.key}>
                  <div className="stat-card-icon" style={{ background: k.color.replace(')', ' / 0.12)'), color: k.color }}>
                    <Icon name={k.icon} size={16} />
                  </div>
                  <div className="stat-card-value">{val}</div>
                  <div className="stat-card-label">{k.label}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <span className="eyebrow">— Doanh thu</span>
              <div className="h-2 mt-2">{Number(data.totalRevenue || 0).toLocaleString('vi-VN')}₫</div>
              <p className="text-muted mt-2" style={{ fontSize: 13 }}>Tổng doanh thu từ tất cả đặt phòng</p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <span className="eyebrow">— Đánh giá trung bình</span>
              <div className="h-2 mt-2">{data.avgRating || '—'}</div>
              <p className="text-muted mt-2" style={{ fontSize: 13 }}>Dựa trên {data.reviews || 0} đánh giá</p>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginTop: 20 }}>
            <span className="eyebrow">— Điều hướng nhanh</span>
            <div className="row mt-4" style={{ gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/hotels')}>
                <Icon name="map" size={14} /> Quản lý nhà cho thuê
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/viewings')}>
                <Icon name="eye" size={14} /> Lịch xem phòng
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/bookings')}>
                <Icon name="calendar" size={14} /> Đặt phòng
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/settings')}>
                <Icon name="sliders" size={14} /> Cài đặt
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

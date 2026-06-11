import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { hostAPI, hotelsAPI, bookingsAPI } from '../lib/api.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function formatVND(vnd) {
  return Number(vnd || 0).toLocaleString('vi-VN');
}

export default function HostDashboardScreen() {
  const navigate = useNavigate();
  usePageTitle('Host — Dashboard');

  const propertiesQ = useQuery({
    queryKey: ['host', 'properties'],
    queryFn: () => hostAPI.properties(),
  });

  const bookingsQ = useQuery({
    queryKey: ['host', 'bookings'],
    queryFn: () => hostAPI.bookings(),
  });

  const properties = propertiesQ.data?.properties || [];
  const bookings = bookingsQ.data?.bookings || [];

  const totalRooms = properties.reduce((sum, p) => sum + (p.rooms_count || 0), 0);
  const occupancy = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.occupancy || 0), 0) / properties.length)
    : 0;
  const avgRating = properties.length > 0
    ? (properties.reduce((sum, p) => sum + (p.rating_avg || 0), 0) / properties.length).toFixed(1)
    : 'N/A';

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <span className="eyebrow">— Host Dashboard</span>
          <h1 className="h-1 mt-2">Tổng quan</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="row mb-6" style={{ gap: 16, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Nhà cho thuê</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{properties.length}</div>
        </div>
        <div className="card" style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Phòng</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{totalRooms}</div>
        </div>
        <div className="card" style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Lấp đầy</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{occupancy}%</div>
        </div>
        <div className="card" style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Đánh giá</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{avgRating}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Hành động nhanh</h2>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/host/create-room')}
          >
            <Icon name="plus" size={16} />
            Tạo phòng mới
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/host/rooms')}
          >
            <Icon name="bed" size={16} />
            Xem tất cả phòng
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/host/bookings')}
          >
            <Icon name="calendar" size={16} />
            Xem đặt phòng ({bookings.length})
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/host/profile')}
          >
            <Icon name="user" size={16} />
            Hồ sơ
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Đặt phòng gần đây</h2>
          <div className="bookings-row bookings-head">
            <div>Khách</div>
            <div>Phòng</div>
            <div>Ngày</div>
            <div>Trạng thái</div>
          </div>
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} className="bookings-row">
              <div>
                <div style={{ fontSize: 14 }}>{b.customer_name || 'Khách'}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{b.customer_phone || ''}</div>
              </div>
              <div style={{ fontSize: 13 }}>{b.room_name || b.room_type}</div>
              <div style={{ fontSize: 13 }}>
                {new Date(b.checkin_date).toLocaleDateString('vi-VN')} → {new Date(b.checkout_date).toLocaleDateString('vi-VN')}
              </div>
              <div>
                <span
                  className={`status-pill ${
                    b.status === 'confirmed'
                      ? 'confirmed'
                      : b.status === 'pending'
                      ? 'upcoming'
                      : 'cancelled'
                  }`}
                >
                  {b.status === 'confirmed'
                    ? 'Xác nhận'
                    : b.status === 'pending'
                    ? 'Chờ xử lý'
                    : 'Hủy'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {propertiesQ.isLoading && <div style={{ textAlign: 'center', padding: 40 }}>Đang tải…</div>}
      {propertiesQ.isError && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>
          Lỗi khi tải dữ liệu
        </div>
      )}
    </div>
  );
}

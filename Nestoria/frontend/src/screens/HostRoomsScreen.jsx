import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { hostAPI } from '../lib/api.js';
import { usePageTitle } from '../hooks/usePageTitle.js';



function formatPrice(vnd) {
  return Number(vnd || 0).toLocaleString('vi-VN');
}

export default function HostRoomsScreen() {
  const navigate = useNavigate();
  usePageTitle('Host — Phòng');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['host', 'rooms'],
    queryFn: () => hostAPI.rooms(),
  });

  const rooms = data?.rooms || [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Host / Phòng</span>
          <h1 className="h-1 mt-2">Tất cả phòng</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/host/create-room')}>
          <Icon name="plus" size={14} />
          Tạo phòng
        </button>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}
      {isError && (
        <div className="card" style={{ padding: 24, color: '#dc2626' }}>
          Lỗi khi tải phòng
        </div>
      )}

      {!isLoading && rooms.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chưa có phòng</div>
          <p className="text-muted">Bắt đầu bằng cách tạo phòng đầu tiên.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate('/host/create-room')}
          >
            Tạo phòng mới
          </button>
        </div>
      )}

      {!isLoading && rooms.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="bookings-row bookings-head">
            <div>Phòng</div>
            <div>Loại</div>
            <div>Giá</div>
            <div>Trạng thái</div>
            <div style={{ textAlign: 'right' }}>Hành động</div>
          </div>
          {rooms.map((r) => (
            <div key={r.id} className="bookings-row">
              <div>
                <div style={{ fontSize: 14 }}>{r.name || r.type}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  {r.hotel_name}
                </div>
              </div>
              <div style={{ fontSize: 12 }}>
                {r.property_type || '—'}
              </div>
              <div className="text-mono" style={{ fontSize: 13 }}>
                {formatPrice(r.price_per_night)}₫/tháng
              </div>
              <div>
                <span
                  className={`status-pill ${r.status === 'available' ? 'confirmed' : r.status === 'unavailable' ? 'cancelled' : 'upcoming'}`}
                >
                  {r.status === 'available'
                    ? 'Còn trống'
                    : r.status === 'unavailable'
                    ? 'Đã thuê'
                    : 'Bảo trì'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/hotel/${r.hotel_slug}?room=${r.id}`)}
                  title="Xem chi tiết"
                >
                  <Icon name="eye" size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/host/edit-room/${r.id}`)}
                  title="Chỉnh sửa"
                >
                  <Icon name="edit" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

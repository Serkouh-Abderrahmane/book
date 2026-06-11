import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành',
};

export default function AdminBookingsScreen() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  usePageTitle('Admin — Đặt phòng');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', filterStatus],
    queryFn: () => adminAPI.bookings({ status: filterStatus || undefined }),
  });

  const bookings = data?.bookings || [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Admin / Đặt phòng</span>
          <h1 className="h-1 mt-2">Tất cả đặt phòng</h1>
        </div>
      </div>

      <div className="row mb-6" style={{ gap: 8, flexWrap: 'wrap' }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button key={s} className={`chip ${filterStatus === s ? 'is-active' : ''}`}
            onClick={() => setFilterStatus(s)}>
            {s ? STATUS_LABELS[s] : 'Tất cả'} ({s ? bookings.filter(b => b.status === s).length : data?.total || 0})
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="bookings-row bookings-head">
          <div>Khách</div><div>Nhà · Phòng</div><div>Ngày</div><div>Trạng thái</div><div style={{ textAlign: 'right' }}>Tổng</div>
        </div>
        {bookings.map((b) => (
          <div key={b.id} className="bookings-row">
            <div>
              <div style={{ fontSize: 14 }}>{b.guest_name}</div>
              <div className="text-muted text-mono" style={{ fontSize: 11 }}>CVL-{String(b.id).padStart(6, '0')}</div>
            </div>
            <div>
              <div style={{ fontSize: 13 }}>{b.hotel_name}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{b.room_type || b.room_name}</div>
            </div>
            <div className="text-mono" style={{ fontSize: 12 }}>
              <div>{new Date(b.checkin_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</div>
              <div className="text-muted">→ {new Date(b.checkout_date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</div>
            </div>
            <div>
              <span className={`status-pill ${b.status === 'confirmed' ? 'confirmed' : b.status === 'pending' ? 'upcoming' : b.status === 'cancelled' ? 'cancelled' : 'completed'}`}>
                {STATUS_LABELS[b.status] || b.status}
              </span>
            </div>
            <div style={{ textAlign: 'right' }} className="text-mono">{Number(b.total_amount).toLocaleString('vi-VN')}₫</div>
          </div>
        ))}
        {!isLoading && bookings.length === 0 && (
          <p className="text-muted" style={{ padding: 20, textAlign: 'center' }}>Không có đặt phòng nào.</p>
        )}
      </div>
    </div>
  );
}

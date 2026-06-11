import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../components/Icon.jsx';
import { hostAPI } from '../lib/api.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function formatPrice(vnd) {
  return Number(vnd || 0).toLocaleString('vi-VN');
}

export default function HostBookingsScreen() {
  const [filterStatus, setFilterStatus] = useState('');
  usePageTitle('Host — Đặt phòng');

  const { data, isLoading } = useQuery({
    queryKey: ['host', 'bookings'],
    queryFn: () => hostAPI.bookings(),
  });

  const bookings = data?.bookings || [];

  const filtered = useMemo(() => {
    if (!filterStatus) return bookings;
    return bookings.filter((b) => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Xác nhận' },
    { value: 'cancelled', label: 'Hủy' },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">— Host / Đặt phòng</span>
        <h1 className="h-1 mt-2">Đặt phòng</h1>
      </div>

      <div className="row mb-6" style={{ gap: 8, flexWrap: 'wrap' }}>
        <select
          className="input"
          style={{ maxWidth: 160 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-muted" style={{ fontSize: 13 }}>
          {filtered.length} đặt phòng
        </span>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      {!isLoading && filtered.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Không có đặt phòng</div>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="bookings-row bookings-head">
            <div>Khách</div>
            <div>Phòng</div>
            <div>Ngày</div>
            <div>Giá</div>
            <div>Trạng thái</div>
          </div>
          {filtered.map((b) => (
            <div key={b.id} className="bookings-row">
              <div>
                <div style={{ fontSize: 14 }}>{b.customer_name || 'Khách'}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  {b.customer_phone || ''}
                </div>
              </div>
              <div style={{ fontSize: 13 }}>{b.room_name || b.room_type}</div>
              <div style={{ fontSize: 13 }}>
                {new Date(b.checkin_date).toLocaleDateString('vi-VN')} →{' '}
                {new Date(b.checkout_date).toLocaleDateString('vi-VN')}
              </div>
              <div className="text-mono" style={{ fontSize: 13 }}>
                {formatPrice(b.amount)}₫
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
    </div>
  );
}

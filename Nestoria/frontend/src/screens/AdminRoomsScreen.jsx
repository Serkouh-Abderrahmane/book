import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';



export default function AdminRoomsScreen() {
  const navigate = useNavigate();
  const [filterLoai, setFilterLoai] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  usePageTitle('Admin — Phòng');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'rooms', filterLoai, filterStatus],
    queryFn: () => adminAPI.rooms({
      loai_phong_chinh: filterLoai || undefined,
      status: filterStatus || undefined,
    }),
  });

  const rooms = data?.rooms || [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Admin / Phòng</span>
          <h1 className="h-1 mt-2">Tất cả phòng</h1>
        </div>
      </div>

      <div className="row mb-6" style={{ gap: 8, flexWrap: 'wrap' }}>
        <select className="input" style={{ maxWidth: 160 }} value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option value="CAN_HO">Căn hộ</option>
          <option value="PHONG_TRO">Phòng trọ</option>
        </select>
        <select className="input" style={{ maxWidth: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="available">Còn trống</option>
          <option value="booked">Đã đặt</option>
          <option value="maintenance">Bảo trì</option>
        </select>
        <span className="text-muted" style={{ fontSize: 13 }}>{data?.total || 0} phòng</span>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="bookings-row bookings-head">
          <div>Phòng</div><div>Nhà cho thuê</div><div>Loại</div><div>Giá</div><div>Trạng thái</div>
        </div>
        {rooms.map((r) => (
          <div key={r.id} className="bookings-row" style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/hotel/${r.hotel_slug}`)}>
            <div>
              <div style={{ fontSize: 14 }}>{r.name || r.type}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>ID: {r.id}</div>
            </div>
            <div style={{ fontSize: 13 }}>{r.hotel_name}</div>
            <div style={{ fontSize: 12 }}>
              {r.property_type || '—'}
            </div>
            <div className="text-mono" style={{ fontSize: 13 }}>{Number(r.price_per_night).toLocaleString('vi-VN')}₫</div>
            <div>
              <span className={`status-pill ${r.status === 'available' ? 'confirmed' : r.status === 'booked' ? 'upcoming' : 'cancelled'}`}>
                {r.status === 'available' ? 'Còn trống' : r.status === 'booked' ? 'Đã đặt' : r.status}
              </span>
            </div>
          </div>
        ))}
        {!isLoading && rooms.length === 0 && (
          <p className="text-muted" style={{ padding: 20, textAlign: 'center' }}>Không có phòng nào.</p>
        )}
      </div>
    </div>
  );
}

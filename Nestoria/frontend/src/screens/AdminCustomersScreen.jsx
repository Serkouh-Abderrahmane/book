import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AdminCustomersScreen() {
  usePageTitle('Admin — Khách hàng');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.users(),
  });

  const users = data?.users || [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Admin / Khách hàng</span>
          <h1 className="h-1 mt-2">Người dùng</h1>
        </div>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="bookings-row bookings-head">
          <div>Họ tên</div><div>Email</div><div>Vai trò</div><div>Ngày tham gia</div>
        </div>
        {users.map((u) => (
          <div key={`${u.type}-${u.id}`} className="bookings-row">
            <div className="row" style={{ gap: 10 }}>
              <span className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{(u.full_name || '?')[0]}</span>
              <div>
                <div style={{ fontSize: 14 }}>{u.full_name || 'N/A'}</div>
                {u.business_name && <div className="text-muted" style={{ fontSize: 11 }}>{u.business_name}</div>}
              </div>
            </div>
            <div className="text-muted" style={{ fontSize: 13 }}>{u.email}</div>
            <div>
              <span className={`status-pill ${u.type === 'host' ? 'confirmed' : 'upcoming'}`}>
                {u.type === 'host' ? 'Đối tác' : 'Khách hàng'}
              </span>
            </div>
            <div className="text-muted text-mono" style={{ fontSize: 12 }}>
              {new Date(u.created_at).toLocaleDateString('vi-VN')}
            </div>
          </div>
        ))}
        {!isLoading && users.length === 0 && (
          <p className="text-muted" style={{ padding: 20, textAlign: 'center' }}>Không có người dùng.</p>
        )}
      </div>
    </div>
  );
}

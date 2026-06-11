import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AdminReviewsScreen() {
  usePageTitle('Admin — Đánh giá');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminAPI.reviews(),
  });

  const reviews = data?.reviews || [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Admin / Đánh giá</span>
          <h1 className="h-1 mt-2">Đánh giá của khách</h1>
        </div>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      <div className="stack" style={{ '--gap': '8px' }}>
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 20 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{(r.customer_name || '?')[0]}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.customer_name}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{r.hotel_name}</div>
                </div>
              </div>
              <div className="row" style={{ gap: 4 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={12} style={{ color: i < r.rating ? 'var(--accent)' : 'var(--line)' }} />
                ))}
              </div>
            </div>
            {r.comment && <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.comment}</p>}
            <div className="text-muted text-mono mt-3" style={{ fontSize: 11 }}>
              {new Date(r.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}
        {!isLoading && reviews.length === 0 && (
          <p className="text-muted" style={{ padding: 20, textAlign: 'center' }}>Chưa có đánh giá nào.</p>
        )}
      </div>
    </div>
  );
}

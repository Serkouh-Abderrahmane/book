import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAPI, hotelsAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import Photo from '../components/Photo.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AdminHotelsScreen() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  usePageTitle('Admin — Nhà cho thuê');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'hotels', search],
    queryFn: () => adminAPI.hotels({ search: search || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => hotelsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'hotels'] }),
  });

  const hotels = data?.hotels || [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <span className="eyebrow">— Admin / Nhà cho thuê</span>
          <h1 className="h-1 mt-2">Tất cả nhà cho thuê</h1>
        </div>
      </div>

      <div className="row mb-6" style={{ gap: 8 }}>
        <input
          className="input"
          placeholder="Tìm kiếm theo tên, thành phố..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <span className="text-muted" style={{ fontSize: 13 }}>{data?.total || 0} nhà</span>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      <div className="stack" style={{ '--gap': '8px' }}>
        {hotels.map((h) => (
          <div key={h.id} className="card property-row">
            <div style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
              <Photo hue={h.hue} src={h.hero_image_url} />
            </div>
            <div>
              <div className="h-3">{h.name}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>{h.city}, {h.region}</div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                {h.host_name || h.host_business} · ⭐ {Number(h.rating_avg).toFixed(1)} ({h.rating_count})
              </div>
            </div>
            <div className="stack" style={{ '--gap': '6px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/hotel/${h.slug}`)}>
                <Icon name="eye" size={12} /> Xem
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                onClick={() => { if (window.confirm(`Xóa "${h.name}"?`)) deleteMut.mutate(h.id); }}>
                <Icon name="trash" size={12} /> Xóa
              </button>
            </div>
          </div>
        ))}
        {!isLoading && hotels.length === 0 && (
          <p className="text-muted" style={{ padding: 20, textAlign: 'center' }}>Không có nhà cho thuê nào.</p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { viewingsAPI } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const STATUS_COLORS = {
  pending:     { bg: '#fef3c7', text: '#92400e' },
  confirmed:   { bg: '#d1fae5', text: '#065f46' },
  rescheduled: { bg: '#dbeafe', text: '#1e40af' },
  completed:   { bg: '#e0e7ff', text: '#3730a3' },
  cancelled:   { bg: '#fee2e2', text: '#991b1b' },
};

const STATUS_LABELS = {
  pending:     'Chờ xác nhận',
  confirmed:   'Đã xác nhận',
  rescheduled: 'Đã dời lịch',
  completed:   'Đã hoàn thành',
  cancelled:   'Đã hủy',
};

export default function ViewingsScreen({ backPath }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');

  usePageTitle('Lịch xem phòng');

  const { data, isLoading } = useQuery({
    queryKey: ['viewings', statusFilter],
    queryFn: () => viewingsAPI.list(statusFilter ? { status: statusFilter } : {}).then((d) => d.viewings),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, body }) => viewingsAPI.updateStatus(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['viewings'] });
      setConfirmAction(null);
      setSelectedViewing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => viewingsAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['viewings'] });
      setSelectedViewing(null);
    },
  });

  const confirmAndUpdate = () => {
    if (!confirmAction) return;
    updateStatusMut.mutate({
      id: confirmAction.id,
      body: {
        status: confirmAction.toStatus,
        ...(user?.role === 'admin' && internalNotes ? { internal_notes: internalNotes } : {}),
      },
    });
  };

  const viewings = data || [];

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 1000 }}>
      <button onClick={() => navigate(backPath || '/host/dashboard')} className="text-muted mb-4" style={{ fontSize: 13 }}>← Về bảng điều khiển</button>
      <div className="eyebrow mb-3">— Quản lý</div>
      <h1 className="h-1 mb-6">Lịch xem phòng</h1>

      <div className="row mb-6" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`chip ${!statusFilter ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          Tất cả ({viewings.length})
        </button>
        {['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'].map((s) => {
          const count = viewings.filter((v) => v.status === s).length;
          return (
            <button
              key={s}
              className={`chip ${statusFilter === s ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <p className="text-muted">Đang tải…</p>
      ) : viewings.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Icon name="calendar" size={24} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p className="text-muted">Chưa có lịch xem phòng nào.</p>
        </div>
      ) : (
        <div className="stack" style={{ '--gap': '8px' }}>
          {viewings.map((v) => (
            <div
              key={v.id}
              className="card"
              style={{
                padding: 16,
                cursor: 'pointer',
                background: selectedViewing?.id === v.id ? 'var(--accent-soft)' : 'var(--bg-inset)',
                border: selectedViewing?.id === v.id ? '1px solid var(--accent)' : '1px solid var(--line)',
              }}
              onClick={() => setSelectedViewing(selectedViewing?.id === v.id ? null : v)}
            >
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{v.customer_name}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: STATUS_COLORS[v.status]?.bg || '#eee',
                      color: STATUS_COLORS[v.status]?.text || '#333',
                    }}>
                      {STATUS_LABELS[v.status] || v.status}
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    <span>{v.customer_phone}</span>
                    {v.customer_email && <span> · {v.customer_email}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13 }}>
                  <div className="text-mono">{v.preferred_date}</div>
                  <div className="text-muted">{v.preferred_time}</div>
                </div>
              </div>

              {selectedViewing?.id === v.id && (
                <div className="fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
                    <div><span className="text-muted">Căn nhà / Căn hộ:</span> {v.room_name || v.room_type || 'Tất cả'}</div>
                    {v.note && <div style={{ gridColumn: '1 / -1' }}><span className="text-muted">Ghi chú:</span> {v.note}</div>}
                    {v.internal_notes && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span className="text-muted">Ghi chú nội bộ:</span> {v.internal_notes}
                      </div>
                    )}
                  </div>

                  {/* Action buttons for pending */}
                  {v.status === 'pending' && (
                    <div className="row mt-4" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: v.id, toStatus: 'confirmed' }); }}>
                        <Icon name="check" size={12} /> Xác nhận
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: v.id, toStatus: 'cancelled' }); }}>
                        <Icon name="x" size={12} /> Từ chối
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: v.id, toStatus: 'rescheduled' }); }}>
                        <Icon name="calendar" size={12} /> Dời lịch
                      </button>
                    </div>
                  )}

                  {/* Action buttons for confirmed */}
                  {v.status === 'confirmed' && (
                    <div className="row mt-4" style={{ gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: v.id, toStatus: 'completed' }); }}>
                        <Icon name="check" size={12} /> Hoàn thành
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmAction({ id: v.id, toStatus: 'cancelled' }); }}>
                        <Icon name="x" size={12} /> Hủy
                      </button>
                    </div>
                  )}

                  {/* Internal notes (admin only) */}
                  {user?.role === 'admin' && (
                    <div className="mt-3">
                      <label className="field-label" style={{ fontSize: 12 }}>Ghi chú nội bộ</label>
                      <div className="row" style={{ gap: 8 }}>
                        <input
                          className="input"
                          defaultValue={v.internal_notes || ''}
                          placeholder="Thêm ghi chú..."
                          style={{ fontSize: 12 }}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setInternalNotes(e.target.value)}
                        />
                        <button className="btn btn-ghost btn-sm" onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMut.mutate({ id: v.id, body: { status: v.status, internal_notes: internalNotes } });
                        }}>
                          Lưu
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete (admin only) */}
                  {user?.role === 'admin' && (
                    <div className="mt-3" style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: 12 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Xóa lịch xem phòng này?')) deleteMut.mutate(v.id);
                        }}>
                        <Icon name="trash" size={12} /> Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="vi-sheet-overlay" onClick={() => setConfirmAction(null)}>
          <div className="vi-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, margin: '60px auto', borderRadius: 12 }}>
            <div className="vi-sheet-header">
              <h3>Xác nhận thao tác</h3>
              <button className="vi-sheet-close" onClick={() => setConfirmAction(null)}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ marginBottom: 16, fontSize: 14 }}>
                Thay đổi trạng thái lịch xem phòng này thành <strong>{STATUS_LABELS[confirmAction.toStatus]}</strong>?
              </p>
              {user?.role === 'admin' && (
                <div className="field mb-3">
                  <label className="field-label">Ghi chú nội bộ</label>
                  <textarea className="input" rows={3} value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)} placeholder="Lý do thay đổi..." />
                </div>
              )}
              <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmAction(null)}>Hủy</button>
                <button className="btn btn-primary btn-sm" onClick={confirmAndUpdate} disabled={updateStatusMut.isPending}>
                  {updateStatusMut.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

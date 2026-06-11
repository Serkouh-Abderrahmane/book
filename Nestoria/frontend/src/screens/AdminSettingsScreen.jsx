import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AdminSettingsScreen() {
  const qc = useQueryClient();
  usePageTitle('Admin — Cài đặt');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminAPI.getSettings(),
  });

  const updateMut = useMutation({
    mutationFn: (body) => adminAPI.updateSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });

  const settings = data?.settings || {};

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    updateMut.mutate({
      site_name: fd.get('site_name'),
      contact_email: fd.get('contact_email'),
      commission_rate: Number(fd.get('commission_rate')),
    });
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 720 }}>
      <div className="mb-6">
        <span className="eyebrow">— Admin</span>
        <h1 className="h-1 mt-2">Cài đặt hệ thống</h1>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      <form className="card" style={{ padding: 28 }} onSubmit={handleSave}>
        <h2 className="h-3 mb-2">Thông tin chung</h2>
        <p className="text-muted mb-6" style={{ fontSize: 13 }}>Quản lý thông tin cơ bản của nền tảng.</p>

        <div className="form-row-2">
          <div className="field">
            <label className="field-label">Tên trang web</label>
            <input className="input" name="site_name" defaultValue={settings.site_name || ''} />
          </div>
          <div className="field">
            <label className="field-label">Email liên hệ</label>
            <input className="input" name="contact_email" defaultValue={settings.contact_email || ''} />
          </div>
          <div className="field">
            <label className="field-label">Phí hoa hồng (%)</label>
            <input className="input" name="commission_rate" type="number" step="0.1" defaultValue={settings.commission_rate || 10} />
          </div>
        </div>

        {updateMut.isError && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 16 }}>
            {updateMut.error?.response?.data?.error || 'Không thể lưu.'}
          </p>
        )}
        {updateMut.isSuccess && <p className="text-muted mt-4" style={{ fontSize: 12 }}>Đã lưu.</p>}

        <div className="row mt-8" style={{ justifyContent: 'flex-end', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

      <div className="card" style={{ padding: 28, marginTop: 20 }}>
        <h2 className="h-3 mb-2">Ghi chú</h2>
        <p className="text-muted" style={{ fontSize: 13 }}>
          Các tính năng quản lý người dùng, phân quyền và cấu hình nâng cao sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </div>
    </div>
  );
}

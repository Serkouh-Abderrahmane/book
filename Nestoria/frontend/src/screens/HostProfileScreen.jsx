import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Icon from '../components/Icon.jsx';
import { profileAPI } from '../lib/api.js';
import { profileSchema } from '../lib/schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function HostProfileScreen() {
  const qc = useQueryClient();
  const { user, setUser } = useAuth();
  usePageTitle('Host — Hồ sơ');

  const profileQ = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.get().then((d) => d.user),
  });

  const updateMut = useMutation({
    mutationFn: (data) => profileAPI.update(data),
    onSuccess: (d) => {
      setUser({ ...user, ...d.user });
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name,
      phone: user?.phone || '',
      dob: '',
      gender: '',
    },
  });

  const me = profileQ.data || user || { full_name: '—', email: '—' };
  const isLoading = profileQ.isLoading;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">— Host / Hồ sơ</span>
        <h1 className="h-1 mt-2">Hồ sơ cá nhân</h1>
      </div>

      {isLoading && <p className="text-muted">Đang tải…</p>}

      {!isLoading && (
        <div className="card" style={{ maxWidth: 600 }}>
          <form onSubmit={handleSubmit((data) => updateMut.mutate(data))}>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Tên đầy đủ</label>
              <input
                type="text"
                className="input"
                {...register('full_name')}
                disabled={updateMut.isPending}
              />
              {errors.full_name && <span className="form-error">{errors.full_name.message}</span>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="input"
                {...register('phone')}
                disabled={updateMut.isPending}
              />
              {errors.phone && <span className="form-error">{errors.phone.message}</span>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Email</label>
              <div className="input" style={{ backgroundColor: 'var(--bg-2)', cursor: 'not-allowed' }}>
                {me.email}
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                Không thể thay đổi email
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMut.isPending || profileQ.isLoading}
              style={{ width: '100%' }}
            >
              {updateMut.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>

            {updateMut.isError && (
              <p className="form-error" style={{ marginTop: 12 }}>
                Lỗi: {updateMut.error?.message || 'Không thể cập nhật hồ sơ'}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

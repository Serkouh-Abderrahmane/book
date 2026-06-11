import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';

import Icon from '../components/Icon.jsx';
import Photo from '../components/Photo.jsx';
import { authAPI } from '../lib/api.js';
import { loginSchema, signupSchema } from '../lib/schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const DEMO_ACCOUNTS = {
  customer: { email: 'demo@example.com', password: 'Demo1234', label: 'Người thuê' },
  host:     { email: 'host@example.com', password: 'Host1234', label: 'Chủ nhà' },
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login: setSession } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(params.get('role') === 'host' ? 'host' : 'customer');
  const [err,  setErr]  = useState(null);
  usePageTitle('Đăng nhập');

  const schema = mode === 'login' ? loginSchema : signupSchema;
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSuccess = (data) => {
    setSession(data.token, { ...data.user, role });
    const next = params.get('next');
    navigate(next || (role === 'host' ? '/host/dashboard' : '/'), { replace: true });
  };

  const loginMut  = useMutation({
    mutationFn: (body) => authAPI.login(body),
    onSuccess,
    onError: (e) => {
      const raw = e.response?.data?.error || 'Máy chủ không phản hồi. Vui lòng thử lại sau.';
      setErr(raw);
    },
  });
  const signupMut = useMutation({ mutationFn: (body) => authAPI.register(body), onSuccess, onError: (e) => setErr(e.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.') });
  const googleMut = useMutation({ mutationFn: (body) => authAPI.google(body),   onSuccess, onError: (e) => setErr(e.response?.data?.error || 'Đăng nhập Google thất bại.') });

  const onSubmit = (values) => {
    setErr(null);
    if (mode === 'login') loginMut.mutate({ role, ...values });
    else signupMut.mutate({ role, ...values });
  };

  const fillDemo = () => {
    const demo = DEMO_ACCOUNTS[role];
    setRole(role);
    setValue('email', demo.email, { shouldValidate: true });
    setValue('password', demo.password, { shouldValidate: true });
    setErr(null);
  };

  const pending = loginMut.isPending || signupMut.isPending || googleMut.isPending;

  return (
    <div className="auth">
      <div className="auth-side">
         <Photo hue="dusk" src="/images/chi-vinh-house-hero.svg" alt="" />
         <div className="auth-quote">
           <span className="eyebrow" style={{ color: 'white', opacity: 0.85 }}>— Chi Vinh Land</span>
           <h2 className="h-2 mt-4" style={{ color: 'white' }}>Nhà thuê & căn hộ chất lượng TP. Hồ Chí Minh.</h2>
         </div>
       </div>

      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <span className="eyebrow">— {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</span>
          <h1 className="h-2 mt-2 mb-6">{mode === 'login' ? 'Đăng nhập vào Chi Vinh Land.' : 'Tạo tài khoản người thuê hoặc chủ nhà.'}</h1>

          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${mode==='login' ? 'is-active' : ''}`}  onClick={() => { setMode('login');  setErr(null); }}>Đăng nhập</button>
            <button type="button" className={`auth-tab ${mode==='signup' ? 'is-active' : ''}`} onClick={() => { setMode('signup'); setErr(null); }}>Tạo tài khoản</button>
          </div>

          <div className="role-toggle">
<button type="button" className={role==='customer' ? 'is-active' : ''} onClick={() => { setRole('customer'); setErr(null); }}>Tôi thuê nhà</button>
          <button type="button" className={role==='host' ? 'is-active' : ''} onClick={() => { setRole('host'); setErr(null); }}>Tôi cho thuê</button>
          </div>

          {mode === 'signup' && (
            <div className="field mb-3">
              <label className="field-label">Tên</label>
              <input className="input" placeholder="Họ và tên" {...register('full_name')} />
              {errors.full_name && <small style={{ color: 'var(--danger)' }}>{errors.full_name.message}</small>}
            </div>
          )}

          <div className="field mb-3">
            <label className="field-label">Email</label>
            <input className="input" type="email" placeholder="email@example.com" {...register('email')} />
            {errors.email && <small style={{ color: 'var(--danger)' }}>{errors.email.message}</small>}
          </div>

          {mode === 'signup' && (
            <div className="field mb-3">
              <label className="field-label">Số điện thoại (không bắt buộc)</label>
              <input className="input" placeholder="+84 …" {...register('phone')} />
            </div>
          )}

          <div className="field mb-4">
            <label className="field-label">Mật khẩu</label>
            <input className="input" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <small style={{ color: 'var(--danger)' }}>{errors.password.message}</small>}
          </div>

          {err && (
            <div className="field mb-4" style={{ padding: '10px 14px', background: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
              {err}
            </div>
          )}

          {mode === 'login' && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', marginBottom: 12, fontSize: 12, opacity: 0.7 }}
              onClick={fillDemo}
            >
              <Icon name="sparkle" size={12} /> Dùng tài khoản dùng thử ({DEMO_ACCOUNTS[role].label})
            </button>
          )}

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={pending}>
            {pending ? (
              <span className="row" style={{ gap: 8 }}>
                <span className="spinner" />
                {mode === 'login' ? 'Đang đăng nhập…' : 'Đang tạo tài khoản…'}
              </span>
            ) : (
              mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
            )}
          </button>

          {mode === 'login' && (
            <>
              <div className="row mt-4" style={{ gap: 12, alignItems: 'center' }}>
                <hr className="divider" style={{ flex: 1 }} />
                <span className="text-muted" style={{ fontSize: 12 }}>hoặc</span>
                <hr className="divider" style={{ flex: 1 }} />
              </div>

              <div className="mt-4">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <button type="button" className="btn btn-ghost btn-lg" style={{ width: '100%', pointerEvents: 'none' }}>
                      <Icon name="google" size={16} />
                      {mode === 'login' ? 'Tiếp tục với Google' : 'Đăng ký với Google'}
                    </button>
                    <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0, colorScheme: 'light', overflow: 'hidden' }}>
                      <GoogleLogin
                        onSuccess={(cred) => googleMut.mutate({ role, credential: cred.credential })}
                        onError={() => setErr('Đăng nhập Google bị hủy hoặc thất bại.')}
                        theme="outline"
                        size="large"
                        width="380"
                        text={mode === 'login' ? 'signin_with' : 'signup_with'}
                      />
                    </div>
                  </div>
                ) : (
                  <button type="button" className="btn btn-ghost btn-lg" style={{ width: '100%' }} disabled>
                    <Icon name="google" size={16} /> Đăng nhập với Google
                  </button>
                )}
              </div>
            </>
          )}

          <p className="text-muted mt-6" style={{ fontSize: 12, textAlign: 'center' }}>
            Tiếp tục đồng nghĩa bạn đồng ý với <Link to="/legal" style={{ borderBottom: '1px solid var(--line-strong)' }}>Điều khoản</Link> và <Link to="/legal?tab=privacy" style={{ borderBottom: '1px solid var(--line-strong)' }}>Chính sách</Link> của chúng tôi.
          </p>
        </form>
      </div>
    </div>
  );
}

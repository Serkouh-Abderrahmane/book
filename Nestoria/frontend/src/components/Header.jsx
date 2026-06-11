import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/home',    label: 'Trang chủ' },
  { to: '/',        label: 'Nhà cho thuê' },
  { to: '/about',   label: 'Giới thiệu' },
  { to: '/contact', label: 'Liên hệ' },
];

export default function Header({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHost = user?.role === 'host';
  const isAdmin = user?.role === 'admin';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <div className="header-left">
          <Link to="/home" className="logo" aria-label="Chi Vinh Land">
            <span className="logo-mark">Chi Vinh Land</span>
          </Link>
        </div>

        <nav className="header-center" aria-label="Chính">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-right">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          {user ? (
            <>
              {isAdmin && (
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>
                  <Icon name="shield" size={14} /> Admin
                </button>
              )}
              {isHost && (
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/host/dashboard')}>
                  <Icon name="home" size={14} /> Host
                </button>
              )}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(isHost ? '/host/profile' : isAdmin ? '/admin/settings' : '/profile')}
              >
                <Icon name="user" size={14} /> {user.full_name?.split(' ')[0] || 'Bạn'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { logout(); navigate('/home'); }}
                aria-label="Đăng xuất"
              >
                <Icon name="logout" size={14} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Đăng nhập</button>
          )}
        </div>
      </div>
    </header>
  );
}

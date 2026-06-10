import { NavLink, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/home',    label: 'Trang chủ',  icon: 'home' },
  { to: '/',        label: 'Nhà cho thuê', icon: 'compass' },
  { to: '/about',   label: 'Giới thiệu', icon: 'sparkle' },
  { to: '/contact', label: 'Liên hệ',    icon: 'heart' },
  { to: '/profile', label: 'Tài khoản',  icon: 'user' },
];

function NavIcon({ name, size }) {
  const icons = {
    home: 'M21 20V9.5l-9-7-9 7V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1ZM9 21V12h6v9',
    compass: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
    sparkle: 'M12 2l1.09 4.17L17.17 2l-2.26 5.09L20 8.57l-4.17 1.74L17.17 16l-4.17-2.26L12 20l-1.09-4.17L6.83 16l2.26-5.09L4 8.57l4.17-1.74L6.83 4l4.17 3.26L12 2z',
    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name]} />
    </svg>
  );
}

export default function MobileNav() {
  const location = useLocation();

  const isActiveTab = (to) => {
    if (to === '/') return location.pathname === '/' || location.pathname === '/hotels';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="mobile-nav" aria-label="Menu di động">
      <div className="mobile-nav-inner">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end className={`mobile-nav-link ${isActiveTab(t.to) ? 'is-active' : ''}`}>
            <NavIcon name={t.icon} size={18} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

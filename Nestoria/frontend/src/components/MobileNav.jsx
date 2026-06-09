import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const TABS = [
  { to: '/',        label: 'Tìm phòng', icon: 'search' },
  { to: '/hotels',  label: 'Điểm đến',  icon: 'compass' },
  { to: '/journal', label: 'Trải nghiệm', icon: 'sparkle' },
  { to: '/help',    label: 'Trợ giúp',     icon: 'heart' },
  { to: '/profile', label: 'Tài khoản',   icon: 'user' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Menu di động">
      <div className="mobile-nav-inner">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}>
            <Icon name={t.icon} size={18} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

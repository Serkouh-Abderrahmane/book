import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Tổng quan',   icon: 'compass' },
  { to: '/admin/hotels',    label: 'Nhà cho thuê', icon: 'map' },
  { to: '/admin/rooms',     label: 'Phòng',        icon: 'bed' },
  { to: '/admin/bookings',  label: 'Đặt phòng',    icon: 'calendar' },
  { to: '/admin/viewings',  label: 'Xem phòng',    icon: 'eye' },
  { to: '/admin/reviews',   label: 'Đánh giá',     icon: 'star' },
  { to: '/admin/customers', label: 'Khách hàng',   icon: 'users' },
  { to: '/admin/settings',  label: 'Cài đặt',      icon: 'sliders' },
];

export default function AdminNavbar({ isOpen, onToggle }) {
  return (
    <>
      {isOpen && <div className="admin-nav-overlay" onClick={onToggle} />}
      <aside className={`admin-nav ${isOpen ? 'is-open' : ''}`}>
        <div className="admin-nav-head">
          <span className="admin-nav-logo">CVL</span>
          <span className="admin-nav-title">Admin</span>
          <button className="admin-nav-close" onClick={onToggle} aria-label="Đóng menu">
            <Icon name="x" size={16} />
          </button>
        </div>
        <nav className="admin-nav-body">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={onToggle}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

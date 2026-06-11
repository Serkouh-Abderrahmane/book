import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';

const navItems = [
  { path: '/host/dashboard', label: 'Dashboard', icon: 'compass' },
  { path: '/host/rooms', label: 'Phòng', icon: 'bed' },
  { path: '/host/create-room', label: 'Tạo phòng', icon: 'plus' },
  { path: '/host/bookings', label: 'Đặt phòng', icon: 'calendar' },
  { path: '/host/viewings', label: 'Lịch xem phòng', icon: 'eye' },
  { path: '/host/profile', label: 'Hồ sơ', icon: 'user' },
  { path: '/host/settings', label: 'Cài đặt', icon: 'sliders' },
];

export default function HostNavbar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-overlay show-mobile"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
            Host
          </div>
          <button
            className="admin-sidebar-close show-mobile"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'is-active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

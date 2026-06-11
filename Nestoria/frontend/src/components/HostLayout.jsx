import { useState } from 'react';
import HostNavbar from './HostNavbar.jsx';
import Icon from './Icon.jsx';

export default function HostLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <HostNavbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <button
        className="admin-sidebar-toggle show-mobile"
        onClick={() => setSidebarOpen((s) => !s)}
        aria-label="Mở menu"
      >
        <Icon name="menu" size={20} />
      </button>
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}

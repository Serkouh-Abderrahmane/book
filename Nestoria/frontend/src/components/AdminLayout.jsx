import { useState } from 'react';
import AdminNavbar from './AdminNavbar.jsx';
import Icon from './Icon.jsx';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminNavbar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <div className="admin-mobile-bar">
          <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)}>
            <Icon name="menu" size={16} /> Menu
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

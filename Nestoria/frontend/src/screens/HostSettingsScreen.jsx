import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Icon from '../components/Icon.jsx';

export default function HostSettingsScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  usePageTitle('Host — Cài đặt');

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const settings = [
    {
      title: 'Tài khoản',
      items: [
        {
          label: 'Thay đổi mật khẩu',
          description: 'Cập nhật mật khẩu của bạn',
          icon: 'lock',
          onClick: () => navigate('/host/settings#password'),
        },
        {
          label: 'Xác minh danh tính',
          description: 'Xác minh thông tin cá nhân của bạn',
          icon: 'check',
          onClick: () => navigate('/host/settings#verification'),
        },
      ],
    },
    {
      title: 'Thông báo',
      items: [
        {
          label: 'Email',
          description: 'Nhận thông báo qua email',
          icon: 'mail',
          onClick: () => navigate('/host/settings#notifications-email'),
        },
        {
          label: 'SMS',
          description: 'Nhận thông báo qua tin nhắn',
          icon: 'phone',
          onClick: () => navigate('/host/settings#notifications-sms'),
        },
      ],
    },
    {
      title: 'Nguy hiểm',
      items: [
        {
          label: 'Đăng xuất',
          description: 'Thoát khỏi tài khoản của bạn',
          icon: 'logout',
          onClick: handleLogout,
          isDanger: true,
        },
      ],
    },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div style={{ marginBottom: 24 }}>
        <span className="eyebrow">— Host / Cài đặt</span>
        <h1 className="h-1 mt-2">Cài đặt</h1>
      </div>

      <div style={{ maxWidth: 600 }}>
        {settings.map((section) => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              — {section.title}
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  className="settings-item"
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderBottom: idx < section.items.length - 1 ? '1px solid var(--line)' : 'none',
                    textAlign: 'left',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                    <Icon name={item.icon} size={18} style={{ color: item.isDanger ? 'var(--error)' : 'var(--ink-2)' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: item.isDanger ? 'var(--error)' : 'var(--ink)' }}>
                        {item.label}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <Icon name="arrow-right" size={16} style={{ color: 'var(--ink-3)' }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

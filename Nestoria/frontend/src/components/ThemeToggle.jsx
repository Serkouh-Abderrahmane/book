import Icon from './Icon.jsx';

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Đổi giao diện"
      title={theme === 'light' ? 'Sang giao diện tối' : 'Sang giao diện sáng'}
    >
      <span className="theme-toggle-thumb" />
      <span className={`theme-toggle-icon ${theme === 'light' ? 'is-active' : ''}`}>
        <Icon name="sun" size={14} />
      </span>
      <span className={`theme-toggle-icon ${theme === 'dark' ? 'is-active' : ''}`}>
        <Icon name="moon" size={14} />
      </span>
    </button>
  );
}

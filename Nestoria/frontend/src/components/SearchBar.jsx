import { useRef, useState } from 'react';

import Icon from './Icon.jsx';

export default function SearchBar({ initial = {}, onSubmit }) {
  const [location, setLocation] = useState(initial.location || '');
  const [error, setError] = useState(null);

  const whereInputRef = useRef(null);

  const submit = (e) => {
    e?.preventDefault?.();
    if (!location.trim()) {
      setError('Vui lòng nhập khu vực trước.');
      whereInputRef.current?.focus();
      return;
    }
    setError(null);
    onSubmit?.({ location });
  };

  return (
    <>
    <form className="search-panel" onSubmit={submit}>
      <label
        htmlFor="search-where"
        className="search-field"
      >
        <span className="search-label">Khu vực</span>
        <input
          id="search-where"
          ref={whereInputRef}
          type="text"
          autoComplete="off"
          className="search-input"
          placeholder="Quận, khu vực hoặc địa danh"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setError(null); }}
        />
      </label>

      <button type="submit" className="search-submit">
        <Icon name="search" size={16} />
        <span>Tìm nhà</span>
      </button>
    </form>
    {error && (
      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>
    )}
    </>
  );
}

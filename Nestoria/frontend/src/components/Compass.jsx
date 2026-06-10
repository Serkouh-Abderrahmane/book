const DIRECTIONS = [
  { key: 'N', label: 'Bắc' },
  { key: 'NE', label: 'Đông Bắc' },
  { key: 'E', label: 'Đông' },
  { key: 'SE', label: 'Đông Nam' },
  { key: 'S', label: 'Nam' },
  { key: 'SW', label: 'Tây Nam' },
  { key: 'W', label: 'Tây' },
  { key: 'NW', label: 'Tây Bắc' },
];

export default function Compass({ value, onChange, label }) {
  return (
    <div className="compass">
      {label && <div className="compass-label">{label}</div>}
      <div className="compass-ring">
        {DIRECTIONS.map((d, i) => {
          const angle = i * 45;
          const isActive = value === d.key;
          return (
            <button
              key={d.key}
              type="button"
              className={`compass-dir ${isActive ? 'is-active' : ''}`}
              style={{ transform: `rotate(${angle}deg) translateY(-64px) rotate(-${angle}deg)` }}
              onClick={() => onChange(isActive ? null : d.key)}
              aria-label={d.label}
            >
              <span className="compass-dir-label">{d.key}</span>
              <span className="compass-dir-full">{d.label}</span>
            </button>
          );
        })}
        <div className="compass-center">
          <div className="compass-needle">
            <div className="compass-needle-n" />
            <div className="compass-needle-s" />
          </div>
        </div>
      </div>
      {value && (
        <div className="compass-selected">
          <span className="compass-selected-dot" />
          {DIRECTIONS.find((d) => d.key === value)?.label}
        </div>
      )}
    </div>
  );
}

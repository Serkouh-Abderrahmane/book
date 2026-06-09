import Icon from './Icon.jsx';

export default function Stepper({ value, min = 0, max = 10, step = 1, onChange, label, format }) {
  const display = format ? format(value) : value;
  return (
    <div className="guest-stepper">
      <div><div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div></div>
      <div className="stepper-controls">
        <button type="button" className="stepper-btn" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
          <Icon name="minus" size={14} />
        </button>
        <span className="text-mono" style={{ minWidth: 48, textAlign: 'center', fontSize: 14 }}>{display}</span>
        <button type="button" className="stepper-btn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}

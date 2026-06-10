import { useCallback, useRef } from 'react';

export default function RangeSlider({ min, max, step, value, onChange }) {
  const track = useRef(null);
  const [lo, hi] = value;

  const pct = (v) => ((v - min) / (max - min)) * 100;
  const loPct = pct(lo);
  const hiPct = pct(hi);

  const commit = useCallback((l, h) => {
    const nlo = Math.min(l, h - step);
    const nhi = Math.max(h, nlo + step);
    onChange([Math.max(min, nlo), Math.min(max, nhi)]);
  }, [min, max, step, onChange]);

  return (
    <div className="range-slider">
      <div className="range-slider-values">
        <span className="range-slider-value">{lo.toLocaleString('vi-VN')}₫</span>
        <span className="range-slider-dash">—</span>
        <span className="range-slider-value">{hi.toLocaleString('vi-VN')}₫</span>
      </div>
      <div className="range-slider-track" ref={track}>
        <div className="range-slider-rail" />
        <div className="range-slider-fill" style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }} />
        <input
          type="range"
          className="range-slider-thumb"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Giá thấp nhất"
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= hi - step) commit(v, hi);
          }}
        />
        <input
          type="range"
          className="range-slider-thumb"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Giá cao nhất"
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= lo + step) commit(lo, v);
          }}
        />
      </div>
    </div>
  );
}

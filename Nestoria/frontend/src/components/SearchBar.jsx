import { useMemo, useRef, useState } from 'react';
import { vi } from 'date-fns/locale';
import {
  addMonths, addDays, format, isBefore, isAfter, isSameDay,
  startOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import Icon from './Icon.jsx';
import Stepper from './Stepper.jsx';
import Popover from './Popover.jsx';
import { hotelsAPI } from '../lib/api.js';

function toISO(d) { return d ? format(d, 'yyyy-MM-dd') : ''; }
function fromISO(s) { return s ? new Date(s + 'T00:00:00') : null; }
function pretty(d) { return d ? format(d, 'EEE d MMM', { locale: vi }) : ''; }

function MonthGrid({ monthStart, today, checkin, checkout, hover, onPick, onHover }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 1 });
    const end   = endOfWeek(endOfMonth(monthStart),     { weekStartsOn: 1 });
    const arr = [];
    for (let d = start; !isAfter(d, end); d = addDays(d, 1)) arr.push(d);
    return arr;
  }, [monthStart]);

  const inRange = (d) => {
    if (!checkin) return false;
    const end = checkout || (hover && isAfter(hover, checkin) ? hover : null);
    if (!end) return false;
    return isAfter(d, checkin) && isBefore(d, end);
  };

  return (
    <div className="cal-month">
      <div className="cal-month-label">{format(monthStart, 'MMMM yyyy', { locale: vi })}</div>
      <div className="cal-weekdays">
        {['T2','T3','T4','T5','T6','T7','CN'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {days.map((d) => {
          const inMonth  = d.getMonth() === monthStart.getMonth();
          const disabled = isBefore(d, today);
          const isStart  = checkin  && isSameDay(d, checkin);
          const isEnd    = checkout && isSameDay(d, checkout);
          const cls = [
            'cal-cell',
            inMonth ? '' : 'is-out',
            disabled ? 'is-disabled' : '',
            inRange(d) ? 'is-range' : '',
            (isStart || isEnd) ? 'is-end' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={d.toISOString()}
              type="button"
              className={cls}
              disabled={disabled}
              onMouseEnter={() => onHover(d)}
              onClick={() => onPick(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchBar({ initial = {}, onSubmit }) {
  const [location, setLocation] = useState(initial.location || '');
  const [checkin,  setCheckin]  = useState(fromISO(initial.checkin));
  const [checkout, setCheckout] = useState(fromISO(initial.checkout));
  const [guests,   setGuests]   = useState(Number(initial.guests) || 2);
  const [open,     setOpen]     = useState(null); // 'where' | 'dates' | 'guests' | null
  const [hoverDate, setHoverDate] = useState(null);
  const [error, setError] = useState(null);
  const [monthStart, setMonthStart] = useState(() => startOfMonth(checkin || new Date()));
  const today = useMemo(() => startOfDay(new Date()), []);

  const whereRef      = useRef(null);
  const whereInputRef = useRef(null);
  const datesRef      = useRef(null);
  const guestsRef     = useRef(null);

  const destsQ = useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelsAPI.destinations().then((d) => d.destinations),
    staleTime: 5 * 60 * 1000,
  });

  const pickDate = (d) => {
    if (!checkin || (checkin && checkout)) {
      setCheckin(d); setCheckout(null);
    } else if (isBefore(d, checkin) || isSameDay(d, checkin)) {
      setCheckin(d); setCheckout(null);
    } else {
      setCheckout(d);
    }
  };

  const clearDates = () => { setCheckin(null); setCheckout(null); };

  const submit = (e) => {
    e?.preventDefault?.();
    if (!location.trim()) {
      setError('Vui lòng chọn điểm đến trước.');
      whereInputRef.current?.focus();
      return;
    }
    setError(null);
    onSubmit?.({
      location,
      checkin:  toISO(checkin),
      checkout: toISO(checkout),
      guests,
    });
  };

  const filteredDests = (() => {
    const q = location.trim().toLowerCase();
    return (destsQ.data || []).filter((d) =>
      !q || d.name.toLowerCase().includes(q) || (d.region || '').toLowerCase().includes(q)
    );
  })();

  return (
    <>
    <form className="search-panel" onSubmit={submit}>
      <label
        ref={whereRef}
        htmlFor="search-where"
        className={`search-field ${open === 'where' ? 'is-focus' : ''}`}
      >
        <span className="search-label">Điểm đến</span>
        <input
          id="search-where"
          ref={whereInputRef}
          type="text"
          autoComplete="off"
          className="search-input"
          placeholder="Thành phố hoặc khu vực"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setError(null); }}
        />
      </label>

      <button
        ref={datesRef}
        type="button"
        className={`search-field search-field-btn ${open === 'dates' ? 'is-focus' : ''}`}
        onClick={() => setOpen(open === 'dates' ? null : 'dates')}
      >
        <span className="search-label">Nhận phòng</span>
        <span className="search-value">{checkin ? pretty(checkin) : 'Chọn ngày'}</span>
      </button>

      <button
        type="button"
        className={`search-field search-field-btn ${open === 'dates' ? 'is-focus' : ''}`}
        onClick={() => setOpen(open === 'dates' ? null : 'dates')}
      >
        <span className="search-label">Trả phòng</span>
        <span className="search-value">{checkout ? pretty(checkout) : 'Chọn ngày'}</span>
      </button>

      <button
        ref={guestsRef}
        type="button"
        className={`search-field search-field-btn ${open === 'guests' ? 'is-focus' : ''}`}
        onClick={() => setOpen(open === 'guests' ? null : 'guests')}
      >
        <span className="search-label">Khách</span>
        <span className="search-value">
          {guests} khách <Icon name="chevron-down" size={12} />
        </span>
      </button>

      <button type="submit" className="search-submit">
        <Icon name="search" size={16} />
        <span>Tìm kiếm</span>
      </button>

      <Popover
        anchorRef={whereRef}
        open={location.trim().length > 0 && filteredDests.length > 0 && open !== 'dates' && open !== 'guests'}
        onClose={() => setOpen(null)}
        placement="below-left"
        className="search-popover-where"
      >
        {filteredDests.map((d) => (
          <button
            key={d.name}
            type="button"
            className="where-row"
            onClick={() => { setLocation(d.name); setError(null); setOpen('dates'); }}
          >
            <span className="where-row-name">{d.name}</span>
            <span className="where-row-region">{d.region}</span>
          </button>
        ))}
      </Popover>

      <Popover anchorRef={datesRef} open={open === 'dates'} onClose={() => setOpen(null)} placement="below-left" className="search-popover-dates">
        <div className="cal-head">
          <button type="button" className="cal-nav" onClick={() => setMonthStart(addMonths(monthStart, -1))} aria-label="Tháng trước">
            <Icon name="chevron-left" size={16} />
          </button>
          <button type="button" className="cal-nav" onClick={() => setMonthStart(addMonths(monthStart, 1))} aria-label="Tháng sau">
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
        <div className="cal-months">
          <MonthGrid monthStart={monthStart}              today={today} checkin={checkin} checkout={checkout} hover={hoverDate} onPick={pickDate} onHover={setHoverDate} />
          <MonthGrid monthStart={addMonths(monthStart,1)} today={today} checkin={checkin} checkout={checkout} hover={hoverDate} onPick={pickDate} onHover={setHoverDate} />
        </div>
        <div className="cal-foot">
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearDates}>Xóa</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(null)} disabled={!checkin || !checkout}>
            Áp dụng
          </button>
        </div>
      </Popover>

      <Popover anchorRef={guestsRef} open={open === 'guests'} onClose={() => setOpen(null)} placement="below-right" className="search-popover-guests">
        <Stepper label="Khách" value={guests} min={1} max={8} onChange={setGuests} />
        <div className="cal-foot" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(null)}>Xong</button>
        </div>
      </Popover>
    </form>
    {error && (
      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>
    )}
    </>
  );
}

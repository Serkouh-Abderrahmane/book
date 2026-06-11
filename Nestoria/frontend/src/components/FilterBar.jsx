import { PROVINCES, DISTRICTS, WARDS, ROOM_TYPE_OPTIONS, PRICE_RANGES, AMENITIES } from '../lib/filterConstants.js';
import { useFilters } from '../hooks/useFilters.js';
import Icon from './Icon.jsx';

const cx = {
  section: { marginBottom: 24 },
  sectionLast: { marginBottom: 0 },
  label: {
    fontSize: 13, fontWeight: 600, color: '#374151',
    marginBottom: 8, display: 'block',
  },
  select: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid #d1d5db', borderRadius: 8,
    background: '#fff', color: '#111827',
    outline: 'none', cursor: 'pointer',
  },
  disabledSelect: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid #e5e7eb', borderRadius: 8,
    background: '#f9fafb', color: '#9CA3AF',
    cursor: 'not-allowed',
  },
  roomTypeGroup: {
    marginBottom: 12,
  },
  roomTypeGroupLabel: {
    fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase',
    marginBottom: 8, display: 'block', letterSpacing: '0.5px',
  },
  roomTypeOption: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', marginBottom: 4,
    border: '1px solid #e5e7eb', borderRadius: 6,
    background: '#fff', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  roomTypeOptionActive: {
    border: '1px solid #1a3a6b', background: '#f0f4ff',
  },
  roomTypeLabel: {
    fontSize: 13, fontWeight: 500, color: '#374151', flex: 1,
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', fontSize: 12, fontWeight: 500,
    border: '1px solid #d1d5db', borderRadius: 20,
    background: '#fff', color: '#374151',
    cursor: 'pointer', userSelect: 'none',
    transition: 'all 0.15s',
  },
  chipActive: {
    border: '1px solid #1a3a6b', background: '#1a3a6b', color: '#fff',
  },
  chipWrap: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
  },
  btnPrimary: {
    padding: '10px 24px', fontSize: 14, fontWeight: 600,
    background: '#1a3a6b', color: '#fff',
    border: 0, borderRadius: 8, cursor: 'pointer',
    flex: 1, minWidth: 0,
  },
  btnGhost: {
    padding: '10px 24px', fontSize: 14, fontWeight: 500,
    background: 'transparent', color: '#6B7280',
    border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer',
    flex: 1, minWidth: 0,
  },
  actions: {
    display: 'flex', gap: 12, marginTop: 24,
  },
};

function Select({ label, value, options, placeholder, disabled, onChange }) {
  return (
    <div style={cx.section}>
      <label style={cx.label}>{label}</label>
      <select
        style={disabled ? cx.disabledSelect : cx.select}
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function RoomTypeSelector({ value, onChange }) {
  // Group options by group name
  const grouped = {};
  ROOM_TYPE_OPTIONS.forEach((opt) => {
    const grp = opt.group || 'main';
    if (!grouped[grp]) grouped[grp] = [];
    grouped[grp].push(opt);
  });

  return (
    <div style={cx.section}>
      <label style={cx.label}>Loại phòng</label>
      
      {/* Phòng trọ */}
      <div style={cx.roomTypeGroup}>
        {grouped.main && grouped.main.map((opt) => (
          <div
            key={opt.id}
            style={{ ...cx.roomTypeOption, ...(value === opt.id ? cx.roomTypeOptionActive : {}) }}
            onClick={() => onChange(value === opt.id ? '' : opt.id)}
            role="button"
            tabIndex={0}
          >
            <input
              type="radio"
              checked={value === opt.id}
              onChange={() => {}}
              style={{ accentColor: '#1a3a6b' }}
            />
            <span style={cx.roomTypeLabel}>{opt.label}</span>
          </div>
        ))}
      </div>

      {/* Căn hộ group */}
      {grouped['Căn hộ'] && (
        <div style={cx.roomTypeGroup}>
          <div
            style={{ ...cx.roomTypeGroupLabel, ...(value === 'CAN_HO' ? cx.roomTypeOptionActive : {}), cursor: 'pointer' }}
            onClick={() => onChange(value === 'CAN_HO' ? '' : 'CAN_HO')}
            role="button"
            tabIndex={0}
          >
            Căn hộ
          </div>
          {grouped['Căn hộ'].map((opt) => (
            <div
              key={opt.id}
              style={{ ...cx.roomTypeOption, ...(value === opt.id ? cx.roomTypeOptionActive : {}), marginLeft: 8 }}
              onClick={() => onChange(value === opt.id ? '' : opt.id)}
              role="button"
              tabIndex={0}
            >
              <input
                type="radio"
                checked={value === opt.id}
                onChange={() => {}}
                style={{ accentColor: '#1a3a6b' }}
              />
              <span style={cx.roomTypeLabel}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChipGroup({ label, options, selected, onChange, valueKey, labelKey }) {
  return (
    <div style={cx.section}>
      <label style={cx.label}>{label}</label>
      <div style={cx.chipWrap}>
        {options.map((opt) => {
          const val = valueKey ? opt[valueKey] : opt;
          const lbl = labelKey ? opt[labelKey] : opt;
          const isActive = selected.includes(val);
          return (
            <span
              key={val}
              role="checkbox"
              aria-checked={isActive}
              tabIndex={0}
              style={{ ...cx.chip, ...(isActive ? cx.chipActive : {}) }}
              onClick={() => {
                if (isActive) onChange(selected.filter((s) => s !== val));
                else onChange([...selected, val]);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (isActive) onChange(selected.filter((s) => s !== val));
                  else onChange([...selected, val]);
                }
              }}
            >
              {lbl}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar({ onClose, activeFilterCount }) {
  const { filters, setFilters, resetFilters } = useFilters();

  const districts = filters.province ? (DISTRICTS[filters.province] || []) : [];
  const wards = filters.district ? (WARDS[filters.district] || []) : [];

  const handleApply = () => {
    if (onClose) onClose();
  };

  return (
    <div>
      {/* 1. Tỉnh / Thành phố */}
      <Select
        label="Tỉnh / Thành phố"
        value={filters.province}
        options={PROVINCES}
        placeholder="Chọn tỉnh/thành phố"
        disabled={false}
        onChange={(val) => setFilters({ province: val })}
      />

      {/* 2. Quận / Huyện */}
      <Select
        label="Quận / Huyện"
        value={filters.district}
        options={districts}
        placeholder="Chọn quận/huyện"
        disabled={!filters.province}
        onChange={(val) => setFilters({ district: val })}
      />

      {/* 3. Phường / Xã */}
      <Select
        label="Phường / Xã"
        value={filters.ward}
        options={wards}
        placeholder="Chọn phường/xã"
        disabled={!filters.district}
        onChange={(val) => setFilters({ ward: val })}
      />

      {/* 4. Loại phòng */}
      <RoomTypeSelector
        value={filters.roomType}
        onChange={(val) => setFilters({ roomType: val })}
      />

      {/* 5. Giá */}
      <ChipGroup
        label="Giá (bỏ chọn để xem tất cả)"
        options={PRICE_RANGES}
        selected={filters.priceRangeIds}
        onChange={(val) => setFilters({ priceRangeIds: val })}
        valueKey="id"
        labelKey="label"
      />

      {/* 6. Tiện ích khác */}
      <ChipGroup
        label="Tiện ích khác"
        options={AMENITIES}
        selected={filters.amenities}
        onChange={(val) => setFilters({ amenities: val })}
        valueKey="key"
        labelKey="label"
      />

      {/* 7. Action buttons */}
      <div style={cx.actions}>
        <button style={cx.btnPrimary} onClick={handleApply}>
          Áp dụng
        </button>
        <button style={cx.btnGhost} onClick={resetFilters}>
          Mới lại
        </button>
      </div>

      {/* Delete filter button (shown when desktop sidebar has it) */}
      {activeFilterCount > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <button
            style={{
              width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 500,
              background: 'transparent', color: '#6B7280', border: '1px solid #d1d5db',
              borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            onClick={resetFilters}
          >
            <Icon name="x" size={14} />
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}

import { PROVINCES, DISTRICTS, WARDS, ROOM_TYPES, PRICE_RANGES, AMENITIES } from '../lib/filterConstants.js';
import { useFilters } from '../hooks/useFilters.js';

const cx = {
  section: { marginBottom: 24 },
  label: {
    fontSize: 13, fontWeight: 600, color: '#374151',
    marginBottom: 8, display: 'block',
  },
  select: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid #d1d5db', borderRadius: 10,
    background: '#fff', color: '#111827',
    outline: 'none', cursor: 'pointer',
    appearance: 'auto',
  },
  disabledSelect: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid #e5e7eb', borderRadius: 10,
    background: '#f9fafb', color: '#9CA3AF',
    cursor: 'not-allowed',
    appearance: 'auto',
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', fontSize: 13, fontWeight: 500,
    border: '1px solid #d1d5db', borderRadius: 20,
    background: '#fff', color: '#374151',
    cursor: 'pointer', userSelect: 'none',
    transition: 'all 0.15s',
  },
  chipActive: {
    border: '1px solid #1a3a6b', background: '#1a3a6b',
    color: '#fff',
  },
  chipWrap: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
  },
  btnPrimary: {
    padding: '10px 24px', fontSize: 14, fontWeight: 600,
    background: '#1a3a6b', color: '#fff',
    border: 0, borderRadius: 10, cursor: 'pointer',
    flex: 1, minWidth: 0,
  },
  btnGhost: {
    padding: '10px 24px', fontSize: 14, fontWeight: 500,
    background: 'transparent', color: '#6B7280',
    border: '1px solid #d1d5db', borderRadius: 10, cursor: 'pointer',
    flex: 1, minWidth: 0,
  },
  actions: {
    display: 'flex', gap: 12, marginTop: 8,
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

function ChipGroup({ label, options, selected, onChange, selectedKey, labelKey, valueKey }) {
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

export default function FilterBar({ onClose }) {
  const { filters, setFilters, resetFilters, activeFilterCount } = useFilters();

  const districts = filters.province ? (DISTRICTS[filters.province] || []) : [];
  const wards = filters.district ? (WARDS[filters.district] || []) : [];

  const handleProvince = (val) => setFilters({ province: val, district: '', ward: '' });
  const handleDistrict = (val) => setFilters({ district: val, ward: '' });
  const handleWard = (val) => setFilters({ ward: val });
  const handleRoomType = (val) => setFilters({ roomType: val });
  const handlePriceRanges = (val) => setFilters({ selectedPriceRanges: val });
  const handleAmenities = (val) => setFilters({ selectedAmenities: val });

  const handleApply = () => {
    if (onClose) onClose();
  };

  return (
    <div>
      <Select
        label="Tỉnh / Thành phố"
        value={filters.province}
        options={PROVINCES}
        placeholder="Chọn tỉnh/thành phố"
        disabled={false}
        onChange={handleProvince}
      />

      <Select
        label="Quận / Huyện"
        value={filters.district}
        options={districts}
        placeholder="Chọn quận/huyện"
        disabled={!filters.province}
        onChange={handleDistrict}
      />

      <Select
        label="Phường / Xã"
        value={filters.ward}
        options={wards}
        placeholder="Chọn phường/xã"
        disabled={!filters.district}
        onChange={handleWard}
      />

      <Select
        label="Loại phòng"
        value={filters.roomType}
        options={ROOM_TYPES}
        placeholder="Chọn loại phòng"
        disabled={false}
        onChange={handleRoomType}
      />

      <ChipGroup
        label="Giá (bỏ chọn để xem tất cả)"
        options={PRICE_RANGES}
        selected={filters.selectedPriceRanges}
        onChange={handlePriceRanges}
        valueKey="min"
        labelKey="label"
      />

      <ChipGroup
        label="Tiện ích khác (bỏ chọn để xem tất cả)"
        options={AMENITIES}
        selected={filters.selectedAmenities}
        onChange={handleAmenities}
        valueKey="key"
        labelKey="label"
      />

      <div style={cx.actions}>
        <button style={cx.btnPrimary} onClick={handleApply}>
          Áp dụng
        </button>
        <button style={cx.btnGhost} onClick={resetFilters}>
          Mới lại
        </button>
      </div>
    </div>
  );
}

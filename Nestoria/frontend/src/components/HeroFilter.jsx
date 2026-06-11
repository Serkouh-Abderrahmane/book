import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { DISTRICTS, WARDS, ROOM_TYPE_OPTIONS, PRICE_RANGES, AMENITIES } from '../lib/filterConstants.js';
import './HeroFilter.css';

export default function HeroFilter() {
  const navigate = useNavigate();
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [roomType, setRoomType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [amenity, setAmenity] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  // Get available districts based on selected province
  const availableDistricts = useMemo(() => {
    if (!province) return [];
    return DISTRICTS[province] || [];
  }, [province]);

  // Get available wards based on selected district
  const availableWards = useMemo(() => {
    if (!district) return [];
    return WARDS[district] || [];
  }, [district]);

  // Reset dependent filters when parent changes
  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    setProvince(newProvince);
    setDistrict('');
    setWard('');
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setDistrict(newDistrict);
    setWard('');
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (province) params.append('province', province);
    if (district) params.append('district', district);
    if (ward) params.append('ward', ward);
    if (roomType) params.append('roomType', roomType);
    if (priceRange) params.append('priceRanges', priceRange);
    if (amenity) params.append('amenities', amenity);

    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="hero-filter-container">
      <div className="hero-filter-grid">
        {/* Province */}
        <div className="hero-filter-group">
          <label className="hero-filter-label">Tỉnh/Thành phố</label>
          <select
            className="hero-filter-select"
            value={province}
            onChange={handleProvinceChange}
            aria-label="Chọn tỉnh/thành phố"
          >
            <option value="">Chọn tỉnh/thành phố</option>
            <option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</option>
          </select>
        </div>

        {/* District */}
        <div className="hero-filter-group">
          <label className="hero-filter-label">Quận/Huyện</label>
          <select
            className="hero-filter-select"
            value={district}
            onChange={handleDistrictChange}
            disabled={!province}
            aria-label="Chọn quận/huyện"
          >
            <option value="">Chọn quận/huyện</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div className="hero-filter-group">
          <label className="hero-filter-label">Phường/Xã</label>
          <select
            className="hero-filter-select"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            disabled={!district}
            aria-label="Chọn phường/xã"
          >
            <option value="">Chọn phường/xã</option>
            {availableWards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div className="hero-filter-group">
          <label className="hero-filter-label">Loại phòng</label>
          <select
            className="hero-filter-select"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            aria-label="Chọn loại phòng"
          >
            <option value="">Tất cả loại phòng</option>
            {ROOM_TYPE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="hero-filter-group">
          <label className="hero-filter-label">Giá</label>
          <select
            className="hero-filter-select"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            aria-label="Chọn khoảng giá"
          >
            <option value="">Tất cả giá</option>
            {PRICE_RANGES.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amenities */}
        <div className="hero-filter-group">
          <label className="hero-filter-label">Tiện ích</label>
          <select
            className="hero-filter-select"
            value={amenity}
            onChange={(e) => setAmenity(e.target.value)}
            aria-label="Chọn tiện ích"
          >
            <option value="">Tất cả tiện ích</option>
            {AMENITIES.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="hero-filter-group hero-filter-button-group">
          <button
            className={`hero-filter-button ${isHovering ? 'is-hovering' : ''}`}
            onClick={handleSearch}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            aria-label="Tìm phòng"
          >
            <Icon name="search" size={16} />
            <span>Tìm phòng</span>
          </button>
        </div>
      </div>
    </div>
  );
}

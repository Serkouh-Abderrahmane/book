import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';

import RoomCard from '../components/RoomCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Icon from '../components/Icon.jsx';
import FilterBar from '../components/FilterBar.jsx';
import { hotelsAPI } from '../lib/api.js';
import { useSavedHotels } from '../hooks/useSavedHotels.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFilters } from '../hooks/useFilters.js';
import { ROOM_TYPE_OPTIONS } from '../lib/filterConstants.js';

export default function HotelsScreen() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const { isSaved, toggle: toggleSave } = useSavedHotels();
  usePageTitle('Tìm nhà');

  const { filters, activeFilterCount, resetFilters, getPriceRange } = useFilters();

  const location = params.get('location') || '';

  const [sort, setSort] = useState(params.get('sort') || 'score');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const next = params.get('sort') || 'score';
    if (next !== sort) setSort(next);
  }, [params]);

  // Body-scroll lock + Escape close for the mobile filter drawer.
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.classList.add('body-locked');
    const onKey = (e) => { if (e.key === 'Escape') setFiltersOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('body-locked');
      document.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const setSortAndUrl = (k) => {
    setSort(k);
    const next = new URLSearchParams(params);
    next.set('sort', k);
    setParams(next, { replace: true });
  };
  const onSave = (id) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(routerLocation.pathname + routerLocation.search)}`);
      return;
    }
    toggleSave(id);
  };

  // Parse room type filter into property_type
  const parseRoomType = () => {
    if (!filters.roomType) return {};
    if (filters.roomType === 'CAN_HO') return { property_type: 'CAN_HO' };
    const opt = ROOM_TYPE_OPTIONS.find((o) => o.id === filters.roomType);
    if (!opt) return {};
    return { property_type: opt.property_type };
  };

  const priceRange = getPriceRange();
  const roomTypeParams = parseRoomType();

  const apiParams = {
    location: location || undefined,
    property_type: roomTypeParams.property_type,
    min_price: priceRange.min > 0 ? priceRange.min : undefined,
    max_price: priceRange.max < 100000 ? priceRange.max : undefined,
    amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
    sort,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['hotels', apiParams],
    queryFn: () => hotelsAPI.search(apiParams).then((d) => d.hotels),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((h) => {
      if (filters.district && h.region !== filters.district) return false;
      return true;
    });
  }, [data, filters.district]);

  const onSearch = (q) => {
    const next = new URLSearchParams();
    if (q.location) next.set('location', q.location);
    setParams(next);
  };

  return (
    <div className="container-wide page-enter" style={{ paddingTop: 28, paddingBottom: 90 }}>
      <div className="mb-6">
        <div className="eyebrow mb-3">— CĂN HỘ & PHÒNG TRỌ</div>
        <div className="list-head">
          <h1 className="h-1" style={{ fontSize: 'clamp(22px, 3.5vw, 38px)' }}>
            {isLoading ? '…' : filtered.length} Căn hộ và phòng trọ chất lượng TP.HCM.
          </h1>
        </div>

        <div className="brand-strip">
          <span className="brand-name">Chi Vinh Land</span>
          <span className="brand-sep">·</span>
          <span className="brand-tagline">Nhà thuê và căn hộ chất lượng tại TP. Hồ Chí Minh</span>
        </div>

        <div className="trust-row">
          <span><Icon name="star" size={12} /> 4.8 đánh giá</span>
          <span><Icon name="shield" size={12} /> Xác thực 100%</span>
          <span><Icon name="calendar" size={12} /> Hỗ trợ 24/7</span>
        </div>

        {/* Mobile compact search bar */}
        <div className="show-mobile" style={{ marginTop: 12 }}>
          <div className="mobile-search-bar" style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, justifyContent: 'flex-start', gap: 8, padding: '10px 14px', fontSize: 13, fontWeight: 400, color: 'var(--ink-3)' }}
              onClick={() => setMobileSearchOpen((s) => !s)}
            >
              <Icon name="search" size={14} />
              {location || 'Tìm khu vực...'}
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: '10px 14px', fontSize: 13 }}
              onClick={() => setFiltersOpen(true)}
            >
              <Icon name="filter" size={14} /> Bộ lọc
              {activeFilterCount > 0 && <span className="filter-count-pill">{activeFilterCount}</span>}
            </button>
          </div>
          {mobileSearchOpen && (
            <div className="mt-3 fade-up">
              <SearchBar initial={{ location }} onSubmit={(q) => { onSearch(q); setMobileSearchOpen(false); }} />
            </div>
          )}
        </div>

      </div>

      <div className="hotels-toolbar">
        <div className="show-mobile sort" style={{ width: '100%', justifyContent: 'flex-start' }}>
          {[['price_asc','Giá ↑'],['price_desc','Giá ↓']].map(([k,l]) => (
            <button key={k} className={`sort-btn ${sort===k ? 'is-active' : ''}`} onClick={() => setSortAndUrl(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="list-shell">
        <aside className="filters-desktop">
          <div className="filters-desktop-inner">
            <div className="filters-desktop-title">Bộ lọc</div>
            <FilterBar />
            <button type="button" className="filters-desktop-reset" onClick={resetFilters}>
              <Icon name="x" size={14} />
              Xóa bộ lọc
            </button>
          </div>
        </aside>

        <div>
          <div className="list-head hide-mobile">
            <div className="list-results">{isLoading ? 'Đang tải…' : `${filtered.length} kết quả`}</div>
            <div className="sort">
          {[['price_asc','Giá ↑'],['price_desc','Giá ↓']].map(([k,l]) => (
                <button key={k} className={`sort-btn ${sort===k ? 'is-active' : ''}`} onClick={() => setSortAndUrl(k)}>{l}</button>
              ))}
            </div>
          </div>

          {!isLoading && isError ? (
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>Không thể kết nối máy chủ</div>
              <p className="text-muted mt-3">Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
              <button className="btn btn-primary btn-sm mt-4" onClick={() => refetch()}>
                Thử lại
              </button>
            </div>
          ) : !isLoading && filtered.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ fontSize: 32 }}>Chưa có kết quả.</div>
              <p className="text-muted mt-3">Không có nhà cho thuê phù hợp với bộ lọc. Hãy thử mở rộng khoảng giá hoặc thay đổi khu vực.</p>
            </div>
          ) : (
            <div className="hotel-grid">
              {filtered.map((h, i) => (
                <div key={h.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <RoomCard hotel={h} saved={isSaved(h.id)} onSave={() => onSave(h.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="brand-intro">
        <div className="brand-intro-card">
          <div className="brand-intro-icon"><Icon name="home" size={24} /></div>
          <div>
            <h3 className="brand-intro-title">Chi Vinh Land</h3>
            <p className="brand-intro-text">Căn hộ và nhà cho thuê tốt nhất tại TP. Hồ Chí Minh</p>
            <p className="brand-intro-sub">Từ Quận 1 đến Thủ Đức — mỗi căn nhà đều được chọn lọc bởi đội ngũ của chúng tôi.</p>
            <Link to="/about" className="brand-intro-link">Giới thiệu về Chi Vinh Land <Icon name="arrow-right" size={12} /></Link>
          </div>
        </div>
      </section>

      {filtersOpen && createPortal(
        <>
          <div className="filter-drawer-overlay" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          <aside className="filter-drawer" role="dialog" aria-label="Bộ lọc tìm kiếm">

            <div className="filter-drawer-header">
              <h2 className="filter-drawer-title">
                Bộ lọc
                {activeFilterCount > 0 && <span className="filter-drawer-count">({activeFilterCount})</span>}
              </h2>
              <button type="button" className="filter-drawer-close" onClick={() => setFiltersOpen(false)} aria-label="Đóng">
                <Icon name="x" size={20} />
              </button>
            </div>

            <div className="filter-content">
            <FilterBar onClose={() => setFiltersOpen(false)} activeFilterCount={activeFilterCount} />
            </div>

            <div className="filter-footer">
              <button
                type="button"
                className="filter-footer-btn filter-footer-btn-secondary"
                onClick={resetFilters}
              >
                <Icon name="x" size={14} />
                Xóa lọc
              </button>
              <button
                type="button"
                className="filter-footer-btn filter-footer-btn-primary"
                onClick={() => setFiltersOpen(false)}
              >
                Hiện {filtered.length} kết quả
                <Icon name="arrow-right" size={16} />
              </button>
            </div>

          </aside>
        </>,
        document.body
      )}
    </div>
  );
}

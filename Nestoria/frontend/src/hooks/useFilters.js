import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_FILTERS, PRICE_RANGES, FILTER_PARAM_NAMES, priceRangeToParam } from '../lib/filterConstants.js';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => ({
    province: searchParams.get(FILTER_PARAM_NAMES.province) || DEFAULT_FILTERS.province,
    district: searchParams.get(FILTER_PARAM_NAMES.district) || DEFAULT_FILTERS.district,
    ward: searchParams.get(FILTER_PARAM_NAMES.ward) || DEFAULT_FILTERS.ward,
    roomType: searchParams.get(FILTER_PARAM_NAMES.roomType) || DEFAULT_FILTERS.roomType,
    selectedPriceRanges: parsePriceRanges(searchParams.get(FILTER_PARAM_NAMES.minPrice), searchParams.get(FILTER_PARAM_NAMES.maxPrice)),
    selectedAmenities: (searchParams.get(FILTER_PARAM_NAMES.amenities) || '').split(',').filter(Boolean),
  }), [searchParams]);

  const setFilters = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const { province, district, ward, roomType, selectedPriceRanges, selectedAmenities } = updates;

      if (province !== undefined) {
        setOrRemove(next, FILTER_PARAM_NAMES.province, province);
        if (province !== filters.province) {
          setOrRemove(next, FILTER_PARAM_NAMES.district, '');
          setOrRemove(next, FILTER_PARAM_NAMES.ward, '');
        }
      }
      if (district !== undefined) {
        setOrRemove(next, FILTER_PARAM_NAMES.district, district);
        if (district !== filters.district) {
          setOrRemove(next, FILTER_PARAM_NAMES.ward, '');
        }
      }
      if (ward !== undefined) setOrRemove(next, FILTER_PARAM_NAMES.ward, ward);
      if (roomType !== undefined) setOrRemove(next, FILTER_PARAM_NAMES.roomType, roomType);

      if (selectedPriceRanges !== undefined) {
        const { minPrice, maxPrice } = priceRangeToParam(selectedPriceRanges);
        setOrRemove(next, FILTER_PARAM_NAMES.minPrice, minPrice != null ? String(minPrice) : '');
        setOrRemove(next, FILTER_PARAM_NAMES.maxPrice, maxPrice != null ? String(maxPrice) : '');
      }
      if (selectedAmenities !== undefined) {
        setOrRemove(next, FILTER_PARAM_NAMES.amenities, selectedAmenities.join(','));
      }
      return next;
    });
  }, [setSearchParams, filters.province, filters.district]);

  const resetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      for (const [k, v] of prev) {
        if (!Object.values(FILTER_PARAM_NAMES).includes(k)) {
          next.set(k, v);
        }
      }
      return next;
    });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.province) count++;
    if (filters.district) count++;
    if (filters.ward) count++;
    if (filters.roomType) count++;
    if (filters.selectedPriceRanges.length) count++;
    if (filters.selectedAmenities.length) count++;
    return count;
  }, [filters]);

  return { filters, setFilters, resetFilters, activeFilterCount };
}

function parsePriceRanges(minStr, maxStr) {
  const min = minStr ? Number(minStr) : undefined;
  const max = maxStr ? Number(maxStr) : undefined;
  if (min == null && max == null) return [];
  return PRICE_RANGES.filter((r) => {
    const rMin = r.min;
    const rMax = r.max;
    if (min != null && max != null) {
      return rMin >= min && rMax <= max;
    }
    if (min != null) return rMax >= min;
    if (max != null) return rMin <= max;
    return false;
  });
}

function setOrRemove(params, key, value) {
  if (value) params.set(key, value);
  else params.delete(key);
}

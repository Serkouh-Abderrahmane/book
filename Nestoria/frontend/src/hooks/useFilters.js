import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRICE_RANGES } from '../lib/filterConstants.js';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => ({
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    ward: searchParams.get('ward') || '',
    roomType: searchParams.get('roomType') || '', // e.g., 'PHONG_TRO', 'CAN_HO', 'CAN_HO::CH_2N1W'
    priceRangeIds: (searchParams.get('priceRanges') || '').split(',').filter(Boolean),
    amenities: (searchParams.get('amenities') || '').split(',').filter(Boolean),
  }), [searchParams]);

  const setFilters = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (updates.province !== undefined) {
        if (updates.province) {
          next.set('province', updates.province);
        } else {
          next.delete('province');
          next.delete('district');
          next.delete('ward');
        }
        // When province changes, clear district and ward
        if (updates.province !== filters.province) {
          next.delete('district');
          next.delete('ward');
        }
      }

      if (updates.district !== undefined) {
        if (updates.district) {
          next.set('district', updates.district);
        } else {
          next.delete('district');
          next.delete('ward');
        }
        // When district changes, clear ward
        if (updates.district !== filters.district) {
          next.delete('ward');
        }
      }

      if (updates.ward !== undefined) {
        if (updates.ward) {
          next.set('ward', updates.ward);
        } else {
          next.delete('ward');
        }
      }

      if (updates.roomType !== undefined) {
        if (updates.roomType) {
          next.set('roomType', updates.roomType);
        } else {
          next.delete('roomType');
        }
      }

      if (updates.priceRangeIds !== undefined) {
        if (updates.priceRangeIds.length > 0) {
          next.set('priceRanges', updates.priceRangeIds.join(','));
        } else {
          next.delete('priceRanges');
        }
      }

      if (updates.amenities !== undefined) {
        if (updates.amenities.length > 0) {
          next.set('amenities', updates.amenities.join(','));
        } else {
          next.delete('amenities');
        }
      }

      return next;
    });
  }, [setSearchParams, filters.province, filters.district]);

  const resetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      // Keep non-filter params (e.g., 'location', 'sort')
      const filterKeys = new Set(['province', 'district', 'ward', 'roomType', 'priceRanges', 'amenities']);
      for (const [k, v] of prev) {
        if (!filterKeys.has(k)) {
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
    if (filters.priceRangeIds.length) count++;
    if (filters.amenities.length) count++;
    return count;
  }, [filters]);

  // Helper: convert selected price range IDs to min/max for API
  const getPriceRange = useCallback(() => {
    if (filters.priceRangeIds.length === 0) return { min: undefined, max: undefined };
    const selected = PRICE_RANGES.filter((r) => filters.priceRangeIds.includes(r.id));
    if (selected.length === 0) return { min: undefined, max: undefined };
    let min = Math.min(...selected.map((r) => r.min));
    let max = Math.max(...selected.map((r) => r.max));
    return { min, max };
  }, [filters.priceRangeIds]);

  return { filters, setFilters, resetFilters, activeFilterCount, getPriceRange };
}

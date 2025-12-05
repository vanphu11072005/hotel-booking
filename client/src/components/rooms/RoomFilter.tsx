import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FilterValues } from '../../types/rooms';

interface RoomFilterProps {
  onFilterChange?: (filters: FilterValues) => void;
}

const RoomFilter: React.FC<RoomFilterProps> = ({ onFilterChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<FilterValues>({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') 
      ? Number(searchParams.get('minPrice')) 
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    capacity: searchParams.get('capacity')
      ? Number(searchParams.get('capacity'))
      : undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
  });

  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities')
      ? searchParams.get('amenities')!.split(',').map((s) => s.trim())
      : []
  );

  const [checkInDate, setCheckInDate] = useState<Date | null>(
    searchParams.get('from') ? new Date(searchParams.get('from')!) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    searchParams.get('to') ? new Date(searchParams.get('to')!) : null
  );

  // Sync filters with URL on mount and URL changes
  useEffect(() => {
    const type = searchParams.get('type') || '';
    const minPrice = searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined;
    const capacity = searchParams.get('capacity')
      ? Number(searchParams.get('capacity'))
      : undefined;
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    setFilters({ type, minPrice, maxPrice, capacity, from, to });

    // Sync local date state
    setCheckInDate(from ? new Date(from) : null);
    setCheckOutDate(to ? new Date(to) : null);
  }, [searchParams]);

  // Load amenities from API
  useEffect(() => {
    let mounted = true;
    
    const loadAmenities = async () => {
      try {
        const mod = await import('../../services/api/roomService');
        const res = await mod.getAmenities();
        const list = res.data?.amenities || [];
        if (mounted) setAvailableAmenities(list);
      } catch (error) {
        console.error('Failed to load amenities:', error);
      }
    };
    
    loadAmenities();
    
    return () => {
      mounted = false;
    };
  }, []);

  const parseCurrency = (value: string): number | undefined => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return undefined;
    try {
      return Number(digits);
    } catch {
      return undefined;
    }
  };

  const formatCurrency = (n?: number): string => {
    if (n == null) return '';
    return new Intl.NumberFormat('vi-VN').format(n);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Room type select
    if (name === 'type') {
      setFilters((prev) => ({ ...prev, type: value || '' }));
      return;
    }

    // Capacity input
    if (name === 'capacity') {
      setFilters((prev) => ({
        ...prev,
        capacity: value === '' ? undefined : Number(value),
      }));
      return;
    }

    // Price inputs: allow formatted VN style with dots
    if (name === 'minPrice' || name === 'maxPrice') {
      const parsed = parseCurrency(value);
      setFilters((prev) => ({ ...prev, [name]: parsed }));
      return;
    }

    // Fallback numeric parsing
    setFilters((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }));
  };

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Filters are applied only when user clicks "Áp dụng".
  // Debounced values are kept for UX but won't auto-submit.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build new search params
    const newParams = new URLSearchParams(searchParams);
    
    // Reset page to 1 when filters change
    newParams.set('page', '1');

    // Update search params with filter values
    if (filters.type) {
      newParams.set('type', filters.type);
    } else {
      newParams.delete('type');
    }

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      newParams.set('minPrice', String(filters.minPrice));
    } else {
      newParams.delete('minPrice');
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      newParams.set('maxPrice', String(filters.maxPrice));
    } else {
      newParams.delete('maxPrice');
    }

    if (filters.capacity !== undefined && filters.capacity > 0) {
      newParams.set('capacity', String(filters.capacity));
    } else {
      newParams.delete('capacity');
    }

    // Dates
    if (checkInDate) {
      newParams.set('from', formatDate(checkInDate));
    } else {
      newParams.delete('from');
    }

    if (checkOutDate) {
      newParams.set('to', formatDate(checkOutDate));
    } else {
      newParams.delete('to');
    }
    // Amenities
    if (selectedAmenities.length > 0) {
      newParams.set('amenities', selectedAmenities.join(','));
    } else {
      newParams.delete('amenities');
    }

    setSearchParams(newParams);
    onFilterChange?.({
      ...filters,
      from: checkInDate ? formatDate(checkInDate) : undefined,
      to: checkOutDate ? formatDate(checkOutDate) : undefined,
      // include amenities
      ...(selectedAmenities.length > 0 ? { amenities: selectedAmenities.join(',') } : {}),
    });
  };

  const handleReset = () => {
    setFilters({
      type: '',
      minPrice: undefined,
      maxPrice: undefined,
      capacity: undefined,
      from: undefined,
      to: undefined,
    });

    setCheckInDate(null);
    setCheckOutDate(null);
    setSelectedAmenities([]);

    // Reset URL params but keep the base /rooms path
    setSearchParams({});
    onFilterChange?.({});
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenity)) return prev.filter((a) => a !== amenity);
      return [...prev, amenity];
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {t('rooms.filter')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Type */}
        <div>
          <label 
            htmlFor="type" 
            className="block text-sm font-medium 
              text-gray-700 dark:text-gray-200 mb-1"
          >
            {t('rooms.roomType')}
          </label>
          <select
            id="type"
            name="type"
            value={filters.type || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
              bg-white text-gray-900 focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:border-transparent
              dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          >
            <option value="">{t('rooms.allRooms')}</option>
            <option value="Standard Room">Standard Room</option>
            <option value="Superior Room">Superior Room</option>
            <option value="Deluxe Room">Deluxe Room</option>
            <option value="Executive Room">Executive Room</option>
            <option value="Junior Suite">Junior Suite</option>
            <option value="Suite">Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
            <option value="Family Room">Family Room</option>
            <option value="Twin Room">Twin Room</option>
            <option value="Double Room">Double Room</option>
            <option value="Accessible Room">Accessible Room</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="from"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              {t('rooms.checkIn')}
            </label>
            <DatePicker
              selected={checkInDate}
              onChange={(date: Date | null) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date()}
              dateFormat="dd/MM"
              placeholderText=""
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100
                dark:border-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              {t('rooms.checkOut')}
            </label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date: Date | null) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || new Date()}
              dateFormat="dd/MM"
              placeholderText=""
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100
                dark:border-gray-600"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium 
                text-gray-700 dark:text-gray-200 mb-1"
            >
              {t('rooms.minPrice')}
            </label>
            <input
              type="text"
              id="minPrice"
              name="minPrice"
              value={
                filters.minPrice != null
                  ? formatCurrency(filters.minPrice)
                  : ''
              }
              onChange={handleInputChange}
              placeholder="0"
              inputMode="numeric"
              pattern="[0-9.]*"
              className="w-full px-4 py-2 border 
                border-gray-300 rounded-lg bg-white text-gray-900
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium 
                text-gray-700 mb-1"
            >
              {t('rooms.maxPrice')}
            </label>
            <input
              type="text"
              id="maxPrice"
              name="maxPrice"
              value={
                filters.maxPrice != null
                  ? formatCurrency(filters.maxPrice)
                  : ''
              }
              onChange={handleInputChange}
              placeholder="10.000.000"
              inputMode="numeric"
              pattern="[0-9.]*"
              className="w-full px-4 py-2 border 
                border-gray-300 rounded-lg bg-white text-gray-900
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium 
              text-gray-700 dark:text-gray-200 mb-1"
          >
            {t('rooms.capacity')}
          </label>
          <select
            id="capacity"
            name="capacity"
            value={filters.capacity ?? ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          >
            <option value="">{t('rooms.all')}</option>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>{v} {t('rooms.people')}</option>
            ))}
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('rooms.amenities')}
          </label>
          {availableAmenities.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('rooms.loadingAmenities')}</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-40 overflow-auto pr-2">
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 text-sm w-full"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 text-blue-600 bg-white border-gray-300 rounded
                      dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-200">{amenity}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white 
              py-2 px-4 rounded-lg hover:bg-blue-700 
              transition-colors font-medium"
          >
            {t('common.apply')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-700 
              py-2 px-4 rounded-lg hover:bg-gray-300 
              transition-colors font-medium dark:bg-gray-700 dark:text-gray-200
              dark:hover:bg-gray-600"
          >
            {t('common.reset')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomFilter;

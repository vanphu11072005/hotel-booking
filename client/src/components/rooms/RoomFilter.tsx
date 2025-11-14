import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSearchParams } from 'react-router-dom';
// no debounce needed when apply-on-submit is used

interface RoomFilterProps {
  onFilterChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  from?: string;
  to?: string;
}

const RoomFilter: React.FC<RoomFilterProps> = ({ onFilterChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  // no debounce needed — apply on submit

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
    import('../../services/api/roomService').then((mod) => {
      mod.getAmenities().then((res) => {
        const list = res.data?.amenities || [];
        if (mounted) setAvailableAmenities(list.slice(0, 10));
      }).catch(() => {});
    });
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

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Bộ lọc phòng
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Type */}
        <div>
          <label 
            htmlFor="type" 
            className="block text-sm font-medium 
              text-gray-700 mb-1"
          >
            Loại phòng
          </label>
          <select
            id="type"
            name="type"
            value={filters.type || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 
              rounded-lg focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
          >
            <option value="">Tất cả loại phòng</option>
            <option value="Standard Single">Standard Single</option>
            <option value="Standard Double">Standard Double</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Family Suite">Family Suite</option>
            <option value="Presidential">Presidential</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="from"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày nhận phòng
            </label>
            <DatePicker
              selected={checkInDate}
              onChange={(date: Date | null) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày nhận"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày trả phòng
            </label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date: Date | null) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày trả"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium 
                text-gray-700 mb-1"
            >
              Giá tối thiểu
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
                border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 
                focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium 
                text-gray-700 mb-1"
            >
              Giá tối đa
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
                border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 
                focus:border-transparent"
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium 
              text-gray-700 mb-1"
          >
            Số người
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={filters.capacity || ''}
            onChange={handleInputChange}
            placeholder="1"
            min="1"
            max="10"
            className="w-full px-4 py-2 border 
              border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiện ích
          </label>
          {availableAmenities.length === 0 ? (
            <div className="text-sm text-gray-500">Đang tải tiện ích...</div>
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
                    className="h-4 w-4"
                  />
                  <span className="text-gray-700">{amenity}</span>
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
            Áp dụng
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-700 
              py-2 px-4 rounded-lg hover:bg-gray-300 
              transition-colors font-medium"
          >
            Đặt lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomFilter;

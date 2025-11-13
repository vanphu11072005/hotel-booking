import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';

interface RoomFilterProps {
  onFilterChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
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
  });

  // Debounce price inputs to avoid excessive API calls
  const debouncedMinPrice = useDebounce(
    filters.minPrice, 
    800
  );
  const debouncedMaxPrice = useDebounce(
    filters.maxPrice, 
    800
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

    setFilters({ type, minPrice, maxPrice, capacity });
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : 
        name === 'type' ? value : Number(value),
    }));
  };

  // Auto-submit when debounced prices change
  useEffect(() => {
    if (
      debouncedMinPrice !== undefined || 
      debouncedMaxPrice !== undefined
    ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');

      if (filters.type) {
        newParams.set('type', filters.type);
      } else {
        newParams.delete('type');
      }

      if (
        debouncedMinPrice !== undefined && 
        debouncedMinPrice > 0
      ) {
        newParams.set('minPrice', String(debouncedMinPrice));
      } else {
        newParams.delete('minPrice');
      }

      if (
        debouncedMaxPrice !== undefined && 
        debouncedMaxPrice > 0
      ) {
        newParams.set('maxPrice', String(debouncedMaxPrice));
      } else {
        newParams.delete('maxPrice');
      }

      if (
        filters.capacity !== undefined && 
        filters.capacity > 0
      ) {
        newParams.set('capacity', String(filters.capacity));
      } else {
        newParams.delete('capacity');
      }

      setSearchParams(newParams);
      onFilterChange?.({
        ...filters,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
      });
    }
  }, [debouncedMinPrice, debouncedMaxPrice]);

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

    setSearchParams(newParams);
    onFilterChange?.(filters);
  };

  const handleReset = () => {
    setFilters({
      type: '',
      minPrice: undefined,
      maxPrice: undefined,
      capacity: undefined,
    });

    // Reset URL params but keep the base /rooms path
    setSearchParams({});
    onFilterChange?.({});
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

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium 
                text-gray-700 mb-1"
            >
              Giá tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice || ''}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="100000"
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
              Giá tối đa (VNĐ)
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice || ''}
              onChange={handleInputChange}
              placeholder="10,000,000"
              min="0"
              step="100000"
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

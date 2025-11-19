import React, { useState, useEffect } from 'react';
import { 
  Search,
  AlertCircle,
} from 'lucide-react';
import { serviceService } from '../services/api';
import type { Service } from '../services/api/serviceService';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = 
    useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = 
    useState<string>('all');

  // Fetch all services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await serviceService.getServices({
          status: 'active',
        });

        if (
          response.success || 
          response.status === 'success'
        ) {
          setServices(response.data.services || []);
          setFilteredServices(response.data.services || []);
        }
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(
          err.response?.data?.message ||
            'Không thể tải danh sách dịch vụ'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get unique categories
  const categories = [
    'all',
    ...Array.from(
      new Set(
        services
          .map((s) => s.category)
          .filter(Boolean) as string[]
      )
    ),
  ];

  // Filter services
  useEffect(() => {
    let filtered = [...services];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (s) => s.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchQuery]);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Ăn uống':
        return '🍽️';
      case 'Giặt ủi':
        return '👔';
      case 'Spa & Sức khỏe':
        return '💆';
      case 'Vận chuyển':
        return '🚗';
      case 'Tiện ích phòng':
        return '🛎️';
      default:
        return '✨';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 
            className="text-4xl font-bold text-gray-900 
              mb-2"
          >
            Dịch vụ của khách sạn
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá các dịch vụ đẳng cấp 
            tại khách sạn của chúng tôi
          </p>
        </div>

        {/* Search and Filter */}
        <div 
          className="bg-white rounded-lg shadow-sm 
            p-6 mb-8"
        >
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              gap-4"
          >
            {/* Search Input */}
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 
                  -translate-y-1/2 text-gray-400 
                  w-5 h-5" 
              />
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchQuery}
                onChange={(e) => 
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 
                  border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-indigo-500 
                  focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => 
                  setSelectedCategory(e.target.value)
                }
                className="w-full px-4 py-3 
                  border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-indigo-500 
                  focus:border-transparent"
              >
                <option value="all">
                  Tất cả danh mục
                </option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((category) => (
                    <option 
                      key={category} 
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Tìm thấy{' '}
            <span className="font-semibold">
              {filteredServices.length}
            </span>{' '}
            dịch vụ
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-sm 
                  p-6 animate-pulse"
              >
                <div 
                  className="w-12 h-12 bg-gray-200 
                    rounded-full mb-4"
                />
                <div 
                  className="h-4 bg-gray-200 rounded 
                    mb-2 w-3/4"
                />
                <div 
                  className="h-3 bg-gray-200 rounded 
                    mb-3 w-full"
                />
                <div 
                  className="h-6 bg-gray-200 rounded 
                    w-1/2"
                />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div 
            className="bg-red-50 border border-red-200 
              rounded-lg p-6 text-center"
          >
            <AlertCircle 
              className="w-12 h-12 text-red-500 
                mx-auto mb-3" 
            />
            <p className="text-red-700 font-medium">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 
                text-white rounded-lg 
                hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && !error && (
          <>
            {filteredServices.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 
                  lg:grid-cols-3 gap-6"
              >
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg 
                      shadow-sm hover:shadow-md 
                      transition-shadow p-6 
                      border border-gray-100"
                  >
                    {/* Service Icon */}
                    <div 
                      className="w-16 h-16 bg-indigo-100 
                        rounded-full flex items-center 
                        justify-center mb-4"
                    >
                      <span className="text-3xl">
                        {getCategoryIcon(service.category)}
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 
                      className="text-xl font-semibold 
                        text-gray-900 mb-2"
                    >
                      {service.name}
                    </h3>

                    {/* Service Description */}
                    {service.description && (
                      <p 
                        className="text-sm text-gray-600 
                          mb-4"
                      >
                        {service.description}
                      </p>
                    )}

                    {/* Service Price */}
                    <div 
                      className="flex items-baseline 
                        gap-1 mb-3"
                    >
                      <span 
                        className="text-2xl font-bold 
                          text-indigo-600"
                      >
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(service.price)}
                      </span>
                      {service.unit && (
                        <span 
                          className="text-sm 
                            text-gray-500"
                        >
                          /{service.unit}
                        </span>
                      )}
                    </div>

                    {/* Service Category */}
                    {service.category && (
                      <div>
                        <span 
                          className="inline-block px-3 
                            py-1 text-xs font-medium 
                            rounded-full bg-indigo-100 
                            text-indigo-700"
                        >
                          {service.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="bg-gray-100 rounded-lg 
                  p-12 text-center"
              >
                <p className="text-gray-600 text-lg">
                  {searchQuery || 
                   selectedCategory !== 'all'
                    ? 'Không tìm thấy dịch vụ phù hợp'
                    : 'Hiện chưa có dịch vụ nào'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;

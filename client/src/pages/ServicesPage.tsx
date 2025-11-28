import React, { useState, useEffect } from 'react';
import { 
  Search,
  AlertCircle,
} from 'lucide-react';
import { serviceService } from '../services/api';
import type { Service } from '../types/service';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in">
            ✨ Dịch Vụ Đẳng Cấp ✨
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
            Trải nghiệm những dịch vụ cao cấp được thiết kế đặc biệt cho sự thoải mái của bạn
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">

        {/* Search and Filter */}
        <div 
          className="bg-white rounded-2xl shadow-xl 
            p-8 mb-10 border border-indigo-100 backdrop-blur-sm"
        >
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              gap-6"
          >
            {/* Search Input */}
            <div className="relative group">
              <Search 
                className="absolute left-4 top-1/2 
                  -translate-y-1/2 text-indigo-400 
                  w-5 h-5 group-hover:text-indigo-600 transition-colors" 
              />
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ mong muốn..."
                value={searchQuery}
                onChange={(e) => 
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-12 pr-4 py-4 
                  border-2 border-indigo-200 rounded-xl 
                  focus:ring-4 focus:ring-indigo-200 
                  focus:border-indigo-500 transition-all
                  text-gray-900 placeholder-gray-400
                  hover:border-indigo-300"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => 
                  setSelectedCategory(e.target.value)
                }
                className="w-full px-4 py-4 
                  border-2 border-indigo-200 rounded-xl 
                  focus:ring-4 focus:ring-indigo-200 
                  focus:border-indigo-500 transition-all
                  text-gray-900 font-medium
                  hover:border-indigo-300 cursor-pointer
                  appearance-none bg-white"
              >
                <option value="all">
                  🏨 Tất cả danh mục
                </option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((category) => (
                    <option 
                      key={category} 
                      value={category}
                    >
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg py-3 px-4">
            <span className="text-gray-600">Tìm thấy</span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {filteredServices.length}
            </span>
            <span className="text-gray-600">dịch vụ tuyệt vời</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-8"
          >
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg 
                  p-8 animate-pulse border border-gray-100"
              >
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100
                    rounded-full mb-6"
                />
                <div 
                  className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg
                    mb-4 w-3/4"
                />
                <div 
                  className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded 
                    mb-2 w-full"
                />
                <div 
                  className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded 
                    mb-4 w-5/6"
                />
                <div 
                  className="h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg
                    w-2/3"
                />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div 
            className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 
              rounded-2xl p-12 text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <AlertCircle 
                className="w-12 h-12 text-red-500" 
              />
            </div>
            <p className="text-red-700 font-bold text-xl mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600
                text-white rounded-xl font-bold
                hover:from-red-700 hover:to-pink-700 
                transition-all duration-300
                shadow-lg hover:shadow-xl
                transform hover:-translate-y-1"
            >
              🔄 Thử lại
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && !error && (
          <>
            {filteredServices.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 
                  lg:grid-cols-3 gap-8"
              >
                {filteredServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="group bg-white rounded-2xl 
                      shadow-lg hover:shadow-2xl 
                      transition-all duration-300 p-8 
                      border border-gray-100
                      hover:border-indigo-200
                      hover:-translate-y-2
                      relative overflow-hidden
                      animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      {/* Service Icon */}
                      <div 
                        className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100
                          rounded-2xl flex items-center 
                          justify-center mb-5
                          group-hover:scale-110 group-hover:rotate-6
                          transition-transform duration-300
                          shadow-md"
                      >
                        <span className="text-4xl">
                          {getCategoryIcon(service.category)}
                        </span>
                      </div>

                      {/* Service Name */}
                      <h3 
                        className="text-2xl font-bold 
                          text-gray-900 mb-3
                          group-hover:text-transparent
                          group-hover:bg-clip-text
                          group-hover:bg-gradient-to-r
                          group-hover:from-indigo-600
                          group-hover:to-purple-600
                          transition-all duration-300"
                      >
                        {service.name}
                      </h3>

                      {/* Service Description */}
                      {service.description && (
                        <p 
                          className="text-gray-600 
                            mb-5 leading-relaxed
                            line-clamp-2"
                        >
                          {service.description}
                        </p>
                      )}

                      {/* Service Price */}
                      <div 
                        className="flex items-baseline 
                          gap-2 mb-4 bg-gradient-to-r from-indigo-50 to-purple-50
                          rounded-xl p-4 -mx-2"
                      >
                        <span 
                          className="text-3xl font-extrabold 
                            text-transparent bg-clip-text
                            bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(service.price)}
                        </span>
                        {service.unit && (
                          <span 
                            className="text-sm font-medium
                              text-gray-500"
                          >
                            /{service.unit}
                          </span>
                        )}
                      </div>

                      {/* Service Category */}
                      {service.category && (
                        <div className="flex items-center justify-between">
                          <span 
                            className="inline-flex items-center gap-1.5 px-4 
                              py-2 text-sm font-bold 
                              rounded-full bg-gradient-to-r from-indigo-500 to-purple-500
                              text-white shadow-md
                              group-hover:shadow-lg
                              transition-shadow"
                          >
                            <span>{getCategoryIcon(service.category)}</span>
                            <span>{service.category}</span>
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-indigo-600 font-semibold text-sm">
                              Xem chi tiết →
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl 
                  p-16 text-center shadow-lg border-2 border-dashed border-indigo-200"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-5xl">🔍</span>
                </div>
                <p className="text-gray-700 text-xl font-semibold mb-2">
                  {searchQuery || 
                   selectedCategory !== 'all'
                    ? 'Không tìm thấy dịch vụ phù hợp'
                    : 'Hiện chưa có dịch vụ nào'}
                </p>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác'
                    : 'Các dịch vụ sẽ sớm được cập nhật'}
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

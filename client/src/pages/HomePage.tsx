import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  AlertCircle,
  Home,
  DollarSign,
  Headphones,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Coffee,
  Truck,
  Heart,
} from 'lucide-react';
import {
  BannerCarousel,
  BannerSkeleton,
  RoomTypeCard,
  RoomCardSkeleton,
  SearchRoomForm,
} from '../components/rooms';
import useRoomStore from '../store/useRoomStore';
import useBannerStore from '../store/useBannerStore';
import useServiceStore from '../store/useServiceStore';

const HomePage: React.FC = () => {
  const { banners, fetchBannersByPosition, isLoading: isLoadingBanners } = useBannerStore();
  const [featuredRoomTypes, setFeaturedRoomTypes] = useState<any[]>([]);
  const [newestRoomTypes, setNewestRoomTypes] = useState<any[]>([]);
  const { roomTypes, fetchRoomTypes, isLoading: isLoadingRoomTypes, error: roomError } = useRoomStore();
  const { services, isLoading: isLoadingServices, fetchServices } = useServiceStore();

  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingNewest, setIsLoadingNewest] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch banners via store
  useEffect(() => {
    fetchBannersByPosition('home');
  }, [fetchBannersByPosition]);

  // Fetch room types from store (used for featured and newest lists)
  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  // Derive featured room types when store updates
  useEffect(() => {
    setIsLoadingRooms(isLoadingRoomTypes);
    if (roomTypes && roomTypes.length > 0) {
      const types = roomTypes.filter((t: any) => !!t.featured);
      setFeaturedRoomTypes(types.slice(0, 6));
    } else {
      setFeaturedRoomTypes([]);
    }
    if (roomError) setError(roomError);
  }, [roomTypes, isLoadingRoomTypes, roomError]);

  // Derive newest room types when store updates
  useEffect(() => {
    setIsLoadingNewest(isLoadingRoomTypes);
    if (roomTypes && roomTypes.length > 0) {
      const sorted = [...roomTypes].sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setNewestRoomTypes(sorted.slice(0, 6));
    } else {
      setNewestRoomTypes([]);
    }
  }, [roomTypes, isLoadingRoomTypes]);

  // Fetch services via store
  useEffect(() => {
    fetchServices({ status: 'active', limit: 8 });
  }, [fetchServices]);

  return (
    <div className="min-h-screen bg-gradient-to-br 
      from-indigo-50 via-white to-purple-50">
      {/* Banner Section */}
      <section className="container mx-auto px-4 pb-8">
        {isLoadingBanners ? (
          <BannerSkeleton />
        ) : (
          <BannerCarousel banners={banners} />
        )}
      </section>

      {/* Search Section with Gradient Background */}
      <section 
        className="container mx-auto px-4 py-8 mb-8"
      >
        <div 
          className="bg-gradient-to-r from-indigo-600 
            to-purple-600 rounded-2xl shadow-2xl p-8 
            relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 
              bg-white opacity-10 rounded-full 
              -translate-y-32 translate-x-32"
          />
          <div 
            className="absolute bottom-0 left-0 w-48 h-48 
              bg-white opacity-10 rounded-full 
              translate-y-24 -translate-x-24"
          />
          
          <div className="relative z-10">
            <SearchRoomForm />
          </div>
        </div>
      </section>

      {/* Featured Room Types Section */}
      <section className="container mx-auto px-4 py-12">
        {/* Section Header with Gradient */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-2 h-12 bg-gradient-to-b 
                from-indigo-600 to-purple-600 
                rounded-full"
            />
            <div>
              <h2 
                className="text-4xl font-bold 
                  bg-gradient-to-r from-indigo-600 
                  to-purple-600 bg-clip-text 
                  text-transparent 
                  leading-tight pb-1"
              >
                Phòng nổi bật
              </h2>
            </div>
          </div>

          <Link
            to="/rooms"
            className="hidden md:flex items-center gap-2 
              text-indigo-600 hover:text-indigo-700 
              font-semibold transition-colors"
          >
            Xem tất cả phòng
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Loading State */}
            {isLoadingRooms && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6"
          >
                {[...Array(6)].map((_, index) => (
                  <RoomCardSkeleton key={index} />
                ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoadingRooms && (
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

        {/* Rooms Grid */}
            {!isLoadingRooms && !error && (
          <>
              {featuredRoomTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredRoomTypes.map((rt: any) => (
                    <RoomTypeCard key={rt.id} roomType={rt} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <p className="text-gray-600 text-lg">Hiện chưa có phòng nổi bật</p>
                </div>
              )}

            {/* View All Button (Mobile) */}
            {featuredRoomTypes.length > 0 && (
              <div className="mt-8 text-center md:hidden">
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 
                    bg-indigo-600 text-white px-6 py-3 
                    rounded-lg hover:bg-indigo-700 
                    transition-colors font-semibold"
                >
                  Xem tất cả phòng
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newest Rooms Section */}
      <section 
        className="container mx-auto px-4 py-12 
          bg-gradient-to-br from-blue-50 to-cyan-50 
          rounded-3xl"
      >
        {/* Section Header with Gradient */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-2 h-12 bg-gradient-to-b 
                from-blue-600 to-cyan-600 
                rounded-full"
            />
            <div>
              <h2 
                className="text-4xl font-bold 
                  bg-gradient-to-r from-blue-600 
                  to-cyan-600 bg-clip-text 
                  text-transparent 
                  leading-tight pb-1"
              >
                Phòng mới nhất
              </h2>
            </div>
          </div>

          <Link
            to="/rooms"
            className="hidden md:flex items-center gap-2 
              text-indigo-600 hover:text-indigo-700 
              font-semibold transition-colors"
          >
            Xem tất cả phòng
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoadingNewest && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <RoomCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Rooms Grid */}
        {!isLoadingNewest && (
          <>
            {newestRoomTypes.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 
                  lg:grid-cols-3 gap-6"
              >
                {newestRoomTypes.map((room) => (
                  <RoomTypeCard key={room.id} roomType={room} />
                ))}
              </div>
            ) : (
              <div 
                className="bg-gray-100 rounded-lg 
                  p-12 text-center"
              >
                <p className="text-gray-600 text-lg">
                  Hiện chưa có phòng mới
                </p>
              </div>
            )}

            {/* View All Button (Mobile) */}
            {newestRoomTypes.length > 0 && (
              <div className="mt-8 text-center md:hidden">
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 
                    bg-indigo-600 text-white px-6 py-3 
                    rounded-lg hover:bg-indigo-700 
                    transition-colors font-semibold"
                >
                  Xem tất cả phòng
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Services Section */}
      <section 
        className="container mx-auto px-4 py-16 
          bg-gradient-to-br from-purple-50 
          via-pink-50 to-orange-50 rounded-3xl"
      >
        {/* Section Header with Animation */}
        <div className="mb-12 text-center">
          <div 
            className="inline-block mb-4 px-4 py-2 
              bg-gradient-to-r from-purple-600 
              to-pink-600 rounded-full text-white 
              text-sm font-semibold"
          >
            🎯 Dịch vụ cao cấp
          </div>
          <h2 
            className="text-5xl font-bold 
              bg-gradient-to-r from-purple-600 
              via-pink-600 to-orange-600 
              bg-clip-text text-transparent mb-4 
              leading-tight pb-1"
          >
            Dịch vụ của khách sạn
          </h2>
          <p 
            className="text-gray-600 max-w-2xl mx-auto 
              text-lg"
          >
            Trải nghiệm các dịch vụ đẳng cấp 
            tại khách sạn của chúng tôi
          </p>
        </div>

        {/* Loading State */}
        {isLoadingServices && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, index) => (
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

        {/* Services Grid */}
        {!isLoadingServices && services.length > 0 && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-4 gap-6"
          >
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm 
                  hover:shadow-md transition-shadow 
                  p-6 border border-gray-100 text-center"
              >
                {/* Service Icon with Gradient */}
                <div 
                  className="w-14 h-14 bg-gradient-to-br 
                    from-purple-500 to-pink-500 
                    rounded-2xl flex items-center 
                    justify-center mb-4 shadow-lg 
                    transform transition-transform 
                    hover:scale-110 hover:rotate-6 mx-auto"
                >
                  <span className="text-2xl">
                    {service.category === 'Ăn uống' ? (
                      <Coffee className="w-6 h-6" />
                    ) : service.category === 'Giặt ủi' ? (
                      <ShoppingBag className="w-6 h-6" />
                    ) : service.category === 'Spa & Sức khỏe' ? (
                      <Heart className="w-6 h-6" />
                    ) : service.category === 'Vận chuyển' ? (
                      <Truck className="w-6 h-6" />
                    ) : (
                      <Home className="w-6 h-6" />
                    )}
                  </span>
                </div>

                {/* Service Name */}
                <h3 
                  className="text-lg font-semibold 
                    text-gray-900 mb-2"
                >
                  {service.name}
                </h3>

                {/* Service Description */}
                {service.description && (
                  <p 
                    className="text-sm text-gray-600 
                      mb-3 line-clamp-2"
                  >
                    {service.description}
                  </p>
                )}

                {/* Service Price with Gradient */}
                <div className="flex items-baseline gap-1 justify-center">
                  <span 
                    className="text-xl font-bold 
                      bg-gradient-to-r from-purple-600 
                      to-pink-600 bg-clip-text 
                      text-transparent"
                  >
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(service.price)}
                  </span>
                  {service.unit && (
                    <span className="text-sm text-gray-500">
                      /{service.unit}
                    </span>
                  )}
                </div>

                {/* Service Category with Gradient Badge */}
                {service.category && (
                  <div className="mt-3">
                    <span 
                      className="inline-block px-3 py-1 
                        text-xs font-semibold rounded-full 
                        bg-gradient-to-r from-purple-100 
                        to-pink-100 text-purple-700"
                    >
                      {service.category}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Services */}
        {!isLoadingServices && services.length === 0 && (
          <div 
            className="bg-gray-100 rounded-lg 
              p-12 text-center"
          >
            <p className="text-gray-600 text-lg">
              Hiện chưa có dịch vụ nào
            </p>
          </div>
        )}

        {/* View All Button with Gradient */}
        {!isLoadingServices && services.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 
                bg-gradient-to-r from-purple-600 
                to-pink-600 text-white px-8 py-4 
                rounded-full hover:shadow-2xl 
                hover:scale-105 transition-all 
                font-bold text-lg"
            >
              Xem tất cả dịch vụ
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </section>

      {/* Nearby Locations Section */}
      <section 
        className="container mx-auto px-4 py-16 
          bg-gradient-to-br from-green-50 
          via-teal-50 to-blue-50 rounded-3xl"
      >
        {/* Section Header with Gradient */}
        <div className="mb-12 text-center">
          <div 
            className="inline-block mb-4 px-4 py-2 
              bg-gradient-to-r from-green-600 
              to-teal-600 rounded-full text-white 
              text-sm font-semibold"
          >
            📍 Vị trí thuận lợi
          </div>
          <h2 
            className="text-5xl font-bold 
              bg-gradient-to-r from-green-600 
              via-teal-600 to-blue-600 
              bg-clip-text text-transparent mb-4 
              leading-tight pb-1"
          >
            Địa điểm gần khách sạn
          </h2>
          <p 
            className="text-gray-600 max-w-2xl mx-auto 
              text-lg"
          >
            Khám phá những địa điểm nổi tiếng 
            xung quanh khách sạn
          </p>
        </div>

        {/* Locations Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 
            lg:grid-cols-3 gap-6"
        >
          {/* Beach */}
          <div 
            className="bg-white rounded-2xl shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              p-6 border-2 border-transparent 
              hover:border-blue-300 
              flex items-start gap-4 group"
          >
            <div 
              className="flex-shrink-0 w-14 h-14 
                bg-gradient-to-br from-blue-400 
                to-cyan-400 rounded-2xl 
                flex items-center justify-center 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-bold 
                  bg-gradient-to-r from-blue-700 
                  to-cyan-700 bg-clip-text 
                  text-transparent mb-1 
                  leading-snug pb-0.5"
              >
                Biển Mỹ Khê
              </h3>
              <p className="text-sm font-medium text-gray-600">
                300m từ khách sạn
              </p>
            </div>
          </div>

          {/* Night Market */}
          <div
            className="bg-white rounded-2xl shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              p-6 border-2 border-transparent 
              hover:border-purple-300 
              flex items-start gap-4 group"
          >
            <div 
              className="flex-shrink-0 w-14 h-14 
                bg-gradient-to-br from-purple-400 
                to-pink-400 rounded-2xl 
                flex items-center justify-center 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-bold 
                  bg-gradient-to-r from-purple-700 
                  to-pink-700 bg-clip-text 
                  text-transparent mb-1 
                  leading-snug pb-0.5"
              >
                Chợ đêm Sơn Trà
              </h3>
              <p className="text-sm font-medium text-gray-600">
                5 phút đi bộ
              </p>
            </div>
          </div>

          {/* Shopping Mall */}
          <div
            className="bg-white rounded-2xl shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              p-6 border-2 border-transparent 
              hover:border-green-300 
              flex items-start gap-4 group"
          >
            <div 
              className="flex-shrink-0 w-14 h-14 
                bg-gradient-to-br from-green-400 
                to-teal-400 rounded-2xl 
                flex items-center justify-center 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-bold 
                  bg-gradient-to-r from-green-700 
                  to-teal-700 bg-clip-text 
                  text-transparent mb-1 
                  leading-snug pb-0.5"
              >
                Vincom Plaza
              </h3>
              <p className="text-sm font-medium text-gray-600">
                1.2km
              </p>
            </div>
          </div>

          {/* Dragon Bridge */}
          <div
            className="bg-white rounded-2xl shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              p-6 border-2 border-transparent 
              hover:border-orange-300 
              flex items-start gap-4 group"
          >
            <div 
              className="flex-shrink-0 w-14 h-14 
                bg-gradient-to-br from-orange-400 
                to-red-400 rounded-2xl 
                flex items-center justify-center 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-bold 
                  bg-gradient-to-r from-orange-700 
                  to-red-700 bg-clip-text 
                  text-transparent mb-1 
                  leading-snug pb-0.5"
              >
                Cầu Rồng
              </h3>
              <p className="text-sm font-medium text-gray-600">
                2km
              </p>
            </div>
          </div>

          {/* Sun Wheel */}
          <div
            className="bg-white rounded-2xl shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              p-6 border-2 border-transparent 
              hover:border-pink-300 
              flex items-start gap-4 group"
          >
            <div 
              className="flex-shrink-0 w-14 h-14 
                bg-gradient-to-br from-pink-400 
                to-rose-400 rounded-2xl 
                flex items-center justify-center 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-bold 
                  bg-gradient-to-r from-pink-700 
                  to-rose-700 bg-clip-text 
                  text-transparent mb-1 
                  leading-snug pb-0.5"
              >
                Sun Wheel
              </h3>
              <p className="text-sm font-medium text-gray-600">
                3.5km
              </p>
            </div>
          </div>

          {/* Airport */}
          <div
            className="bg-white rounded-2xl shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              p-6 border-2 border-transparent 
              hover:border-indigo-300 
              flex items-start gap-4 group"
          >
            <div 
              className="flex-shrink-0 w-14 h-14 
                bg-gradient-to-br from-indigo-400 
                to-blue-400 rounded-2xl 
                flex items-center justify-center 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-bold 
                  bg-gradient-to-r from-indigo-700 
                  to-blue-700 bg-clip-text 
                  text-transparent mb-1 
                  leading-snug pb-0.5"
              >
                Sân bay Đà Nẵng
              </h3>
              <p className="text-sm font-medium text-gray-600">
                10 phút đi xe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="container mx-auto px-4 py-16 
          bg-gradient-to-br from-slate-50 
          via-gray-50 to-zinc-50 rounded-3xl"
      >
        <div className="text-center mb-12">
          <div 
            className="inline-block mb-4 px-4 py-2 
              bg-gradient-to-r from-indigo-600 
              to-purple-600 rounded-full text-white 
              text-sm font-semibold"
          >
            ✨ Tại sao chọn chúng tôi
          </div>
          <h2 
            className="text-4xl font-bold 
              bg-gradient-to-r from-slate-700 
              to-gray-900 bg-clip-text 
              text-transparent 
              leading-tight pb-2"
          >
            Lợi ích khi đặt phòng
          </h2>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-3 
            gap-8"
        >
          <div 
            className="text-center bg-white 
              rounded-2xl p-8 shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              border-2 border-transparent 
              hover:border-indigo-200 group"
          >
              <div 
                className="w-20 h-20 bg-gradient-to-br 
                from-indigo-400 to-purple-400 
                rounded-2xl flex items-center 
                justify-center mx-auto mb-6 
                shadow-lg group-hover:rotate-12 
                transition-transform"
              >
                <Home className="w-10 h-10 text-white" />
              </div>
            <h3 
              className="text-2xl font-bold mb-3 
                bg-gradient-to-r from-indigo-700 
                to-purple-700 bg-clip-text 
                text-transparent 
                leading-snug pb-0.5"
            >
              Đặt phòng dễ dàng
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Tìm kiếm và đặt phòng chỉ với vài cú click
            </p>
          </div>

          <div 
            className="text-center bg-white 
              rounded-2xl p-8 shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              border-2 border-transparent 
              hover:border-green-200 group"
          >
            <div 
              className="w-20 h-20 bg-gradient-to-br 
                from-green-400 to-emerald-400 
                rounded-2xl flex items-center 
                justify-center mx-auto mb-6 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold mb-3 
                bg-gradient-to-r from-green-700 
                to-emerald-700 bg-clip-text 
                text-transparent 
                leading-snug pb-0.5"
            >
              Giá tốt nhất
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Cam kết giá tốt nhất thị trường
            </p>
          </div>

          <div 
            className="text-center bg-white 
              rounded-2xl p-8 shadow-lg 
              hover:shadow-2xl hover:scale-105 
              transition-all duration-300 
              border-2 border-transparent 
              hover:border-blue-200 group"
          >
            <div 
              className="w-20 h-20 bg-gradient-to-br 
                from-blue-400 to-cyan-400 
                rounded-2xl flex items-center 
                justify-center mx-auto mb-6 
                shadow-lg group-hover:rotate-12 
                transition-transform"
            >
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold mb-3 
                bg-gradient-to-r from-blue-700 
                to-cyan-700 bg-clip-text 
                text-transparent 
                leading-snug pb-0.5"
            >
              Hỗ trợ 24/7
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Đội ngũ hỗ trợ luôn sẵn sàng phục vụ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

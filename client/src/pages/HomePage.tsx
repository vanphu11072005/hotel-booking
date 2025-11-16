import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import {
  BannerCarousel,
  BannerSkeleton,
  RoomCard,
  RoomCardSkeleton,
  SearchRoomForm,
} from '../components/rooms';
import { 
  bannerService, 
  roomService 
} from '../services/api';
import type { Banner } from '../services/api/bannerService';
import type { Room } from '../services/api/roomService';

const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [newestRooms, setNewestRooms] = useState<Room[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = 
    useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingNewest, setIsLoadingNewest] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoadingBanners(true);
        const response = await bannerService
          .getBannersByPosition('home');
        
        if (
          response.success || 
          response.status === 'success'
        ) {
          setBanners(response.data.banners || []);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        // Don't show error for banners, just use fallback
      } finally {
        setIsLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  // Fetch featured rooms
  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        setIsLoadingRooms(true);
        setError(null);
        const response = await roomService.getFeaturedRooms({
          featured: true,
          limit: 6,
        });

        if (
          response.success || 
          response.status === 'success'
        ) {
          setFeaturedRooms(response.data.rooms || []);
        }
      } catch (err: any) {
        console.error('Error fetching rooms:', err);
        setError(
          err.response?.data?.message ||
            'Không thể tải danh sách phòng'
        );
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  // Fetch newest rooms
  useEffect(() => {
    const fetchNewestRooms = async () => {
      try {
        setIsLoadingNewest(true);
        const response = await roomService.getRooms({
          page: 1,
          limit: 6,
          sort: 'newest',
        });

        if (
          response.success || 
          response.status === 'success'
        ) {
          setNewestRooms(response.data.rooms || []);
        }
      } catch (err: any) {
        console.error('Error fetching newest rooms:', err);
      } finally {
        setIsLoadingNewest(false);
      }
    };

    fetchNewestRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <section className="container mx-auto px-4 pb-8">
        {isLoadingBanners ? (
          <BannerSkeleton />
        ) : (
          <BannerCarousel banners={banners} />
        )}
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <SearchRoomForm />
      </section>

      {/* Featured Rooms Section */}
      <section className="container mx-auto px-4 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h2 
                className="text-3xl font-bold 
                  text-gray-900"
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
            {featuredRooms.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 
                  lg:grid-cols-3 gap-6"
              >
                {featuredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div 
                className="bg-gray-100 rounded-lg 
                  p-12 text-center"
              >
                <p className="text-gray-600 text-lg">
                  Hiện chưa có phòng nổi bật
                </p>
              </div>
            )}

            {/* View All Button (Mobile) */}
            {featuredRooms.length > 0 && (
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
      <section className="container mx-auto px-4 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h2 
                className="text-3xl font-bold 
                  text-gray-900"
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
            {newestRooms.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 
                  lg:grid-cols-3 gap-6"
              >
                {newestRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
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
            {newestRooms.length > 0 && (
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

      {/* Features Section */}
      <section 
        className="container mx-auto px-4 py-12 
          bg-white rounded-xl shadow-sm mx-4"
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-3 
            gap-8"
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 bg-indigo-100 
                rounded-full flex items-center 
                justify-center mx-auto mb-4"
            >
              <span className="text-3xl">🏨</span>
            </div>
            <h3 
              className="text-xl font-semibold mb-2 
                text-gray-900"
            >
              Đặt phòng dễ dàng
            </h3>
            <p className="text-gray-600">
              Tìm kiếm và đặt phòng chỉ với vài cú click
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 bg-green-100 
                rounded-full flex items-center 
                justify-center mx-auto mb-4"
            >
              <span className="text-3xl">💰</span>
            </div>
            <h3 
              className="text-xl font-semibold mb-2 
                text-gray-900"
            >
              Giá tốt nhất
            </h3>
            <p className="text-gray-600">
              Cam kết giá tốt nhất thị trường
            </p>
          </div>

          <div className="text-center">
            <div 
              className="w-16 h-16 bg-blue-100 
                rounded-full flex items-center 
                justify-center mx-auto mb-4"
            >
              <span className="text-3xl">🎧</span>
            </div>
            <h3 
              className="text-xl font-semibold mb-2 
                text-gray-900"
            >
              Hỗ trợ 24/7
            </h3>
            <p className="text-gray-600">
              Đội ngũ hỗ trợ luôn sẵn sàng phục vụ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

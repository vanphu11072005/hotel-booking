import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, AlertCircle, ArrowLeft } from 'lucide-react';
import { RoomCard, RoomCardSkeleton } from 
  '../../components/rooms';
import useFavoritesStore from 
  '../../store/useFavoritesStore';
import useAuthStore from '../../store/useAuthStore';

const FavoritesPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { 
    favorites, 
    isLoading, 
    error, 
    fetchFavorites 
  } = useFavoritesStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div 
            className="bg-yellow-50 border 
              border-yellow-200 rounded-lg 
              p-8 text-center"
          >
            <AlertCircle 
              className="w-12 h-12 text-yellow-500 
                mx-auto mb-3" 
            />
            <h3 
              className="text-xl font-bold 
                text-gray-900 mb-2"
            >
              Vui lòng đăng nhập
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để xem danh sách yêu thích
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 
                bg-indigo-600 text-white rounded-lg 
                hover:bg-indigo-700 transition-colors 
                font-semibold"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 
              text-gray-600 hover:text-gray-900 
              mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại trang chủ</span>
          </Link>

          <div className="flex items-center gap-3">
            <Heart 
              className="w-8 h-8 text-red-500" 
              fill="currentColor" 
            />
            <div>
              <h1 
                className="text-3xl font-bold 
                  text-gray-900"
              >
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length > 0
                  ? `${favorites.length} phòng`
                  : 'Chưa có phòng yêu thích'}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
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
        {error && !isLoading && (
          <div 
            className="bg-red-50 border border-red-200 
              rounded-lg p-8 text-center"
          >
            <AlertCircle 
              className="w-12 h-12 text-red-500 
                mx-auto mb-3" 
            />
            <p className="text-red-700 font-medium mb-4">
              {error}
            </p>
            <button
              onClick={fetchFavorites}
              className="px-6 py-2 bg-red-600 
                text-white rounded-lg 
                hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && 
          !error && 
          favorites.length === 0 && (
          <div 
            className="bg-white rounded-lg shadow-sm 
              p-12 text-center"
          >
            <div 
              className="w-24 h-24 bg-gray-100 
                rounded-full flex items-center 
                justify-center mx-auto mb-6"
            >
              <Heart 
                className="w-12 h-12 text-gray-400" 
              />
            </div>
            
            <h3 
              className="text-2xl font-bold 
                text-gray-900 mb-3"
            >
              Chưa có phòng yêu thích
            </h3>
            
            <p 
              className="text-gray-600 mb-6 
                max-w-md mx-auto"
            >
              Bạn chưa thêm phòng nào vào danh sách 
              yêu thích. Hãy khám phá và lưu những 
              phòng bạn thích!
            </p>

            <Link
              to="/rooms"
              className="inline-block px-6 py-3 
                bg-indigo-600 text-white rounded-lg 
                hover:bg-indigo-700 transition-colors 
                font-semibold"
            >
              Khám phá phòng
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && 
          !error && 
          favorites.length > 0 && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 
              lg:grid-cols-3 gap-6"
          >
            {favorites.map((favorite) =>
              favorite.room ? (
                <RoomCard
                  key={favorite.id}
                  room={favorite.room}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

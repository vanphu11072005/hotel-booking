import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, AlertCircle, ArrowLeft } from 'lucide-react';
import { RoomTypeCard, RoomCardSkeleton } from 
  '../../components/rooms';
import Pagination from '../../components/rooms/Pagination';
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
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // adjust page if favorites length changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [favorites.length]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div 
            className="bg-yellow-50 dark:bg-yellow-900/20 border 
              border-yellow-200 dark:border-yellow-700 rounded-lg 
              p-8 text-center"
          >
            <AlertCircle 
              className="w-12 h-12 text-yellow-500 dark:text-yellow-300
                mx-auto mb-3" 
            />
            <h3 
              className="text-xl font-bold 
                text-gray-900 dark:text-gray-100 mb-2"
            >
              Vui lòng đăng nhập
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại trang chủ</span>
          </Link>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 
                className="text-3xl font-bold 
                  text-gray-900 dark:text-gray-100"
              >
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
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
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700
              rounded-lg p-8 text-center"
          >
            <AlertCircle 
              className="w-12 h-12 text-red-500 dark:text-red-300
                mx-auto mb-3" 
            />
            <p className="text-red-700 dark:text-red-300 font-medium mb-4">
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm 
              p-12 text-center"
          >
            <div 
              className="w-24 h-24 bg-gray-100 dark:bg-gray-700 
                rounded-full flex items-center 
                justify-center mx-auto mb-6"
            >
              <Heart 
                className="w-12 h-12 text-gray-400 dark:text-gray-300" 
              />
            </div>
            
            <h3 
              className="text-2xl font-bold 
                text-gray-900 dark:text-gray-100 mb-3"
            >
              Chưa có phòng yêu thích
            </h3>
            
            <p 
              className="text-gray-600 dark:text-gray-300 mb-6 
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
        {!isLoading && !error && favorites.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites
                .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                .map((favorite) =>
                  favorite.room ? (
                    <RoomTypeCard key={favorite.id} room={favorite.room} />
                  ) : null
                )}
            </div>

            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE))}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

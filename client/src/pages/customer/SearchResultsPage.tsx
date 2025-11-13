import React, { useState, useEffect } from 'react';
import { 
  useSearchParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  AlertCircle, 
  ArrowLeft,
  Home,
  Users,
} from 'lucide-react';
import { 
  RoomCard, 
  RoomCardSkeleton,
  Pagination,
} from '../../components/rooms';
import { searchAvailableRooms } from 
  '../../services/api/roomService';
import type { Room } from '../../services/api/roomService';
import { toast } from 'react-toastify';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  // Get search params
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const type = searchParams.get('type') || '';
  const capacityParam = searchParams.get('capacity') || '';
  const capacity = capacityParam ? Number(capacityParam) : undefined;
  const pageParam = searchParams.get('page') || '';
  const page = pageParam ? Number(pageParam) : 1;

  useEffect(() => {
    // Validate required params
    if (!from || !to) {
      toast.error(
        'Thiếu thông tin tìm kiếm. ' +
        'Vui lòng chọn ngày nhận và trả phòng.'
      );
      navigate('/');
      return;
    }

    fetchAvailableRooms();
  }, [from, to, type, capacity, page]);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await searchAvailableRooms({
        from,
        to,
        type: type || undefined,
        capacity: capacity || undefined,
        page,
        limit: 12,
      });

      if (
        response.success || 
        response.status === 'success'
      ) {
        setRooms(response.data.rooms || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          // Fallback compute
          const total = response.data.rooms
            ? response.data.rooms.length
            : 0;
          const limit = 12;
          setPagination({
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          });
        }
      } else {
        throw new Error('Không thể tìm kiếm phòng');
      }
    } catch (err: any) {
      console.error('Error searching rooms:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tìm kiếm phòng trống';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 
            text-gray-600 hover:text-gray-900 
            mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại trang chủ</span>
        </Link>

        {/* Search Info Header */}
        <div 
          className="bg-white rounded-lg shadow-sm 
            p-6 mb-8"
        >
          <div className="flex items-start justify-between 
            flex-wrap gap-4"
          >
            <div>
              <h1 
                className="text-3xl font-bold 
                  text-gray-900 mb-4"
              >
                Kết quả tìm kiếm
              </h1>
              
              <div 
                className="flex flex-wrap items-center 
                  gap-4 text-gray-700"
              >
                <div 
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5 
                    text-indigo-600" 
                  />
                  <span>
                    <strong>Nhận phòng:</strong>{' '}
                    {formatDate(from)}
                  </span>
                </div>
                
                <div 
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5 
                    text-indigo-600" 
                  />
                  <span>
                    <strong>Trả phòng:</strong>{' '}
                    {formatDate(to)}
                  </span>
                </div>

                {type && (
                  <div 
                    className="flex items-center gap-2"
                  >
                    <Home className="w-5 h-5 
                      text-indigo-600" 
                    />
                    <span>
                      <strong>Loại phòng:</strong>{' '}
                      {type}
                    </span>
                  </div>
                )}
                {capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>
                      <strong>Số khách:</strong>{' '}
                      {capacity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 
                text-gray-700 rounded-lg 
                hover:bg-gray-50 transition-colors
                flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm mới
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div>
            <p 
              className="text-gray-600 mb-6 
                text-center animate-pulse"
            >
              Đang tìm kiếm phòng trống...
            </p>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 
                lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, index) => (
                <RoomCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
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
              onClick={fetchAvailableRooms}
              className="px-6 py-2 bg-red-600 
                text-white rounded-lg 
                hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {rooms.length > 0 ? (
              <>
                <div 
                  className="flex items-center 
                    justify-between mb-6"
                >
                </div>

                <div 
                  className="grid grid-cols-1 
                    md:grid-cols-2 lg:grid-cols-3 
                    gap-6"
                >
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                />
              </>
            ) : (
              // Empty State
              <div 
                className="bg-white rounded-lg 
                  shadow-sm p-12 text-center"
              >
                <div 
                  className="w-24 h-24 bg-gray-100 
                    rounded-full flex items-center 
                    justify-center mx-auto mb-6"
                >
                  <Search 
                    className="w-12 h-12 text-gray-400" 
                  />
                </div>
                
                <h3 
                  className="text-2xl font-bold 
                    text-gray-900 mb-3"
                >
                  Không tìm thấy phòng phù hợp
                </h3>
                
                <p 
                  className="text-gray-600 mb-6 
                    max-w-md mx-auto"
                >
                  Rất tiếc, không có phòng nào trống 
                  trong khoảng thời gian bạn chọn. 
                  Vui lòng thử tìm kiếm với ngày khác 
                  hoặc loại phòng khác.
                </p>

                <div 
                  className="flex flex-col sm:flex-row 
                    gap-3 justify-center"
                >
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-indigo-600 
                      text-white rounded-lg 
                      hover:bg-indigo-700 
                      transition-colors font-semibold
                      inline-flex items-center 
                      justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Tìm kiếm lại
                  </button>
                  
                  <Link
                    to="/rooms"
                    className="px-6 py-3 border 
                      border-gray-300 text-gray-700 
                      rounded-lg hover:bg-gray-50 
                      transition-colors font-semibold
                      inline-flex items-center 
                      justify-center gap-2"
                  >
                    Xem tất cả phòng
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRooms } from '../../services/api/roomService';
import type { Room } from '../../services/api/roomService';
import RoomFilter from '../../components/rooms/RoomFilter';
import RoomCard from '../../components/rooms/RoomCard';
import RoomCardSkeleton from '../../components/rooms/RoomCardSkeleton';
import Pagination from '../../components/rooms/Pagination';

const RoomListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch rooms based on URL params
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          type: searchParams.get('type') || undefined,
          minPrice: searchParams.get('minPrice')
            ? Number(searchParams.get('minPrice'))
            : undefined,
          maxPrice: searchParams.get('maxPrice')
            ? Number(searchParams.get('maxPrice'))
            : undefined,
          capacity: searchParams.get('capacity')
            ? Number(searchParams.get('capacity'))
            : undefined,
          page: searchParams.get('page')
            ? Number(searchParams.get('page'))
            : 1,
          limit: 12,
        };

        const response = await getRooms(params);

        if (response.status === 'success' && response.data) {
          setRooms(response.data.rooms || []);
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        } else {
          throw new Error('Failed to fetch rooms');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Không thể tải danh sách phòng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách phòng
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <RoomFilter />
          </aside>

          <main className="lg:col-span-3">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 
                xl:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <RoomCardSkeleton key={index} />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 
                rounded-lg p-6 text-center"
              >
                <svg
                  className="w-12 h-12 text-red-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 
                      9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 
                    text-white rounded-lg hover:bg-red-700 
                    transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && rooms.length === 0 && (
              <div className="bg-white rounded-lg shadow-md 
                p-12 text-center"
              >
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 
                      0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 
                      4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-semibold 
                  text-gray-800 mb-2"
                >
                  Không tìm thấy phòng phù hợp
                </h3>
                <p className="text-gray-600 mb-6">
                  Vui lòng thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
                <button
                  onClick={() => window.location.href = '/rooms'}
                  className="px-6 py-2 bg-blue-600 text-white 
                    rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {!loading && !error && rooms.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 
                  xl:grid-cols-3 gap-6"
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoomListPage;

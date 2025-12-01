import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getRooms, getRoomTypes } from '../../services/api/roomService';
import type { Room, RoomType } from '../../types/rooms';
import RoomFilter from '../../components/rooms/RoomFilter';
import RoomTypeCard from '../../components/rooms/RoomTypeCard';
import RoomCardSkeleton from '../../components/rooms/RoomCardSkeleton';
import Pagination from '../../components/rooms/Pagination';
import { ArrowLeft } from 'lucide-react';

const RoomListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [representativeRooms, setRepresentativeRooms] = useState<Record<number, Room | null>>({});
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

          const response = await getRoomTypes();
          if (response?.data?.room_types) {
            // simple client-side filtering
            let types = response.data.room_types as RoomType[];
            // capacity filter
            if (params.capacity) {
              types = types.filter((t) => (t.capacity || 0) >= params.capacity!);
            }
            // price filter
            if (params.minPrice) types = types.filter((t) => Number(t.base_price || 0) >= params.minPrice!);
            if (params.maxPrice) types = types.filter((t) => Number(t.base_price || 0) <= params.maxPrice!);

            const sliced = types.slice(0, params.limit || 12);
            setRoomTypes(sliced);
            setPagination({ ...pagination, total: types.length, totalPages: Math.ceil(types.length / (params.limit || 12)) });

            // Fetch one representative room per displayed room type so
            // the card can link to `/rooms/:id` (fast, small requests)
            try {
              const samples = await Promise.all(sliced.map(async (t) => {
                try {
                  const res = await getRooms({ type: String(t.id), limit: 1 });
                  const room = res?.data?.rooms?.[0] ?? null;
                  return { typeId: t.id, room };
                } catch (e) {
                  return { typeId: t.id, room: null };
                }
              }));

              const map: Record<number, Room | null> = {};
              samples.forEach((s) => { map[s.typeId] = s.room; });
              setRepresentativeRooms(map);
            } catch (e) {
              // ignore sample fetch failures, fallback to existing behavior
              console.warn('Failed to fetch representative rooms', e);
            }
          } else {
            throw new Error('Failed to fetch room types');
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
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl text-center font-bold text-gray-900">
            Danh sách phòng
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 z-50">
            <div className="lg:sticky lg:top-16 lg:self-start">
              <RoomFilter />
            </div>
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

            {!loading && !error && roomTypes.length === 0 && (
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

            {!loading && !error && roomTypes.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 
                  xl:grid-cols-2 gap-6"
                >
                  {roomTypes.map((rt) => (
                    <RoomTypeCard
                      key={rt.id}
                      roomType={rt}
                      room={representativeRooms[rt.id] ?? undefined}
                    />
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

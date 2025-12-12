import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, DollarSign, ArrowLeft } from 'lucide-react';
import type { Room } from '../../types/rooms';
import RoomTypeCard from '../../components/rooms/RoomTypeCard';
import RoomGallery from '../../components/rooms/RoomGallery';
import RoomAmenities from '../../components/rooms/RoomAmenities';
import ReviewSection from '../../components/rooms/ReviewSection';
import RatingStars from '../../components/rooms/RatingStars';
import useRoomStore from '../../store/useRoomStore';

const RoomTypeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomType, setRoomType] = useState<any | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [suggestedTypes, setSuggestedTypes] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingType, setLoadingType] = useState(true);

  const roomTypes = useRoomStore((s) => s.roomTypes);
  const fetchRoomTypes = useRoomStore((s) => s.fetchRoomTypes);
  const fetchRooms = useRoomStore((s) => s.fetchRooms);

  useEffect(() => {
    if (id) loadRoomTypeDetail(Number(id));
  }, [id]);

  const loadRoomTypeDetail = async (typeId: number) => {
    try {
      setLoadingType(true);

      if (!roomTypes || roomTypes.length === 0) {
        await fetchRoomTypes();
      }
      const list = useRoomStore.getState().roomTypes ?? [];
      const rt = list.find((t: any) => Number(t.id) === Number(typeId));

      if (!rt) {
        setRoomType(null);
        return;
      }

      setRoomType(rt);

      // Prepare suggested room types (exclude current, featured first)
      try {
        setLoadingSuggestions(true);
        const types = list.filter((t: any) => Number(t.id) !== Number(typeId));
        const featured = types.filter((t: any) => t.featured);
        const others = types.filter((t: any) => !t.featured);
        const ordered = [...featured, ...others];
        setSuggestedTypes(ordered.slice(0, 3));
      } finally {
        setLoadingSuggestions(false);
      }

      try {
        await fetchRooms({ type: String(typeId), limit: 20 });
        const rooms = useRoomStore.getState().rooms ?? [];
        setAvailableRooms(rooms.filter((rm) => rm.status === 'available'));
      } catch (err) {
        console.error('Error loading available rooms:', err);
        setAvailableRooms([]);
      }
    } catch (err) {
      console.error('Error loading room type:', err);
      setRoomType(null);
    } finally {
      setLoadingType(false);
    }
  };

  const normalizeAmenities = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => String(v));
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        return [val];
      } catch {
        return [val];
      }
    }
    if (typeof val === 'object') {
      return Object.keys(val).filter((k) => (val as any)[k]).map((k) => String(k));
    }
    return [];
  };

  if (loadingType) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <p className="text-red-800 dark:text-red-300 font-medium mb-4">Không tìm thấy loại phòng</p>
            <button
              onClick={() => navigate(`/room-types${location.search || ''}`)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 mb-6 transition-colors"
            >
              Quay lại danh sách loại phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(roomType.base_price || 0));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/room-types${location.search || ''}`}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách loại phòng</span>
        </Link>

        <div className="mb-8">
          <RoomGallery images={roomType.images || []} roomName={roomType.name || 'Room Type'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{roomType.name}</h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-white mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{roomType.capacity || 0} người</span>
                </div>

                {roomType.average_rating != null && (
                  <div className="flex items-center gap-2">
                    <RatingStars rating={Number(roomType.average_rating)} size="sm" showNumber />
                    <span className="text-sm text-gray-500 dark:text-gray-400">({roomType.total_reviews || 0} đánh giá)</span>
                  </div>
                )}
              </div>

              {roomType.featured && (
                <div className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">Featured</div>
              )}
            </div>

            {roomType.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mô tả loại phòng</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{roomType.description}</p>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tiện ích</h2>
              <RoomAmenities amenities={normalizeAmenities(roomType.amenities)} />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-10">
              <div className="flex items-baseline gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{formattedPrice}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">/ đêm</div>
                </div>
              </div>

              {availableRooms.length > 0 ? (
                <div className="mt-4">
                  <Link to={`/booking/${availableRooms[0].id}`} className="block w-full py-3 text-center font-semibold rounded-md transition-colors bg-indigo-600 text-white hover:bg-indigo-700">Đặt ngay</Link>
                </div>
              ) : (
                <div className="mt-4">
                  <button disabled className="block w-full py-3 text-center font-semibold rounded-md bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed">Hết phòng</button>
                </div>
              )}

              <hr className="my-4 border-gray-200 dark:border-gray-700" />

              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="flex items-center justify-between"><span>Loại phòng</span><strong>{roomType.name}</strong></div>
                <div className="flex items-center justify-between"><span>Số khách</span><span>{roomType.capacity} người</span></div>
                <div className="flex items-center justify-between"><span>Phòng khả dụng</span><span>{availableRooms.length}</span></div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mb-12"><ReviewSection roomTypeId={Number(id)} /></div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phòng đề xuất</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {loadingSuggestions ? (
              <>
                <div className="w-full h-44 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="w-full h-44 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="w-full h-44 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              </>
            ) : (
              suggestedTypes.map((rt) => <RoomTypeCard key={rt.id} roomType={rt} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeDetailPage;

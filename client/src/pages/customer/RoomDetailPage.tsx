import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Users,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import type { Room } from '../../types/rooms';
import RoomTypeCard from '../../components/rooms/RoomTypeCard';
import RoomGallery from '../../components/rooms/RoomGallery';
import RoomAmenities from '../../components/rooms/RoomAmenities';
import ReviewSection from '../../components/rooms/ReviewSection';
import RatingStars from '../../components/rooms/RatingStars';
import useRoomStore from '../../store/useRoomStore';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getRoom, fetchRoomTypes, roomTypes, isLoading, error } = useRoomStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [suggestedTypes, setSuggestedTypes] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoomDetail(Number(id));
    }
  }, [id]);

  const fetchRoomDetail = async (roomId: number) => {
    const roomData = await getRoom(roomId);
    
    if (roomData) {
      setRoom(roomData);
      // fetch suggested room types after we have room data
      fetchSuggestedRoomTypes(roomData.room_type?.id);
    }
  };

  const fetchSuggestedRoomTypes = async (currentRoomTypeId?: number) => {
    try {
      setLoadingSuggestions(true);
      await fetchRoomTypes();
      if (roomTypes && Array.isArray(roomTypes)) {
        let types = [...roomTypes];
        // Exclude current room type
        if (currentRoomTypeId) {
          types = types.filter((t) => t.id !== currentRoomTypeId);
        }

        // Prefer featured types first, then slice to 3
        const featured = types.filter((t) => t.featured);
        const others = types.filter((t) => !t.featured);
        const ordered = [...featured, ...others];
        setSuggestedTypes(ordered.slice(0, 3));
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách loại phòng gợi ý', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (isLoading) {
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

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
            rounded-lg p-8 text-center"
          >
            <p className="text-red-800 dark:text-red-300 font-medium mb-4">
              {error || 'Không tìm thấy phòng'}
            </p>
            <button
              onClick={() => navigate(`/rooms${location.search || ''}`)}
              className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
            >
              Quay lại danh sách phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roomType = room.room_type;
  // Normalize amenities to string[] (server ideally returns string[])
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
  
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(room.price || roomType?.base_price || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to={`/rooms${location.search || ''}`}
          className="inline-flex items-center gap-2 bg-indigo-600 
            text-white px-3 py-2 rounded-md hover:bg-indigo-700 
            disabled:bg-gray-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách phòng</span>
        </Link>

        {/* Image Gallery */}
        <div className="mb-8">
          <RoomGallery
              images={roomType?.images || []}
              roomName={roomType?.name || 'Room'}
            />
        </div>

        {/* Room Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Basic Info */}
            <div>
              <h1 className="text-4xl font-bold 
                text-gray-900 dark:text-white mb-4"
              >
                {roomType?.name}
              </h1>
              
              <div className="flex flex-wrap items-center 
                gap-6 text-gray-600 dark:text-white mb-4"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>
                    {roomType?.capacity || 0} người
                  </span>
                </div>

                {room.average_rating != null && (
                  <div className="flex items-center gap-2">
                    <RatingStars
                      rating={Number(room.average_rating)}
                      size="sm"
                      showNumber
                    />
                    <span className="text-sm text-gray-500">
                      ({room.total_reviews || 0} đánh giá)
                    </span>
                  </div>
                )}
              </div>

              {/* Status display removed from room detail UI */}
            </div>

            {/* Description */}
            {roomType?.description && (
              <div>
                <h2 className="text-2xl font-bold 
                  text-gray-900 dark:text-white mb-4"
                >
                  Mô tả phòng
                </h2>
                <p className="text-gray-700 dark:text-white leading-relaxed">
                  {roomType.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold 
                text-gray-900 dark:text-white mb-4"
              >
                Tiện ích
              </h2>
              <RoomAmenities amenities={normalizeAmenities(roomType?.amenities)} />
            </div>
          </div>

          {/* Booking Card */}
          <aside className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-10">
              <div className="flex items-baseline gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-gray-600 dark:text-white" />
                <div>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formattedPrice}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-white">/ đêm</div>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to={`/booking/${room.id}`}
                  className={
                    'block w-full py-3 text-center font-semibold rounded-md '
                    + 'transition-colors bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                  }
                >
                  Đặt ngay
                </Link>
              </div>

              <hr className="my-4 border-gray-200 dark:border-gray-700" />

              <div className="text-sm text-gray-700 dark:text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span>Loại phòng</span>
                  <strong>{roomType?.name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Số khách</span>
                  <span>{roomType?.capacity} người</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ReviewSection roomId={room.id} />
        </div>

        {/* Suggested Room Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phòng đề xuất</h2>
          {loadingSuggestions ? (
            <div className="flex gap-4">
              <div className="w-80 h-56 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-80 h-56 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-80 h-56 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {suggestedTypes.map((rt) => (
                <RoomTypeCard key={rt.id} roomType={rt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;

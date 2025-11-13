import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { getRoomById, type Room } from 
  '../../services/api/roomService';
import RoomGallery from '../../components/rooms/RoomGallery';
import RoomAmenities from '../../components/rooms/RoomAmenities';
import ReviewSection from '../../components/rooms/ReviewSection';
import RatingStars from '../../components/rooms/RatingStars';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRoomDetail(Number(id));
    }
  }, [id]);

  const fetchRoomDetail = async (roomId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRoomById(roomId);
      
      // backend uses `status: 'success'` (not `success`), accept both
      if ((response as any).success || (response as any).status === 'success') {
        if (response.data && response.data.room) {
          setRoom(response.data.room);
        } else {
          throw new Error('Failed to fetch room details');
        }
      } else {
        throw new Error('Failed to fetch room details');
      }
    } catch (err: any) {
      console.error('Error fetching room:', err);
      const message =
        err.response?.data?.message ||
        'Không thể tải thông tin phòng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-300 rounded-lg" />
            <div className="h-8 bg-gray-300 rounded w-1/3" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-32 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 
            rounded-lg p-8 text-center"
          >
            <p className="text-red-800 font-medium mb-4">
              {error || 'Không tìm thấy phòng'}
            </p>
            <button
              onClick={() => navigate('/rooms')}
              className="px-6 py-2 bg-red-600 text-white 
                rounded-lg hover:bg-red-700 
                transition-colors"
            >
              Quay lại danh sách phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roomType = room.room_type;
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(roomType?.base_price || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 
            text-gray-600 hover:text-gray-900 
            mb-6 transition-colors"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 
          gap-8 mb-12"
        >
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Basic Info */}
            <div>
              <h1 className="text-4xl font-bold 
                text-gray-900 mb-4"
              >
                {roomType?.name}
              </h1>
              
              <div className="flex flex-wrap items-center 
                gap-6 text-gray-600 mb-4"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>
                    Phòng {room.room_number} - Tầng {room.floor}
                  </span>
                </div>
                
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

              {/* Status Badge */}
              <div
                className={`inline-block px-4 py-2 
                  rounded-full text-sm font-semibold
                  ${
                    room.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : room.status === 'occupied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {room.status === 'available'
                  ? 'Còn phòng'
                  : room.status === 'occupied'
                  ? 'Đã đặt'
                  : 'Bảo trì'}
              </div>
            </div>

            {/* Description */}
            {roomType?.description && (
              <div>
                <h2 className="text-2xl font-bold 
                  text-gray-900 mb-4"
                >
                  Mô tả phòng
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {roomType.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold 
                text-gray-900 mb-4"
              >
                Tiện ích
              </h2>
              <RoomAmenities
                amenities={roomType?.amenities || []}
              />
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg 
              p-6 sticky top-8"
            >
              <div className="flex items-baseline gap-2 mb-6">
                <DollarSign className="w-6 h-6 
                  text-gray-600"
                />
                <span className="text-3xl font-bold 
                  text-indigo-600"
                >
                  {formattedPrice}
                </span>
                <span className="text-gray-600">/ đêm</span>
              </div>

              <Link
                to={`/booking/${room.id}`}
                className={`block w-full py-4 text-center 
                  font-semibold rounded-lg 
                  transition-colors ${
                    room.status === 'available'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={(e) => {
                  if (room.status !== 'available') {
                    e.preventDefault();
                  }
                }}
              >
                {room.status === 'available'
                  ? 'Đặt ngay'
                  : 'Không khả dụng'}
              </Link>

              {room.status === 'available' && (
                <p className="text-sm text-gray-500 
                  text-center mt-4"
                >
                  Bạn sẽ không bị tính phí ngay
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ReviewSection roomId={room.id} />
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;

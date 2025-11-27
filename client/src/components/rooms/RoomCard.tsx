import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Star,
  ArrowRight,
} from 'lucide-react';
import type { Room } from '../../types/rooms';
import FavoriteButton from './FavoriteButton';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const location = useLocation();
  const roomType = room.room_type;
  
  if (!roomType) {
    return null;
  }

  // Server root (strip possible trailing '/api' if env points to API root)
  const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

  const PLACEHOLDER = '/images/room-placeholder.jpg';

  // Backend guarantees `images: string[]` and `formatRoomImages`
  // normalizes values. Use the first image if present.
  const firstImage = Array.isArray(room.images) && room.images.length > 0
    ? room.images[0]
    : undefined;

  // Final image source resolution
  let imageSrc = PLACEHOLDER;
  if (firstImage) {
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      imageSrc = firstImage;
    } else if (firstImage.startsWith('/uploads')) {
      // Server-hosted uploads
      imageSrc = `${SERVER_URL}${firstImage}`;
    } else if (firstImage.startsWith('/')) {
      // Client-side absolute path (public folder)
      imageSrc = firstImage;
    } else {
      // treat as filename under uploads/rooms
      imageSrc = `${SERVER_URL}/uploads/rooms/${firstImage}`;
    }
  }
  
  // Format price (fallback to 0 if base_price missing)
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(roomType.base_price || 0));

  // Normalize amenities (server should send string[] but be defensive)
  const normalizeAmenities = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => String(v));
    if (typeof val === 'string') {
      // try parse JSON string like '["wifi","tv"]'
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        return [val];
      } catch {
        return [val];
      }
    }
    if (typeof val === 'object') {
      // maybe a map/object of flags { wifi: true, tv: false }
      return Object.keys(val).filter((k) => (val as any)[k]).map((k) => String(k));
    }
    return [];
  };

  // Get amenities (limit to 3 for display)
  const amenities = normalizeAmenities(roomType.amenities).slice(0, 3);

  return (
    <div 
      className="bg-white rounded-lg shadow-md 
        overflow-hidden hover:shadow-xl 
        transition-shadow duration-300 group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden 
        bg-gray-200"
      >
        <img
          src={imageSrc}
          alt={roomType.name}
          loading="lazy"
          className="w-full h-full object-cover 
            group-hover:scale-110 transition-transform 
            duration-300"
          onLoad={(e) => e.currentTarget.classList.add('loaded')}
          onError={(e) => {
            // fallback to client-side placeholder; avoid infinite loop
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = PLACEHOLDER;
          }}
        />
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-5">
          <FavoriteButton roomId={room.id} size="md" />
        </div>
        
        {/* Featured Badge */}
        {room.featured && (
          <div 
            className="absolute top-3 left-3 
              bg-yellow-500 text-white px-3 py-1 
              rounded-full text-xs font-semibold"
          >
            Nổi bật
          </div>
        )}

        {/* Status Badge */}
        <div 
          className={`absolute bottom-3 left-3 px-3 py-1 
            rounded-full text-xs font-semibold
            ${
              room.status === 'available'
                ? 'bg-green-500 text-white'
                : room.status === 'occupied'
                ? 'bg-red-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
        >
          {room.status === 'available'
            ? 'Còn phòng'
            : room.status === 'occupied'
            ? 'Đã đặt'
            : 'Bảo trì'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Room Type Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {roomType.name}
        </h3>

        {/* Description (truncated) */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {roomType.description}
        </p>

        {/* Capacity & Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {roomType.capacity} người
            </span>
          </div>

          {room.average_rating != null && (
            <div className="flex items-center">
              <Star
                className="w-4 h-4 text-yellow-500 mr-1"
                fill="currentColor"
              />
              <span className="text-sm font-semibold text-gray-900">
                {Number(room.average_rating).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({Number(room.total_reviews || 0)})
              </span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 
                  text-gray-600 text-xs bg-gray-100 
                  px-2 py-1 rounded"
                title={amenity}
              >
                <span>•</span>
                <span className="capitalize">{amenity}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <p className="text-xs text-gray-500">Giá từ</p>
            <p className="text-xl font-bold text-indigo-600">
              {formattedPrice}
            </p>
            <p className="text-xs text-gray-500">/ đêm</p>
          </div>

          <Link
            to={`/rooms/${room.id}${location.search || ''}`}
            className="flex items-center gap-1 
              bg-indigo-600 text-white px-4 py-2 
              rounded-lg hover:bg-indigo-700 
              transition-colors text-sm font-medium"
          >
            Xem chi tiết
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Star,
  MapPin,
  Wifi,
  Tv,
  Wind,
  ArrowRight,
} from 'lucide-react';
import type { Room } from '../../services/api/roomService';
import FavoriteButton from './FavoriteButton';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const roomType = room.room_type;
  
  if (!roomType) {
    return null;
  }

  // Get first image or use placeholder
  const imageUrl = roomType.images?.[0] || 
    '/images/room-placeholder.jpg';
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(roomType.base_price);

  // Prefer room-level amenities when available, otherwise use room type
  const normalizeAmenities = (input: any): string[] => {
    if (Array.isArray(input)) return input;
    if (!input) return [];
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return input.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof input === 'object') {
      try {
        const vals = Object.values(input);
        if (Array.isArray(vals) && vals.length > 0) return vals.flat().map((v: any) => String(v).trim());
      } catch {}
    }
    return [];
  };

  const amenitiesSource =
    (room.amenities && normalizeAmenities(room.amenities).length > 0)
      ? normalizeAmenities(room.amenities)
      : normalizeAmenities(roomType.amenities);

  // Get amenities (limit to 3 for display)
  const amenities = amenitiesSource.slice(0, 3);

  // Amenity icons mapping
  const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    'air-conditioning': <Wind className="w-4 h-4" />,
  };

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
          src={imageUrl}
          alt={roomType.name}
          loading="lazy"
          className="w-full h-full object-cover 
            group-hover:scale-110 transition-transform 
            duration-300"
          onLoad={(e) => 
            e.currentTarget.classList.add('loaded')
          }
        />
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
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

        {/* Room Number & Floor */}
        <div 
          className="flex items-center text-sm 
            text-gray-600 mb-3"
        >
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            Phòng {room.room_number} - Tầng {room.floor}
          </span>
        </div>

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
                {amenityIcons[amenity.toLowerCase()] || 
                  <span>•</span>}
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
            to={`/rooms/${room.id}`}
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

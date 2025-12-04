import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Star,
  ArrowRight,
} from 'lucide-react';
import type { Room, RoomType } from '../../types/rooms';
import { getRooms } from '../../services/api/roomService';
import FavoriteButton from './FavoriteButton';

interface RoomTypeCardProps {
  room?: Room;
  roomType?: RoomType;
  onSelect?: () => void;
  actionLabel?: string;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({ room, roomType: rtProp, onSelect, actionLabel }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingSample, setLoadingSample] = useState(false);
  const roomType = rtProp ?? room?.room_type;

  if (!roomType) return null;

  // Server root (strip possible trailing '/api' if env points to API root)
  const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

  const PLACEHOLDER = '/images/room-placeholder.jpg';

  // Helper to safely parse images
  const getImages = (imgs: any): string[] => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === 'string') {
      try {
        const parsed = JSON.parse(imgs);
        if (Array.isArray(parsed)) return parsed;
        return [imgs];
      } catch {
        return [imgs];
      }
    }
    return [];
  };

  const images = getImages(roomType?.images);
  const firstImage = images.length > 0 ? images[0] : undefined;

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
      // treat as filename under uploads/room_types
      imageSrc = `${SERVER_URL}/uploads/room_types/${firstImage}`;
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
          <FavoriteButton roomId={room?.id ?? roomType.id} size="md" />
        </div>
        
        {/* Featured Badge (moved to room_type) */}
        {roomType?.featured && (
          <div 
            className="absolute top-3 left-3 
              bg-yellow-500 text-white px-3 py-1 
              rounded-full text-xs font-semibold"
          >
            Featured
          </div>
        )}

        {/* Status badge removed from customer card UI */}
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

          {(() => {
            const avg = room?.average_rating ?? roomType.average_rating;
            const total = room?.total_reviews ?? roomType.total_reviews ?? 0;
            if (avg == null) return null;
            return (
              <div className="flex items-center">
                <Star
                  className="w-4 h-4 text-yellow-500 mr-1"
                  fill="currentColor"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {Number(avg).toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 ml-1">({Number(total)})</span>
              </div>
            );
          })()}
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

          {onSelect ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelect();
              }}
              className="flex items-center gap-1 
                bg-indigo-600 text-white px-4 py-2 
                rounded-lg hover:bg-indigo-700 
                transition-colors text-sm font-medium"
            >
              {actionLabel || 'Chọn'}
            </button>
          ) : (
            <Link
              to={
                room
                  ? `/rooms/${room.id}${location.search || ''}`
                  : `/rooms?type=${roomType.id}${location.search || ''}`
              }
              onClick={async (e) => {
                // If we already have a room, allow normal navigation.
                if (room) return;

                // Prevent default link and try to fetch a sample room
                e.preventDefault();
                if (loadingSample) return;
                setLoadingSample(true);
                try {
                  const res = await getRooms({ type: String(roomType.id), limit: 1 });
                  const sample = res?.data?.rooms?.[0] ?? null;
                  if (sample) {
                    navigate(`/rooms/${sample.id}${location.search || ''}`);
                  } else {
                    // Fallback to filtered list if no sample found
                    navigate(`/rooms?type=${roomType.id}${location.search || ''}`);
                  }
                } catch (err) {
                  // On error fallback to filtered list
                  navigate(`/rooms?type=${roomType.id}${location.search || ''}`);
                } finally {
                  setLoadingSample(false);
                }
              }}
              className="flex items-center gap-1 
                bg-indigo-600 text-white px-4 py-2 
                rounded-lg hover:bg-indigo-700 
                transition-colors text-sm font-medium"
            >
              Xem chi tiết
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomTypeCard;

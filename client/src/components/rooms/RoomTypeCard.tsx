import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Star, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useRoomStore from '../../store/useRoomStore';
import type { Room, RoomType } from '../../types/rooms';
import FavoriteButton from './FavoriteButton';

interface RoomTypeCardProps {
  room?: Room;
  roomType?: RoomType;
  onSelect?: () => void;
  actionLabel?: string;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({ room, roomType: rtProp, onSelect, actionLabel }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
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

  // If a physical `room` object is not provided (we only have roomType),
  // use the room store helper to fetch one sample room for this type
  // so favorite actions (which require a room id) work the same as
  // on the room list page.
  const [sampleRoomId, setSampleRoomId] = useState<number | null>(null);
  const { getSampleRoomByType } = useRoomStore();
  useEffect(() => {
    let mounted = true;
    const fetchSample = async () => {
      if (!room && roomType?.id) {
        try {
          const sample = await getSampleRoomByType(roomType.id);
          if (mounted && sample) setSampleRoomId(sample.id);
        } catch (e) {
          // ignore errors
        }
      }
    };
    fetchSample();
    return () => {
      mounted = false;
    };
  }, [room, roomType?.id, getSampleRoomByType]);

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
  // Format price according to selected language (English uses en-US, Vietnamese uses vi-VN)
  const currencyLocale = i18n.language && i18n.language.startsWith('en') ? 'en-US' : 'vi-VN';
  const formattedPrice = new Intl.NumberFormat(currencyLocale, {
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md 
        overflow-hidden hover:shadow-xl dark:hover:shadow-lg
        transition-shadow duration-300 group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden 
        bg-gray-200 dark:bg-gray-700"
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
        
        {/* Favorite Button: prefer physical room id (room.id), else a sampled
            room for this type. If none available yet, hide button. */}
        {(room?.id || sampleRoomId) && (
          <div className="absolute top-3 right-3 z-5">
            <FavoriteButton roomId={room?.id ?? sampleRoomId!} size="md" />
          </div>
        )}
        
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {roomType.name}
        </h3>

        {/* Description (truncated) */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {roomType.description}
        </p>

        {/* Capacity & Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
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
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {Number(avg).toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({Number(total)})</span>
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
                  text-gray-600 dark:text-gray-300 text-xs bg-gray-100 dark:bg-gray-700
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
        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500">{t('rooms.priceFrom')}</p>
            <p className="text-xl font-bold text-indigo-600">
              {formattedPrice}
            </p>
            <p className="text-xs text-gray-500">{t('rooms.perNight')}</p>
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
              {actionLabel || t('common.select')}
            </button>
          ) : (
            <Link
              to={`/room-types/${roomType.id}${location.search || ''}`}
              className="flex items-center gap-1 
                bg-indigo-600 text-white px-4 py-2 
                rounded-lg hover:bg-indigo-700 
                transition-colors text-sm font-medium"
            >
              {t('common.viewDetails')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomTypeCard;

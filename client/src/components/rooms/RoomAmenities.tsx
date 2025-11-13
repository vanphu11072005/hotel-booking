import React from 'react';
import {
  Wifi,
  Tv,
  Wind,
  Coffee,
  Utensils,
  Car,
  Dumbbell,
  Waves,
  UtensilsCrossed,
  Shield,
  Cigarette,
  Bath,
} from 'lucide-react';

interface RoomAmenitiesProps {
  amenities: string[];
}

const RoomAmenities: React.FC<RoomAmenitiesProps> = ({ 
  amenities 
}) => {
  const safeAmenities = Array.isArray(amenities) ? amenities : [];

  // Icon mapping for common amenities
  const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-5 h-5" />,
    'wi-fi': <Wifi className="w-5 h-5" />,
    tv: <Tv className="w-5 h-5" />,
    television: <Tv className="w-5 h-5" />,
    'air-conditioning': <Wind className="w-5 h-5" />,
    'air conditioning': <Wind className="w-5 h-5" />,
    ac: <Wind className="w-5 h-5" />,
    'mini bar': <Coffee className="w-5 h-5" />,
    minibar: <Coffee className="w-5 h-5" />,
    restaurant: <Utensils className="w-5 h-5" />,
    parking: <Car className="w-5 h-5" />,
    gym: <Dumbbell className="w-5 h-5" />,
    fitness: <Dumbbell className="w-5 h-5" />,
    pool: <Waves className="w-5 h-5" />,
    'swimming pool': <Waves className="w-5 h-5" />,
    'room service': <UtensilsCrossed className="w-5 h-5" />,
    safe: <Shield className="w-5 h-5" />,
    'no smoking': <Cigarette className="w-5 h-5" />,
    bathtub: <Bath className="w-5 h-5" />,
    shower: <Bath className="w-5 h-5" />,
  };

  const getIcon = (amenity: string) => {
    const key = amenity.toLowerCase().trim();
    return amenityIcons[key] || (
      <span className="w-5 h-5 flex items-center 
        justify-center text-blue-600 font-bold"
      >
        ✓
      </span>
    );
  };

  if (safeAmenities.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Thông tin tiện ích đang được cập nhật
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 
      lg:grid-cols-3 gap-4"
    >
      {safeAmenities.map((amenity, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 
            bg-gray-50 rounded-lg hover:bg-gray-100 
            transition-colors"
        >
          <div className="text-blue-600">
            {getIcon(amenity)}
          </div>
          <span className="text-gray-800 capitalize">
            {amenity}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RoomAmenities;

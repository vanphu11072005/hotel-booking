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
  const normalizeAmenities = (input: any): string[] => {
    if (Array.isArray(input)) return input;
    if (!input) return [];
    if (typeof input === 'string') {
      // Try JSON.parse first (stringified JSON)
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }

      // Fallback: comma separated list
      return input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // If it's an object with values as amenities
    if (typeof input === 'object') {
      try {
        // Convert object values to array if possible
        const vals = Object.values(input);
        if (Array.isArray(vals) && vals.length > 0) {
          // flatten nested arrays
          return vals.flat().map((v: any) => String(v).trim()).filter(Boolean);
        }
      } catch (e) {
        // ignore
      }
    }

    return [];
  };

  const safeAmenities = normalizeAmenities(amenities);

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
    breakfast: <Coffee className="w-5 h-5" />,
    'breakfast included': <Coffee className="w-5 h-5" />,
    kettle: <Coffee className="w-5 h-5" />,
    'hair dryer': <Shield className="w-5 h-5" />,
    hairdryer: <Shield className="w-5 h-5" />,
    iron: <Shield className="w-5 h-5" />,
    fridge: <Utensils className="w-5 h-5" />,
    microwave: <Utensils className="w-5 h-5" />,
    'private bathroom': <Bath className="w-5 h-5" />,
    balcony: <Wind className="w-5 h-5" />,
    '24-hour front desk': <Shield className="w-5 h-5" />,
    'front desk': <Shield className="w-5 h-5" />,
    spa: <Waves className="w-5 h-5" />,
    sauna: <Waves className="w-5 h-5" />,
    jacuzzi: <Waves className="w-5 h-5" />,
    'airport shuttle': <Car className="w-5 h-5" />,
    shuttle: <Car className="w-5 h-5" />,
    laundry: <Shield className="w-5 h-5" />,
    pets: <Car className="w-5 h-5" />,
  };

  const amenityLabels: Record<string, string> = {
    wifi: 'Wi‑Fi',
    tv: 'Ti vi',
    ac: 'Điều hòa',
    'air-conditioning': 'Điều hòa',
    minibar: 'Mini bar',
    'mini bar': 'Mini bar',
    restaurant: 'Nhà hàng',
    parking: 'Bãi đỗ xe',
    gym: 'Phòng gym',
    pool: 'Hồ bơi',
    'room service': 'Dịch vụ phòng',
    safe: 'Hòm an toàn',
    'no smoking': 'Không hút thuốc',
    bathtub: 'Bồn tắm',
    shower: 'Vòi sen',
    breakfast: 'Bao gồm bữa sáng',
    kettle: 'Ấm siêu tốc',
    hairdryer: 'Máy sấy tóc',
    iron: 'Bàn ủi',
    fridge: 'Tủ lạnh',
    microwave: 'Lò vi sóng',
    'private bathroom': 'Phòng tắm riêng',
    balcony: 'Ban công',
    spa: 'Spa',
    sauna: 'Sauna',
    jacuzzi: 'Jacuzzi',
    laundry: 'Dịch vụ giặt',
    '24-hour front desk': 'Lễ tân 24/7',
    'airport shuttle': 'Đưa/đón sân bay',
    pets: 'Cho phép thú cưng',
  };

  const amenityDescriptions: Record<string, string> = {
    wifi: 'Kết nối Internet không dây miễn phí',
    tv: 'Tivi với truyền hình cáp hoặc vệ tinh',
    ac: 'Hệ thống điều hòa nhiệt độ trong phòng',
    minibar: 'Thức uống và đồ ăn nhẹ trong mini bar',
    pool: 'Hồ bơi ngoài trời hoặc trong nhà',
    gym: 'Phòng tập thể dục/fitness',
    'room service': 'Đặt thức ăn vào phòng',
    breakfast: 'Bữa sáng phục vụ tại nhà hàng',
    balcony: 'Ban công riêng với tầm nhìn',
    '24-hour front desk': 'Lễ tân phục vụ 24 giờ',
    spa: 'Dịch vụ spa và thư giãn',
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

  const getLabel = (amenity: string) => {
    const key = amenity.toLowerCase().trim();
    if (amenityLabels[key]) return amenityLabels[key];
    // Fallback: capitalize words and replace dashes/underscores
    return amenity
      .toLowerCase()
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  const getDescription = (amenity: string) => {
    const key = amenity.toLowerCase().trim();
    return amenityDescriptions[key] || '';
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
      {safeAmenities.slice(0, 10).map((amenity, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 
            bg-gray-50 rounded-lg hover:bg-gray-100 
            transition-colors"
          title={getDescription(amenity)}
        >
          <div className="text-blue-600">{getIcon(amenity)}</div>
          <div>
            <div className="text-gray-800 font-medium">
              {getLabel(amenity)}
            </div>
            {getDescription(amenity) && (
              <div className="text-xs text-gray-500">
                {getDescription(amenity)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomAmenities;

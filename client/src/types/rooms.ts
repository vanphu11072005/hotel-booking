export interface RoomType {
  id: number;
  name: string;
  description?: string;
  base_price?: number;
  capacity?: number;
  amenities: string[];
  images?: string[];
  featured?: boolean;
  average_rating?: number | string | null;
  total_reviews?: number | string | null;
}

export interface Room {
  id: number;
  room_type_id: number;
  room_number?: string;
  floor?: number;
  price?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning';
  created_at?: string;
  updated_at?: string;
  room_type?: RoomType;
  average_rating?: number | string | null;
  total_reviews?: number | string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoomListResponse {
  success: boolean;
  status?: string;
  data: {
    rooms: Room[];
    pagination?: Pagination;
  };
  message?: string;
}

export interface FeaturedRoomsParams {
  featured?: boolean;
  limit?: number;
}

export interface RoomSearchParams {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AvailableSearchParams {
  from: string;
  to: string;
  type?: string;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string;
  page?: number;
  limit?: number;
}

export interface FilterValues {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  from?: string;
  to?: string;
  amenities?: string;
}

export interface CreateRoomData {
  room_number: string;
  floor: number;
  room_type_id: number;
  price?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning';
}

import apiClient from './apiClient';

/**
 * Room API Service
 */

export interface Room {
  id: number;
  room_type_id: number;
  room_number: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance';
  featured: boolean;
  images?: string[];
  created_at: string;
  updated_at: string;
  room_type?: {
    id: number;
    name: string;
    description: string;
    base_price: number;
    capacity: number;
    amenities: string[];
    images: string[];
  };
  average_rating?: number | string | null;
  total_reviews?: number | string | null;
}

export interface RoomListResponse {
  success: boolean;
  status?: string;
  data: {
    rooms: Room[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
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

/**
 * Get featured rooms for homepage
 */
export const getFeaturedRooms = async (
  params: FeaturedRoomsParams = {}
): Promise<RoomListResponse> => {
  const response = await apiClient.get('/rooms', {
    params: {
      featured: params.featured ?? true,
      limit: params.limit ?? 6,
    },
  });
  return response.data;
};

/**
 * Get all rooms with filters
 */
export const getRooms = async (
  params: RoomSearchParams = {}
): Promise<RoomListResponse> => {
  const response = await apiClient.get('/rooms', {
    params,
  });
  return response.data;
};

/**
 * Get room by ID
 */
export const getRoomById = async (
  id: number
): Promise<{ success: boolean; data: { room: Room } }> => {
  const response = await apiClient.get(`/rooms/${id}`);
  return response.data;
};

/**
 * Search available rooms
 */
export interface AvailableSearchParams {
  from: string;
  to: string;
  type?: string;
  capacity?: number;
  page?: number;
  limit?: number;
}

export const searchAvailableRooms = async (
  params: AvailableSearchParams
): Promise<RoomListResponse> => {
  const response = await apiClient.get('/rooms/available', {
    params,
  });
  return response.data;
};

/**
 * Create new room
 */
export interface CreateRoomData {
  room_number: string;
  floor: number;
  room_type_id: number;
  status: 'available' | 'occupied' | 'maintenance';
  featured?: boolean;
}

export const createRoom = async (
  data: CreateRoomData
): Promise<{ success: boolean; data: { room: Room }; message: string }> => {
  const response = await apiClient.post('/rooms', data);
  return response.data;
};

/**
 * Update room
 */
export const updateRoom = async (
  id: number,
  data: Partial<CreateRoomData>
): Promise<{ success: boolean; data: { room: Room }; message: string }> => {
  const response = await apiClient.put(`/rooms/${id}`, data);
  return response.data;
};

/**
 * Delete room
 */
export const deleteRoom = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/rooms/${id}`);
  return response.data;
};

export default {
  getFeaturedRooms,
  getRooms,
  getRoomById,
  searchAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};

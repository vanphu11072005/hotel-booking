import apiClient from './apiClient';

// Types & Interfaces
export interface Room {
  id: number;
  room_type_id: number;
  room_number: string;
  floor: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning';
  featured: boolean;
  images?: string[];
  amenities?: string[];
  created_at: string;
  updated_at: string;
  room_type?: {
    id: number;
    name: string;
    description: string;
    base_price: number;
    capacity: number;
    amenities: string[];
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

export interface AvailableSearchParams {
  from: string;
  to: string;
  type?: string;
  capacity?: number;
  page?: number;
  limit?: number;
}

export interface CreateRoomData {
  room_number: string;
  floor: number;
  room_type_id: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning';
  featured?: boolean;
}
// API functions
export const getRoomTypes = async (): Promise<{
  success: boolean;
  data: { room_types: { id: number; name: string }[] };
}> => {
  const response = await apiClient.get('/rooms/room-types');
  return response.data;
};

/**
 * Room API Service
 */

export interface Room {
  id: number;
  room_type_id: number;
  room_number: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning';
  featured: boolean;
  images?: string[];
  amenities?: string[];
  created_at: string;
  updated_at: string;
  room_type?: {
    id: number;
    name: string;
    description: string;
    base_price: number;
    capacity: number;
    amenities: string[];
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
  // Xoá log debug nếu có
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
 * Get available amenities list (unique)
 */
export const getAmenities = async (): Promise<{
  success?: boolean;
  status?: string;
  data: { amenities: string[] };
}> => {
  const response = await apiClient.get('/rooms/amenities');
  return response.data;
};

/**
 * Create new room
 */
export interface CreateRoomData {
  room_number: string;
  floor: number;
  room_type_id: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty' | 'cleaning';
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

/**
 * Update room status (for staff)
 */
export const updateRoomStatus = async (
  id: number,
  status: string
): Promise<{ success: boolean; data: { room: Room }; message: string }> => {
  const response = await apiClient.patch(`/rooms/${id}/status`, { status });
  return response.data;
};

/**
 * Get available room count for specific dates
 */
export const getAvailableRoomCount = async (
  roomId: number,
  checkInDate?: string,
  checkOutDate?: string
): Promise<{ success: boolean; data: { available_count: number } }> => {
  const response = await apiClient.get(`/rooms/${roomId}/available-count`, {
    params: {
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
    },
  });
  return response.data;
};

export default {
  getFeaturedRooms,
  getRooms,
  getRoomById,
  searchAvailableRooms,
  getAmenities,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getRoomTypes,
  getAvailableRoomCount,
};

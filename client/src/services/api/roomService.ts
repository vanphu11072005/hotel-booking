import apiClient from './apiClient';
import type {
  Room,
  RoomListResponse,
  FeaturedRoomsParams,
  RoomSearchParams,
  AvailableSearchParams,
  CreateRoomData,
} from '../../types/rooms';

// API functions
export const getRoomTypes = async (): Promise<{
  success: boolean;
  data: { room_types: { id: number; name: string }[] };
}> => {
  const response = await apiClient.get('/rooms/room-types');
  return response.data;
};

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

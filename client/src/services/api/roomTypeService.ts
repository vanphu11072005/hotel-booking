import apiClient from './apiClient';

export interface RoomTypeData {
  name: string;
  base_price: number;
  capacity: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

export const getAllRoomTypes = async () => {
  const response = await apiClient.get('/room-types');
  return response.data;
};

export const createRoomType = async (data: RoomTypeData) => {
  const response = await apiClient.post('/room-types', data);
  return response.data;
};

export const updateRoomType = async (id: number, data: Partial<RoomTypeData>) => {
  const response = await apiClient.put(`/room-types/${id}`, data);
  return response.data;
};

export const deleteRoomType = async (id: number) => {
  const response = await apiClient.delete(`/room-types/${id}`);
  return response.data;
};

export default {
  getAllRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};

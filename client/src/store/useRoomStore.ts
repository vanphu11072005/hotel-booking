import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  getRooms,
  getRoomById,
  getRoomTypes,
  searchAvailableRooms,
  getAvailableRoomCount,
} from '../services/api/roomService';
import type { Room, RoomSearchParams, AvailableSearchParams } from '../types/rooms';

interface RoomState {
  rooms: Room[];
  roomTypes: any[];
  isLoading: boolean;
  error: string | null;
  pagination?: { page: number; limit: number; total: number; totalPages?: number } | null;

  // Actions
  fetchRooms: (params?: RoomSearchParams) => Promise<void>;
  getRoom: (id: number) => Promise<Room | null>;
  fetchRoomTypes: () => Promise<void>;
  getSampleRoomByType: (typeId: number) => Promise<Room | null>;
  searchAvailable: (params: AvailableSearchParams) => Promise<void>;
  getAvailableCount: (roomId: number, from?: string, to?: string) => Promise<number>;
  setRooms: (rooms: Room[]) => void;
  clearRooms: () => void;
}

const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  roomTypes: [],
  isLoading: false,
  error: null,
  pagination: null,

  fetchRooms: async (params: RoomSearchParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRooms(params);
      if (response && response.data) {
        const rooms = response.data.rooms || [];
        set({ rooms, pagination: response.data.pagination || null, isLoading: false });
      } else {
        set({ rooms: [], pagination: null, isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      set({ error: error?.message || 'Failed to load rooms', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể tải phòng');
    }
  },

  getRoom: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRoomById(id);
      if (response && response.data && response.data.room) {
        set({ isLoading: false });
        return response.data.room as Room;
      }
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.error('Error getting room:', error);
      set({ error: error?.message || 'Failed to get room', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể lấy thông tin phòng');
      return null;
    }
  },

  fetchRoomTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRoomTypes();
      if (response && response.data && response.data.room_types) {
        set({ roomTypes: response.data.room_types, isLoading: false });
      } else {
        set({ roomTypes: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      set({ error: error?.message || 'Failed to load room types', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể tải loại phòng');
    }
  },

  // Fetch a single sample room for a given room type (does not
  // mutate global `rooms` state) — useful for components that need
  // a physical room id to perform actions like favoriting.
  getSampleRoomByType: async (typeId: number) => {
    try {
      const response = await getRooms({ type: String(typeId), limit: 1 });
      if (response && response.data && Array.isArray(response.data.rooms)) {
        return response.data.rooms[0] as Room;
      }
      return null;
    } catch (error) {
      console.error('Error fetching sample room by type:', error);
      return null;
    }
  },

  searchAvailable: async (params: AvailableSearchParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await searchAvailableRooms(params);
      if (response && response.data) {
        set({ rooms: response.data.rooms || [], pagination: response.data.pagination || null, isLoading: false });
      } else {
        set({ rooms: [], pagination: null, isLoading: false });
      }
    } catch (error: any) {
      console.error('Error searching available rooms:', error);
      set({ error: error?.message || 'Failed to search rooms', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể tìm phòng');
    }
  },

  getAvailableCount: async (roomId: number, from?: string, to?: string) => {
    try {
      const response = await getAvailableRoomCount(roomId, from, to);
      if (response && response.data) {
        return response.data.available_count || 0;
      }
      return 0;
    } catch (error: any) {
      console.error('Error getting available count:', error);
      toast.error(error?.response?.data?.message || 'Không thể lấy số phòng trống');
      return 0;
    }
  },

  setRooms: (rooms: Room[]) => set({ rooms }),

  clearRooms: () => set({ rooms: [], pagination: null, error: null }),
}));

export default useRoomStore;

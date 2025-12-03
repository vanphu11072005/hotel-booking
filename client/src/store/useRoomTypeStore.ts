import { create } from 'zustand';
import { toast } from 'react-toastify';
import roomTypeService, { RoomTypeData } from '../services/api/roomTypeService';

export interface RoomType extends RoomTypeData {
  id?: number;
}

interface RoomTypeState {
  roomTypes: RoomType[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoomTypes: () => Promise<void>;
  createRoomType: (data: RoomTypeData) => Promise<boolean>;
  updateRoomType: (id: number, data: Partial<RoomTypeData>) => Promise<boolean>;
  deleteRoomType: (id: number) => Promise<boolean>;
  clearError: () => void;
}

const useRoomTypeStore = create<RoomTypeState>((set) => ({
  roomTypes: [],
  isLoading: false,
  error: null,

  fetchRoomTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await roomTypeService.getAllRoomTypes();
      const types = response.data?.room_types || [];
      set({ roomTypes: types, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      const errorMsg = error?.response?.data?.message || 'Không thể tải danh sách loại phòng';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
    }
  },

  createRoomType: async (data: RoomTypeData) => {
    set({ isLoading: true, error: null });
    try {
      await roomTypeService.createRoomType(data);
      toast.success('Thêm loại phòng thành công');
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Error creating room type:', error);
      const errorMsg = error?.response?.data?.message || 'Không thể thêm loại phòng';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  updateRoomType: async (id: number, data: Partial<RoomTypeData>) => {
    set({ isLoading: true, error: null });
    try {
      await roomTypeService.updateRoomType(id, data);
      toast.success('Cập nhật loại phòng thành công');
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Error updating room type:', error);
      const errorMsg = error?.response?.data?.message || 'Không thể cập nhật loại phòng';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  deleteRoomType: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await roomTypeService.deleteRoomType(id);
      toast.success('Xóa loại phòng thành công');
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Error deleting room type:', error);
      const errorMsg = error?.response?.data?.message || 'Không thể xóa loại phòng';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRoomTypeStore;

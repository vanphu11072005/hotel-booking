import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
} from '../services/api/promotionService';
import type {
  Promotion,
  PromotionListResponse,
  PromotionSearchParams,
  CreatePromotionData,
  UpdatePromotionData,
} from '../types/promotion';

interface PromotionState {
  promotions: Promotion[];
  promotion?: Promotion | null;
  isLoading: boolean;
  error: string | null;
  pagination?: any | null;

  fetchPromotions: (params?: PromotionSearchParams) => Promise<void>;
  getPromotion: (id: number) => Promise<Promotion | null>;
  create: (data: CreatePromotionData) => Promise<Promotion | null>;
  update: (id: number, data: UpdatePromotionData) => Promise<Promotion | null>;
  remove: (id: number) => Promise<boolean>;
  validateCode: (code: string, bookingValue: number) => Promise<{ promotion: Promotion; discount: number } | null>;

  setPromotions: (promotions: Promotion[]) => void;
  clear: () => void;
}

const usePromotionStore = create<PromotionState>((set) => ({
  promotions: [],
  promotion: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchPromotions: async (params: PromotionSearchParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res: PromotionListResponse = await getPromotions(params);
      if (res && res.data && res.data.promotions) {
        set({ promotions: res.data.promotions || [], pagination: res.data.pagination || null, isLoading: false });
      } else {
        set({ promotions: [], pagination: null, isLoading: false });
      }
    } catch (err: any) {
      console.error('Error fetching promotions:', err);
      set({ error: err?.message || 'Failed to load promotions', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải mã khuyến mãi');
    }
  },

  getPromotion: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getPromotionById(id);
      if (res && (res as any).data?.promotion) {
        set({ promotion: (res as any).data.promotion as Promotion, isLoading: false });
        return (res as any).data.promotion as Promotion;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error getting promotion:', err);
      set({ error: err?.message || 'Failed to get promotion', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể lấy khuyến mãi');
      return null;
    }
  },

  create: async (data: CreatePromotionData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createPromotion(data);
      if (res && (res as any).data?.promotion) {
        const p = (res as any).data.promotion as Promotion;
        set((s) => ({ promotions: [p, ...s.promotions], isLoading: false }));
        toast.success('Tạo khuyến mãi thành công');
        return p;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error creating promotion:', err);
      set({ error: err?.message || 'Failed to create promotion', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tạo khuyến mãi');
      return null;
    }
  },

  update: async (id: number, data: UpdatePromotionData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updatePromotion(id, data);
      if (res && (res as any).data?.promotion) {
        const updated = (res as any).data.promotion as Promotion;
        set((s) => ({ promotions: s.promotions.map((p) => (p.id === updated.id ? updated : p)), isLoading: false }));
        toast.success('Cập nhật khuyến mãi thành công');
        return updated;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error updating promotion:', err);
      set({ error: err?.message || 'Failed to update promotion', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể cập nhật khuyến mãi');
      return null;
    }
  },

  remove: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await deletePromotion(id);
      set({ isLoading: false });
      if (res && (res as any).success) {
        set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) }));
        toast.success('Xóa khuyến mãi thành công');
        return true;
      }
      toast.error(res?.message || 'Xóa thất bại');
      return false;
    } catch (err: any) {
      console.error('Error deleting promotion:', err);
      set({ error: err?.message || 'Failed to delete promotion', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể xóa khuyến mãi');
      return false;
    }
  },

  validateCode: async (code: string, bookingValue: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await validatePromotion(code, bookingValue);
      set({ isLoading: false });
      if (res && (res as any).data) {
        return (res as any).data as { promotion: Promotion; discount: number };
      }
      return null;
    } catch (err: any) {
      console.error('Error validating promotion:', err);
      set({ error: err?.message || 'Failed to validate promotion', isLoading: false });
      toast.error(err?.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
      return null;
    }
  },

  setPromotions: (promotions: Promotion[]) => set({ promotions }),
  clear: () => set({ promotions: [], promotion: null, pagination: null, error: null }),
}));

export default usePromotionStore;

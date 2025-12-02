import { create } from 'zustand';
import { toast } from 'react-toastify';
import { bannerService } from '../services/api';
import type { Banner, BannerListResponse } from '../types/banner';

interface BannerState {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBanners: (params?: Record<string, any>) => Promise<void>;
  fetchBannersByPosition: (position?: string) => Promise<void>;
  getBannerById: (id: number) => Promise<Banner | null>;
  createBanner: (data: any) => Promise<Banner | null>;
  updateBanner: (id: number, data: any) => Promise<Banner | null>;
  deleteBanner: (id: number) => Promise<void>;
  setBanners: (banners: Banner[]) => void;
  clearBanners: () => void;
}

const useBannerStore = create<BannerState>((set) => ({
  banners: [],
  isLoading: false,
  error: null,

  fetchBanners: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response: BannerListResponse = await bannerService.getBanners(
        params
      );

      if (response && response.data) {
        set({ banners: response.data.banners || [], isLoading: false });
      } else {
        set({ banners: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      set({ error: error.message || 'Failed to load banners', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể tải banner');
    }
  },

  fetchBannersByPosition: async (position) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bannerService.getBannersByPosition(position || '');
      if (response && (response.success || response.status === 'success')) {
        set({ banners: response.data.banners || [], isLoading: false });
      } else {
        set({ banners: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching banners by position:', error);
      set({ error: error.message || 'Failed to load banners', isLoading: false });
    }
  },

  getBannerById: async (id: number) => {
    try {
      const response = await bannerService.getBannerById(id);
      if (response && response.data && response.data.banner) {
        return response.data.banner;
      }
      return null;
    } catch (error) {
      console.error('Error getting banner by id:', error);
      return null;
    }
  },

  createBanner: async (data: any) => {
    try {
      const response = await bannerService.createBanner(data);
      if (response && response.data && response.data.banner) {
        // prepend new banner
        set((state) => ({ banners: [response.data.banner, ...state.banners] }));
        return response.data.banner;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating banner:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo banner');
      return null;
    }
  },

  updateBanner: async (id: number, data: any) => {
    try {
      const response = await bannerService.updateBanner(id, data);
      if (response && response.data && response.data.banner) {
        const updated = response.data.banner;
        set((state) => ({
          banners: state.banners.map((b) => (b.id === id ? updated : b)),
        }));
        return updated;
      }
      return null;
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast.error(error?.response?.data?.message || 'Không thể cập nhật banner');
      return null;
    }
  },

  deleteBanner: async (id: number) => {
    try {
      await bannerService.deleteBanner(id);
      set((state) => ({ banners: state.banners.filter((b) => b.id !== id) }));
      toast.success('Xóa banner thành công');
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa banner');
    }
  },

  setBanners: (banners: Banner[]) => set({ banners }),

  clearBanners: () => set({ banners: [], error: null }),
}));

export default useBannerStore;

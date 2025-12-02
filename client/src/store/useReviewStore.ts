import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  getRoomReviews,
  createReview,
  updateReview,
  getReviews as getAllReviews,
  approveReview,
  rejectReview,
} from '../services/api/reviewService';
import type { Review } from '../types/review';

interface ReviewState {
  // Per-room reviews cache
  reviewsByRoom: Record<number, Review[]>;
  isLoading: boolean;
  error: string | null;

  // Admin list
  adminReviews: Review[];
  adminPagination?: { page: number; limit: number; total: number; totalPages?: number } | null;

  // Actions
  fetchRoomReviews: (roomId: number) => Promise<void>;
  addReview: (data: any, appendLocal?: boolean) => Promise<Review | null>;
  editReview: (id: number, data: { rating?: number; comment?: string }) => Promise<Review | null>;
  fetchAdminReviews: (params?: Record<string, any>) => Promise<void>;
  approve: (id: number) => Promise<boolean>;
  reject: (id: number) => Promise<boolean>;
  clearRoomReviews: (roomId: number) => void;
}

const useReviewStore = create<ReviewState>((set) => ({
  reviewsByRoom: {},
  isLoading: false,
  error: null,
  adminReviews: [],
  adminPagination: null,

  fetchRoomReviews: async (roomId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRoomReviews(roomId);
      if (response && response.data) {
        const list: Review[] = response.data.reviews || [];
        set((state) => ({ reviewsByRoom: { ...state.reviewsByRoom, [roomId]: list }, isLoading: false }));
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching room reviews:', error);
      set({ error: error?.message || 'Failed to load reviews', isLoading: false });
    }
  },

  addReview: async (data: any, appendLocal = true) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createReview(data);
      if (response && response.data && response.data.review) {
        const review: Review = response.data.review;
        if (appendLocal && data.room_id) {
          set((state) => {
            const existing = state.reviewsByRoom[data.room_id] || [];
            return { reviewsByRoom: { ...state.reviewsByRoom, [data.room_id]: [review, ...existing] }, isLoading: false };
          });
        } else {
          set({ isLoading: false });
        }
        toast.success(response.message || 'Đã gửi đánh giá');
        return review;
      }
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.error('Error creating review:', error);
      set({ error: error?.message || 'Không thể gửi đánh giá', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể gửi đánh giá');
      return null;
    }
  },

  editReview: async (id: number, data: { rating?: number; comment?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateReview(id, data);
      if (response && response.data && response.data.review) {
        const updated: Review = response.data.review;
        // Update in local cache
        set((state) => {
          const newMap = { ...state.reviewsByRoom };
          Object.keys(newMap).forEach((key) => {
            newMap[parseInt(key, 10)] = newMap[parseInt(key, 10)].map((r) => (r.id === updated.id ? updated : r));
          });
          return { reviewsByRoom: newMap, isLoading: false };
        });
        toast.success(response.message || 'Cập nhật đánh giá thành công');
        return updated;
      }
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.error('Error updating review:', error);
      set({ error: error?.message || 'Không thể cập nhật đánh giá', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể cập nhật đánh giá');
      return null;
    }
  },

  fetchAdminReviews: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllReviews(params);
      if (response && response.data) {
        set({ adminReviews: response.data.reviews || [], isLoading: false, adminPagination: response.data.pagination || null });
      } else {
        set({ adminReviews: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching admin reviews:', error);
      set({ error: error?.message || 'Không thể tải đánh giá', isLoading: false });
    }
  },

  approve: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await approveReview(id);
      if (response && (response.success || response.status === 'success')) {
        // update local admin list
        set((state) => ({ adminReviews: state.adminReviews.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)), isLoading: false }));
        toast.success(response.message || 'Đã duyệt đánh giá');
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      console.error('Error approving review:', error);
      set({ error: error?.message || 'Không thể duyệt đánh giá', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể duyệt đánh giá');
      return false;
    }
  },

  reject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await rejectReview(id);
      if (response && (response.success || response.status === 'success')) {
        set((state) => ({ adminReviews: state.adminReviews.filter((r) => r.id !== id), isLoading: false }));
        toast.success(response.message || 'Đã từ chối đánh giá');
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      console.error('Error rejecting review:', error);
      set({ error: error?.message || 'Không thể từ chối đánh giá', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể từ chối đánh giá');
      return false;
    }
  },

  clearRoomReviews: (roomId: number) => {
    set((state) => {
      const copy = { ...state.reviewsByRoom };
      delete copy[roomId];
      return { reviewsByRoom: copy };
    });
  },
}));

export default useReviewStore;

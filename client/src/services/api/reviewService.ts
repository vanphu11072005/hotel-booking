import apiClient from './apiClient';

/**
 * Review API Service
 */

export interface Review {
  id: number;
  user_id: number;
  room_id: number;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    full_name: string;
    email: string;
  };
  room?: {
    id: number;
    room_number: string;
    room_type?: {
      name: string;
    };
  };
}

export interface ReviewListResponse {
  success: boolean;
  status?: string;
  data: {
    reviews: Review[];
    average_rating?: number;
    total_reviews?: number;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CreateReviewData {
  room_id: number;
  rating: number;
  comment: string;
}

/**
 * Get reviews for a specific room
 */
export const getRoomReviews = async (
  roomId: number
): Promise<ReviewListResponse> => {
  const response = await apiClient.get(
    `/api/rooms/${roomId}/reviews`
  );
  return response.data;
};

/**
 * Create a new review
 */
export const createReview = async (
  data: CreateReviewData
): Promise<{ success: boolean; message: string; data?: Review }> => {
  const response = await apiClient.post('/api/reviews', data);
  return response.data;
};

/**
 * Get all reviews (admin)
 */
export const getReviews = async (
  params?: {
    status?: string;
    roomId?: number;
    page?: number;
    limit?: number;
  }
): Promise<ReviewListResponse> => {
  const response = await apiClient.get('/reviews', { params });
  return response.data;
};

/**
 * Approve review (admin)
 */
export const approveReview = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.patch(`/reviews/${id}/approve`);
  return response.data;
};

/**
 * Reject review (admin)
 */
export const rejectReview = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.patch(`/reviews/${id}/reject`);
  return response.data;
};

export default {
  getRoomReviews,
  createReview,
  getReviews,
  approveReview,
  rejectReview,
};

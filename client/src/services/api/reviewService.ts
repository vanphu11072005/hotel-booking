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
    full_name: string;
    email: string;
  };
}

export interface ReviewListResponse {
  success: boolean;
  status?: string;
  data: {
    reviews: Review[];
    average_rating?: number;
    total_reviews?: number;
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

export default {
  getRoomReviews,
  createReview,
};

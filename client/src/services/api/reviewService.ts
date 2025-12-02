import apiClient from './apiClient';
import type { Review, ReviewListResponse, CreateReviewData } from '../../types/review';

export type ApiResponse<T = any> = {
  success?: boolean;
  status?: string;
  message?: string;
  data?: T;
};

/**
 * Get reviews for a specific room
 */
export const getRoomReviews = async (
  roomId: number
): Promise<ReviewListResponse> => {
  const response = await apiClient.get(`/api/rooms/${roomId}/reviews`);
  return response.data;
};

/**
 * Create a new review
 */
export const createReview = async (
  data: CreateReviewData
): Promise<ApiResponse<{ review: Review }>> => {
  const response = await apiClient.post('/api/reviews', data);
  return response.data as ApiResponse<{ review: Review }>;
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
): Promise<ApiResponse> => {
  const response = await apiClient.patch(`/reviews/${id}/approve`);
  return response.data as ApiResponse;
};

/**
 * Reject review (admin)
 */
export const rejectReview = async (
  id: number
): Promise<ApiResponse> => {
  const response = await apiClient.patch(`/reviews/${id}/reject`);
  return response.data as ApiResponse;
};

/**
 * Update a review (owner)
 */
export const updateReview = async (
  id: number,
  data: { rating?: number; comment?: string }
): Promise<ApiResponse<{ review: Review }>> => {
  const response = await apiClient.patch(`/api/reviews/${id}`, data);
  return response.data as ApiResponse<{ review: Review }>;
};

export default {
  getRoomReviews,
  createReview,
  getReviews,
  approveReview,
  rejectReview,
};

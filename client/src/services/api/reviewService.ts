import apiClient from './apiClient';
import type { Review, ReviewListResponse, CreateReviewData } from '../../types/review';

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

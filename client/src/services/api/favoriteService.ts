import apiClient from './apiClient';
import type {
  FavoriteResponse,
  FavoriteActionResponse,
  CheckFavoriteResponse,
} from '../../types/favorite';

/**
 * Get user's favorite rooms
 */
export const getFavorites = async (): Promise<
  FavoriteResponse
> => {
  const response = await apiClient.get('/api/favorites');
  return response.data;
};

/**
 * Add room to favorites
 */
export const addFavorite = async (
  roomId: number
): Promise<FavoriteActionResponse> => {
  const response = await apiClient.post(
    `/api/favorites/${roomId}`
  );
  return response.data;
};

/**
 * Remove room from favorites
 */
export const removeFavorite = async (
  roomId: number
): Promise<FavoriteActionResponse> => {
  const response = await apiClient.delete(
    `/api/favorites/${roomId}`
  );
  return response.data;
};

/**
 * Check if room is favorited
 */
export const checkFavorite = async (
  roomId: number
): Promise<CheckFavoriteResponse> => {
  const response = await apiClient.get(
    `/api/favorites/check/${roomId}`
  );
  return response.data;
};

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};

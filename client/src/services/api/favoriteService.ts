import apiClient from './apiClient';
import type { Room } from './roomService';

/**
 * Favorite API Service
 */

export interface Favorite {
  id: number;
  user_id: number;
  room_id: number;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface FavoriteResponse {
  success?: boolean;
  status: string;
  message?: string;
  data?: {
    favorites: Favorite[];
    total: number;
  };
}

export interface FavoriteActionResponse {
  success?: boolean;
  status: string;
  message: string;
  data?: {
    favorite: Favorite;
  };
}

export interface CheckFavoriteResponse {
  success?: boolean;
  status: string;
  data: {
    isFavorited: boolean;
  };
}

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

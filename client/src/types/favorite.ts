import type { Room } from './rooms';

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
  data?: { favorite: Favorite };
}

export interface CheckFavoriteResponse {
  success?: boolean;
  status: string;
  data: { isFavorited: boolean };
}

export default Favorite;

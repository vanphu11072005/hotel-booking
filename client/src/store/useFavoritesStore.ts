import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../services/api/favoriteService';
import type { Favorite } from '../services/api/favoriteService';

interface FavoritesState {
  favorites: Favorite[];
  favoriteRoomIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFavorites: () => Promise<void>;
  addToFavorites: (roomId: number) => Promise<void>;
  removeFromFavorites: (roomId: number) => Promise<void>;
  isFavorited: (roomId: number) => boolean;
  syncGuestFavorites: () => Promise<void>;
  clearFavorites: () => void;
  
  // Guest favorites (localStorage)
  loadGuestFavorites: () => void;
  saveGuestFavorite: (roomId: number) => void;
  removeGuestFavorite: (roomId: number) => void;
}

const GUEST_FAVORITES_KEY = 'guestFavorites';

// Helper functions for localStorage
const getGuestFavorites = (): number[] => {
  try {
    const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading guest favorites:', error);
    return [];
  }
};

const setGuestFavorites = (roomIds: number[]): void => {
  try {
    localStorage.setItem(
      GUEST_FAVORITES_KEY,
      JSON.stringify(roomIds)
    );
  } catch (error) {
    console.error('Error saving guest favorites:', error);
  }
};

const useFavoritesStore = create<FavoritesState>(
  (set, get) => ({
    favorites: [],
    favoriteRoomIds: new Set(),
    isLoading: false,
    error: null,

    // Fetch favorites from server (authenticated users)
    fetchFavorites: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await getFavorites();
        
        if (
          response.status === 'success' && 
          response.data
        ) {
          const favorites = response.data.favorites;
          const roomIds = new Set(
            favorites.map((f) => f.room_id)
          );
          
          set({
            favorites,
            favoriteRoomIds: roomIds,
            isLoading: false,
          });
        }
      } catch (error: any) {
        console.error('Error fetching favorites:', error);
        
        // If user is not authenticated, load guest favorites
        if (error.response?.status === 401) {
          get().loadGuestFavorites();
        } else {
          set({
            error: 
              error.response?.data?.message ||
              'Không thể tải danh sách yêu thích',
            isLoading: false,
          });
        }
      }
    },

    // Add room to favorites
    addToFavorites: async (roomId: number) => {
      try {
        const response = await addFavorite(roomId);
        
        if (response.status === 'success') {
          // Update state
          set((state) => {
            const newFavoriteIds = new Set(
              state.favoriteRoomIds
            );
            newFavoriteIds.add(roomId);
            
            return {
              favoriteRoomIds: newFavoriteIds,
            };
          });

          // Re-fetch to get complete data
          await get().fetchFavorites();
          
          toast.success(
            response.message || 
            'Đã thêm vào danh sách yêu thích'
          );
        }
      } catch (error: any) {
        console.error('Error adding favorite:', error);
        
        // If not authenticated, save to guest favorites
        if (error.response?.status === 401) {
          get().saveGuestFavorite(roomId);
          toast.success('Đã thêm vào danh sách yêu thích');
        } else {
          const message =
            error.response?.data?.message ||
            'Không thể thêm vào yêu thích';
          toast.error(message);
        }
      }
    },

    // Remove room from favorites
    removeFromFavorites: async (roomId: number) => {
      try {
        const response = await removeFavorite(roomId);
        
        if (response.status === 'success') {
          // Update state
          set((state) => {
            const newFavoriteIds = new Set(
              state.favoriteRoomIds
            );
            newFavoriteIds.delete(roomId);
            
            const newFavorites = state.favorites.filter(
              (f) => f.room_id !== roomId
            );
            
            return {
              favorites: newFavorites,
              favoriteRoomIds: newFavoriteIds,
            };
          });
          
          toast.success(
            response.message || 
            'Đã xóa khỏi danh sách yêu thích'
          );
        }
      } catch (error: any) {
        console.error('Error removing favorite:', error);
        
        // If not authenticated, remove from guest favorites
        if (error.response?.status === 401) {
          get().removeGuestFavorite(roomId);
          toast.success('Đã xóa khỏi danh sách yêu thích');
        } else {
          const message =
            error.response?.data?.message ||
            'Không thể xóa khỏi yêu thích';
          toast.error(message);
        }
      }
    },

    // Check if room is favorited
    isFavorited: (roomId: number) => {
      return get().favoriteRoomIds.has(roomId);
    },

    // Sync guest favorites to server after login
    syncGuestFavorites: async () => {
      const guestFavorites = getGuestFavorites();
      
      if (guestFavorites.length === 0) {
        return;
      }

      try {
        // Add each guest favorite to server
        await Promise.all(
          guestFavorites.map((roomId) =>
            addFavorite(roomId).catch(() => {
              // Ignore errors (room might already be favorited)
            })
          )
        );

        // Clear guest favorites
        localStorage.removeItem(GUEST_FAVORITES_KEY);
        
        // Fetch updated favorites
        await get().fetchFavorites();
        
        toast.success(
          'Đã đồng bộ danh sách yêu thích'
        );
      } catch (error) {
        console.error(
          'Error syncing guest favorites:', 
          error
        );
      }
    },

    // Clear all favorites
    clearFavorites: () => {
      set({
        favorites: [],
        favoriteRoomIds: new Set(),
        error: null,
      });
      localStorage.removeItem(GUEST_FAVORITES_KEY);
    },

    // Guest favorites management
    loadGuestFavorites: () => {
      const guestFavorites = getGuestFavorites();
      set({
        favoriteRoomIds: new Set(guestFavorites),
        isLoading: false,
      });
    },

    saveGuestFavorite: (roomId: number) => {
      const guestFavorites = getGuestFavorites();
      
      if (!guestFavorites.includes(roomId)) {
        const updated = [...guestFavorites, roomId];
        setGuestFavorites(updated);
        
        set((state) => {
          const newFavoriteIds = new Set(
            state.favoriteRoomIds
          );
          newFavoriteIds.add(roomId);
          return { favoriteRoomIds: newFavoriteIds };
        });
      }
    },

    removeGuestFavorite: (roomId: number) => {
      const guestFavorites = getGuestFavorites();
      const updated = guestFavorites.filter(
        (id) => id !== roomId
      );
      setGuestFavorites(updated);
      
      set((state) => {
        const newFavoriteIds = new Set(
          state.favoriteRoomIds
        );
        newFavoriteIds.delete(roomId);
        return { favoriteRoomIds: newFavoriteIds };
      });
    },
  })
);

export default useFavoritesStore;

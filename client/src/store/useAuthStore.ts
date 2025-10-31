import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api/auth.api';
import { STORAGE_KEYS } from '@/constants';
import type { User, LoginCredentials, RegisterData } 
  from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);
          const { user, token, refreshToken } = response.data;

          // Save to localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN, 
            refreshToken
          );
          localStorage.setItem(
            STORAGE_KEYS.USER, 
            JSON.stringify(user)
          );

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          const { user, token, refreshToken } = response.data;

          // Save to localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN, 
            refreshToken
          );
          localStorage.setItem(
            STORAGE_KEYS.USER, 
            JSON.stringify(user)
          );

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear localStorage
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);

          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user) => {
        set({ user });
        localStorage.setItem(
          STORAGE_KEYS.USER, 
          JSON.stringify(user)
        );
      },

      setToken: (token, refreshToken) => {
        set({ token, refreshToken });
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN, 
          refreshToken
        );
      },

      checkAuth: async () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
            });

            // Verify token by fetching profile
            const response = await authApi.getProfile();
            set({ user: response.data });
          } catch (error) {
            // Token invalid, clear everything
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

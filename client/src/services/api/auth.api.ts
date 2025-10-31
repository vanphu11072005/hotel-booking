import apiClient from './axios';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse 
} from '@/types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      data
    );
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post(
      '/api/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },
};

import apiClient from './apiClient';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
} from '../../types/auth';

/**
 * Auth Service - Xử lý các API calls liên quan 
 * đến authentication
 */
const authService = {
  /**
   * Đăng nhập
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      credentials
    );
    return response.data;
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (
    data: RegisterData
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getProfile: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>(
      '/api/auth/profile'
    );
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: Partial<{ full_name: string; phone_number: string }>) => {
    const response = await apiClient.put('/api/auth/profile', data);
    return response.data;
  },

  /**
   * Upload avatar file for current user
   */
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    const response = await apiClient.put('/api/auth/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Refresh token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    // No need to send refreshToken in body - it's in cookie
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/refresh-token'
    );
    return response.data;
  },

  /**
   * Quên mật khẩu - Gửi email reset
   */
  forgotPassword: async (
    data: ForgotPasswordData
  ): Promise<{ status?: string; success?: boolean; message?: string }> => {
    const response = await apiClient.post(
      '/api/auth/forgot-password',
      data
    );
    return response.data;
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (
    data: ResetPasswordData
  ): Promise<{ status?: string; success?: boolean; message?: string }> => {
    const response = await apiClient.post(
      '/api/auth/reset-password',
      data
    );
    return response.data;
  },
};

export default authService;

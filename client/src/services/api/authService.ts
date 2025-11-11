import apiClient from './apiClient';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  // Server may use `status: 'success'` or boolean `success`
  status?: string;
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    refreshToken?: string;
    user?: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
      role: string;
      createdAt?: string;
    };
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

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
   * Refresh token
   */
  refreshToken: async (
    refreshToken: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/refresh-token',
      { refreshToken }
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

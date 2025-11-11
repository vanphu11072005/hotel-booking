import { create } from 'zustand';
import { toast } from 'react-toastify';
import authService, { 
  LoginCredentials, 
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData
} from '../services/api/authService';

// Types
interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt?: string;
}

interface AuthState {
  // State
  token: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo) => void;
  refreshAuthToken: () => Promise<void>;
  forgotPassword: (
    data: ForgotPasswordData
  ) => Promise<void>;
  resetPassword: (
    data: ResetPasswordData
  ) => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;
}

/**
 * useAuthStore - Zustand store quản lý 
 * authentication state
 */
const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')!)
    : null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  /**
   * Login - Đăng nhập
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);

      // Accept either boolean `success` (client) or `status: 'success'` (server)
      if (response.success || response.status === 'success') {
        const token = response.data?.token;
        const refreshToken = response.data?.refreshToken;
        const user = response.data?.user ?? null;

        // If we didn't receive a token or user, treat as failure
        if (!token || !user) {
          throw new Error(response.message || 'Đăng nhập thất bại.');
        }

        // Lưu vào localStorage
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('userInfo', JSON.stringify(user));

        // Cập nhật state
        set({
          token,
          refreshToken: refreshToken || null,
          userInfo: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast.success('Đăng nhập thành công!');
      }
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        'Đăng nhập thất bại. Vui lòng thử lại.';
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false 
      });
      
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Register - Đăng ký tài khoản mới
   */
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      
  if (response.success || response.status === 'success') {
        set({ isLoading: false, error: null });
        toast.success(
          'Đăng ký thành công! Vui lòng đăng nhập.'
        );
      }
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        'Đăng ký thất bại. Vui lòng thử lại.';
      
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Logout - Đăng xuất
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');

      // Reset state
      set({
        token: null,
        refreshToken: null,
        userInfo: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      toast.info('Đã đăng xuất');
    }
  },

  /**
   * SetUser - Cập nhật thông tin user
   */
  setUser: (user: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(user));
    set({ userInfo: user });
  },

  /**
   * Refresh Token - Làm mới token
   */
  refreshAuthToken: async () => {
    const { refreshToken } = get();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refreshToken(refreshToken);

      if (response.success || response.status === 'success') {
        const token = response.data?.token;
        const newRefreshToken = response.data?.refreshToken;

        if (!token) {
          throw new Error(response.message || 'Không thể làm mới token');
        }

        localStorage.setItem('token', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        set({
          token,
          refreshToken: newRefreshToken || refreshToken,
        });
      }
    } catch (error) {
      // Nếu refresh token thất bại, logout
      get().logout();
      throw error;
    }
  },

  /**
   * Forgot Password - Quên mật khẩu
   */
  forgotPassword: async (data: ForgotPasswordData) => {
    set({ isLoading: true, error: null });
    try {
      const response = 
        await authService.forgotPassword(data);
      
  if (response.success || response.status === 'success') {
        set({ isLoading: false, error: null });
        toast.success(
          response.message || 
          'Vui lòng kiểm tra email để đặt lại mật khẩu.'
        );
      }
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        'Có lỗi xảy ra. Vui lòng thử lại.';
      
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Reset Password - Đặt lại mật khẩu
   */
  resetPassword: async (data: ResetPasswordData) => {
    set({ isLoading: true, error: null });
    try {
      const response = 
        await authService.resetPassword(data);
      
  if (response.success || response.status === 'success') {
        set({ isLoading: false, error: null });
        toast.success(
          response.message || 
          'Đặt lại mật khẩu thành công!'
        );
      }
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message || 
        'Đặt lại mật khẩu thất bại. ' +
        'Vui lòng thử lại.';
      
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Initialize Auth - Khởi tạo auth state 
   * khi app load
   */
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const refreshToken = 
      localStorage.getItem('refreshToken');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      set({
        token,
        refreshToken,
        userInfo: JSON.parse(userInfo),
        isAuthenticated: true,
      });
    }
  },

  /**
   * Clear Error - Xóa error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;

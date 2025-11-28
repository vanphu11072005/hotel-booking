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

export interface ForgotPasswordData { email: string }
export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export default AuthResponse;

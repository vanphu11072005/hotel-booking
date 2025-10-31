export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  avatar?: string;
  is_active: boolean;
  role: Role;
}

export interface Role {
  id: number;
  name: 'admin' | 'staff' | 'customer';
  description?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
}

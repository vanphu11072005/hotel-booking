export interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  role: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserListResponse {
  success: boolean;
  status?: string;
  data: {
    users: User[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  role: string;
  status?: string;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  password?: string;
  status?: string;
}

export interface UserSearchParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export default User;

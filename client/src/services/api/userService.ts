import apiClient from './apiClient';

/**
 * User API Service
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
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
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
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

/**
 * Get all users
 */
export const getUsers = async (
  params: UserSearchParams = {}
): Promise<UserListResponse> => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (
  id: number
): Promise<{ success: boolean; data: { user: User } }> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

/**
 * Create new user
 */
export const createUser = async (
  data: CreateUserData
): Promise<{ success: boolean; data: { user: User }; message: string }> => {
  const response = await apiClient.post('/users', data);
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (
  id: number,
  data: UpdateUserData
): Promise<{ success: boolean; data: { user: User }; message: string }> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../services/api/userService';
import type {
  User,
  UserSearchParams,
  CreateUserData,
  UpdateUserData,
} from '../types/user';

interface UserState {
  users: User[];
  user?: User | null;
  isLoading: boolean;
  error: string | null;
  pagination?: { total: number; page: number; limit: number; totalPages?: number } | null;

  fetchUsers: (params?: UserSearchParams) => Promise<void>;
  getUser: (id: number) => Promise<User | null>;
  create: (data: CreateUserData) => Promise<User | null>;
  update: (id: number, data: UpdateUserData) => Promise<User | null>;
  remove: (id: number) => Promise<boolean>;

  setUsers: (users: User[]) => void;
  clear: () => void;
}

const useUserStore = create<UserState>((set) => ({
  users: [],
  user: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchUsers: async (params: UserSearchParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUsers(params);
      if (response && response.data) {
        const users = response.data.users || [];
        set({ users, pagination: response.data.pagination || null, isLoading: false });
      } else {
        set({ users: [], pagination: null, isLoading: false });
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      set({ error: err?.message || 'Failed to load users', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách người dùng');
    }
  },

  getUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserById(id);
      if (response && response.data && response.data.user) {
        set({ user: response.data.user as User, isLoading: false });
        return response.data.user as User;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error getting user:', err);
      set({ error: err?.message || 'Failed to get user', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể lấy thông tin người dùng');
      return null;
    }
  },

  create: async (data: CreateUserData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createUser(data);
      if (response && response.data && response.data.user) {
        const created = response.data.user as User;
        set((state) => ({ users: [created, ...state.users], isLoading: false }));
        toast.success('Tạo người dùng thành công');
        return created;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error creating user:', err);
      set({ error: err?.message || 'Failed to create user', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tạo người dùng');
      return null;
    }
  },

  update: async (id: number, data: UpdateUserData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateUser(id, data);
      if (response && response.data && response.data.user) {
        const updated = response.data.user as User;
        set((state) => ({ users: state.users.map((u) => (u.id === id ? updated : u)), isLoading: false }));
        toast.success('Cập nhật người dùng thành công');
        return updated;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error updating user:', err);
      set({ error: err?.message || 'Failed to update user', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể cập nhật người dùng');
      return null;
    }
  },

  remove: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteUser(id);
      if (response && (response as any).success) {
        set((state) => ({ users: state.users.filter((u) => u.id !== id), isLoading: false }));
        toast.success('Xóa người dùng thành công');
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.error('Error deleting user:', err);
      set({ error: err?.message || 'Failed to delete user', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể xóa người dùng');
      return false;
    }
  },

  setUsers: (users: User[]) => set({ users }),
  clear: () => set({ users: [], user: null, pagination: null, error: null }),
}));

export default useUserStore;

import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../services/api/serviceService';
import type { Service } from '../types/service';

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchServices: (params?: Record<string, any>) => Promise<void>;
  getService: (id: number) => Promise<Service | null>;
  create: (data: any) => Promise<Service | null>;
  update: (id: number, data: any) => Promise<Service | null>;
  remove: (id: number) => Promise<boolean>;
  setServices: (services: Service[]) => void;
  clearServices: () => void;
}

const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getServices(params);
      if (response && response.data) {
        set({ services: response.data.services || [], isLoading: false });
      } else {
        set({ services: [], isLoading: false });
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      set({ error: error?.message || 'Failed to load services', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể tải dịch vụ');
    }
  },

  getService: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getServiceById(id);
      if (response && response.data && response.data.service) {
        set({ isLoading: false });
        return response.data.service as Service;
      }
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.error('Error getting service:', error);
      set({ error: error?.message || 'Failed to get service', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể lấy dịch vụ');
      return null;
    }
  },

  create: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createService(data);
      if (response && response.data && response.data.service) {
        const created: Service = response.data.service;
        set((state) => ({ services: [created, ...state.services], isLoading: false }));
        toast.success(response.message || 'Tạo dịch vụ thành công');
        return created;
      }
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.error('Error creating service:', error);
      set({ error: error?.message || 'Failed to create service', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể tạo dịch vụ');
      return null;
    }
  },

  update: async (id: number, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateService(id, data);
      if (response && response.data && response.data.service) {
        const updated: Service = response.data.service;
        set((state) => ({ services: state.services.map((s) => (s.id === id ? updated : s)), isLoading: false }));
        toast.success(response.message || 'Cập nhật dịch vụ thành công');
        return updated;
      }
      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.error('Error updating service:', error);
      set({ error: error?.message || 'Failed to update service', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể cập nhật dịch vụ');
      return null;
    }
  },

  remove: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteService(id);
      const ok = response && (((response as any).success) || ((response as any).status === 'success'));
      if (ok) {
        set((state) => ({ services: state.services.filter((s) => s.id !== id), isLoading: false }));
        toast.success((response as any).message || 'Xóa dịch vụ thành công');
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      set({ error: error?.message || 'Failed to delete service', isLoading: false });
      toast.error(error?.response?.data?.message || 'Không thể xóa dịch vụ');
      return false;
    }
  },

  setServices: (services: Service[]) => set({ services }),

  clearServices: () => set({ services: [], error: null }),
}));

export default useServiceStore;

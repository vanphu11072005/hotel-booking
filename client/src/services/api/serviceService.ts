import apiClient from './apiClient';

/**
 * Service API Service
 */

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  category?: string;
  is_active?: boolean;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ServiceListResponse {
  success: boolean;
  status?: string;
  data: {
    services: Service[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  status?: 'active' | 'inactive';
  category?: string;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  status?: 'active' | 'inactive';
  category?: string;
}

export interface ServiceSearchParams {
  status?: string;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all services
 */
export const getServices = async (
  params: ServiceSearchParams = {}
): Promise<ServiceListResponse> => {
  // Chỉ truyền category nếu có giá trị
  const queryParams = { ...params };
  if (!params.category) {
    delete queryParams.category;
  }
  const response = await apiClient.get('/services', { params: queryParams });
  // Map is_active to status cho frontend
  if (response.data.data?.services) {
    response.data.data.services = response.data.data.services.map((service: any) => ({
      ...service,
      status: service.is_active ? 'active' : 'inactive'
    }));
  }
  return response.data;
};

/**
 * Get service by ID
 */
export const getServiceById = async (
  id: number
): Promise<{ success: boolean; data: { service: Service } }> => {
  const response = await apiClient.get(`/services/${id}`);
  // Map is_active to status for frontend
  if (response.data.data?.service) {
    response.data.data.service = {
      ...response.data.data.service,
      status: response.data.data.service.is_active ? 'active' : 'inactive'
    };
  }
  return response.data;
};

/**
 * Create new service
 */
export const createService = async (
  data: CreateServiceData
): Promise<{ success: boolean; data: { service: Service }; message: string }> => {
  const response = await apiClient.post('/services', data);
  return response.data;
};

/**
 * Update service
 */
export const updateService = async (
  id: number,
  data: UpdateServiceData
): Promise<{ success: boolean; data: { service: Service }; message: string }> => {
  const response = await apiClient.put(`/services/${id}`, data);
  return response.data;
};

/**
 * Delete service
 */
export const deleteService = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/services/${id}`);
  return response.data;
};

/**
 * Use service
 */
export const useService = async (data: {
  booking_id: number;
  service_id: number;
  quantity: number;
}): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/services/use', data);
  return response.data;
};

export default {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  useService,
};

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
  status: 'active' | 'inactive';
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
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  status?: 'active' | 'inactive';
}

export interface ServiceSearchParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all services
 */
export const getServices = async (
  params: ServiceSearchParams = {}
): Promise<ServiceListResponse> => {
  const response = await apiClient.get('/services', { params });
  return response.data;
};

/**
 * Get service by ID
 */
export const getServiceById = async (
  id: number
): Promise<{ success: boolean; data: { service: Service } }> => {
  const response = await apiClient.get(`/services/${id}`);
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

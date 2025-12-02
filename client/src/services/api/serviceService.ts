import apiClient from './apiClient';
import type {
  Service,
  ServiceListResponse,
  CreateServiceData,
  UpdateServiceData,
  ServiceSearchParams,
} from '../../types/service';

/**
 * Get all services
 */
export const getServices = async (
  params: ServiceSearchParams = {}
): Promise<ServiceListResponse> => {
  const queryParams = { ...params };
  if (!params.category) {
    delete queryParams.category;
  }
  const response = await apiClient.get('/services', { params: queryParams });
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

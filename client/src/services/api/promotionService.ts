import apiClient from './apiClient';

/**
 * Promotion API Service
 */

export interface Promotion {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count?: number;
  status: 'active' | 'inactive' | 'expired';
  created_at?: string;
  updated_at?: string;
}

export interface PromotionListResponse {
  success: boolean;
  status?: string;
  data: {
    promotions: Promotion[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CreatePromotionData {
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  status?: 'active' | 'inactive' | 'expired';
}

export interface UpdatePromotionData {
  code?: string;
  name?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  status?: 'active' | 'inactive' | 'expired';
}

export interface PromotionSearchParams {
  status?: string;
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all promotions
 */
export const getPromotions = async (
  params: PromotionSearchParams = {}
): Promise<PromotionListResponse> => {
  // Map 'fixed' to 'fixed_amount' for backend filter
  const mappedParams = {
    ...params,
    type: params.type === 'fixed' ? 'fixed_amount' : params.type,
  };
  const response = await apiClient.get('/promotions', { params: mappedParams });
  // Map is_active to status for frontend
  if (response.data.data?.promotions) {
    response.data.data.promotions = response.data.data.promotions.map((promotion: any) => ({
      ...promotion,
      status: promotion.is_active ? 'active' : 'inactive',
      discount_type: promotion.discount_type === 'fixed_amount' ? 'fixed' : promotion.discount_type,
    }));
  }
  return response.data;
};

/**
 * Get promotion by ID
 */
export const getPromotionById = async (
  id: number
): Promise<{ success: boolean; data: { promotion: Promotion } }> => {
  const response = await apiClient.get(`/promotions/${id}`);
  return response.data;
};

/**
 * Create new promotion
 */
export const createPromotion = async (
  data: CreatePromotionData
): Promise<{ success: boolean; data: { promotion: Promotion }; message: string }> => {
  // Map 'fixed' to 'fixed_amount' for backend
  const mappedData = {
    ...data,
    discount_type: data.discount_type === 'fixed' ? 'fixed_amount' : data.discount_type,
  };
  const response = await apiClient.post('/promotions', mappedData);
  return response.data;
};

/**
 * Update promotion
 */
export const updatePromotion = async (
  id: number,
  data: UpdatePromotionData
): Promise<{ success: boolean; data: { promotion: Promotion }; message: string }> => {
  // Map 'fixed' to 'fixed_amount' for backend
  const mappedData = {
    ...data,
    discount_type: data.discount_type === 'fixed' ? 'fixed_amount' : data.discount_type,
  };
  const response = await apiClient.put(`/promotions/${id}`, mappedData);
  return response.data;
};

/**
 * Delete promotion
 */
export const deletePromotion = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/promotions/${id}`);
  return response.data;
};

/**
 * Validate promotion code
 */
export const validatePromotion = async (
  code: string,
  bookingValue: number
): Promise<{ success: boolean; data: { promotion: Promotion; discount: number }; message: string }> => {
  const response = await apiClient.post('/promotions/validate', {
    code,
    booking_value: bookingValue,
  });
  return response.data;
};

export default {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
};

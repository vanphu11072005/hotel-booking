import apiClient from './apiClient';

/**
 * Banner API Service
 */

export interface Banner {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BannerListResponse {
  success: boolean;
  status?: string;
  data: {
    banners: Banner[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface BannerResponse {
  success: boolean;
  data: {
    banner: Banner;
  };
  message?: string;
}

/**
 * Get all banners with filters and pagination
 */
export const getBanners = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<BannerListResponse> => {
  const response = await apiClient.get('/banners', { params });
  return response.data;
};

/**
 * Get banner by ID
 */
export const getBannerById = async (id: number): Promise<BannerResponse> => {
  const response = await apiClient.get(`/banners/${id}`);
  return response.data;
};

/**
 * Create new banner
 */
export const createBanner = async (data: Partial<Banner>): Promise<BannerResponse> => {
  const response = await apiClient.post('/banners', data);
  return response.data;
};

/**
 * Update banner
 */
export const updateBanner = async (id: number, data: Partial<Banner>): Promise<BannerResponse> => {
  const response = await apiClient.put(`/banners/${id}`, data);
  return response.data;
};

/**
 * Delete banner
 */
export const deleteBanner = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/banners/${id}`);
  return response.data;
};

/**
 * Get banners by position (for public use)
 */
export const getBannersByPosition = async (
  position: string = 'home'
): Promise<BannerListResponse> => {
  const response = await apiClient.get('/banners', {
    params: { position },
  });
  return response.data;
};

/**
 * Get all active banners
 */
export const getActiveBanners = async (): 
  Promise<BannerListResponse> => {
  const response = await apiClient.get('/banners');
  return response.data;
};

export default {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannersByPosition,
  getActiveBanners,
};

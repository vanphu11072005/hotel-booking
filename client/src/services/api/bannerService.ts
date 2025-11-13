import apiClient from './apiClient';

/**
 * Banner API Service
 */

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link?: string;
  position: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BannerListResponse {
  success: boolean;
  status?: string;
  data: {
    banners: Banner[];
  };
  message?: string;
}

/**
 * Get banners by position
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
  getBannersByPosition,
  getActiveBanners,
};

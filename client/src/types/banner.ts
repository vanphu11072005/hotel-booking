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

export default Banner;

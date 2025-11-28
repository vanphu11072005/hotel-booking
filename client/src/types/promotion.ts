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

export default Promotion;

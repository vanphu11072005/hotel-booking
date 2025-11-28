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
    pagination?: { total: number; page: number; limit: number; totalPages: number };
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

export default Service;

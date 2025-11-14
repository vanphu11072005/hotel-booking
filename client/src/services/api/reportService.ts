import apiClient from './apiClient';

/**
 * Report API Service
 */

export interface ReportData {
  total_bookings: number;
  total_revenue: number;
  total_customers: number;
  available_rooms: number;
  occupied_rooms: number;
  revenue_by_date?: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  bookings_by_status?: {
    pending: number;
    confirmed: number;
    checked_in: number;
    checked_out: number;
    cancelled: number;
  };
  top_rooms?: Array<{
    room_id: number;
    room_number: string;
    bookings: number;
    revenue: number;
  }>;
  service_usage?: Array<{
    service_id: number;
    service_name: string;
    usage_count: number;
    total_revenue: number;
  }>;
}

export interface ReportResponse {
  success: boolean;
  status?: string;
  data: ReportData;
  message?: string;
}

export interface ReportParams {
  from?: string;
  to?: string;
  type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Get reports
 */
export const getReports = async (
  params: ReportParams = {}
): Promise<ReportResponse> => {
  const response = await apiClient.get('/reports', { params });
  return response.data;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<ReportResponse> => {
  const response = await apiClient.get('/reports/dashboard');
  return response.data;
};

/**
 * Export report to CSV
 */
export const exportReport = async (
  params: ReportParams = {}
): Promise<Blob> => {
  const response = await apiClient.get('/reports/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export default {
  getReports,
  getDashboardStats,
  exportReport,
};

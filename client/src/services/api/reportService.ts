import apiClient from './apiClient';
import type { ReportResponse, ReportParams } from '../../types/report';

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

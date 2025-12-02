import { create } from 'zustand';
import { toast } from 'react-toastify';
import { getReports, getDashboardStats, exportReport } from '../services/api/reportService';
import type { ReportData, DashboardData, ReportParams } from '../types/report';

interface ReportState {
  report?: ReportData | DashboardData | null;
  dashboard?: DashboardData | null;
  isLoading: boolean;
  error: string | null;

  fetchReport: (params?: ReportParams) => Promise<ReportData | DashboardData | null>;
  fetchDashboard: () => Promise<DashboardData | null>;
  exportReport: (params?: ReportParams) => Promise<Blob | null>;

  setReport: (r: ReportData | DashboardData | null) => void;
  clear: () => void;
}

const useReportStore = create<ReportState>((set) => ({
  report: null,
  dashboard: null,
  isLoading: false,
  error: null,

  fetchReport: async (params: ReportParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getReports(params);
      set({ isLoading: false });
      if (res && (res as any).data) {
        set({ report: (res as any).data as ReportData | DashboardData });
        return (res as any).data as ReportData | DashboardData;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching report:', err);
      set({ error: err?.message || 'Failed to fetch report', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải báo cáo');
      return null;
    }
  },

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getDashboardStats();
      set({ isLoading: false });
      if (res && (res as any).data) {
        set({ dashboard: (res as any).data as DashboardData });
        return (res as any).data as DashboardData;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      set({ error: err?.message || 'Failed to fetch dashboard', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải số liệu dashboard');
      return null;
    }
  },

  exportReport: async (params: ReportParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const blob = await exportReport(params);
      set({ isLoading: false });
      return blob;
    } catch (err: any) {
      console.error('Error exporting report:', err);
      set({ error: err?.message || 'Failed to export report', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể xuất báo cáo');
      return null;
    }
  },

  setReport: (r) => set({ report: r }),
  clear: () => set({ report: null, dashboard: null, error: null }),
}));

export default useReportStore;

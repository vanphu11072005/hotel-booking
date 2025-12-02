import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  createPayment,
  getPaymentByBookingId,
  confirmBankTransfer,
  confirmDepositPayment,
  notifyPaymentCompletion,
  getPayments,
  createVNPayPayment,
  verifyVNPayReturn,
  getPaymentsByBookingId,
} from '../services/api/paymentService';
import type { Payment, PaymentData } from '../types/payment';

interface PaymentState {
  payments: Payment[];
  payment?: Payment | null;
  isLoading: boolean;
  error: string | null;
  pagination?: any | null;

  create: (data: PaymentData) => Promise<Payment | null>;
  getByBooking: (bookingId: number) => Promise<Payment | null>;
  confirmBankTransfer: (bookingId: number, transactionId?: string, receipt?: File) => Promise<boolean>;
  confirmDeposit: (paymentId: number, transactionId?: string) => Promise<boolean>;
  notifyCompletion: (paymentId: number, notes?: string) => Promise<boolean>;
  fetchPayments: (params?: Record<string, any>) => Promise<void>;
  createVNPay: (paymentId: number, returnUrl?: string) => Promise<{ payment_url?: string; payment_id?: number } | null>;
  verifyVNPay: (queryParams: string) => Promise<any>;
  getPaymentsByBooking: (bookingId: number) => Promise<Payment[] | null>;

  setPayments: (payments: Payment[]) => void;
  clear: () => void;
}

const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  payment: null,
  isLoading: false,
  error: null,
  pagination: null,

  create: async (data: PaymentData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createPayment(data);
      if (res && (res as any).success && (res as any).data?.payment) {
        const p = (res as any).data.payment as Payment;
        set((s) => ({ payments: [p, ...s.payments], isLoading: false }));
        toast.success('Tạo payment thành công');
        return p;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error creating payment:', err);
      set({ error: err?.message || 'Failed to create payment', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tạo payment');
      return null;
    }
  },

  getByBooking: async (bookingId: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getPaymentByBookingId(bookingId);
      if (res && (res as any).data?.payment) {
        set({ payment: (res as any).data.payment as Payment, isLoading: false });
        return (res as any).data.payment as Payment;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error getting payment by booking:', err);
      set({ error: err?.message || 'Failed to get payment', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể lấy payment');
      return null;
    }
  },

  confirmBankTransfer: async (bookingId: number, transactionId?: string, receipt?: File) => {
    set({ isLoading: true, error: null });
    try {
      const res = await confirmBankTransfer(bookingId, transactionId, receipt);
      set({ isLoading: false });
      if (res && (res as any).success) {
        toast.success(res.message || 'Xác nhận chuyển khoản thành công');
        return true;
      }
      toast.error(res.message || 'Xác nhận thất bại');
      return false;
    } catch (err: any) {
      console.error('Error confirming bank transfer:', err);
      set({ error: err?.message || 'Failed to confirm', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể xác nhận chuyển khoản');
      return false;
    }
  },

  confirmDeposit: async (paymentId: number, transactionId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await confirmDepositPayment(paymentId, transactionId);
      set({ isLoading: false });
      if (res && (res as any).success) {
        toast.success(res.message || 'Xác nhận đặt cọc thành công');
        return true;
      }
      toast.error(res.message || 'Xác nhận thất bại');
      return false;
    } catch (err: any) {
      console.error('Error confirming deposit:', err);
      set({ error: err?.message || 'Failed to confirm deposit', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể xác nhận đặt cọc');
      return false;
    }
  },

  notifyCompletion: async (paymentId: number, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await notifyPaymentCompletion(paymentId, notes);
      set({ isLoading: false });
      if (res && (res as any).success) {
        toast.success(res.message || 'Thông báo hoàn tất thanh toán gửi admin');
        return true;
      }
      toast.error(res.message || 'Gửi thất bại');
      return false;
    } catch (err: any) {
      console.error('Error notifying completion:', err);
      set({ error: err?.message || 'Failed to notify', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể gửi thông báo');
      return false;
    }
  },

  fetchPayments: async (params: Record<string, any> = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getPayments(params);
      if (res && (res as any).data?.payments) {
        set({ payments: (res as any).data.payments || [], pagination: (res as any).data.pagination || null, isLoading: false });
      } else {
        set({ payments: [], pagination: null, isLoading: false });
      }
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      set({ error: err?.message || 'Failed to load payments', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách thanh toán');
    }
  },

  createVNPay: async (paymentId: number, returnUrl?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createVNPayPayment(paymentId, returnUrl);
      set({ isLoading: false });
      if (res && (res as any).data) {
        return (res as any).data;
      }
      return null;
    } catch (err: any) {
      console.error('Error creating VNPay payment:', err);
      set({ error: err?.message || 'Failed to create VNPay payment', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tạo VNPay payment');
      return null;
    }
  },

  verifyVNPay: async (queryParams: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await verifyVNPayReturn(queryParams);
      set({ isLoading: false });
      return res;
    } catch (err: any) {
      console.error('Error verifying VNPay:', err);
      set({ error: err?.message || 'Failed to verify VNPay', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể xác thực VNPay');
      return null;
    }
  },

  getPaymentsByBooking: async (bookingId: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await getPaymentsByBookingId(bookingId);
      set({ isLoading: false });
      if (res && (res as any).data?.payments) {
        return (res as any).data.payments as Payment[];
      }
      return null;
    } catch (err: any) {
      console.error('Error getting payments by booking:', err);
      set({ error: err?.message || 'Failed to get payments', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể lấy danh sách thanh toán');
      return null;
    }
  },

  setPayments: (payments: Payment[]) => set({ payments }),
  clear: () => set({ payments: [], payment: null, pagination: null, error: null }),
}));

export default usePaymentStore;

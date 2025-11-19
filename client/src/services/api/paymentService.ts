import apiClient from './apiClient';

// Types
export interface PaymentData {
  booking_id: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer';
  transaction_id?: string;
  notes?: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'e_wallet';
  payment_type: 'full' | 'deposit' | 'remaining';
  deposit_percentage?: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  booking?: {
    booking_number?: string;
    user?: {
      full_name?: string;
      name?: string;
      email?: string;
    };
  };
}

export interface BankInfo {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  amount: number;
  content: string;
  qr_url: string;
}

export interface PaymentResponse {
  success: boolean;
  data: {
    payment: Payment;
  };
  message?: string;
}

/**
 * Create a new payment record
 * POST /api/payments
 */
export const createPayment = async (
  paymentData: PaymentData
): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>(
    '/payments',
    paymentData
  );
  return response.data;
};

/**
 * Get payment details by booking ID
 * GET /api/payments/:bookingId
 */
export const getPaymentByBookingId = async (
  bookingId: number
): Promise<PaymentResponse> => {
  const response = await apiClient.get<PaymentResponse>(
    `/payments/booking/${bookingId}`
  );
  return response.data;
};

/**
 * Confirm bank transfer payment (with receipt)
 * POST /api/payments/confirm
 */
export const confirmBankTransfer = async (
  bookingId: number,
  transactionId?: string,
  receipt?: File
): Promise<{ success: boolean; message?: string }> => {
  const formData = new FormData();
  formData.append('booking_id', bookingId.toString());
  
  if (transactionId) {
    formData.append('transaction_id', transactionId);
  }
  
  if (receipt) {
    formData.append('receipt', receipt);
  }

  const response = await apiClient.post(
    '/payments/confirm',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Confirm deposit payment
 * POST /api/payments/confirm-deposit
 */
export const confirmDepositPayment = async (
  paymentId: number,
  transactionId?: string
): Promise<{
  success: boolean;
  data: { payment: Payment; booking: any };
  message?: string;
}> => {
  const response = await apiClient.post(
    '/payments/confirm-deposit',
    {
      payment_id: paymentId,
      transaction_id: transactionId,
    }
  );
  return response.data;
};

/**
 * Notify payment completion (for admin verification)
 * POST /api/payments/notify
 */
export const notifyPaymentCompletion = async (
  paymentId: number,
  notes?: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.post(
    '/payments/notify',
    {
      payment_id: paymentId,
      notes,
    }
  );
  return response.data;
};

/**
 * Get payments for a booking
 * GET /api/payments/booking/:bookingId
 */
export const getPaymentsByBookingId = async (
  bookingId: number
): Promise<{
  success: boolean;
  data: { payments: Payment[] };
  message?: string;
}> => {
  const response = await apiClient.get(
    `/payments/booking/${bookingId}`
  );
  return response.data;
};

/**
 * Get all payments with filters (admin/staff)
 * GET /api/payments
 */
export const getPayments = async (
  params: Record<string, any> = {}
): Promise<{
  success: boolean;
  data: { payments: Payment[]; pagination?: any };
  message?: string;
}> => {
  const response = await apiClient.get('/payments', { params });
  return response.data;
};

/**
 * Create VNPay payment URL
 * POST /api/payments/vnpay/create
 */
export const createVNPayPayment = async (
  paymentId: number,
  returnUrl?: string
): Promise<{
  success: boolean;
  data: { payment_url: string; payment_id: number };
  message?: string;
}> => {
  const response = await apiClient.post('/payments/vnpay/create', {
    payment_id: paymentId,
    return_url: returnUrl,
  });
  return response.data;
};

/**
 * Verify VNPay payment return
 * GET /api/payments/vnpay/return
 */
export const verifyVNPayReturn = async (
  queryParams: string
): Promise<{
  success: boolean;
  data?: { payment: Payment; booking: any };
  message?: string;
  code?: string;
}> => {
  const response = await apiClient.get(`/payments/vnpay/return${queryParams}`);
  return response.data;
};

export default {
  createPayment,
  getPaymentByBookingId,
  confirmBankTransfer,
  confirmDepositPayment,
  notifyPaymentCompletion,
  getPaymentsByBookingId,
  getPayments,
  createVNPayPayment,
  verifyVNPayReturn,
};

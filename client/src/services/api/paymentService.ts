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
  payment_method: 'cash' | 'bank_transfer';
  payment_status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  payment_date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    booking_number: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export interface PaymentResponse {
  success: boolean;
  data: {
    payment: Payment;
  };
  message?: string;
}

export interface PaymentListResponse {
  success: boolean;
  data: {
    payments: Payment[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
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
    `/payments/${bookingId}`
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
 * Get all payments (admin)
 * GET /api/payments
 */
export const getPayments = async (
  params?: {
    search?: string;
    method?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaymentListResponse> => {
  const response = await apiClient.get<PaymentListResponse>('/payments', { params });
  return response.data;
};

export default {
  createPayment,
  getPaymentByBookingId,
  confirmBankTransfer,
  getPayments,
};

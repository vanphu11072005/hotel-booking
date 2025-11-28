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

export default Payment;

export interface BookingData {
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  room_quantity?: number;
  notes?: string;
  payment_method: 'cash' | 'bank_transfer' | 'vnpay';
  total_price: number;
  guest_info: { full_name: string; email: string; phone: string };
  services?: { service_id: number; quantity: number }[];
}

export interface MultiRoomTypeBookingData {
  rooms: { room_id: number; quantity: number }[];
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  notes?: string;
  payment_method: 'cash' | 'bank_transfer' | 'vnpay';
  total_price: number;
  guest_info: { full_name: string; email: string; phone: string };
  services?: { service_id: number; quantity: number }[];
}

export interface Booking {
  id: number;
  booking_number: string;
  user_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  num_guests?: number;
  room_quantity?: number;
  parent_booking_id?: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  payment_method: 'cash' | 'bank_transfer' | 'vnpay';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  deposit_paid?: boolean;
  requires_deposit?: boolean;
  notes?: string;
  special_requests?: string;
  cancellation_reason?: string;
  cancellation_details?: string;
  cancelled_at?: string;
  guest_info?: { full_name: string; email: string; phone: string };
  room?: any;
  user?: any;
  payments?: Payment[];
  service_usages?: ServiceUsage[];
  booking_rooms?: BookingRoom[];
  created_at: string;
  updated_at: string;
}

export interface BookingRoom {
  id: number;
  booking_id: number;
  room_id: number;
  quantity: number;
  room?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceUsage {
  id: number;
  booking_id: number;
  service_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  service?: any;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_type: 'full' | 'deposit' | 'remaining';
  deposit_percentage?: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingResponse {
  success: boolean;
  data: { booking: Booking };
  message?: string;
}

export interface BookingsResponse {
  success: boolean;
  data: { bookings: Booking[]; pagination?: any };
  message?: string;
}

export interface CheckBookingResponse {
  success: boolean;
  data: { booking: Booking };
  message?: string;
}

export default Booking;

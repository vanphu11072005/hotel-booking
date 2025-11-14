import apiClient from './apiClient';

// Types
export interface BookingData {
  room_id: number;
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  guest_count: number;
  notes?: string;
  payment_method: 'cash' | 'bank_transfer';
  total_price: number;
  guest_info: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Booking {
  id: number;
  booking_number: string;
  user_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_price: number;
  status: 
    | 'pending' 
    | 'confirmed' 
    | 'cancelled' 
    | 'checked_in' 
    | 'checked_out';
  payment_method: 'cash' | 'bank_transfer';
  payment_status: 
    | 'unpaid' 
    | 'paid' 
    | 'refunded';
  notes?: string;
  guest_info?: {
    full_name: string;
    email: string;
    phone: string;
  };
  room?: {
    id: number;
    room_number: string;
    floor: number;
    status: string;
    room_type: {
      id: number;
      name: string;
      base_price: number;
      capacity: number;
      images?: string[];
    };
  };
  user?: {
    id: number;
    name: string;
    full_name: string;
    email: string;
    phone?: string;
    phone_number?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  success: boolean;
  data: {
    booking: Booking;
  };
  message?: string;
}

export interface BookingsResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CheckBookingResponse {
  success: boolean;
  data: {
    booking: Booking;
  };
  message?: string;
}

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (
  bookingData: BookingData
): Promise<BookingResponse> => {
  const response = await apiClient.post<BookingResponse>(
    '/bookings',
    bookingData
  );
  return response.data;
};

/**
 * Get all bookings of the current user
 * GET /api/bookings/me
 */
export const getMyBookings = async (): 
  Promise<BookingsResponse> => {
  const response = await apiClient.get<BookingsResponse>(
    '/bookings/me'
  );
  return response.data;
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (
  id: number
): Promise<BookingResponse> => {
  const response = await apiClient.get<BookingResponse>(
    `/bookings/${id}`
  );
  return response.data;
};

/**
 * Cancel a booking
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = async (
  id: number
): Promise<BookingResponse> => {
  const response = await apiClient.patch<BookingResponse>(
    `/bookings/${id}/cancel`
  );
  return response.data;
};

/**
 * Check booking by booking number
 * GET /api/bookings/check/:bookingNumber
 */
export const checkBookingByNumber = async (
  bookingNumber: string
): Promise<CheckBookingResponse> => {
  const response = 
    await apiClient.get<CheckBookingResponse>(
      `/bookings/check/${bookingNumber}`
    );
  return response.data;
};

/**
 * Get all bookings (admin)
 * GET /api/bookings
 */
export const getAllBookings = async (
  params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<BookingsResponse> => {
  const response = await apiClient.get<BookingsResponse>('/bookings', { params });
  return response.data;
};

/**
 * Update booking status (admin)
 * PUT /api/bookings/:id
 */
export const updateBooking = async (
  id: number,
  data: Partial<Booking>
): Promise<BookingResponse> => {
  const response = await apiClient.put<BookingResponse>(`/bookings/${id}`, data);
  return response.data;
};

/**
 * Check room availability (helper function)
 * GET /api/rooms/available?roomId=...&from=...&to=...
 */
export const checkRoomAvailability = async (
  roomId: number,
  checkInDate: string,
  checkOutDate: string
): Promise<{ available: boolean; message?: string }> => {
  try {
    const response = await apiClient.get(
      '/rooms/available',
      {
        params: {
          roomId,
          from: checkInDate,
          to: checkOutDate,
        },
      }
    );
    return {
      available: true,
      message: response.data.message,
    };
  } catch (error: any) {
    if (error.response?.status === 409) {
      return {
        available: false,
        message: 
          error.response.data.message || 
          'Phòng đã được đặt trong thời gian này',
      };
    }
    throw error;
  }
};

/**
 * Notify payment (upload payment receipt)
 * POST /api/notify/payment
 */
export const notifyPayment = async (
  bookingId: number,
  file?: File
): Promise<{ success: boolean; message?: string }> => {
  const formData = new FormData();
  formData.append('bookingId', bookingId.toString());
  
  if (file) {
    formData.append('receipt', file);
  }

  const response = await apiClient.post(
    '/notify/payment',
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
 * Generate QR code URL for bank transfer
 */
export const generateQRCode = (
  bookingNumber: string,
  amount: number
): string => {
  // Using VietQR API format
  // Bank: Vietcombank (VCB)
  // Account: 0123456789
  const bankCode = 'VCB';
  const accountNumber = '0123456789';
  const accountName = 'KHACH SAN ABC';
  const transferContent = bookingNumber;
  
  // VietQR format
  const qrUrl = 
    `https://img.vietqr.io/image/${bankCode}-` +
    `${accountNumber}-compact2.jpg?` +
    `amount=${amount}&` +
    `addInfo=${encodeURIComponent(transferContent)}&` +
    `accountName=${encodeURIComponent(accountName)}`;
  
  return qrUrl;
};

export default {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkBookingByNumber,
  checkRoomAvailability,
  notifyPayment,
  generateQRCode,
  getAllBookings,
  updateBooking,
};

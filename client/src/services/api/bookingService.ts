import apiClient from './apiClient';
import type {
  BookingData,
  MultiRoomTypeBookingData,
  Booking,
  BookingResponse,
  BookingsResponse,
  CheckBookingResponse,
} from '../../types/booking';

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
 * Create multi-room-type booking
 * POST /api/bookings/multi-room-type
 */
export const createMultiRoomTypeBooking = async (
  bookingData: MultiRoomTypeBookingData
): Promise<BookingResponse> => {
  const response = await apiClient.post<BookingResponse>(
    '/bookings/multi-room-type',
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
  id: number,
  reason?: string,
  details?: string
): Promise<BookingResponse> => {
  const response = await apiClient.patch<BookingResponse>(
    `/bookings/${id}/cancel`,
    { reason, details }
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
    from?: string;
    to?: string;
    check_in_date?: string;
    check_out_date?: string;
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

import { create } from 'zustand';
import { toast } from 'react-toastify';
import {
  createBooking,
  createMultiRoomTypeBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkBookingByNumber,
  checkRoomAvailability,
  notifyPayment,
} from '../services/api/bookingService';
import type {
  Booking,
  BookingData,
  MultiRoomTypeBookingData,
  BookingResponse,
  BookingsResponse,
} from '../types/booking';

interface BookingState {
  bookings: Booking[];
  booking?: Booking | null;
  isLoading: boolean;
  error: string | null;
  pagination?: any | null;

  createBooking: (data: BookingData) => Promise<Booking | null>;
  createMultiRoomBooking: (data: MultiRoomTypeBookingData) => Promise<Booking | null>;
  fetchMyBookings: () => Promise<void>;
  getBooking: (id: number) => Promise<Booking | null>;
  cancel: (id: number, reason?: string, details?: string) => Promise<Booking | null>;
  checkByNumber: (bookingNumber: string) => Promise<Booking | null>;
  checkRoomAvailability: (roomId: number, from: string, to: string) => Promise<{ available: boolean; message?: string }>;
  uploadPaymentReceipt: (bookingId: number, file?: File) => Promise<boolean>;

  setBookings: (bookings: Booking[]) => void;
  clear: () => void;
}

const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  booking: null,
  isLoading: false,
  error: null,
  pagination: null,

  createBooking: async (data: BookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response: BookingResponse = await createBooking(data);
      if (response && response.data && response.data.booking) {
        const b = response.data.booking as Booking;
        set((state) => ({ bookings: [b, ...state.bookings], isLoading: false }));
        toast.success('Đặt phòng thành công');
        return b;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      set({ error: err?.message || 'Failed to create booking', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể đặt phòng');
      return null;
    }
  },

  createMultiRoomBooking: async (data: MultiRoomTypeBookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response: BookingResponse = await createMultiRoomTypeBooking(data);
      if (response && response.data && response.data.booking) {
        const b = response.data.booking as Booking;
        set((state) => ({ bookings: [b, ...state.bookings], isLoading: false }));
        toast.success('Đặt phòng (nhiều loại) thành công');
        return b;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error creating multi-room booking:', err);
      set({ error: err?.message || 'Failed to create booking', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể đặt phòng');
      return null;
    }
  },

  fetchMyBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response: BookingsResponse = await getMyBookings();
      if (response && response.data && response.data.bookings) {
        set({ bookings: response.data.bookings || [], pagination: response.data.pagination || null, isLoading: false });
      } else {
        set({ bookings: [], pagination: null, isLoading: false });
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      set({ error: err?.message || 'Failed to load bookings', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách đặt phòng');
    }
  },

  getBooking: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response: BookingResponse = await getBookingById(id);
      if (response && response.data && response.data.booking) {
        set({ booking: response.data.booking as Booking, isLoading: false });
        return response.data.booking as Booking;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error getting booking:', err);
      set({ error: err?.message || 'Failed to get booking', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể lấy thông tin đặt phòng');
      return null;
    }
  },

  cancel: async (id: number, reason?: string, details?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: BookingResponse = await cancelBooking(id, reason, details);
      if (response && response.data && response.data.booking) {
        const updated = response.data.booking as Booking;
        set((state) => ({ bookings: state.bookings.map((b) => (b.id === updated.id ? updated : b)), isLoading: false }));
        toast.success('Hủy đặt phòng thành công');
        return updated;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      set({ error: err?.message || 'Failed to cancel booking', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể hủy đặt phòng');
      return null;
    }
  },

  checkByNumber: async (bookingNumber: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await checkBookingByNumber(bookingNumber);
      if (response && response.data && response.data.booking) {
        set({ booking: response.data.booking as Booking, isLoading: false });
        return response.data.booking as Booking;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Error checking booking by number:', err);
      set({ error: err?.message || 'Failed to check booking', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể kiểm tra đặt phòng');
      return null;
    }
  },

  checkRoomAvailability: async (roomId: number, from: string, to: string) => {
    try {
      return await checkRoomAvailability(roomId, from, to);
    } catch (err: any) {
      console.error('Error checking room availability:', err);
      toast.error(err?.response?.data?.message || 'Không thể kiểm tra phòng');
      throw err;
    }
  },

  uploadPaymentReceipt: async (bookingId: number, file?: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notifyPayment(bookingId, file);
      set({ isLoading: false });
      if (response && (response as any).success) {
        toast.success(response.message || 'Upload thành công');
        return true;
      }
      toast.error(response.message || 'Upload thất bại');
      return false;
    } catch (err: any) {
      console.error('Error uploading payment receipt:', err);
      set({ error: err?.message || 'Failed to upload', isLoading: false });
      toast.error(err?.response?.data?.message || 'Không thể tải biên lai');
      return false;
    }
  },

  setBookings: (bookings: Booking[]) => set({ bookings }),
  clear: () => set({ bookings: [], booking: null, pagination: null, error: null }),
}));

export default useBookingStore;

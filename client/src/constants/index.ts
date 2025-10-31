export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:id',
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  PROFILE: '/profile',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROOMS: '/admin/rooms',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_PROMOTIONS: '/admin/promotions',
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_REPORTS: '/admin/reports',
  
  // Staff routes
  STAFF_CHECKIN: '/staff/checkin',
  STAFF_CHECKOUT: '/staff/checkout',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_info',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

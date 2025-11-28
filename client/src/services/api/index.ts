export { default as apiClient } from './apiClient';
export { default as authService } from './authService';
export type * from '../../types/auth';

export { default as roomService } from './roomService';
export type * from '../../types/rooms';

export { default as bannerService } from './bannerService';
export type * from '../../types/banner';

export { default as reviewService } from './reviewService';
export type * from '../../types/review';

export { default as favoriteService } from './favoriteService';
export type * from '../../types/favorite';

export { default as bookingService } from './bookingService';
export type * from '../../types/booking';

export { default as paymentService } from './paymentService';
// Không export type * từ paymentService để tránh trùng tên Payment

export { default as userService } from './userService';
export type * from '../../types/user';

export { default as serviceService } from './serviceService';
export type * from '../../types/service';

export { default as promotionService } from './promotionService';
export type * from '../../types/promotion';

export { default as reportService } from './reportService';
export type * from '../../types/report';

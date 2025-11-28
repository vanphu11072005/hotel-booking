export interface Review {
  id: number;
  user_id: number;
  room_id: number;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: { id: number; name?: string; full_name?: string; email?: string };
  room?: { id: number; room_number?: string; room_type?: { name?: string } };
}

export interface ReviewListResponse {
  success: boolean;
  status?: string;
  data: { reviews: Review[]; average_rating?: number; total_reviews?: number; pagination?: any };
  message?: string;
}

export interface CreateReviewData { room_id: number; rating: number; comment: string; booking_id?: string | number }

export default Review;

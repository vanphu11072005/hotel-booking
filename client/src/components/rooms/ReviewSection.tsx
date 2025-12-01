import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import RatingStars from './RatingStars';
import { getRoomReviews, createReview, updateReview } from '../../services/api/reviewService';
import type { Review } from '../../types/review';
import { getMyBookings } from '../../services/api/bookingService';
import type { Booking } from '../../types/booking';
import useAuthStore from '../../store/useAuthStore';

interface ReviewSectionProps {
  roomId: number;
}

const reviewSchema = yup.object({
  rating: yup
    .number()
    .min(1, 'Vui lòng chọn số sao')
    .max(5)
    .required('Vui lòng đánh giá'),
  comment: yup
    .string()
    .min(10, 'Nhận xét phải có ít nhất 10 ký tự')
    .max(500, 'Nhận xét không được quá 500 ký tự')
    .required('Vui lòng nhập nhận xét'),
});

type ReviewFormData = {
  rating: number;
  comment: string;
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ 
  roomId 
}) => {
  const { isAuthenticated, userInfo } = useAuthStore();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [editingSubmitting, setEditingSubmitting] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [eligibleBookingId, setEligibleBookingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: yupResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  useEffect(() => {
    // If user is authenticated, try to find an eligible booking
    if (isAuthenticated) {
      checkEligibleBooking();
    } else {
      setEligibleBookingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, roomId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getRoomReviews(roomId);
      if (response.status === 'success' && response.data) {
        const reviewsData = response.data.reviews || [];
        setReviews(reviewsData);
        
        // Calculate average rating and total from the reviews array
        const total = reviewsData.length;
        const avgRating = total > 0
          ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / total
          : 0;
        
        setAverageRating(avgRating);
        setTotalReviews(total);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibleBooking = async () => {
    try {
      const resp = await getMyBookings();
      if (resp && resp.success && resp.data && Array.isArray(resp.data.bookings)) {
        const bookings: Booking[] = resp.data.bookings;
        // Accept either 'checked_out' or 'completed' as completed state
        const completedStatuses = ['checked_out', 'completed'];
        const booking = bookings.find((b) =>
          b.room_id === roomId &&
          completedStatuses.includes(b.status) &&
          // has_review may be present from backend annotation
          !(b as any).has_review
        );

        if (booking) {
          setEligibleBookingId(booking.id);
          return;
        }
      }

      setEligibleBookingId(null);
    } catch (err) {
      console.error('Error checking bookings for review eligibility', err);
      setEligibleBookingId(null);
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      if (!eligibleBookingId) {
        toast.error('Bạn không có booking đủ điều kiện để đánh giá');
        return;
      }

      setSubmitting(true);
      const response = await createReview({
        room_id: roomId,
        rating: data.rating,
        comment: data.comment,
        booking_id: eligibleBookingId,
      });

      // Server responds with `{ status: 'success', message, data: { review } }`
      if (response && ((response as any).status === 'success' || (response as any).success)) {
        const created: any = (response as any).data?.review || (response as any).data;
        toast.success('Đánh giá của bạn đã được gửi và đang chờ duyệt');
        reset();
        // Hide form for this booking
        setEligibleBookingId(null);

        // Append the pending review locally so user sees their
        // submission immediately with a 'Đang chờ duyệt' badge.
        if (created) {
          setReviews((prev) => [created, ...prev]);
          setTotalReviews((t) => t + 1);
        } else {
          // Fallback: refresh approved reviews only (pending won't show)
          fetchReviews();
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Đánh giá từ khách hàng
        </h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">
              {averageRating > 0 
                ? averageRating.toFixed(1) 
                : 'N/A'}
            </div>
            <RatingStars 
              rating={averageRating} 
              size="md" 
            />
            <div className="text-sm text-gray-600 mt-2">
              {totalReviews} đánh giá
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-semibold mb-4">
            Viết đánh giá của bạn
          </h4>

          {eligibleBookingId ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn
                </label>
                <RatingStars
                  rating={rating}
                  size="lg"
                  interactive
                  onRatingChange={(value) => setValue('rating', value)}
                />
                {errors.rating && (
                  <p className="text-red-600 text-sm mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét
                </label>
                <textarea
                  {...register('comment')}
                  id="comment"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
                {errors.comment && (
                  <p className="text-red-600 text-sm mt-1">{errors.comment.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Bạn chỉ có thể đánh giá nếu có booking đã hoàn tất và chưa được đánh giá.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            Vui lòng{' '}
            <a href="/login" className="font-semibold underline hover:text-blue-900">
              đăng nhập
            </a>{' '}
            để viết đánh giá
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="text-xl font-semibold mb-6">
          Tất cả đánh giá ({totalReviews})
        </h4>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg p-6 
                  animate-pulse"
              >
                <div className="h-4 bg-gray-300 
                  rounded w-1/4 mb-2"
                />
                <div className="h-4 bg-gray-300 
                  rounded w-3/4"
                />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 
            rounded-lg"
          >
            <p className="text-gray-600 text-lg">
              Chưa có đánh giá nào
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Hãy là người đầu tiên đánh giá phòng này!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                  key={review.id}
                  className="relative bg-white rounded-lg shadow-md p-6"
                >
                {/* Determine if current user can edit this review */}
                {(() => {
                  if (!userInfo) return null;
                  const isOwner = review.user?.id === userInfo.id;
                  const EDIT_WINDOW_HOURS = 48; // must match server
                  const createdAt = review.created_at ? new Date(review.created_at) : null;
                  const hoursDiff = createdAt ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60) : Infinity;
                    return isOwner && hoursDiff <= EDIT_WINDOW_HOURS ? (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <button
                        onClick={() => {
                          setEditingReviewId(review.id);
                          setEditRating(review.rating);
                          setEditComment(review.comment || '');
                        }}
                        aria-label="Chỉnh sửa đánh giá"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                          bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400
                          text-white text-sm shadow-lg transform transition-transform
                          hover:scale-105 focus:outline-none focus:ring-2
                          focus:ring-offset-2 focus:ring-pink-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                          aria-hidden
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71
                            7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42
                            0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                        </svg>
                        <span className="whitespace-nowrap">Chỉnh sửa</span>
                      </button>
                    </div>
                  ) : null;
                })()}

                {/* Edit form */}
                {editingReviewId === review.id ? (
                  <div className="mb-4">
                    <div className="mb-2">
                      <RatingStars
                        rating={editRating}
                        interactive
                        onRatingChange={(v) => setEditRating(v)}
                        size="lg"
                      />
                    </div>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          try {
                            setEditingSubmitting(true);
                            const resp = await updateReview(review.id, {
                              rating: editRating,
                              comment: editComment,
                            });
                            if (resp && (resp.status === 'success' || resp.success)) {
                              const updated: any = resp.data?.review || resp.data;
                              // Replace review in list
                              setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
                              toast.success('Cập nhật đánh giá thành công. Đang chờ duyệt.');
                              setEditingReviewId(null);
                            }
                          } catch (err: any) {
                            const msg = err.response?.data?.message || 'Không thể cập nhật đánh giá';
                            toast.error(msg);
                          } finally {
                            setEditingSubmitting(false);
                          }
                        }}
                        disabled={editingSubmitting}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                      >
                        {editingSubmitting ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start 
                  justify-between mb-3"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h5 className="font-semibold text-gray-900">
                        {review.user?.full_name || 'Khách hàng'}
                      </h5>
                      {review.status !== 'approved' && (
                        <span
                          className="text-xs px-2 py-1 rounded-full 
                            bg-yellow-100 text-yellow-800 font-medium"
                        >
                          Đang chờ duyệt
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;

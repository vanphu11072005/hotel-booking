import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import RatingStars from './RatingStars';
import useReviewStore from '../../store/useReviewStore';
import useBookingStore from '../../store/useBookingStore';
import useAuthStore from '../../store/useAuthStore';

interface ReviewSectionProps {
  roomTypeId: number;
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
  roomTypeId 
}) => {
  const { isAuthenticated, userInfo } = useAuthStore();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [editingSubmitting, setEditingSubmitting] = useState<boolean>(false);
  const reviews = useReviewStore((s) => s.reviewsByRoom[roomTypeId] || []);
  const loading = useReviewStore((s) => s.isLoading);
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

  const fetchRoomTypeReviews = useReviewStore((s) => s.fetchRoomTypeReviews);

  useEffect(() => {
    fetchRoomTypeReviews(roomTypeId);
  }, [roomTypeId, fetchRoomTypeReviews]);

  useEffect(() => {
    if (isAuthenticated) {
      checkEligibleBooking();
    } else {
      setEligibleBookingId(null);
    }
  }, [isAuthenticated, roomTypeId]);

  // compute derived stats when reviews change
  useEffect(() => {
    const reviewsData = reviews || [];
    const total = reviewsData.length;
    const avgRating = total > 0
      ? reviewsData.reduce((sum, r) => sum + r.rating,  0) / total
      : 0;
    setAverageRating(avgRating);
    setTotalReviews(total);
  }, [reviews]);

  const checkEligibleBooking = async () => {
    try {
      await useBookingStore.getState().fetchMyBookings();
      const bookings = useBookingStore.getState().bookings;
      
      if (bookings && Array.isArray(bookings)) {
        // Accept either 'checked_out' or 'completed' as completed state
        const completedStatuses = ['checked_out', 'completed'];
        const booking = bookings.find((b) =>
          b.room?.room_type_id === roomTypeId &&
          completedStatuses.includes(b.status) &&
          !(b as any).has_review
        );

        if (booking) {
          setEligibleBookingId(booking.id);
          return;
        }
      }

      setEligibleBookingId(null);
    } catch (err) {
      console.error('Lỗi khi kiểm tra đặt phòng có đủ điều kiện đánh giá', err);
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
      const added = await useReviewStore.getState().addReview({
        rating: data.rating,
        comment: data.comment,
        booking_id: eligibleBookingId,
      }, true);

      if (added) {
        toast.success('Đánh giá của bạn đã được gửi và đang chờ duyệt');
        reset();
        setEligibleBookingId(null);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể gửi đánh giá';
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
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Đánh giá từ khách hàng
        </h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {averageRating > 0 
                ? averageRating.toFixed(1) 
                : 'N/A'}
            </div>
            <RatingStars 
              rating={averageRating} 
              size="md" 
            />
            <div className="text-sm text-gray-600 dark:text-white mt-2">
              {totalReviews} đánh giá
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Viết đánh giá của bạn
          </h4>

          {eligibleBookingId ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Đánh giá của bạn
                </label>
                <RatingStars
                  rating={rating}
                  size="lg"
                  interactive
                  onRatingChange={(value) => setValue('rating', value)}
                />
                {errors.rating && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhận xét
                </label>
                <textarea
                  {...register('comment')}
                  id="comment"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
                {errors.comment && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.comment.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                Bạn chỉ có thể đánh giá nếu có booking đã hoàn tất và chưa được đánh giá.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-800 dark:text-blue-200">
            Vui lòng{' '}
            <a href="/login" className="font-semibold underline hover:text-blue-900 dark:hover:text-blue-100">
              đăng nhập
            </a>{' '}
            để viết đánh giá
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          Tất cả đánh giá ({totalReviews})
        </h4>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 
                  animate-pulse"
              >
                <div className="h-4 bg-gray-300 dark:bg-gray-600 
                  rounded w-1/4 mb-2"
                />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 
                  rounded w-3/4"
                />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 
            rounded-lg"
          >
            <p className="text-gray-600 dark:text-white text-lg">
              Chưa có đánh giá nào
            </p>
            <p className="text-gray-500 dark:text-white text-sm mt-2">
              Hãy là người đầu tiên đánh giá phòng này!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                  key={review.id}
                  className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                          onClick={async () => {
                            try {
                              setEditingSubmitting(true);
                              const updated = await useReviewStore.getState().editReview(review.id, {
                                rating: editRating,
                                comment: editComment,
                              });
                              if (updated) {
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
                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800"
                      >
                        {editingSubmitting ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
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
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {review.user?.full_name || 'Khách hàng'}
                      </h5>
                      {review.status !== 'approved' && (
                        <span
                          className="text-xs px-2 py-1 rounded-full 
                            bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 font-medium"
                        >
                          Đang chờ duyệt
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="text-sm text-gray-500 dark:text-white">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-white leading-relaxed">
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

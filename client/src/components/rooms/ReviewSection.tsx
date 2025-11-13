import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import RatingStars from './RatingStars';
import {
  getRoomReviews,
  createReview,
  type Review,
} from '../../services/api/reviewService';
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
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

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

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getRoomReviews(roomId);
      if (response.status === 'success' && response.data) {
        setReviews(response.data.reviews || []);
        setAverageRating(response.data.average_rating || 0);
        setTotalReviews(response.data.total_reviews || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createReview({
        room_id: roomId,
        rating: data.rating,
        comment: data.comment,
      });

      if (response.success) {
        toast.success(
          'Đánh giá của bạn đã được gửi và đang chờ duyệt'
        );
        reset();
        fetchReviews();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Không thể gửi đánh giá';
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
          <form onSubmit={handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium 
                text-gray-700 mb-2"
              >
                Đánh giá của bạn
              </label>
              <RatingStars
                rating={rating}
                size="lg"
                interactive
                onRatingChange={(value) => 
                  setValue('rating', value)
                }
              />
              {errors.rating && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Nhận xét
              </label>
              <textarea
                {...register('comment')}
                id="comment"
                rows={4}
                className="w-full px-4 py-2 border 
                  border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 
                  focus:border-transparent"
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
              {errors.comment && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.comment.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white 
                rounded-lg hover:bg-blue-700 
                disabled:bg-gray-400 
                disabled:cursor-not-allowed 
                transition-colors font-medium"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 
          rounded-lg p-6 text-center"
        >
          <p className="text-blue-800">
            Vui lòng{' '}
            <a
              href="/login"
              className="font-semibold underline 
                hover:text-blue-900"
            >
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
                className="bg-white rounded-lg shadow-md 
                  p-6"
              >
                <div className="flex items-start 
                  justify-between mb-3"
                >
                  <div>
                    <h5 className="font-semibold 
                      text-gray-900"
                    >
                      {review.user?.full_name || 'Khách hàng'}
                    </h5>
                    <div className="flex items-center 
                      gap-2 mt-1"
                    >
                      <RatingStars
                        rating={review.rating}
                        size="sm"
                      />
                      <span className="text-sm 
                        text-gray-500"
                      >
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

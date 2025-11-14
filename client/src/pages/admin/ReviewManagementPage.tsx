import React, { useEffect, useState } from 'react';
import { reviewService, Review } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const ReviewManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchReviews();
  }, [filters, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviews({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      });
      setReviews(response.data.reviews);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await reviewService.approveReview(id);
      toast.success('Phê duyệt đánh giá thành công');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể phê duyệt đánh giá');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn từ chối đánh giá này?')) return;
    
    try {
      await reviewService.rejectReview(id);
      toast.success('Từ chối đánh giá thành công');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối đánh giá');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <p className="text-gray-500 mt-1">Phê duyệt và quản lý đánh giá của khách hàng</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Đánh giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Bình luận
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{review.user?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Phòng {review.room?.room_number} - {review.room?.room_type?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStars(review.rating)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{review.comment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(review.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Phê duyệt"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Từ chối"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default ReviewManagementPage;

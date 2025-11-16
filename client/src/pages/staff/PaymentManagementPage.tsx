import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { paymentService, Payment } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    method: '',
    from: '',
    to: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [filters, currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      });
      setPayments(response.data.payments);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getMethodBadge = (method: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      cash: { bg: 'bg-green-100', text: 'text-green-800', label: 'Tiền mặt' },
      bank_transfer: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Chuyển khoản' },
      credit_card: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Thẻ tín dụng' },
    };
    const badge = badges[method] || badges.cash;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
        <p className="text-gray-500 mt-1">Theo dõi các giao dịch thanh toán</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.method}
            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả phương thức</option>
            <option value="cash">Tiền mặt</option>
            <option value="bank_transfer">Chuyển khoản</option>
            <option value="credit_card">Thẻ tín dụng</option>
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã giao dịch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã đặt phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phương thức
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Số tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày thanh toán
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.transaction_id || `PAY-${payment.id}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-600">{payment.booking?.booking_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.booking?.user?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getMethodBadge(payment.payment_method)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">
                    {formatCurrency(payment.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(payment.payment_date || payment.createdAt).toLocaleDateString('vi-VN')}
                  </div>
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

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
        <p className="text-3xl font-bold">
          {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
        </p>
        <p className="text-sm mt-2 opacity-90">Tổng {payments.length} giao dịch</p>
      </div>
    </div>
  );
};

export default PaymentManagementPage;

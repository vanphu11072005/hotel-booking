import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  LogIn,
  LogOut as LogOutIcon,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { bookingService, paymentService } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

interface DashboardStats {
  todayBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  pendingPayments: number;
  todayRevenue: number;
  activeBookings: number;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pendingPayments: 0,
    todayRevenue: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const today = formatLocalDate(new Date());

      // Lấy booking hôm nay
      const bookingsResponse = await bookingService.getAllBookings({
        from: today,
        to: today,
        page: 1,
        limit: 1,
      });

      // Lấy check-in hôm nay
      const checkInsResponse = await bookingService.getAllBookings({
        check_in_date: today,
        status: 'checked_in',
        page: 1,
        limit: 1,
      });

      // Lấy check-out hôm nay
      const checkOutsResponse = await bookingService.getAllBookings({
        check_out_date: today,
        status: 'checked_out',
        page: 1,
        limit: 1,
      });

      // Lấy thanh toán chưa hoàn tất (filter bằng trạng thái)
      const pendingPaymentsResponse = await paymentService.getPayments({
        payment_status: 'pending',
        page: 1,
        limit: 1,
      });

      // Lấy doanh thu hôm nay (filter bằng trạng thái)
      const revenueResponse = await paymentService.getPayments({
        from: today,
        to: today,
        payment_status: 'completed',
        page: 1,
        limit: 100,
      });

      let todayRevenue = 0;
      if (revenueResponse.data.payments) {
        todayRevenue = revenueResponse.data.payments.reduce(
          (sum: number, payment: any) => sum + parseFloat(payment.amount || 0),
          0
        );
      }

      // Lấy booking đang hoạt động
      const activeBookingsResponse = await bookingService.getAllBookings({
        status: 'confirmed',
        page: 1,
        limit: 1,
      });

      setStats({
        todayBookings: bookingsResponse.data.pagination?.total || 0,
        todayCheckIns: checkInsResponse.data.pagination?.total || 0,
        todayCheckOuts: checkOutsResponse.data.pagination?.total || 0,
        pendingPayments: pendingPaymentsResponse.data.pagination?.total || 0,
        todayRevenue,
        activeBookings: activeBookingsResponse.data.pagination?.total || 0,
      });
    } catch (error: any) {
      toast.error('Không thể tải thống kê dashboard');
      console.error('Dashboard stats error:', error);
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

  if (loading) {
    return <Loading />;
  }

  const statCards = [
    {
      title: 'Đặt phòng hôm nay',
      value: stats.todayBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Check-in hôm nay',
      value: stats.todayCheckIns,
      icon: LogIn,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Check-out hôm nay',
      value: stats.todayCheckOuts,
      icon: LogOutIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Thanh toán chờ xử lý',
      value: stats.pendingPayments,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(stats.todayRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Booking đang hoạt động',
      value: stats.activeBookings,
      icon: CheckCircle,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Nhân viên</h1>
        <p className="text-gray-600 mt-1">
          Tổng quan hoạt động hôm nay - {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/staff/bookings"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-700">Quản lý đặt phòng</span>
          </a>
          <a
            href="/staff/check-in"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogIn className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-700">Check-in khách</span>
          </a>
          <a
            href="/staff/check-out"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOutIcon className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-700">Check-out khách</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

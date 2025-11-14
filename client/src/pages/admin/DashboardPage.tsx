import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Hotel, 
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { reportService, ReportData } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReports({
        from: dateRange.from,
        to: dateRange.to,
      });
      setStats(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu dashboard');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Tổng quan hoạt động khách sạn</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tổng đặt phòng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.total_bookings || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Phòng trống</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.available_rooms || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Hotel className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">
              {stats?.occupied_rooms || 0} phòng đang sử dụng
            </span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.total_customers || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+15.3%</span>
            <span className="text-gray-500 ml-2">khách hàng mới</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Doanh thu theo ngày</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {stats?.revenue_by_date && stats.revenue_by_date.length > 0 ? (
            <div className="space-y-3">
              {stats.revenue_by_date.slice(0, 7).map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-500 h-4 rounded-full transition-all"
                        style={{
                          width: `${Math.min((item.revenue / (stats.revenue_by_date?.[0]?.revenue || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-32 text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
          )}
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trạng thái đặt phòng</h2>
          {stats?.bookings_by_status ? (
            <div className="space-y-4">
              {Object.entries(stats.bookings_by_status).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-blue-500',
                  checked_in: 'bg-green-500',
                  checked_out: 'bg-gray-500',
                  cancelled: 'bg-red-500',
                };
                const statusLabels: Record<string, string> = {
                  pending: 'Chờ xác nhận',
                  confirmed: 'Đã xác nhận',
                  checked_in: 'Đã nhận phòng',
                  checked_out: 'Đã trả phòng',
                  cancelled: 'Đã hủy',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                      <span className="text-gray-700">{statusLabels[status]}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Top Rooms and Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rooms */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top phòng được đặt</h2>
          {stats?.top_rooms && stats.top_rooms.length > 0 ? (
            <div className="space-y-3">
              {stats.top_rooms.map((room, index) => (
                <div key={room.room_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">Phòng {room.room_number}</p>
                      <p className="text-sm text-gray-500">{room.bookings} lượt đặt</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(room.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
          )}
        </div>

        {/* Service Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dịch vụ được sử dụng</h2>
          {stats?.service_usage && stats.service_usage.length > 0 ? (
            <div className="space-y-3">
              {stats.service_usage.map((service) => (
                <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{service.service_name}</p>
                    <p className="text-sm text-gray-500">{service.usage_count} lần sử dụng</p>
                  </div>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(service.total_revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

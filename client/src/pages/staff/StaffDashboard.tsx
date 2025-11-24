import React, { useEffect, useState } from 'react';
import {
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  Clock,
  CheckCircle,
  DoorOpen,
} from 'lucide-react';
import { bookingService, roomService } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

interface DashboardStats {
  todayBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  activeBookings: number;
  roomStats: {
    available: number;
    occupied: number;
    dirty: number;
    cleaning: number;
    maintenance: number;
    total: number;
  };
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    activeBookings: 0,
    roomStats: {
      available: 0,
      occupied: 0,
      dirty: 0,
      cleaning: 0,
      maintenance: 0,
      total: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboardStats();

    // Kiểm tra và làm mới dữ liệu mỗi phút để đảm bảo luôn hiển thị dữ liệu ngày hiện tại
    const interval = setInterval(() => {
      const newDate = new Date().toISOString().split('T')[0];
      if (newDate !== currentDate) {
        // Nếu qua ngày mới, cập nhật currentDate và fetch lại dữ liệu
        setCurrentDate(newDate);
        fetchDashboardStats();
      }
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, [currentDate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Luôn lấy ngày hiện tại mỗi khi fetch để đảm bảo dữ liệu là của ngày hôm nay
      const today = new Date().toISOString().split('T')[0];
      
      // Reset stats về 0 trước khi fetch dữ liệu mới
      setStats({
        todayBookings: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        activeBookings: 0,
        roomStats: {
          available: 0,
          occupied: 0,
          dirty: 0,
          cleaning: 0,
          maintenance: 0,
          total: 0,
        },
      });

      // Lấy TẤT CẢ bookings và filter phía client theo created_at hôm nay
      const allBookingsResponse = await bookingService.getAllBookings({
        page: 1,
        limit: 1000,
      });

      // Lấy thông tin phòng
      const roomsResponse = await roomService.getRooms({});

      // Filter booking được tạo hôm nay
      const todayBookings = allBookingsResponse.data.bookings?.filter((booking: any) => {
        const createdDate = new Date(booking.created_at).toISOString().split('T')[0];
        return createdDate === today;
      }).length || 0;

      // Filter check-in hôm nay
      const todayCheckIns = allBookingsResponse.data.bookings?.filter((booking: any) => {
        const checkInDate = new Date(booking.check_in_date).toISOString().split('T')[0];
        return checkInDate === today && booking.status === 'checked_in';
      }).length || 0;

      // Filter check-out hôm nay
      const todayCheckOuts = allBookingsResponse.data.bookings?.filter((booking: any) => {
        const checkOutDate = new Date(booking.check_out_date).toISOString().split('T')[0];
        return checkOutDate === today && booking.status === 'checked_out';
      }).length || 0;

      // Đếm booking đang hoạt động (confirmed)
      const activeBookings = allBookingsResponse.data.bookings?.filter((booking: any) => {
        return booking.status === 'confirmed';
      }).length || 0;

      // Thống kê phòng theo trạng thái
      const rooms = roomsResponse.data.rooms || [];
      const roomStats = {
        available: rooms.filter((r: any) => r.status === 'available').length,
        occupied: rooms.filter((r: any) => r.status === 'occupied').length,
        dirty: rooms.filter((r: any) => r.status === 'dirty').length,
        cleaning: rooms.filter((r: any) => r.status === 'cleaning').length,
        maintenance: rooms.filter((r: any) => r.status === 'maintenance').length,
        total: rooms.length,
      };

      setStats({
        todayBookings,
        todayCheckIns,
        todayCheckOuts,
        activeBookings,
        roomStats,
      });
    } catch (error: any) {
      toast.error('Không thể tải thống kê dashboard');
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
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
      title: 'Booking đang hoạt động',
      value: stats.activeBookings,
      icon: CheckCircle,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Nhân viên
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <p className="text-base">
                Tổng quan hoạt động hôm nay - {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Clock className="w-5 h-5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor} shadow-md`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
              <div className={`mt-4 h-1 rounded-full ${stat.color}`}></div>
            </div>
          );
        })}
      </div>

      {/* Room Status Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Quản lý phòng hôm nay
            </h2>
          </div>
          <a
            href="/staff/rooms"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            Xem chi tiết
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏨</span>
              <span className="text-lg font-bold text-gray-700">{stats.roomStats.total}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🟢</span>
              <span className="text-lg font-bold text-green-700">{stats.roomStats.available}</span>
            </div>
            <p className="text-sm font-medium text-green-600">Trống</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔴</span>
              <span className="text-lg font-bold text-red-700">{stats.roomStats.occupied}</span>
            </div>
            <p className="text-sm font-medium text-red-600">Đang ở</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🟡</span>
              <span className="text-lg font-bold text-yellow-700">{stats.roomStats.dirty}</span>
            </div>
            <p className="text-sm font-medium text-yellow-600">Bẩn</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔵</span>
              <span className="text-lg font-bold text-blue-700">{stats.roomStats.cleaning}</span>
            </div>
            <p className="text-sm font-medium text-blue-600">Đang dọn</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔧</span>
              <span className="text-lg font-bold text-gray-700">{stats.roomStats.maintenance}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Bảo trì</p>
          </div>
        </div>

        {/* Room Status Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Tỷ lệ sử dụng phòng</span>
            <span className="text-sm font-bold text-gray-900">
              {stats.roomStats.total > 0 
                ? Math.round((stats.roomStats.occupied / stats.roomStats.total) * 100)
                : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-500 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${stats.roomStats.total > 0 
                  ? (stats.roomStats.occupied / stats.roomStats.total) * 100
                  : 0}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Thao tác nhanh
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/staff/bookings"
            className="group flex items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Calendar className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="font-semibold text-gray-800 block group-hover:text-blue-600 transition-colors">
                Quản lý đặt phòng
              </span>
              <span className="text-sm text-gray-500">Xem và quản lý booking</span>
            </div>
          </a>
          <a
            href="/staff/check-in"
            className="group flex items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-500 transition-colors">
              <LogIn className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="font-semibold text-gray-800 block group-hover:text-green-600 transition-colors">
                Check-in khách
              </span>
              <span className="text-sm text-gray-500">Nhận khách vào phòng</span>
            </div>
          </a>
          <a
            href="/staff/check-out"
            className="group flex items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition-colors">
              <LogOutIcon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="font-semibold text-gray-800 block group-hover:text-purple-600 transition-colors">
                Check-out khách
              </span>
              <span className="text-sm text-gray-500">Trả phòng cho khách</span>
            </div>
          </a>
          <a
            href="/staff/rooms"
            className="group flex items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-500 transition-colors">
              <DoorOpen className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="font-semibold text-gray-800 block group-hover:text-orange-600 transition-colors">
                Quản lý phòng
              </span>
              <span className="text-sm text-gray-500">Xem và cập nhật trạng thái phòng</span>
            </div>
          </a>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">Dữ liệu tự động cập nhật</p>
            <p className="text-blue-100 text-sm">Dashboard sẽ tự động làm mới khi qua ngày mới. Chỉ hiển thị thông tin của ngày hiện tại.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

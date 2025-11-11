import React from 'react';
import { 
  TrendingUp, 
  Hotel, 
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Tổng quan hoạt động của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 
        lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-lg shadow-md 
          p-6"
        >
          <div className="flex items-center 
            justify-between mb-4"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 
                text-blue-600" 
              />
            </div>
            <span className="text-sm text-green-600 
              font-medium"
            >
              +12%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm 
            font-medium mb-1"
          >
            Tổng đặt phòng
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            45
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md 
          p-6"
        >
          <div className="flex items-center 
            justify-between mb-4"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 
                text-green-600" 
              />
            </div>
            <span className="text-sm text-green-600 
              font-medium"
            >
              +8%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm 
            font-medium mb-1"
          >
            Tổng chi tiêu
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            $12,450
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md 
          p-6"
        >
          <div className="flex items-center 
            justify-between mb-4"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <Hotel className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 
              font-medium"
            >
              Active
            </span>
          </div>
          <h3 className="text-gray-500 text-sm 
            font-medium mb-1"
          >
            Đang ở
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            2
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md 
          p-6"
        >
          <div className="flex items-center 
            justify-between mb-4"
          >
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 
                text-orange-600" 
              />
            </div>
            <span className="text-sm text-green-600 
              font-medium"
            >
              +15%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm 
            font-medium mb-1"
          >
            Điểm thưởng
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            1,250
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 
        gap-6"
      >
        <div className="bg-white rounded-lg shadow-md 
          p-6"
        >
          <h2 className="text-xl font-semibold 
            text-gray-800 mb-4"
          >
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {[
              { 
                action: 'Đặt phòng', 
                room: 'Phòng 201', 
                time: '2 giờ trước' 
              },
              { 
                action: 'Check-in', 
                room: 'Phòng 105', 
                time: '1 ngày trước' 
              },
              { 
                action: 'Check-out', 
                room: 'Phòng 302', 
                time: '3 ngày trước' 
              },
            ].map((activity, index) => (
              <div key={index} 
                className="flex items-center space-x-4 
                  pb-4 border-b border-gray-200 
                  last:border-0"
              >
                <div className="p-2 bg-blue-100 
                  rounded-lg"
                >
                  <Activity className="w-5 h-5 
                    text-blue-600" 
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.room}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md 
          p-6"
        >
          <h2 className="text-xl font-semibold 
            text-gray-800 mb-4"
          >
            Đặt phòng sắp tới
          </h2>
          <div className="space-y-4">
            {[
              { 
                room: 'Phòng 401', 
                date: '20/11/2025', 
                status: 'Đã xác nhận' 
              },
              { 
                room: 'Phòng 203', 
                date: '25/11/2025', 
                status: 'Chờ xác nhận' 
              },
            ].map((booking, index) => (
              <div key={index} 
                className="flex items-center 
                  justify-between pb-4 border-b 
                  border-gray-200 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {booking.room}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.date}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full 
                  text-xs font-medium 
                  ${booking.status === 'Đã xác nhận' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

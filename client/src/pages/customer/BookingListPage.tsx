import React from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';

const BookingListPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Lịch sử đặt phòng
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các đặt phòng của bạn
        </p>
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {[1, 2, 3].map((booking) => (
          <div key={booking} 
            className="bg-white rounded-lg shadow-md 
              p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row 
              md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center 
                  space-x-3 mb-3"
                >
                  <h3 className="text-xl font-semibold 
                    text-gray-800"
                  >
                    Phòng {booking}01 - Deluxe
                  </h3>
                  <span className="px-3 py-1 
                    bg-green-100 text-green-800 
                    rounded-full text-sm font-medium"
                  >
                    Đã xác nhận
                  </span>
                </div>
                
                <div className="grid grid-cols-1 
                  md:grid-cols-3 gap-4 text-sm 
                  text-gray-600"
                >
                  <div className="flex items-center 
                    space-x-2"
                  >
                    <Calendar className="w-4 h-4 
                      text-blue-500" 
                    />
                    <span>
                      Nhận phòng: 15/11/2025
                    </span>
                  </div>
                  <div className="flex items-center 
                    space-x-2"
                  >
                    <Calendar className="w-4 h-4 
                      text-blue-500" 
                    />
                    <span>
                      Trả phòng: 18/11/2025
                    </span>
                  </div>
                  <div className="flex items-center 
                    space-x-2"
                  >
                    <Clock className="w-4 h-4 
                      text-blue-500" 
                    />
                    <span>3 đêm</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 
                md:ml-6 flex flex-col items-end 
                space-y-3"
              >
                <div className="flex items-center 
                  space-x-2"
                >
                  <DollarSign className="w-5 h-5 
                    text-green-600" 
                  />
                  <span className="text-2xl font-bold 
                    text-gray-800"
                  >
                    ${booking * 150}
                  </span>
                </div>
                <button className="px-4 py-2 
                  bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors 
                  text-sm"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {/* Uncomment khi không có booking
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Bạn chưa có đặt phòng nào
        </p>
        <button className="mt-4 px-6 py-3 
          bg-blue-600 text-white rounded-lg 
          hover:bg-blue-700 transition-colors"
        >
          Đặt phòng ngay
        </button>
      </div>
      */}
    </div>
  );
};

export default BookingListPage;

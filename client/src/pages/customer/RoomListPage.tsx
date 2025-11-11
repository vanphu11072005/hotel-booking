import React from 'react';
import { Hotel, Search } from 'lucide-react';

const RoomListPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Danh sách phòng
        </h1>
        <p className="text-gray-600">
          Tìm kiếm và đặt phòng theo nhu cầu của bạn
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md 
        p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 
          gap-4"
        >
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-2"
            >
              Ngày nhận phòng
            </label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border 
                border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 
                focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-2"
            >
              Ngày trả phòng
            </label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border 
                border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 
                focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium 
              text-gray-700 mb-2"
            >
              Loại phòng
            </label>
            <select className="w-full px-4 py-2 border 
              border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="standard">Phòng Standard</option>
              <option value="deluxe">Phòng Deluxe</option>
              <option value="suite">Phòng Suite</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center 
              justify-center space-x-2 px-4 py-2 
              bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 
        lg:grid-cols-3 gap-6"
      >
        {[1, 2, 3, 4, 5, 6].map((room) => (
          <div key={room} 
            className="bg-white rounded-lg shadow-md 
              overflow-hidden hover:shadow-lg 
              transition-shadow"
          >
            <div className="h-48 bg-gray-200 
              flex items-center justify-center"
            >
              <Hotel className="w-16 h-16 text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold 
                text-gray-800 mb-2"
              >
                Phòng {room}01
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Phòng Standard với đầy đủ tiện nghi
              </p>
              <div className="flex items-center 
                justify-between"
              >
                <span className="text-2xl font-bold 
                  text-blue-600"
                >
                  $99
                </span>
                <button className="px-4 py-2 
                  bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors 
                  text-sm"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomListPage;

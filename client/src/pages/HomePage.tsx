import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Chào mừng đến với Hotel Booking
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Hệ thống quản lý và đặt phòng khách sạn 
          trực tuyến
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 
          gap-6 mt-12"
        >
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              Đặt phòng dễ dàng
            </h3>
            <p className="text-gray-600">
              Tìm kiếm và đặt phòng chỉ với vài cú click
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              Giá tốt nhất
            </h3>
            <p className="text-gray-600">
              Cam kết giá tốt nhất thị trường
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              Hỗ trợ 24/7
            </h3>
            <p className="text-gray-600">
              Đội ngũ hỗ trợ luôn sẵn sàng phục vụ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

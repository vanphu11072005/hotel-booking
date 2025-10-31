import { Link } from 'react-router-dom';
import { Hotel, Search, Star, Shield } from 'lucide-react';
import { ROUTES } from '@/constants';
import { MainLayout } from '@/components/layout/MainLayout';

export const HomePage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 
        to-primary-800 text-white rounded-lg p-12 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chào mừng đến với Hotel Booking
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Trải nghiệm dịch vụ khách sạn tốt nhất với hệ 
            thống đặt phòng trực tuyến hiện đại
          </p>
          <Link to={ROUTES.ROOMS} className="inline-flex 
            items-center space-x-2 bg-white text-primary-600 
            px-6 py-3 rounded-lg font-semibold 
            hover:bg-gray-100 transition-colors">
            <Search className="h-5 w-5" />
            <span>Tìm phòng ngay</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <div className="mx-auto h-12 w-12 flex items-center 
            justify-center rounded-full bg-primary-100 mb-4">
            <Hotel className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Phòng hiện đại
          </h3>
          <p className="text-gray-600">
            Đa dạng loại phòng với đầy đủ tiện nghi, 
            phù hợp mọi nhu cầu
          </p>
        </div>

        <div className="card text-center">
          <div className="mx-auto h-12 w-12 flex items-center 
            justify-center rounded-full bg-primary-100 mb-4">
            <Star className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Dịch vụ 5 sao
          </h3>
          <p className="text-gray-600">
            Đội ngũ nhân viên chuyên nghiệp, 
            phục vụ 24/7
          </p>
        </div>

        <div className="card text-center">
          <div className="mx-auto h-12 w-12 flex items-center 
            justify-center rounded-full bg-primary-100 mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Đặt phòng an toàn
          </h3>
          <p className="text-gray-600">
            Bảo mật thông tin tuyệt đối, 
            thanh toán an toàn
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="card bg-gradient-to-r 
        from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng đặt phòng?
          </h2>
          <p className="text-gray-600 mb-6">
            Khám phá các phòng tuyệt vời và đặt phòng 
            ngay hôm nay
          </p>
          <Link to={ROUTES.ROOMS} className="btn-primary">
            Xem danh sách phòng
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

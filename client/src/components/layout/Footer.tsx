import { Link } from 'react-router-dom';
import { Hotel, Mail, Phone, MapPin } from 'lucide-react';
import { ROUTES } from '@/constants';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Hotel className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold">
                Hotel Booking
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Hệ thống quản lý và đặt phòng khách sạn 
              trực tuyến. Trải nghiệm dịch vụ tốt nhất.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Liên kết
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.HOME} 
                  className="text-gray-400 hover:text-white 
                    text-sm transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ROOMS} 
                  className="text-gray-400 hover:text-white 
                    text-sm transition-colors">
                  Phòng
                </Link>
              </li>
              <li>
                <Link to={ROUTES.BOOKINGS} 
                  className="text-gray-400 hover:text-white 
                    text-sm transition-colors">
                  Đặt phòng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 
                text-gray-400 text-sm">
                <Phone className="h-4 w-4" />
                <span>0901234567</span>
              </li>
              <li className="flex items-center space-x-2 
                text-gray-400 text-sm">
                <Mail className="h-4 w-4" />
                <span>info@hotel.com</span>
              </li>
              <li className="flex items-start space-x-2 
                text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mt-1" />
                <span>
                  123 Hotel Street, District 1, HCMC
                </span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Giờ làm việc
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Thứ 2 - Thứ 6: 24/7</li>
              <li>Thứ 7 - Chủ nhật: 24/7</li>
              <li className="text-primary-400">
                Hotline: 0901234567
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 
          text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Hotel Booking. 
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

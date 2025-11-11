import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Hotel, 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 
          lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Hotel className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">
                Hotel Booking
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Hệ thống quản lý và đặt phòng khách sạn 
              trực tuyến hàng đầu Việt Nam.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="hover:text-blue-500 
                  transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-blue-500 
                  transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-blue-500 
                  transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link 
                  to="/rooms" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Phòng
                </Link>
              </li>
              <li>
                <Link 
                  to="/bookings" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Đặt phòng
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Hỗ trợ
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/faq" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:text-blue-500 
                    transition-colors text-sm"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 
                  flex-shrink-0 mt-0.5" 
                />
                <span className="text-sm">
                  123 Đường ABC, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500 
                  flex-shrink-0" 
                />
                <span className="text-sm">
                  (028) 1234 5678
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500 
                  flex-shrink-0" 
                />
                <span className="text-sm">
                  info@hotelbooking.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 
          pt-8 text-center"
        >
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Hotel Booking. 
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

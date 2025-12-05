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
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 
      dark:text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 
          lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Hotel className="w-8 h-8 text-blue-500 
                dark:text-blue-400" />
              <span className="text-xl font-bold text-white 
                dark:text-gray-100">
                Hotel Booking
              </span>
            </div>
            <p className="text-sm text-gray-400 
              dark:text-gray-500 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="hover:text-blue-500 
                  dark:hover:text-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-blue-500 
                  dark:hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-blue-500 
                  dark:hover:text-blue-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 
              font-semibold mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('header.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/rooms" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('header.rooms')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/bookings" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('header.bookings')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('header.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white dark:text-gray-100 
              font-semibold mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/faq" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors 
                    text-sm"
                >
                  {t('footer.contactLink')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white dark:text-gray-100 
              font-semibold mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 
                  dark:text-blue-400 flex-shrink-0 mt-0.5" 
                />
                <span className="text-sm">
                  {t('footer.address')}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500 
                  dark:text-blue-400 flex-shrink-0" 
                />
                <span className="text-sm">
                  (0236) 3847 333
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500 
                  dark:text-blue-400 flex-shrink-0" 
                />
                <span className="text-sm">
                  info@hotelbooking.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 
          dark:border-gray-900 mt-8 pt-4 -mb-8 text-center"
        >
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Hotel Booking. 
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

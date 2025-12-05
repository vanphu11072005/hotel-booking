import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="w-full flex items-center space-x-2 px-4 py-2 
        text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
      title="Change Language"
    >
      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-300" />
      <span>{i18n.language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
    </button>
  );
};

export default LanguageSwitcher;

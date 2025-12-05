import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center space-x-2 px-4 py-2 
                 text-gray-700 hover:bg-gray-100 
                 dark:text-gray-200 dark:hover:bg-gray-700 
                 transition-colors text-left"
      aria-label={t('common.toggleDarkMode')}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          <span>{t('common.darkMode')}</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>{t('common.lightMode')}</span>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;

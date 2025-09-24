import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export type Language = 'de' | 'en';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage = i18n.language as Language;

  const switchLanguage = (newLanguage: Language) => {
    const currentPath = location.pathname;
    
    // Remove current language prefix
    const pathWithoutLang = currentPath.replace(/^\/(de|en)/, '');
    
    // Create new path with new language
    const newPath = `/${newLanguage}${pathWithoutLang}`;
    
    // Change language in i18next
    i18n.changeLanguage(newLanguage);
    
    // Navigate to new path
    navigate(newPath);
  };

  const getLocalizedPath = (path: string, language?: Language) => {
    const lang = language || currentLanguage;
    
    // Remove any existing language prefix
    const cleanPath = path.replace(/^\/(de|en)/, '');
    
    // Add language prefix
    return `/${lang}${cleanPath}`;
  };

  return {
    currentLanguage,
    switchLanguage,
    getLocalizedPath,
    isGerman: currentLanguage === 'de',
    isEnglish: currentLanguage === 'en',
  };
};
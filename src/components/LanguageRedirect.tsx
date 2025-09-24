import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LanguageRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const path = location.pathname;
    
    // Only redirect if on root path
    if (path === '/') {
      // Check if this is a bot/crawler
      const userAgent = navigator.userAgent.toLowerCase();
      const isCrawler = /googlebot|bingbot|slurp|duckduckbot|facebookexternalhit|twitterbot|whatsapp|linkedinbot/i.test(userAgent);
      
      if (isCrawler) {
        // For crawlers, redirect to German version (default)
        navigate('/de/', { replace: true });
        return;
      }

      // For regular users, detect language
      const browserLang = navigator.language.toLowerCase();
      const isGerman = browserLang.startsWith('de') || browserLang.includes('de');
      const isEnglish = browserLang.startsWith('en') || browserLang.includes('en');
      
      // Check if user has a stored preference
      const storedLang = localStorage.getItem('toolbox24-language');
      
      let targetLang = 'de'; // Default fallback
      
      if (storedLang && (storedLang === 'de' || storedLang === 'en')) {
        targetLang = storedLang;
      } else if (isEnglish) {
        targetLang = 'en';
      } else if (isGerman) {
        targetLang = 'de';
      }
      
      // Set language and redirect
      i18n.changeLanguage(targetLang);
      navigate(`/${targetLang}/`, { replace: true });
    }
  }, [location.pathname, navigate, i18n]);

  return null;
};
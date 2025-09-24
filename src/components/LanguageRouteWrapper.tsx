import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface LanguageRouteWrapperProps {
  children: React.ReactNode;
}

const LanguageRouteWrapper = ({ children }: LanguageRouteWrapperProps) => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    if (lang && (lang === 'de' || lang === 'en')) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
};

export default LanguageRouteWrapper;
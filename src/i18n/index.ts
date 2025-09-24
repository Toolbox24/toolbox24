import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import deCommon from './locales/de/common.json';
import deTools from './locales/de/tools.json';
import deTemplates from './locales/de/templates.json';
import dePages from './locales/de/pages.json';

import enCommon from './locales/en/common.json';
import enTools from './locales/en/tools.json';
import enTemplates from './locales/en/templates.json';
import enPages from './locales/en/pages.json';

const resources = {
  de: {
    common: deCommon,
    tools: deTools,
    templates: deTemplates,
    pages: dePages,
  },
  en: {
    common: enCommon,
    tools: enTools,
    templates: enTemplates,
    pages: enPages,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    debug: false,
    
    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'toolbox24-language',
    },

    interpolation: {
      escapeValue: false,
    },

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'tools', 'templates', 'pages'],
  });

export default i18n;
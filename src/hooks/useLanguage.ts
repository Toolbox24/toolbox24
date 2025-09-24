import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export type Language = 'de' | 'en';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    
    // Convert current path to new language
    const currentPath = location.pathname;
    let newPath = currentPath;

    // Remove current language prefix if exists
    if (currentPath.startsWith('/de/') || currentPath.startsWith('/en/')) {
      newPath = currentPath.substring(3);
    } else if (currentPath === '/de' || currentPath === '/en') {
      newPath = '/';
    }

    // Convert path segments for different languages
    if (lang === 'en') {
      newPath = convertPathToEnglish(newPath);
    } else {
      newPath = convertPathToGerman(newPath);
    }

    // Add new language prefix
    const finalPath = `/${lang}${newPath}`;
    navigate(finalPath);
  };

  return {
    currentLanguage,
    changeLanguage,
    isGerman: currentLanguage === 'de',
    isEnglish: currentLanguage === 'en',
  };
};

// Path conversion helpers
const convertPathToEnglish = (path: string): string => {
  return path
    .replace(/^\/pdf-tools\/pdf-zusammenfuegen/, '/pdf-tools/merge-pdf')
    .replace(/^\/pdf-tools\/pdf-komprimieren/, '/pdf-tools/compress-pdf')
    .replace(/^\/pdf-tools\/pdf-teilen/, '/pdf-tools/split-pdf')
    .replace(/^\/pdf-tools\/pdf-seiten-loeschen/, '/pdf-tools/delete-pages')
    .replace(/^\/pdf-tools\/pdf-zu-word/, '/pdf-tools/pdf-to-word')
    .replace(/^\/pdf-tools\/word-zu-pdf/, '/pdf-tools/word-to-pdf')
    .replace(/^\/pdf-tools\/pdf-zu-bildern/, '/pdf-tools/pdf-to-images')
    .replace(/^\/pdf-tools\/bilder-zu-pdf/, '/pdf-tools/images-to-pdf')
    .replace(/^\/datei-tools/, '/file-tools')
    .replace(/^\/datei-tools\/bild-komprimieren/, '/file-tools/compress-image')
    .replace(/^\/datei-tools\/bild-konvertieren/, '/file-tools/convert-image')
    .replace(/^\/datei-tools\/bild-zuschneiden/, '/file-tools/crop-image')
    .replace(/^\/datei-tools\/bildgroesse-aendern/, '/file-tools/resize-image')
    .replace(/^\/datei-tools\/bild-drehen/, '/file-tools/rotate-image')
    .replace(/^\/datei-tools\/hintergrund-entfernen/, '/file-tools/remove-background')
    .replace(/^\/datei-tools\/webp-konverter/, '/file-tools/webp-converter')
    .replace(/^\/datei-tools\/heic-zu-jpg/, '/file-tools/heic-to-jpg')
    .replace(/^\/datei-tools\/gif-zu-mp4/, '/file-tools/gif-to-mp4')
    .replace(/^\/vorlagen/, '/templates')
    .replace(/^\/alle-vorlagen/, '/all-templates')
    .replace(/^\/alle-tools/, '/all-tools')
    .replace(/^\/kontakt/, '/contact')
    .replace(/^\/impressum/, '/imprint')
    .replace(/^\/rechtliches/, '/legal');
};

const convertPathToGerman = (path: string): string => {
  return path
    .replace(/^\/pdf-tools\/merge-pdf/, '/pdf-tools/pdf-zusammenfuegen')
    .replace(/^\/pdf-tools\/compress-pdf/, '/pdf-tools/pdf-komprimieren')
    .replace(/^\/pdf-tools\/split-pdf/, '/pdf-tools/pdf-teilen')
    .replace(/^\/pdf-tools\/delete-pages/, '/pdf-tools/pdf-seiten-loeschen')
    .replace(/^\/pdf-tools\/pdf-to-word/, '/pdf-tools/pdf-zu-word')
    .replace(/^\/pdf-tools\/word-to-pdf/, '/pdf-tools/word-zu-pdf')
    .replace(/^\/pdf-tools\/pdf-to-images/, '/pdf-tools/pdf-zu-bildern')
    .replace(/^\/pdf-tools\/images-to-pdf/, '/pdf-tools/bilder-zu-pdf')
    .replace(/^\/file-tools/, '/datei-tools')
    .replace(/^\/file-tools\/compress-image/, '/datei-tools/bild-komprimieren')
    .replace(/^\/file-tools\/convert-image/, '/datei-tools/bild-konvertieren')
    .replace(/^\/file-tools\/crop-image/, '/datei-tools/bild-zuschneiden')
    .replace(/^\/file-tools\/resize-image/, '/datei-tools/bildgroesse-aendern')
    .replace(/^\/file-tools\/rotate-image/, '/datei-tools/bild-drehen')
    .replace(/^\/file-tools\/remove-background/, '/datei-tools/hintergrund-entfernen')
    .replace(/^\/file-tools\/webp-converter/, '/datei-tools/webp-konverter')
    .replace(/^\/file-tools\/heic-to-jpg/, '/datei-tools/heic-zu-jpg')
    .replace(/^\/file-tools\/gif-to-mp4/, '/datei-tools/gif-zu-mp4')
    .replace(/^\/templates/, '/vorlagen')
    .replace(/^\/all-templates/, '/alle-vorlagen')
    .replace(/^\/all-tools/, '/alle-tools')
    .replace(/^\/contact/, '/kontakt')
    .replace(/^\/imprint/, '/impressum')
    .replace(/^\/legal/, '/rechtliches');
};
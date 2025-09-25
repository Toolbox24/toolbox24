import { ViteSSG } from "vite-ssg";
import App from "./App.tsx";
import "./index.css";

export const createApp = ViteSSG(
  App,
  {
    routes: [
      { path: '/', component: () => import('./pages/Index.tsx') },
      { path: '/de', component: () => import('./pages/Home.tsx') },
      { path: '/de/pdf-tools', component: () => import('./pages/pdf-tools/AllPDFTools.tsx') },
      { path: '/de/pdf-tools/compress', component: () => import('./pages/pdf-tools/PDFCompress.tsx') },
      { path: '/de/pdf-tools/split', component: () => import('./pages/pdf-tools/PDFSplit.tsx') },
      { path: '/de/pdf-tools/merge', component: () => import('./pages/pdf-tools/PDFMerge.tsx') },
      { path: '/de/pdf-tools/word-to-pdf', component: () => import('./pages/pdf-tools/WordToPDF.tsx') },
      { path: '/de/pdf-tools/pdf-to-word', component: () => import('./pages/pdf-tools/PDFToWord.tsx') },
      { path: '/de/pdf-tools/pdf-to-images', component: () => import('./pages/pdf-tools/PDFToImages.tsx') },
      { path: '/de/pdf-tools/images-to-pdf', component: () => import('./pages/pdf-tools/ImagesToPDF.tsx') },
      { path: '/de/pdf-tools/delete-pages', component: () => import('./pages/pdf-tools/PDFDeletePages.tsx') },
      { path: '/de/datei-tools', component: () => import('./pages/file-tools/AllFileTools.tsx') },
      { path: '/de/datei-tools/bild-komprimieren', component: () => import('./pages/file-tools/ImageCompress.tsx') },
      { path: '/de/datei-tools/bild-konvertieren', component: () => import('./pages/file-tools/ImageConverter.tsx') },
      { path: '/de/datei-tools/bild-zuschneiden', component: () => import('./pages/file-tools/ImageCrop.tsx') },
      { path: '/de/datei-tools/bild-groesse-aendern', component: () => import('./pages/file-tools/ImageResize.tsx') },
      { path: '/de/datei-tools/bild-drehen', component: () => import('./pages/file-tools/ImageRotate.tsx') },
      { path: '/de/datei-tools/hintergrund-entfernen', component: () => import('./pages/file-tools/RemoveBackground.tsx') },
      { path: '/de/datei-tools/webp-konverter', component: () => import('./pages/file-tools/WebPConverter.tsx') },
      { path: '/de/datei-tools/heic-to-jpg', component: () => import('./pages/file-tools/HEICToJPG.tsx') },
      { path: '/de/datei-tools/gif-to-mp4', component: () => import('./pages/file-tools/GifToMp4.tsx') },
      { path: '/de/bild/jpg-to-png', component: () => import('./pages/bild/JpgToPng.tsx') },
      { path: '/de/bild/png-to-jpg', component: () => import('./pages/bild/PngToJpg.tsx') },
      { path: '/de/bild/webp-to-jpg', component: () => import('./pages/bild/WebpToJpg.tsx') },
      { path: '/de/bild/webp-to-png', component: () => import('./pages/bild/WebpToPng.tsx') },
      { path: '/de/bild/heic-to-jpg', component: () => import('./pages/bild/HeicToJpg.tsx') },
      { path: '/de/bild/avif-to-jpg', component: () => import('./pages/bild/AvifToJpg.tsx') },
      { path: '/de/bild/jpeg-compress', component: () => import('./pages/bild/JpegCompress.tsx') },
      { path: '/de/bild/png-compress', component: () => import('./pages/bild/PngCompress.tsx') },
      { path: '/de/bild/gif-compress', component: () => import('./pages/bild/GifCompress.tsx') },
      { path: '/de/bild/svg-compress', component: () => import('./pages/bild/SvgCompress.tsx') },
      { path: '/de/vorlagen', component: () => import('./pages/AllTemplates.tsx') },
      { path: '/de/vorlagen/:category', component: () => import('./pages/CategoryPage.tsx') },
      { path: '/de/vorlagen/:category/:slug', component: () => import('./pages/TemplateDetail.tsx') },
      { path: '/de/blog', component: () => import('./pages/Blog.tsx') },
      { path: '/de/blog/:slug', component: () => import('./pages/BlogPost.tsx') },
      { path: '/de/search', component: () => import('./pages/SearchResults.tsx') },
      { path: '/de/alle-tools', component: () => import('./pages/AlleTools.tsx') },
      { path: '/de/kontakt', component: () => import('./pages/Kontakt.tsx') },
      { path: '/de/impressum', component: () => import('./pages/Impressum.tsx') },
      { path: '/de/rechtliches', component: () => import('./pages/Rechtliches.tsx') },
      { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFound.tsx') },
    ],
  },
  ({ app, router, isClient }) => {
    // Install plugins, configure router, etc.
  }
);

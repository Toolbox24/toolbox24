import './i18n';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import TemplateDetail from "./pages/TemplateDetail";
import SearchResults from "./pages/SearchResults";
import AllTemplates from "./pages/AllTemplates";
import AlleTools from "./pages/AlleTools";
import NotFound from "./pages/NotFound";
import Rechtliches from "./pages/Rechtliches";
import Impressum from "./pages/Impressum";
import Kontakt from "./pages/Kontakt";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import LanguageRedirect from "./components/LanguageRedirect";

// PDF Tools
import AllPDFTools from "./pages/pdf-tools/AllPDFTools";
import PDFMerge from "./pages/pdf-tools/PDFMerge";
import PDFCompress from "./pages/pdf-tools/PDFCompress";
import PDFSplit from "./pages/pdf-tools/PDFSplit";
import PDFToWord from "./pages/pdf-tools/PDFToWord";
import WordToPDF from "./pages/pdf-tools/WordToPDF";
import PDFToImages from "./pages/pdf-tools/PDFToImages";
import ImagesToPDF from "./pages/pdf-tools/ImagesToPDF";
import PDFDeletePages from "./pages/pdf-tools/PDFDeletePages";

// File Tools
import AllFileTools from "./pages/file-tools/AllFileTools";
import ImageCompress from "./pages/file-tools/ImageCompress";
import ImageResize from "./pages/file-tools/ImageResize";
import ImageCrop from "./pages/file-tools/ImageCrop";
import ImageRotate from "./pages/file-tools/ImageRotate";
import RemoveBackground from "./pages/file-tools/RemoveBackground";
import ImageConverter from "./pages/file-tools/ImageConverter";
import WebPConverter from "./pages/file-tools/WebPConverter";
import HEICToJPG from "./pages/file-tools/HEICToJPG";
import GifToMp4 from "./pages/file-tools/GifToMp4";
import ImageConverterHub from "./pages/file-tools/ImageConverterHub";

// Individual converter landing pages
import PngToJpg from "./pages/bild/PngToJpg";
import JpgToPng from "./pages/bild/JpgToPng";
import WebpToJpg from "./pages/bild/WebpToJpg";
import WebpToPng from "./pages/bild/WebpToPng";
import HeicToJpg from "./pages/bild/HeicToJpg";
import AvifToJpg from "./pages/bild/AvifToJpg";
import GifToMp4Landing from "./pages/GifToMp4";
import JpegCompress from "./pages/bild/JpegCompress";
import PngCompress from "./pages/bild/PngCompress";
import SvgCompress from "./pages/bild/SvgCompress";
import GifCompress from "./pages/bild/GifCompress";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <LanguageRedirect />
            <Routes>
              {/* Root redirect to German */}
              <Route path="/" element={<div />} />
              
              {/* German Routes */}
              <Route path="/de" element={<Home />} />
              <Route path="/de/" element={<Home />} />
              <Route path="/de/kategorie/:slug" element={<CategoryPage />} />
              <Route path="/de/vorlage/:slug" element={<TemplateDetail />} />
              <Route path="/de/suche" element={<SearchResults />} />
              <Route path="/de/alle-vorlagen" element={<AllTemplates />} />
              <Route path="/de/alle-tools" element={<AlleTools />} />
              
              {/* PDF Tools */}
              <Route path="/de/pdf-tools/alle" element={<AllPDFTools />} />
              <Route path="/de/pdf-tools/pdf-zusammenfuegen" element={<PDFMerge />} />
              <Route path="/de/pdf-tools/pdf-komprimieren" element={<PDFCompress />} />
              <Route path="/de/pdf-tools/pdf-teilen" element={<PDFSplit />} />
              <Route path="/de/pdf-tools/pdf-zu-word" element={<PDFToWord />} />
              <Route path="/de/pdf-tools/word-zu-pdf" element={<WordToPDF />} />
              <Route path="/de/pdf-tools/pdf-zu-bilder" element={<PDFToImages />} />
              <Route path="/de/pdf-tools/bilder-zu-pdf" element={<ImagesToPDF />} />
              <Route path="/de/pdf-tools/seiten-loeschen" element={<PDFDeletePages />} />
              
              {/* Datei Tools */}
              <Route path="/de/datei-tools/alle" element={<AllFileTools />} />
              <Route path="/de/datei-tools/bild-komprimieren" element={<ImageCompress />} />
              <Route path="/de/datei-tools/bild-groesse-aendern" element={<ImageResize />} />
              <Route path="/de/datei-tools/bild-zuschneiden" element={<ImageCrop />} />
              <Route path="/de/datei-tools/bild-drehen" element={<ImageRotate />} />
              <Route path="/de/datei-tools/hintergrund-entfernen" element={<RemoveBackground />} />
              <Route path="/de/datei-tools/bild-konvertieren" element={<ImageConverter />} />
              <Route path="/de/datei-tools/webp-konverter" element={<WebPConverter />} />
              <Route path="/de/datei-tools/heic-zu-jpg" element={<HEICToJPG />} />
              <Route path="/de/datei-tools/gif-zu-mp4" element={<GifToMp4 />} />
              <Route path="/de/datei-tools/konverter" element={<ImageConverterHub />} />
              
              {/* Individual converter landing pages */}
              <Route path="/de/bild/png-zu-jpg" element={<PngToJpg />} />
              <Route path="/de/bild/jpg-zu-png" element={<JpgToPng />} />
              <Route path="/de/bild/webp-zu-jpg" element={<WebpToJpg />} />
              <Route path="/de/bild/webp-zu-png" element={<WebpToPng />} />
              <Route path="/de/bild/heic-zu-jpg" element={<HeicToJpg />} />
              <Route path="/de/bild/avif-zu-jpg" element={<AvifToJpg />} />
              <Route path="/de/gif-zu-mp4" element={<GifToMp4Landing />} />
              
              {/* Image compression pages */}
              <Route path="/de/bild/jpeg-komprimieren" element={<JpegCompress />} />
              <Route path="/de/bild/png-komprimieren" element={<PngCompress />} />
              <Route path="/de/bild/svg-komprimieren" element={<SvgCompress />} />
              <Route path="/de/bild/gif-komprimieren" element={<GifCompress />} />
              
              {/* Blog Pages */}
              <Route path="/de/blog" element={<Blog />} />
              <Route path="/de/blog/:slug" element={<BlogPost />} />
              
              {/* Legal Pages */}
              <Route path="/de/rechtliches" element={<Rechtliches />} />
              <Route path="/de/impressum" element={<Impressum />} />
              <Route path="/de/kontakt" element={<Kontakt />} />
              
              {/* Legacy routes - redirect to German versions */}
              <Route path="/kategorie/:slug" element={<CategoryPage />} />
              <Route path="/vorlage/:slug" element={<TemplateDetail />} />
              <Route path="/suche" element={<SearchResults />} />
              <Route path="/alle-vorlagen" element={<AllTemplates />} />
              <Route path="/alle-tools" element={<AlleTools />} />
              <Route path="/pdf-tools/*" element={<div />} />
              <Route path="/datei-tools/*" element={<div />} />
              <Route path="/bild/*" element={<div />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/rechtliches" element={<Rechtliches />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/kontakt" element={<Kontakt />} />
              
              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;

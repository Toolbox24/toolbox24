import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageRedirect } from "@/components/LanguageRedirect";
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
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<LanguageRedirect />} />
              
              {/* German routes */}
              <Route path="/de" element={<Home />} />
              <Route path="/de/" element={<Home />} />
              <Route path="/de/kategorie/:slug" element={<CategoryPage />} />
              <Route path="/de/vorlage/:slug" element={<TemplateDetail />} />
              <Route path="/de/suche" element={<SearchResults />} />
              <Route path="/de/alle-vorlagen" element={<AllTemplates />} />
              <Route path="/de/alle-tools" element={<AlleTools />} />
              
              {/* German PDF Tools */}
              <Route path="/de/pdf-tools" element={<AllPDFTools />} />
              <Route path="/de/pdf-tools/pdf-zusammenfuegen" element={<PDFMerge />} />
              <Route path="/de/pdf-tools/pdf-komprimieren" element={<PDFCompress />} />
              <Route path="/de/pdf-tools/pdf-teilen" element={<PDFSplit />} />
              <Route path="/de/pdf-tools/pdf-zu-word" element={<PDFToWord />} />
              <Route path="/de/pdf-tools/word-zu-pdf" element={<WordToPDF />} />
              <Route path="/de/pdf-tools/pdf-zu-bilder" element={<PDFToImages />} />
              <Route path="/de/pdf-tools/bilder-zu-pdf" element={<ImagesToPDF />} />
              <Route path="/de/pdf-tools/seiten-loeschen" element={<PDFDeletePages />} />
              
              {/* German File Tools */}
              <Route path="/de/datei-tools" element={<AllFileTools />} />
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
              
              {/* German Legal & Contact */}
              <Route path="/de/rechtliches" element={<Rechtliches />} />
              <Route path="/de/impressum" element={<Impressum />} />
              <Route path="/de/kontakt" element={<Kontakt />} />
              
              {/* English routes */}
              <Route path="/en" element={<Home />} />
              <Route path="/en/" element={<Home />} />
              <Route path="/en/category/:slug" element={<CategoryPage />} />
              <Route path="/en/template/:slug" element={<TemplateDetail />} />
              <Route path="/en/search" element={<SearchResults />} />
              <Route path="/en/all-templates" element={<AllTemplates />} />
              <Route path="/en/all-tools" element={<AlleTools />} />
              
              {/* English PDF Tools */}
              <Route path="/en/pdf-tools" element={<AllPDFTools />} />
              <Route path="/en/pdf-tools/merge-pdf" element={<PDFMerge />} />
              <Route path="/en/pdf-tools/compress-pdf" element={<PDFCompress />} />
              <Route path="/en/pdf-tools/split-pdf" element={<PDFSplit />} />
              <Route path="/en/pdf-tools/pdf-to-word" element={<PDFToWord />} />
              <Route path="/en/pdf-tools/word-to-pdf" element={<WordToPDF />} />
              <Route path="/en/pdf-tools/pdf-to-images" element={<PDFToImages />} />
              <Route path="/en/pdf-tools/images-to-pdf" element={<ImagesToPDF />} />
              <Route path="/en/pdf-tools/delete-pages" element={<PDFDeletePages />} />
              
              {/* English File Tools */}
              <Route path="/en/file-tools" element={<AllFileTools />} />
              <Route path="/en/file-tools/compress-image" element={<ImageCompress />} />
              <Route path="/en/file-tools/resize-image" element={<ImageResize />} />
              <Route path="/en/file-tools/crop-image" element={<ImageCrop />} />
              <Route path="/en/file-tools/rotate-image" element={<ImageRotate />} />
              <Route path="/en/file-tools/remove-background" element={<RemoveBackground />} />
              <Route path="/en/file-tools/convert-image" element={<ImageConverter />} />
              <Route path="/en/file-tools/webp-converter" element={<WebPConverter />} />
              <Route path="/en/file-tools/heic-to-jpg" element={<HEICToJPG />} />
              <Route path="/en/file-tools/gif-to-mp4" element={<GifToMp4 />} />
              <Route path="/en/file-tools/converter" element={<ImageConverterHub />} />
              
              {/* English Legal & Contact */}
              <Route path="/en/legal" element={<Rechtliches />} />
              <Route path="/en/imprint" element={<Impressum />} />
              <Route path="/en/contact" element={<Kontakt />} />
              
              {/* Legacy routes - redirect to root for language detection */}
              <Route path="/pdf-tools/*" element={<LanguageRedirect />} />
              <Route path="/datei-tools/*" element={<LanguageRedirect />} />
              <Route path="/alle-vorlagen" element={<LanguageRedirect />} />
              <Route path="/alle-tools" element={<LanguageRedirect />} />
              <Route path="/rechtliches" element={<LanguageRedirect />} />
              <Route path="/impressum" element={<LanguageRedirect />} />
              <Route path="/kontakt" element={<LanguageRedirect />} />
              
              {/* Individual converter landing pages */}
              <Route path="/bild/png-zu-jpg" element={<PngToJpg />} />
              <Route path="/bild/jpg-zu-png" element={<JpgToPng />} />
              <Route path="/bild/webp-zu-jpg" element={<WebpToJpg />} />
              <Route path="/bild/webp-zu-png" element={<WebpToPng />} />
              <Route path="/bild/heic-zu-jpg" element={<HeicToJpg />} />
              <Route path="/bild/avif-zu-jpg" element={<AvifToJpg />} />
              <Route path="/gif-zu-mp4" element={<GifToMp4Landing />} />
              
              {/* Image compression pages */}
              <Route path="/bild/jpeg-komprimieren" element={<JpegCompress />} />
              <Route path="/bild/png-komprimieren" element={<PngCompress />} />
              <Route path="/bild/svg-komprimieren" element={<SvgCompress />} />
              <Route path="/bild/gif-komprimieren" element={<GifCompress />} />
              
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

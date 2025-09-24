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
              <Route path="/" element={<Home />} />
              <Route path="/kategorie/:slug" element={<CategoryPage />} />
              <Route path="/vorlage/:slug" element={<TemplateDetail />} />
              <Route path="/suche" element={<SearchResults />} />
              <Route path="/alle-vorlagen" element={<AllTemplates />} />
              <Route path="/alle-tools" element={<AlleTools />} />
              
              {/* PDF Tools */}
              <Route path="/pdf-tools/alle" element={<AllPDFTools />} />
              <Route path="/pdf-tools/pdf-zusammenfuegen" element={<PDFMerge />} />
              <Route path="/pdf-tools/pdf-komprimieren" element={<PDFCompress />} />
              <Route path="/pdf-tools/pdf-teilen" element={<PDFSplit />} />
              <Route path="/pdf-tools/pdf-zu-word" element={<PDFToWord />} />
              <Route path="/pdf-tools/word-zu-pdf" element={<WordToPDF />} />
              <Route path="/pdf-tools/pdf-zu-bilder" element={<PDFToImages />} />
              <Route path="/pdf-tools/bilder-zu-pdf" element={<ImagesToPDF />} />
              <Route path="/pdf-tools/seiten-loeschen" element={<PDFDeletePages />} />
              
              {/* Datei Tools */}
              <Route path="/datei-tools/alle" element={<AllFileTools />} />
              <Route path="/datei-tools/bild-komprimieren" element={<ImageCompress />} />
              <Route path="/datei-tools/bild-groesse-aendern" element={<ImageResize />} />
              <Route path="/datei-tools/bild-zuschneiden" element={<ImageCrop />} />
              <Route path="/datei-tools/bild-drehen" element={<ImageRotate />} />
              <Route path="/datei-tools/hintergrund-entfernen" element={<RemoveBackground />} />
              <Route path="/datei-tools/bild-konvertieren" element={<ImageConverter />} />
              <Route path="/datei-tools/webp-konverter" element={<WebPConverter />} />
              <Route path="/datei-tools/heic-zu-jpg" element={<HEICToJPG />} />
              <Route path="/datei-tools/gif-zu-mp4" element={<GifToMp4 />} />
              <Route path="/datei-tools/konverter" element={<ImageConverterHub />} />
              
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
              
              {/* Legal Pages */}
              <Route path="/rechtliches" element={<Rechtliches />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/kontakt" element={<Kontakt />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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

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
import NotFound from "./pages/NotFound";

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
              
              {/* PDF Tools */}
              <Route path="/pdf-tools/all" element={<AllPDFTools />} />
              <Route path="/pdf-tools/merge" element={<PDFMerge />} />
              <Route path="/pdf-tools/compress" element={<PDFCompress />} />
              <Route path="/pdf-tools/split" element={<PDFSplit />} />
              <Route path="/pdf-tools/to-word" element={<PDFToWord />} />
              <Route path="/pdf-tools/from-word" element={<WordToPDF />} />
              <Route path="/pdf-tools/to-images" element={<PDFToImages />} />
              <Route path="/pdf-tools/from-images" element={<ImagesToPDF />} />
              <Route path="/pdf-tools/delete-pages" element={<PDFDeletePages />} />
              
              {/* File Tools */}
              <Route path="/file-tools/all" element={<AllFileTools />} />
              <Route path="/file-tools/compress-image" element={<ImageCompress />} />
              <Route path="/file-tools/resize-image" element={<ImageResize />} />
              <Route path="/file-tools/crop-image" element={<ImageCrop />} />
              <Route path="/file-tools/rotate-image" element={<ImageRotate />} />
              <Route path="/file-tools/remove-background" element={<RemoveBackground />} />
              <Route path="/file-tools/convert-png-jpg" element={<ImageConverter />} />
              <Route path="/file-tools/convert-webp" element={<WebPConverter />} />
              <Route path="/file-tools/heic-to-jpg" element={<HEICToJPG />} />
              <Route path="/file-tools/gif-to-mp4" element={<GifToMp4 />} />
              <Route path="/file-tools/convert" element={<ImageConverterHub />} />
              
              {/* Individual converter landing pages */}
              <Route path="/bild/png-zu-jpg" element={<PngToJpg />} />
              <Route path="/bild/jpg-zu-png" element={<JpgToPng />} />
              <Route path="/bild/webp-zu-jpg" element={<WebpToJpg />} />
              <Route path="/bild/webp-zu-png" element={<WebpToPng />} />
              <Route path="/bild/heic-zu-jpg" element={<HeicToJpg />} />
              <Route path="/bild/avif-zu-jpg" element={<AvifToJpg />} />
              <Route path="/gif-zu-mp4" element={<GifToMp4Landing />} />
              
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

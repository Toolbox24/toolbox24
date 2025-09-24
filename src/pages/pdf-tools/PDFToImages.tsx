import { useState, useRef } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Image, Settings, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface RenderedPage {
  pageNumber: number;
  imageData: string; // base64 data URL
  width: number;
  height: number;
}

const PDFToImages = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [highQuality, setHighQuality] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setRenderedPages([]);
      setProgress(0);
      setIsProcessing(false);
      setProcessStatus('');
      return;
    }
    
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setRenderedPages([]);
      setProcessStatus('');
      setProgress(0);
    }
  };

  const renderPDFToImages = async (file: File): Promise<RenderedPage[]> => {
    try {
      setProcessStatus('PDF wird geladen...');
      setProgress(10);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const totalPages = pdf.numPages;
      const pages: RenderedPage[] = [];
      
      // Set scale based on quality setting
      const scale = highQuality ? 2.0 : 1.2; // ~300 DPI vs ~150 DPI
      
      setProcessStatus(`${totalPages} Seiten werden gerendert...`);
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProcessStatus(`Seite ${pageNum} von ${totalPages} wird gerendert...`);
        setProgress(10 + (pageNum / totalPages) * 80);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Canvas-Kontext konnte nicht erstellt werden');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to image data URL
        const imageData = canvas.toDataURL('image/png', 0.95);
        
        pages.push({
          pageNumber: pageNum,
          imageData,
          width: viewport.width,
          height: viewport.height,
        });
        
        console.log(`Page ${pageNum} rendered: ${viewport.width}x${viewport.height}`);
      }
      
      return pages;
      
    } catch (error: any) {
      console.error('PDF rendering error:', error);
      
      if (error.name === 'PasswordException') {
        throw new Error('Das PDF ist passwortgeschützt. Bitte verwenden Sie ein ungeschütztes PDF.');
      } else if (error.name === 'InvalidPDFException') {
        throw new Error('Die Datei ist kein gültiges PDF oder ist beschädigt.');
      } else if (error.message && error.message.includes('worker')) {
        throw new Error('PDF.js Worker konnte nicht geladen werden. Überprüfen Sie Ihre Internetverbindung.');
      } else {
        throw new Error(`Fehler beim Rendern des PDFs: ${error.message || 'Unbekannter Fehler'}`);
      }
    }
  };

  const convertPDFToImages = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine PDF-Datei aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Render PDF pages to images
      const pages = await renderPDFToImages(file);
      
      setRenderedPages(pages);
      setProgress(100);
      setProcessStatus('');

      toast({
        title: "Konvertierung erfolgreich!",
        description: `${pages.length} Seiten wurden zu Bildern konvertiert (${highQuality ? '300' : '150'} DPI)`
      });
      
    } catch (error) {
      console.error('Conversion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler bei der Konvertierung.';
      
      toast({
        title: "Konvertierungsfehler",
        description: errorMessage,
        variant: "destructive"
      });
      setProcessStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingleImage = (page: RenderedPage) => {
    const link = document.createElement('a');
    link.href = page.imageData;
    link.download = `${file?.name.replace('.pdf', '') || 'page'}-page-${page.pageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download gestartet",
      description: `Seite ${page.pageNumber} wird heruntergeladen...`
    });
  };

  const downloadAllAsZIP = async () => {
    if (!renderedPages.length || !file) return;
    
    try {
      setProcessStatus('ZIP-Archiv wird erstellt...');
      setProgress(0);
      
      const zip = new JSZip();
      const baseName = file.name.replace('.pdf', '');
      
      // Add each image to ZIP
      for (let i = 0; i < renderedPages.length; i++) {
        const page = renderedPages[i];
        setProgress((i / renderedPages.length) * 90);
        
        // Convert data URL to blob
        const response = await fetch(page.imageData);
        const blob = await response.blob();
        
        zip.file(`${baseName}-page-${page.pageNumber}.png`, blob);
      }
      
      setProgress(95);
      setProcessStatus('ZIP wird generiert...');
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${baseName}-all-pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setProgress(100);
      setProcessStatus('');
      
      toast({
        title: "ZIP-Download gestartet",
        description: `Alle ${renderedPages.length} Seiten werden als ZIP heruntergeladen...`
      });
      
    } catch (error) {
      console.error('ZIP creation error:', error);
      toast({
        title: "ZIP-Fehler",
        description: "Fehler beim Erstellen des ZIP-Archivs.",
        variant: "destructive"
      });
      setProcessStatus('');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <Image className="h-8 w-8 text-primary" />
            PDF in Bilder umwandeln
          </h1>
          <p className="page-description">
            Konvertieren Sie PDF-Seiten in hochqualitative PNG-Bilder
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={false}
            maxSize={100 * 1024 * 1024} // 100MB
          />

          {file && (
            <div className="p-6 bg-muted/30 rounded-lg border space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Konvertierungsoptionen</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quality-mode">Hohe Qualität (300 DPI)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard: 150 DPI, Hoch: 300 DPI (größere Dateien)
                  </p>
                </div>
                <Switch
                  id="quality-mode"
                  checked={highQuality}
                  onCheckedChange={setHighQuality}
                />
              </div>
              
              <Separator />
              
              <Button
                onClick={convertPDFToImages}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Konvertierung läuft...' : 'In Bilder konvertieren'}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                {processStatus || `Konvertierung läuft... ${progress}%`}
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {renderedPages.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {renderedPages.length} Seiten konvertiert
                </h3>
                <Button
                  onClick={downloadAllAsZIP}
                  variant="outline"
                  disabled={isProcessing}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Alle als ZIP herunterladen
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderedPages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="bg-white rounded-lg border shadow-sm overflow-hidden"
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={page.imageData}
                        alt={`Seite ${page.pageNumber}`}
                        className="w-full h-full object-contain"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Seite {page.pageNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {page.width} × {page.height} px
                          </p>
                        </div>
                        <Button
                          onClick={() => downloadSingleImage(page)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 100MB)</li>
            <li>Wählen Sie die gewünschte Qualität (150 oder 300 DPI)</li>
            <li>Klicken Sie auf "In Bilder konvertieren"</li>
            <li>Jede Seite wird als PNG-Bild gerendert</li>
            <li>Laden Sie einzelne Bilder herunter oder alle als ZIP-Archiv</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Qualitätshinweis:</strong> 150 DPI eignet sich für Bildschirmanzeige und Web, 
              300 DPI für Druck und hochqualitative Ausgabe.
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Datenschutz:</strong> Alle Verarbeitungen erfolgen lokal in Ihrem Browser. 
            Ihre Dateien werden nicht an externe Server übertragen.
          </p>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PDFToImages;
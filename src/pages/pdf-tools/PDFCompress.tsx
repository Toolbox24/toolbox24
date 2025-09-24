import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import * as pdfjsLib from 'pdfjs-dist';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFCompress = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setOriginalSize(0);
      setCompressedSize(0);
      setDownloadUrl(null);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setOriginalSize(selectedFiles[0].size);
      setDownloadUrl(null);
      setCompressedSize(0);
      setProgress(0);
      setIsProcessing(false);
    }
  };

  const compressPDF = async () => {
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
      const arrayBuffer = await file.arrayBuffer();
      setProgress(5);
      
      console.log(`Starting compression of ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB PDF`);
      
      // Load PDF with PDF.js to render pages as images
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;
      
      setProgress(10);
      console.log(`PDF has ${numPages} pages`);

      // Create new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Process each page
      for (let i = 1; i <= numPages; i++) {
        setProgress(10 + (i / numPages) * 70);
        
        console.log(`Processing page ${i}/${numPages}`);
        
        // Get page
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Use 1.5 scale for good quality but smaller size
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not create canvas context');
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;

        // Convert canvas to blob with compression
        const imageBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob from canvas'));
          }, 'image/jpeg', 0.8); // 80% quality for good compression
        });

        // Further compress the image
        const compressedImageBlob = await imageCompression(imageBlob as File, {
          maxSizeMB: 0.5, // Max 500KB per page image
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/jpeg'
        });

        console.log(`Page ${i} compressed from ${(imageBlob.size / 1024).toFixed(1)}KB to ${(compressedImageBlob.size / 1024).toFixed(1)}KB`);

        // Convert compressed image to array buffer
        const compressedImageArrayBuffer = await compressedImageBlob.arrayBuffer();

        // Embed compressed image in new PDF
        const pdfImage = await newPdfDoc.embedJpg(compressedImageArrayBuffer);
        
        // Add page with compressed image
        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setProgress(85);
      console.log('All pages processed, saving PDF...');

      // Save compressed PDF
      const compressedPdfBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(95);

      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(compressedPdfBytes.length);
      setProgress(100);

      const savingsPercent = ((originalSize - compressedPdfBytes.length) / originalSize) * 100;
      const savingsMB = (originalSize - compressedPdfBytes.length) / 1024 / 1024;
      
      console.log(`Compression complete: ${savingsPercent.toFixed(1)}% reduction, saved ${savingsMB.toFixed(2)} MB`);
      console.log(`Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB, Compressed: ${(compressedPdfBytes.length / 1024 / 1024).toFixed(2)} MB`);
      
      toast({
        title: "Erfolgreich komprimiert!",
        description: `${savingsPercent.toFixed(1)}% kleiner (${savingsMB.toFixed(1)} MB gespart)`
      });
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Komprimieren der PDF. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressedPDF = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compressed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavingsPercentage = () => {
    if (originalSize && compressedSize) {
      const savings = ((originalSize - compressedSize) / originalSize) * 100;
      return Math.max(0, savings);
    }
    return 0;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <FileDown className="h-8 w-8 text-primary" />
            PDF komprimieren
          </h1>
          <p className="page-description">
            Reduzieren Sie die Dateigröße Ihrer PDF-Dokumente
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
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Originalgröße: {formatFileSize(originalSize)}
              </p>
              <Button
                onClick={compressPDF}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'Komprimierung...' : 'PDF komprimieren'}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Komprimierung läuft... {progress}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                PDF erfolgreich komprimiert!
              </h3>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Ursprüngliche Größe: {formatFileSize(originalSize)}</p>
                <p>Komprimierte Größe: {formatFileSize(compressedSize)}</p>
                <p className="font-semibold text-green-600">
                  Ersparnis: {getSavingsPercentage().toFixed(1)}%
                </p>
              </div>
              <Button
                onClick={downloadCompressedPDF}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Komprimierte PDF herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 100MB)</li>
            <li>Klicken Sie auf "PDF komprimieren"</li>
            <li>Die Datei wird optimiert: Bilder komprimiert, Objekte zusammengefasst</li>
            <li>Laden Sie die komprimierte PDF-Datei herunter</li>
          </ol>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Komprimierungsverfahren:</h3>
            <h3 className="font-semibold text-blue-800 mb-2">Komprimierungsverfahren:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• PDF-Seiten werden als Bilder gerendert</li>
              <li>• Bilder werden mit 70-80% JPEG-Qualität komprimiert</li>
              <li>• Maximale Auflösung: 1200px (für gute Lesbarkeit)</li>
              <li>• Neues PDF wird aus komprimierten Bildern erstellt</li>
              <li>• Typische Reduktion: 40-70% bei bildlastigen PDFs</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Datenschutz:</strong> Alle Verarbeitungen erfolgen lokal in Ihrem Browser. 
            Ihre Dateien werden nicht an externe Server übertragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFCompress;
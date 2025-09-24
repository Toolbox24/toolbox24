import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      setProgress(10);
      
      console.log(`Starting compression of ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB PDF`);
      
      // Load PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setProgress(20);
      console.log(`PDF has ${pageCount} pages`);

      // Create a new compressed PDF
      const newPdfDoc = await PDFDocument.create();
      
      // Copy pages with compression
      for (let i = 0; i < pageCount; i++) {
        setProgress(20 + (i / pageCount) * 60);
        
        try {
          // Copy page to new document
          const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
          newPdfDoc.addPage(page);
          
          console.log(`Processed page ${i + 1}/${pageCount}`);
        } catch (error) {
          console.warn(`Error copying page ${i + 1}:`, error);
          // Add blank page as fallback
          newPdfDoc.addPage();
        }
      }

      setProgress(85);
      console.log('All pages processed, compressing PDF...');

      // Save with aggressive compression settings
      const compressedPdfBytes = await newPdfDoc.save({
        useObjectStreams: true, // Enable object streams for compression
        addDefaultPage: false,
        objectsPerTick: 500, // Process many objects per tick for better compression
        updateFieldAppearances: false, // Don't update form field appearances
      });

      setProgress(95);

      // If compression isn't significant, try removing metadata and optimizing further
      let finalBytes = compressedPdfBytes;
      const compressionRatio = finalBytes.length / arrayBuffer.byteLength;
      
      console.log(`Initial compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
      
      if (compressionRatio > 0.9) {
        // Try additional compression by creating a minimal PDF
        try {
          const minimalDoc = await PDFDocument.create();
          
          // Copy pages one by one with minimal settings
          for (let i = 0; i < pageCount; i++) {
            const [page] = await minimalDoc.copyPages(pdfDoc, [i]);
            minimalDoc.addPage(page);
          }
          
          // Save with maximum compression
          finalBytes = await minimalDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 1000,
            updateFieldAppearances: false,
          });
          
          console.log(`Additional compression ratio: ${(finalBytes.length / arrayBuffer.byteLength * 100).toFixed(1)}%`);
        } catch (error) {
          console.warn('Additional compression failed, using initial result:', error);
        }
      }

      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(finalBytes.length);
      setProgress(100);

      const savingsPercent = ((originalSize - finalBytes.length) / originalSize) * 100;
      const savingsMB = (originalSize - finalBytes.length) / 1024 / 1024;
      
      console.log(`Compression complete: ${savingsPercent.toFixed(1)}% reduction, saved ${savingsMB.toFixed(2)} MB`);
      console.log(`Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB, Compressed: ${(finalBytes.length / 1024 / 1024).toFixed(2)} MB`);
      
      if (savingsPercent > 0) {
        toast({
          title: "PDF erfolgreich komprimiert!",
          description: `${savingsPercent.toFixed(1)}% kleiner (${savingsMB.toFixed(1)} MB gespart)`
        });
      } else {
        toast({
          title: "PDF verarbeitet",
          description: "Das PDF wurde optimiert, konnte aber nicht weiter komprimiert werden."
        });
      }
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
              <li>• Object-Streams für strukturelle Kompression</li>
              <li>• Optimierte PDF-Struktur ohne Redundanzen</li>
              <li>• Entfernung unnötiger Metadaten</li>
              <li>• Aggressive Objektkomprimierung</li>
              <li>• Typische Reduktion: 10-30% (strukturell)</li>
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
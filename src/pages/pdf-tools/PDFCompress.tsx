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
      setProgress(20);
      
      // Load original PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setProgress(40);
      
      // Remove metadata for compression
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      setProgress(60);
      
      // Save with aggressive compression settings
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 1000,
        updateFieldAppearances: false,
      });
      
      setProgress(80);
      
      // Create a new clean PDF document for final optimization
      const cleanDoc = await PDFDocument.create();
      const tempDoc = await PDFDocument.load(compressedBytes);
      
      // Copy all pages to clean document
      const pageIndices = Array.from({ length: tempDoc.getPageCount() }, (_, i) => i);
      const copiedPages = await cleanDoc.copyPages(tempDoc, pageIndices);
      copiedPages.forEach(page => cleanDoc.addPage(page));
      
      setProgress(90);
      
      // Final save with maximum compression
      const finalBytes = await cleanDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 2000,
        updateFieldAppearances: false,
      });
      
      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(finalBytes.length);
      setProgress(100);

      const savingsPercent = ((originalSize - finalBytes.length) / originalSize) * 100;
      const savingsMB = (originalSize - finalBytes.length) / 1024 / 1024;
      
      if (savingsPercent > 0) {
        toast({
          title: "PDF erfolgreich komprimiert!",
          description: `${savingsPercent.toFixed(1)}% kleiner (${savingsMB.toFixed(1)} MB gespart)`
        });
      } else {
        toast({
          title: "PDF verarbeitet",
          description: "Das PDF wurde optimiert."
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
            <li>Die Datei wird optimiert und komprimiert</li>
            <li>Laden Sie die komprimierte PDF-Datei herunter</li>
          </ol>
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
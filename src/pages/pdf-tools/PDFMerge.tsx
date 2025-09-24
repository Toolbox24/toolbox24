import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Merge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PDFMerge = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when files are removed
      setFiles([]);
      setDownloadUrl(null);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    setFiles(selectedFiles);
    setDownloadUrl(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie mindestens 2 PDF-Dateien aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      toast({
        title: "Erfolgreich",
        description: "PDFs wurden erfolgreich zusammengefügt!"
      });
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Zusammenfügen der PDFs.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMergedPDF = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <Merge className="h-8 w-8 text-primary" />
            PDF zusammenfügen
          </h1>
          <p className="page-description">
            Fügen Sie mehrere PDF-Dateien zu einem einzigen Dokument zusammen
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={true}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {files.length >= 2 && (
            <div className="text-center">
              <Button
                onClick={mergePDFs}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'Verarbeitung...' : 'PDFs zusammenfügen'}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Verarbeitung läuft... {progress}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                PDF erfolgreich zusammengefügt!
              </h3>
              <Button
                onClick={downloadMergedPDF}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Zusammengefügte PDF herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie mindestens 2 PDF-Dateien aus (bis zu 50MB pro Datei)</li>
            <li>Die Dateien werden in der Reihenfolge zusammengefügt, wie Sie sie ausgewählt haben</li>
            <li>Klicken Sie auf "PDFs zusammenfügen"</li>
            <li>Laden Sie die zusammengefügte PDF-Datei herunter</li>
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

export default PDFMerge;
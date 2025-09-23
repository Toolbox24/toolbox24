import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PDFDeletePages = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pagesToDelete, setPagesToDelete] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0] || null;
    setFile(selectedFile);
    setDownloadUrl(null);
    setPagesToDelete('');

    if (selectedFile) {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setPageCount(pdf.getPageCount());
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der PDF-Datei.",
          variant: "destructive"
        });
      }
    } else {
      setPageCount(0);
    }
  };

  const parsePageNumbers = (input: string, totalPages: number): number[] => {
    const pages: Set<number> = new Set();
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        // Range like "2-5"
        const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        }
      } else {
        // Single page
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const deletePagesFromPDF = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine PDF-Datei aus.",
        variant: "destructive"
      });
      return;
    }

    if (!pagesToDelete.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie die zu löschenden Seiten an.",
        variant: "destructive"
      });
      return;
    }

    const pageNumbers = parsePageNumbers(pagesToDelete, pageCount);
    
    if (pageNumbers.length === 0) {
      toast({
        title: "Fehler",
        description: "Keine gültigen Seitenzahlen gefunden.",
        variant: "destructive"
      });
      return;
    }

    if (pageNumbers.length >= pageCount) {
      toast({
        title: "Fehler",
        description: "Sie können nicht alle Seiten löschen.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Convert to 0-based indices and create set for faster lookup
      const pagesToDeleteSet = new Set(pageNumbers.map(p => p - 1));
      
      // Copy pages that are NOT in the delete list
      const totalPages = sourcePdf.getPageCount();
      const pagesToKeep: number[] = [];
      
      for (let i = 0; i < totalPages; i++) {
        if (!pagesToDeleteSet.has(i)) {
          pagesToKeep.push(i);
        }
      }

      if (pagesToKeep.length === 0) {
        throw new Error('No pages would remain after deletion');
      }

      setProgress(25);

      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      
      setProgress(75);

      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setProgress(100);

      toast({
        title: "Erfolgreich",
        description: `${pageNumbers.length} Seite(n) wurden gelöscht. ${pagesToKeep.length} Seite(n) verbleiben.`
      });
    } catch (error) {
      console.error('Error deleting pages from PDF:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Seiten.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadModifiedPDF = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.replace('.pdf', '')}_bearbeitet.pdf`;
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
            <Trash2 className="h-8 w-8 text-primary" />
            Seiten aus PDF löschen
          </h1>
          <p className="page-description">
            Entfernen Sie unerwünschte Seiten aus PDF-Dokumenten
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && pageCount > 0 && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Das PDF hat <strong>{pageCount}</strong> Seite(n)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="pages-to-delete" className="block text-sm font-medium">
                  Zu löschende Seiten:
                </label>
                <Input
                  id="pages-to-delete"
                  type="text"
                  value={pagesToDelete}
                  onChange={(e) => setPagesToDelete(e.target.value)}
                  placeholder="z.B. 1,3,5-7"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Einzelne Seiten durch Komma trennen (z.B. 1,3,5) oder Bereiche mit Bindestrich (z.B. 2-4)
                </p>
              </div>

              <div className="text-center">
                <Button
                  onClick={deletePagesFromPDF}
                  disabled={isProcessing || !pagesToDelete.trim()}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {isProcessing ? 'Seiten werden gelöscht...' : 'Seiten löschen'}
                </Button>
              </div>
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
                Seiten erfolgreich gelöscht!
              </h3>
              <Button
                onClick={downloadModifiedPDF}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Bearbeitete PDF herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 50MB)</li>
            <li>Geben Sie die zu löschenden Seitenzahlen ein</li>
            <li>Verwenden Sie Kommas für einzelne Seiten (1,3,5) oder Bindestriche für Bereiche (2-4)</li>
            <li>Klicken Sie auf "Seiten löschen" und laden Sie das Ergebnis herunter</li>
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

export default PDFDeletePages;
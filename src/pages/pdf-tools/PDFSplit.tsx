import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, Split } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PDFSplit = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setPageCount(0);
      setStartPage(1);
      setEndPage(1);
      setDownloadUrl(null);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setDownloadUrl(null);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        setPageCount(totalPages);
        setStartPage(1);
        setEndPage(totalPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der PDF-Datei.",
          variant: "destructive"
        });
      }
    }
  };

  const splitPDF = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine PDF-Datei aus.",
        variant: "destructive"
      });
      return;
    }

    if (startPage < 1 || endPage > pageCount || startPage > endPage) {
      toast({
        title: "Fehler",
        description: "Ungültiger Seitenbereich.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      setProgress(40);

      const newPdf = await PDFDocument.create();
      setProgress(60);

      // Copy pages from startPage to endPage (convert to 0-based index)
      const pagesToCopy = [];
      for (let i = startPage - 1; i < endPage; i++) {
        pagesToCopy.push(i);
      }

      const copiedPages = await newPdf.copyPages(originalPdf, pagesToCopy);
      copiedPages.forEach((page) => newPdf.addPage(page));
      setProgress(80);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);

      toast({
        title: "Erfolgreich",
        description: `Seiten ${startPage}-${endPage} wurden erfolgreich extrahiert!`
      });
    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aufteilen der PDF.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSplitPDF = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `split-${file.name.replace('.pdf', '')}-pages-${startPage}-${endPage}.pdf`;
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
            <Split className="h-8 w-8 text-primary" />
            PDF teilen
          </h1>
          <p className="page-description">
            Extrahieren Sie bestimmte Seiten aus Ihrer PDF-Datei
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={false}
            maxSize={100 * 1024 * 1024} // 100MB
          />

          {file && pageCount > 0 && (
            <div className="p-6 bg-muted/30 rounded-lg border space-y-4">
              <h3 className="text-lg font-semibold">
                PDF geladen: {pageCount} Seiten
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startPage">Startseite</Label>
                  <Input
                    id="startPage"
                    type="number"
                    min={1}
                    max={pageCount}
                    value={startPage}
                    onChange={(e) => setStartPage(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endPage">Endseite</Label>
                  <Input
                    id="endPage"
                    type="number"
                    min={1}
                    max={pageCount}
                    value={endPage}
                    onChange={(e) => setEndPage(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Seiten {startPage} bis {endPage} werden extrahiert 
                ({endPage - startPage + 1} von {pageCount} Seiten)
              </p>

              <Button
                onClick={splitPDF}
                disabled={isProcessing || startPage > endPage}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Verarbeitung...' : 'PDF aufteilen'}
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
                PDF erfolgreich aufgeteilt!
              </h3>
              <Button
                onClick={downloadSplitPDF}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Aufgeteilte PDF herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 100MB)</li>
            <li>Geben Sie den gewünschten Seitenbereich ein (z.B. Seite 1-5)</li>
            <li>Klicken Sie auf "PDF aufteilen"</li>
            <li>Laden Sie die neue PDF mit den ausgewählten Seiten herunter</li>
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

export default PDFSplit;
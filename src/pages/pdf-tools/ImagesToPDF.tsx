import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImagesToPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
  };

  const createPDFFromImages = async () => {
    if (files.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie mindestens ein Bild aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        
        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // Convert other formats to canvas and then to PNG
          const img = new Image();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const pngData = await new Promise<ArrayBuffer>((resolve) => {
            canvas.toBlob(async (blob) => {
              const arrayBuffer = await blob!.arrayBuffer();
              resolve(arrayBuffer);
            }, 'image/png');
          });
          
          image = await pdfDoc.embedPng(pngData);
        }
        
        const page = pdfDoc.addPage();
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Calculate dimensions to fit image on page while maintaining aspect ratio
        const imageAspectRatio = image.width / image.height;
        const pageAspectRatio = pageWidth / pageHeight;
        
        let drawWidth, drawHeight;
        if (imageAspectRatio > pageAspectRatio) {
          // Image is wider relative to page
          drawWidth = pageWidth - 40; // 20pt margin on each side
          drawHeight = drawWidth / imageAspectRatio;
        } else {
          // Image is taller relative to page
          drawHeight = pageHeight - 40; // 20pt margin on top and bottom
          drawWidth = drawHeight * imageAspectRatio;
        }
        
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;
        
        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      toast({
        title: "Erfolgreich",
        description: `PDF mit ${files.length} Seiten wurde erstellt!`
      });
    } catch (error) {
      console.error('Error creating PDF from images:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des PDFs aus den Bildern.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'bilder-sammlung.pdf';
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
            <FileImage className="h-8 w-8 text-primary" />
            Bilder in PDF umwandeln
          </h1>
          <p className="page-description">
            Erstellen Sie PDF-Dokumente aus JPG, PNG oder anderen Bildformaten
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff']
            }}
            multiple={true}
            maxSize={50 * 1024 * 1024} // 50MB per file
          />

          {files.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {files.length} Bild(er) ausgewählt
              </p>
              <Button
                onClick={createPDFFromImages}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'PDF wird erstellt...' : 'PDF erstellen'}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                PDF wird erstellt... {progress}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                PDF erfolgreich erstellt!
              </h3>
              <Button
                onClick={downloadPDF}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie ein oder mehrere Bilder aus (JPG, PNG, GIF, BMP, WebP, TIFF)</li>
            <li>Die Bilder werden in der Reihenfolge der Auswahl in das PDF eingefügt</li>
            <li>Jedes Bild wird auf eine eigene PDF-Seite platziert</li>
            <li>Klicken Sie auf "PDF erstellen" und laden Sie das Ergebnis herunter</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Datenschutz:</strong> Alle Verarbeitungen erfolgen lokal in Ihrem Browser. 
            Ihre Bilder werden nicht an externe Server übertragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagesToPDF;
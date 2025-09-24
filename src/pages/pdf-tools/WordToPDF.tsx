import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';

interface ExtractedContent {
  text: string;
  html: string;
  images: Array<{ src: string; alt?: string }>;
}

const WordToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [processStatus, setProcessStatus] = useState<string>('');
  
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setDownloadUrl(null);
      setExtractedContent(null);
      setProgress(0);
      setIsProcessing(false);
      setProcessStatus('');
      return;
    }
    
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setDownloadUrl(null);
      setExtractedContent(null);
      setProcessStatus('');
      setProgress(0);
    }
  };

  const extractContentFromWord = async (file: File): Promise<ExtractedContent> => {
    try {
      setProcessStatus('Word-Dokument wird gelesen...');
      setProgress(20);
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract text content
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      setProgress(40);
      
      // Extract HTML content with images
      const htmlResult = await mammoth.convertToHtml({ 
        arrayBuffer
      });
      
      setProgress(60);
      
      // Extract images from HTML (simplified approach)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlResult.value;
      const imgElements = tempDiv.querySelectorAll('img');
      const images = Array.from(imgElements).map(img => ({
        src: img.src,
        alt: img.alt || ''
      }));
      
      console.log(`Extracted ${textResult.value.length} characters and ${images.length} images from Word document`);
      
      return {
        text: textResult.value,
        html: htmlResult.value,
        images
      };
      
    } catch (error: any) {
      console.error('Word extraction error:', error);
      throw new Error(`Fehler beim Lesen der Word-Datei: ${error.message || 'Unbekannter Fehler'}`);
    }
  };

  const createPDFFromContent = async (content: ExtractedContent): Promise<Blob> => {
    setProcessStatus('PDF wird erstellt...');
    setProgress(70);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set up margins and dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      const maxHeight = pageHeight - 2 * margin;
      
      let yPosition = margin;
      
      // Add title if we can extract one from the first line
      const lines = content.text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.length < 100) { // Likely a title
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          const titleLines = pdf.splitTextToSize(firstLine, maxWidth);
          pdf.text(titleLines, margin, yPosition);
          yPosition += titleLines.length * 8 + 10;
          lines.shift(); // Remove title from content
        }
      }
      
      // Set normal text formatting
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Process remaining text content
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          yPosition += 5; // Add space for empty lines
          continue;
        }
        
        // Check if we need a new page
        if (yPosition > maxHeight) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Detect if line might be a heading (short and at start of paragraph)
        const isHeading = line.length < 80 && (
          i === 0 || 
          lines[i-1].trim() === '' ||
          line.match(/^\d+\./) ||
          line === line.toUpperCase()
        );
        
        if (isHeading) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
        }
        
        // Split long lines to fit page width
        const splitLines = pdf.splitTextToSize(line, maxWidth);
        
        // Check if we need a new page for this content
        if (yPosition + splitLines.length * 6 > maxHeight) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(splitLines, margin, yPosition);
        yPosition += splitLines.length * 6 + 3;
        
        setProgress(70 + (i / lines.length) * 20);
      }
      
      // Add images if any (simplified - add at end)
      if (content.images.length > 0) {
        setProcessStatus('Bilder werden hinzugefügt...');
        
        for (let i = 0; i < Math.min(content.images.length, 3); i++) { // Limit to first 3 images
          const image = content.images[i];
          
          try {
            // Add new page for images
            pdf.addPage();
            
            // Try to add image (this is a simplified approach)
            const imgData = image.src;
            if (imgData.startsWith('data:image/')) {
              pdf.addImage(imgData, 'JPEG', margin, margin, maxWidth * 0.8, 0);
            }
          } catch (imgError) {
            console.warn('Could not add image to PDF:', imgError);
            // Continue without this image
          }
        }
      }
      
      setProgress(95);
      
      // Convert to blob
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
      
    } catch (error: any) {
      console.error('PDF creation error:', error);
      throw new Error(`Fehler beim Erstellen des PDFs: ${error.message || 'Unbekannter Fehler'}`);
    }
  };

  const convertWordToPDF = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Word-Datei aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Extract content from Word document
      const content = await extractContentFromWord(file);
      
      if (!content.text.trim()) {
        toast({
          title: "Kein Inhalt gefunden",
          description: "Das Word-Dokument scheint leer zu sein oder konnte nicht gelesen werden.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      setExtractedContent(content);
      
      // Create PDF from extracted content
      const pdfBlob = await createPDFFromContent(content);
      
      // Create download URL
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
      setProgress(100);
      setProcessStatus('');

      toast({
        title: "Konvertierung erfolgreich!",
        description: `Word-Dokument wurde zu PDF konvertiert (${Math.round(content.text.length / 1000)}k Zeichen${content.images.length > 0 ? `, ${content.images.length} Bilder` : ''})`
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

  const downloadPDF = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      const fileName = file.name.replace(/\.(docx|doc)$/i, '') + '.pdf';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download gestartet",
        description: `${fileName} wird heruntergeladen...`
      });
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Word zu PDF konvertieren
          </h1>
          <p className="page-description">
            Konvertieren Sie Word-Dokumente (.docx) in PDF-Dateien
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/msword': ['.doc']
            }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && (
            <div className="text-center">
              <Button
                onClick={convertWordToPDF}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'Konvertierung läuft...' : 'In PDF konvertieren'}
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

          {extractedContent && !isProcessing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Inhalt verarbeitet:</strong> {Math.round(extractedContent.text.length / 1000)}k Zeichen
                {extractedContent.images.length > 0 && `, ${extractedContent.images.length} Bilder`} aus dem Word-Dokument extrahiert.
              </AlertDescription>
            </Alert>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                Word-Dokument erfolgreich zu PDF konvertiert!
              </h3>
              <Button
                onClick={downloadPDF}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF herunterladen
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Das PDF kann mit jedem PDF-Viewer geöffnet werden.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine Word-Datei aus (.docx oder .doc, bis zu 50MB)</li>
            <li>Klicken Sie auf "In PDF konvertieren"</li>
            <li>Text, Überschriften und Bilder werden extrahiert</li>
            <li>Ein sauberes PDF wird erstellt</li>
            <li>Laden Sie die PDF-Datei herunter</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Unterstützte Inhalte:</strong> Text, Absätze, Überschriften, Bilder und Sonderzeichen (ä, ö, ü, ß).
              Komplexe Formatierungen wie Tabellen werden als Text dargestellt.
            </p>
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

export default WordToPDF;
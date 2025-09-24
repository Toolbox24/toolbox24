import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PDFToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [processStatus, setProcessStatus] = useState<string>('');
  
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setDownloadUrl(null);
      setExtractedText('');
      setProgress(0);
      setIsProcessing(false);
      setProcessStatus('');
      return;
    }
    
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setDownloadUrl(null);
      setExtractedText('');
      setProcessStatus('');
      setProgress(0);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      setProcessStatus('PDF wird geladen...');
      setProgress(10);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setProcessStatus('Text wird extrahiert...');
      setProgress(20);
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProcessStatus(`Seite ${pageNum} von ${totalPages} wird verarbeitet...`);
        setProgress(20 + (pageNum / totalPages) * 60);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text from each page
        const pageText = textContent.items
          .filter((item: any) => 'str' in item)
          .map((item: any) => item.str)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
      }
      
      // Clean up the text
      fullText = fullText
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();
      
      console.log(`Extracted ${fullText.length} characters from ${totalPages} pages`);
      return fullText;
      
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      
      if (error.name === 'PasswordException') {
        throw new Error('Das PDF ist passwortgeschützt. Bitte verwenden Sie ein ungeschütztes PDF.');
      } else if (error.name === 'InvalidPDFException') {
        throw new Error('Die Datei ist kein gültiges PDF oder ist beschädigt.');
      } else if (error.message && error.message.includes('worker')) {
        throw new Error('PDF.js Worker konnte nicht geladen werden. Überprüfen Sie Ihre Internetverbindung.');
      } else {
        throw new Error(`Fehler beim Verarbeiten des PDFs: ${error.message || 'Unbekannter Fehler'}`);
      }
    }
  };

  const createWordDocument = async (text: string): Promise<Blob> => {
    setProcessStatus('Word-Dokument wird erstellt...');
    setProgress(85);
    
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    const children = paragraphs.map(paragraph => {
      const trimmedParagraph = paragraph.trim();
      
      // Simple heading detection (short lines, often caps or numbers)
      const isHeading = trimmedParagraph.length < 80 && 
        (trimmedParagraph.match(/^[A-Z\s\d\.]+$/) || 
         trimmedParagraph.match(/^\d+\./) ||
         trimmedParagraph.split(' ').length <= 8);
      
      if (isHeading) {
        return new Paragraph({
          children: [new TextRun({ text: trimmedParagraph, bold: true })],
          heading: HeadingLevel.HEADING_2,
        });
      } else {
        return new Paragraph({
          children: [new TextRun({ text: trimmedParagraph })],
          spacing: { after: 120 },
        });
      }
    });
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: children,
      }],
    });
    
    setProgress(95);
    // Use browser-compatible Packer.toBlob() instead of toBuffer()
    return await Packer.toBlob(doc);
  };

  const convertPDFToWord = async () => {
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
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      
      if (!text.trim()) {
        toast({
          title: "Kein Text gefunden",
          description: "Das PDF enthält keinen erkennbaren Text. Möglicherweise handelt es sich um ein gescanntes PDF.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      setExtractedText(text);
      
      // Create Word document
      const docxBlob = await createWordDocument(text);
      
      // Create download URL directly from blob
      const url = URL.createObjectURL(docxBlob);
      setDownloadUrl(url);
      setProgress(100);
      setProcessStatus('');

      toast({
        title: "Konvertierung erfolgreich!",
        description: `PDF wurde zu Word konvertiert (${Math.round(text.length / 1000)}k Zeichen)`
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

  const downloadWordDocument = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      const fileName = file.name.replace(/\.pdf$/i, '') + '-converted.docx';
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
            PDF zu Word (DOCX) konvertieren
          </h1>
          <p className="page-description">
            Extrahieren Sie Text aus PDF-Dateien und konvertieren Sie ihn in bearbeitbare Word-Dokumente
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
              <Button
                onClick={convertPDFToWord}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'Konvertierung läuft...' : 'In Word konvertieren'}
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

          {extractedText && !isProcessing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Text extrahiert:</strong> {Math.round(extractedText.length / 1000)}k Zeichen aus dem PDF erkannt.
              </AlertDescription>
            </Alert>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                PDF erfolgreich zu Word konvertiert!
              </h3>
              <Button
                onClick={downloadWordDocument}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                DOCX-Dokument herunterladen
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Das Dokument kann mit Microsoft Word, LibreOffice oder Google Docs geöffnet werden.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 100MB)</li>
            <li>Klicken Sie auf "In Word konvertieren"</li>
            <li>Der Text wird aus dem PDF extrahiert</li>
            <li>Eine neue DOCX-Datei wird erstellt</li>
            <li>Laden Sie die Word-Datei herunter</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Diese Konvertierung extrahiert den reinen Text aus dem PDF. 
              Komplexe Layouts, Bilder und spezielle Formatierungen werden als einfacher Text dargestellt.
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

export default PDFToWord;
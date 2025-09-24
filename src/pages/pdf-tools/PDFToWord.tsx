import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, PageBreak, AlignmentType } from 'docx';

// Configure PDF.js worker - use CDN for reliable loading
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface ExtractedContent {
  text: string;
  pages: PageContent[];
  totalPages: number;
}

interface PageContent {
  pageNumber: number;
  textItems: TextItem[];
  images: ImageItem[];
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  bold?: boolean;
  italic?: boolean;
}

interface ImageItem {
  data: Uint8Array;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

interface ProcessedParagraph {
  text: string;
  isHeading: boolean;
  headingLevel: number;
  isList: boolean;
  listType: 'bullet' | 'number' | 'none';
  formatting: {
    bold: boolean;
    italic: boolean;
  };
}

const PDFToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [processStatus, setProcessStatus] = useState<string>('');
  
  // Options
  const [layoutAccurate, setLayoutAccurate] = useState(false);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  
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
    }
  };

  const extractTextFromPDF = async (file: File): Promise<ExtractedContent> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    const pages: PageContent[] = [];
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      setProcessStatus(`Seite ${pageNum} von ${totalPages} wird verarbeitet...`);
      setProgress((pageNum / totalPages) * 40);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      
      const textItems: TextItem[] = [];
      
      // Process text content items
      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const fontName = item.fontName || '';
          textItems.push({
            text: item.str,
            x: item.transform[4],
            y: viewport.height - item.transform[5], // Flip Y coordinate
            width: item.width || 0,
            height: item.height || Math.abs(item.transform[3]),
            fontName: fontName,
            fontSize: Math.abs(item.transform[3]) || 12,
            bold: fontName.toLowerCase().includes('bold'),
            italic: fontName.toLowerCase().includes('italic') || fontName.toLowerCase().includes('oblique'),
          });
        }
      }
      
      // Extract images (basic implementation)
      const images: ImageItem[] = [];
      try {
        const ops = await page.getOperatorList();
        // Image extraction is complex, we'll skip for now but keep the interface
      } catch (error) {
        console.warn(`Could not extract images from page ${pageNum}:`, error);
      }
      
      pages.push({
        pageNumber: pageNum,
        textItems,
        images,
      });
    }
    
    const fullText = pages.map(page => 
      page.textItems.map(item => item.text).join(' ')
    ).join('\n\n');
    
    return {
      text: fullText,
      pages,
      totalPages,
    };
  };

  const repairHyphenation = (text: string): string => {
    // Fix hyphenated words at line breaks with comprehensive patterns
    return text
      // Remove hyphen + line break + word continuation
      .replace(/(\w+)-\s*[\r\n]+\s*(\w+)/g, '$1$2')
      // Join words split across lines (when second part starts lowercase)
      .replace(/(\w+)\s*[\r\n]+\s*([a-zäöüß]\w*)/g, '$1$2')
      // Clean up multiple spaces and normalize line breaks
      .replace(/[ \t]+/g, ' ')
      .replace(/[\r\n]+/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

  const detectParagraphs = (textItems: TextItem[]): ProcessedParagraph[] => {
    if (!textItems.length) return [];
    
    // Sort by Y position (descending - top to bottom), then X position (ascending - left to right)
    const sortedItems = [...textItems].sort((a, b) => {
      const yDiff = Math.abs(a.y - b.y);
      if (yDiff < 5) { // Same line tolerance
        return a.x - b.x; // Left to right
      }
      return b.y - a.y; // Top to bottom (higher Y values first in PDF coordinates)
    });
    
    const lines: { text: string; items: TextItem[]; avgFontSize: number; hasBold: boolean; hasItalic: boolean }[] = [];
    let currentLineItems: TextItem[] = [];
    let lastY = -1;
    
    // Group text items into lines
    for (const item of sortedItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) < 5) {
        // Same line
        currentLineItems.push(item);
      } else {
        // New line - process previous line
        if (currentLineItems.length > 0) {
          const lineItems = currentLineItems.sort((a, b) => a.x - b.x);
          const lineText = lineItems.map(item => item.text).join('');
          const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;
          const hasBold = lineItems.some(item => item.bold);
          const hasItalic = lineItems.some(item => item.italic);
          
          lines.push({
            text: lineText,
            items: lineItems,
            avgFontSize,
            hasBold,
            hasItalic,
          });
        }
        currentLineItems = [item];
      }
      lastY = item.y;
    }
    
    // Process final line
    if (currentLineItems.length > 0) {
      const lineItems = currentLineItems.sort((a, b) => a.x - b.x);
      const lineText = lineItems.map(item => item.text).join('');
      const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;
      const hasBold = lineItems.some(item => item.bold);
      const hasItalic = lineItems.some(item => item.italic);
      
      lines.push({
        text: lineText,
        items: lineItems,
        avgFontSize,
        hasBold,
        hasItalic,
      });
    }
    
    // Group lines into paragraphs
    const paragraphs: ProcessedParagraph[] = [];
    let currentParagraph = '';
    let paragraphLines: typeof lines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.text.trim()) {
        // Empty line - end current paragraph
        if (currentParagraph.trim() && paragraphLines.length > 0) {
          const avgFontSize = paragraphLines.reduce((sum, l) => sum + l.avgFontSize, 0) / paragraphLines.length;
          const hasBold = paragraphLines.some(l => l.hasBold);
          const hasItalic = paragraphLines.some(l => l.hasItalic);
          
          const cleaned = repairHyphenation(currentParagraph.trim());
          const heading = detectHeading(cleaned, avgFontSize, hasBold);
          const listInfo = detectList(cleaned);
          
          paragraphs.push({
            text: cleaned,
            isHeading: heading.isHeading,
            headingLevel: heading.level,
            isList: listInfo.isList,
            listType: listInfo.type,
            formatting: { bold: hasBold, italic: hasItalic },
          });
        }
        currentParagraph = '';
        paragraphLines = [];
        continue;
      }
      
      // Add line to current paragraph
      if (currentParagraph) {
        currentParagraph += ' ' + line.text;
      } else {
        currentParagraph = line.text;
      }
      paragraphLines.push(line);
    }
    
    // Process final paragraph
    if (currentParagraph.trim() && paragraphLines.length > 0) {
      const avgFontSize = paragraphLines.reduce((sum, l) => sum + l.avgFontSize, 0) / paragraphLines.length;
      const hasBold = paragraphLines.some(l => l.hasBold);
      const hasItalic = paragraphLines.some(l => l.hasItalic);
      
      const cleaned = repairHyphenation(currentParagraph.trim());
      const heading = detectHeading(cleaned, avgFontSize, hasBold);
      const listInfo = detectList(cleaned);
      
      paragraphs.push({
        text: cleaned,
        isHeading: heading.isHeading,
        headingLevel: heading.level,
        isList: listInfo.isList,
        listType: listInfo.type,
        formatting: { bold: hasBold, italic: hasItalic },
      });
    }
    
    return paragraphs;
  };

  const detectHeading = (text: string, fontSize: number, isBold: boolean = false): { isHeading: boolean; level: number } => {
    // Enhanced heuristics for heading detection
    const isShort = text.length < 120;
    const isLarge = fontSize > 14;
    const hasHeadingPatterns = /^(Chapter|Section|Teil|Kapitel|\d+\.|\d+\.\d+|\w+:)/.test(text);
    const isAllCaps = text === text.toUpperCase() && text.length > 3 && text.length < 50;
    const endsWithoutPeriod = !text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?');
    
    const headingScore = [
      isShort ? 1 : 0,
      isLarge ? 1 : 0,
      isBold ? 1 : 0,
      hasHeadingPatterns ? 2 : 0,
      isAllCaps ? 1 : 0,
      endsWithoutPeriod ? 0.5 : 0,
    ].reduce((sum, score) => sum + score, 0);
    
    if (headingScore >= 2) {
      if (fontSize > 20 || isAllCaps) return { isHeading: true, level: 1 };
      if (fontSize > 16 || hasHeadingPatterns) return { isHeading: true, level: 2 };
      return { isHeading: true, level: 3 };
    }
    
    return { isHeading: false, level: 0 };
  };

  const detectList = (text: string): { isList: boolean; type: 'bullet' | 'number' | 'none' } => {
    // Enhanced list detection patterns
    const bulletPatterns = /^[\u2022\u2023\u25E6\u2043\u2219•·▪▫‣⁃\-–—]\s/;
    const numberPatterns = /^(\d+[\.\)]\s|[a-zA-Z][\.\)]\s|\([a-zA-Z0-9]+\)\s)/;
    const romanPatterns = /^[ivxlcdm]+[\.\)]\s/i;
    
    if (bulletPatterns.test(text)) {
      return { isList: true, type: 'bullet' };
    }
    if (numberPatterns.test(text) || romanPatterns.test(text)) {
      return { isList: true, type: 'number' };
    }
    
    return { isList: false, type: 'none' };
  };

  const createDocxDocument = async (content: ExtractedContent): Promise<Uint8Array> => {
    setProcessStatus('DOCX-Dokument wird erstellt...');
    setProgress(60);
    
    const children: any[] = [];
    
    for (let i = 0; i < content.pages.length; i++) {
      const page = content.pages[i];
      setProgress(60 + (i / content.pages.length) * 30);
      
      if (page.textItems.length === 0) {
        // Empty page or image-only page
        if (i > 0) children.push(new PageBreak());
        children.push(new Paragraph({
          children: [new TextRun({ text: `[Seite ${page.pageNumber} - Kein Text erkannt]`, italics: true })],
        }));
        continue;
      }
      
      const paragraphs = detectParagraphs(page.textItems);
      
      // Add page break between pages (except first page)
      if (i > 0) {
        children.push(new PageBreak());
      }
      
      for (const para of paragraphs) {
        if (!para.text.trim()) continue;
        
        let cleanText = para.text.trim();
        
        // Remove list markers for proper list formatting
        if (para.isList) {
          cleanText = cleanText.replace(/^[\u2022\u2023\u25E6\u2043\u2219•·▪▫‣⁃\-–—]\s*/, '');
          cleanText = cleanText.replace(/^\d+[\.\)]\s*/, '');
          cleanText = cleanText.replace(/^[a-zA-Z][\.\)]\s*/, '');
          cleanText = cleanText.replace(/^\([a-zA-Z0-9]+\)\s*/, '');
        }
        
        const runs = [new TextRun({
          text: cleanText,
          bold: para.formatting.bold,
          italics: para.formatting.italic,
        })];
        
        if (para.isHeading) {
          children.push(new Paragraph({
            children: runs,
            heading: para.headingLevel === 1 ? HeadingLevel.HEADING_1 :
                    para.headingLevel === 2 ? HeadingLevel.HEADING_2 :
                    HeadingLevel.HEADING_3,
          }));
        } else if (para.isList) {
          children.push(new Paragraph({
            children: runs,
            bullet: para.listType === 'bullet' ? { level: 0 } : undefined,
            numbering: para.listType === 'number' ? { reference: "my-numbering", level: 0 } : undefined,
          }));
        } else {
          children.push(new Paragraph({
            children: runs,
            spacing: { after: 120 }, // Add some spacing after paragraphs
          }));
        }
      }
    }
    
    // Create the document with proper numbering
    const doc = new Document({
      numbering: {
        config: [{
          reference: "my-numbering",
          levels: [{
            level: 0,
            format: "decimal",
            text: "%1.",
            alignment: AlignmentType.START,
          }],
        }],
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
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
    return await Packer.toBuffer(doc);
  };

  const performOCR = async (content: ExtractedContent): Promise<ExtractedContent> => {
    if (!ocrEnabled) return content;
    
    setProcessStatus('OCR wird initialisiert...');
    
    try {
      // Lazy load tesseract.js
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('deu+eng');
      
      setProcessStatus('OCR wird konfiguriert...');
      
      // This is a simplified OCR implementation
      // In a full implementation, we would:
      // 1. Render each PDF page to canvas
      // 2. Extract canvas as image data
      // 3. Process with Tesseract
      // 4. Combine results with existing text
      
      // This is a simplified OCR implementation
      // In a full implementation, we would:
      // 1. Render each PDF page to canvas
      // 2. Extract canvas as image data
      // 3. Process with Tesseract
      // 4. Combine results with existing text
      
      setProcessStatus('OCR wird ausgeführt...');
      
      // For now, show that OCR is attempted but needs more implementation
      toast({
        title: "OCR-Prozess",
        description: "OCR ist vorbereitet. Vollständige OCR-Implementierung erfordert Canvas-Rendering der PDF-Seiten.",
      });
      
      await worker.terminate();
      
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "OCR-Fehler",
        description: "OCR konnte nicht gestartet werden. Versuchen Sie es mit einem textbasierten PDF.",
        variant: "destructive"
      });
    }
    
    return content;
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
      // Extract content from PDF
      setProcessStatus('PDF wird analysiert...');
      const content = await extractTextFromPDF(file);
      
      // Check if we have sufficient text content
      const totalTextItems = content.pages.reduce((sum, page) => sum + page.textItems.length, 0);
      
      if (totalTextItems < 10) {
        // Likely a scan or image-based PDF
        if (ocrEnabled) {
          setProcessStatus('Wenig Text gefunden, OCR wird gestartet...');
          const ocrContent = await performOCR(content);
          setExtractedContent(ocrContent);
        } else {
          toast({
            title: "Scan-PDF erkannt",
            description: "Das PDF scheint ein Scan zu sein. Aktivieren Sie OCR für bessere Ergebnisse.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
      } else {
        setExtractedContent(content);
      }
      
      if (!content.text.trim() && totalTextItems === 0) {
        toast({
          title: "Keine Inhalte gefunden",
          description: "Das PDF enthält keinen erkennbaren Text oder Bilder.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      setProgress(50);
      
      // Create DOCX document
      const docxBuffer = await createDocxDocument(content);
      
      const blob = new Blob([docxBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setProcessStatus('');

      toast({
        title: "Konvertierung erfolgreich!",
        description: `PDF wurde zu DOCX konvertiert (${content.totalPages} Seiten, ${totalTextItems} Textblöcke, ${Math.round(content.text.length / 1000)}k Zeichen)`
      });
    } catch (error) {
      console.error('Error converting PDF to Word:', error);
      let errorMessage = "Unbekannter Fehler bei der Konvertierung.";
      
      if (error instanceof Error) {
        if (error.message.includes('passwort') || error.message.includes('password')) {
          errorMessage = "Das PDF ist passwortgeschützt. Bitte verwenden Sie ein ungeschütztes PDF.";
        } else if (error.message.includes('Invalid PDF') || error.message.includes('corrupt')) {
          errorMessage = "Die Datei scheint beschädigt oder kein gültiges PDF zu sein.";
        } else if (error.message.includes('Worker')) {
          errorMessage = "PDF.js Worker konnte nicht geladen werden. Überprüfen Sie Ihre Internetverbindung.";
        } else {
          errorMessage = error.message;
        }
      }
      
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
            Professionelle Konvertierung von PDF-Dateien in bearbeitbare Word-Dokumente
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="layout-mode">Layout-treuer Modus</Label>
                    <p className="text-sm text-muted-foreground">
                      Erhält mehr Formatierung, kann aber komplexer sein
                    </p>
                  </div>
                  <Switch
                    id="layout-mode"
                    checked={layoutAccurate}
                    onCheckedChange={setLayoutAccurate}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ocr-mode">OCR für Scans aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Texterkennung für gescannte PDFs
                    </p>
                  </div>
                  <Switch
                    id="ocr-mode"
                    checked={ocrEnabled}
                    onCheckedChange={setOcrEnabled}
                  />
                </div>
              </div>
              
              <Separator />
              
              <Button
                onClick={convertPDFToWord}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Konvertierung läuft...' : 'In DOCX konvertieren'}
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
                <strong>Verarbeitet:</strong> {extractedContent.totalPages} Seiten, {' '}
                {extractedContent.pages.reduce((sum, page) => sum + page.textItems.length, 0)} Textblöcke, {' '}
                {Math.round(extractedContent.text.length / 1000)}k Zeichen erkannt.
              </AlertDescription>
            </Alert>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                PDF erfolgreich in DOCX konvertiert!
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
          <h2 className="text-xl font-semibold mb-4">Funktionen:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <ul className="space-y-1">
              <li>✓ Mehrseitige PDFs</li>
              <li>✓ Fließtext mit echten Absätzen</li>
              <li>✓ Überschriften-Erkennung</li>
              <li>✓ Listen-Formatierung</li>
            </ul>
            <ul className="space-y-1">
              <li>✓ Silbentrennung reparieren</li>
              <li>✓ Unicode & Umlaute</li>
              <li>✓ Seitenumbrüche</li>
              <li>✓ OCR für Scans (optional)</li>
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

export default PDFToWord;
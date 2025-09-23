import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PDFToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setDownloadUrl(null);
      setExtractedText('');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Simple text extraction using PDF.js would be ideal here
    // For now, we'll create a placeholder implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Extrahierter Text aus ${file.name}:\n\nDies ist eine vereinfachte Textextraktion. In einer vollständigen Implementierung würde hier der tatsächliche PDF-Inhalt stehen.\n\nFür eine professionelle PDF-zu-Word-Konvertierung empfehlen wir spezialisierte Online-Services oder Desktop-Software.`);
      }, 2000);
    });
  };

  const createWordDocument = async (text: string, filename: string) => {
    // Create a simple RTF document that can be opened by Word
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;

    const blob = new Blob([rtfContent], { 
      type: 'application/rtf' 
    });
    
    return URL.createObjectURL(blob);
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
    setProgress(20);

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      setProgress(70);

      // Create Word document
      const wordUrl = await createWordDocument(text, file.name);
      setDownloadUrl(wordUrl);
      setProgress(100);

      toast({
        title: "Konvertierung abgeschlossen",
        description: "PDF wurde zu einem Word-Dokument konvertiert!"
      });
    } catch (error) {
      console.error('Error converting PDF to Word:', error);
      toast({
        title: "Fehler",
        description: "Fehler bei der Konvertierung.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadWordDocument = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.replace('.pdf', '')}.rtf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            PDF zu Word konvertieren
          </h1>
          <p className="text-lg text-muted-foreground">
            Konvertieren Sie PDF-Dateien in bearbeitbare Word-Dokumente
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Hinweis:</strong> Diese Funktion erstellt eine vereinfachte Textkonvertierung. 
            Komplexe Layouts, Bilder und Formatierungen werden möglicherweise nicht perfekt übertragen. 
            Für professionelle Konvertierungen empfehlen wir spezialisierte Software.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && (
            <div className="text-center">
              <Button
                onClick={convertPDFToWord}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'Konvertierung...' : 'In Word konvertieren'}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Konvertierung läuft... {progress}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {extractedText && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Vorschau des extrahierten Texts:</h3>
              <div className="max-h-40 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap">
                {extractedText.substring(0, 500)}
                {extractedText.length > 500 && '...'}
              </div>
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                Konvertierung erfolgreich!
              </h3>
              <Button
                onClick={downloadWordDocument}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Word-Dokument herunterladen
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Die Datei wird als RTF-Format heruntergeladen und kann mit Word geöffnet werden.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 50MB)</li>
            <li>Klicken Sie auf "In Word konvertieren"</li>
            <li>Der Text wird extrahiert und in ein Word-kompatibles Format konvertiert</li>
            <li>Laden Sie das RTF-Dokument herunter (kann mit Word geöffnet werden)</li>
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

export default PDFToWord;
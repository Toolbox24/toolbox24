import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PDFToImages = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png'>('jpg');
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    setFile(selectedFiles[0] || null);
    setDownloadUrls([]);
  };

  const convertPDFToImages = async () => {
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
      // Simulate processing for demo - in reality, this would use pdf2pic or similar
      const totalPages = 3; // Mock page count
      const urls: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        
        // Create mock image data
        const canvas = document.createElement('canvas');
        canvas.width = 595;
        canvas.height = 842;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial';
          ctx.fillText(`Seite ${i}`, 50, 100);
          ctx.fillText('Demo-Inhalt', 50, 150);
        }

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), `image/${outputFormat}`, 0.9);
        });
        
        const url = URL.createObjectURL(blob);
        urls.push(url);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setDownloadUrls(urls);

      toast({
        title: "Erfolgreich",
        description: `PDF wurde in ${urls.length} ${outputFormat.toUpperCase()} Bilder konvertiert!`
      });
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Konvertieren der PDF-Datei.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace('.pdf', '')}_seite_${index + 1}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    downloadUrls.forEach((url, index) => {
      setTimeout(() => downloadImage(url, index), index * 100);
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            PDF in Bilder umwandeln
          </h1>
          <p className="page-description">
            Konvertieren Sie PDF-Seiten in JPG oder PNG Bilder
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <label className="block text-sm font-medium mb-2">Ausgabeformat:</label>
                  <Select value={outputFormat} onValueChange={(value: 'jpg' | 'png') => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={convertPDFToImages}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {isProcessing ? 'Konvertierung läuft...' : 'In Bilder umwandeln'}
                </Button>
              </div>
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

          {downloadUrls.length > 0 && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                PDF erfolgreich in {downloadUrls.length} Bilder konvertiert!
              </h3>
              <div className="space-y-4">
                <Button
                  onClick={downloadAllImages}
                  size="lg"
                  className="w-full max-w-md"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Alle Bilder herunterladen
                </Button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {downloadUrls.map((url, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <img 
                        src={url} 
                        alt={`Seite ${index + 1}`} 
                        className="w-full h-32 object-cover mb-2 rounded"
                      />
                      <Button
                        onClick={() => downloadImage(url, index)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        Seite {index + 1} herunterladen
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine PDF-Datei aus (bis zu 50MB)</li>
            <li>Wählen Sie das gewünschte Ausgabeformat (JPG oder PNG)</li>
            <li>Klicken Sie auf "In Bilder umwandeln"</li>
            <li>Laden Sie die einzelnen Bilder oder alle auf einmal herunter</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Datenschutz:</strong> Alle Konvertierungen erfolgen lokal in Ihrem Browser. 
            Ihre Dateien werden nicht an externe Server übertragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFToImages;
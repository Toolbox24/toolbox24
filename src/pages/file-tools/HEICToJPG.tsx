import { useState } from 'react';
import heic2any from 'heic2any';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HEICToJPG = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number[]>([0.9]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setDownloadUrl(null);
      setConvertedSize(0);
    }
  };

  const convertHEICToJPG = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine HEIC-Datei aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Convert HEIC to JPEG using heic2any
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: quality[0]
      }) as Blob;

      setProgress(70);
      setConvertedSize(convertedBlob.size);

      // Create download URL
      const url = URL.createObjectURL(convertedBlob);
      setDownloadUrl(url);
      setProgress(100);

      toast({
        title: "Erfolgreich",
        description: "HEIC wurde erfolgreich zu JPG konvertiert!"
      });
    } catch (error) {
      console.error('Error converting HEIC to JPG:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Konvertieren der HEIC-Datei. Stellen Sie sicher, dass es sich um eine gültige HEIC-Datei handelt.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadJPG = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.replace(/\.heic$/i, '')}.jpg`;
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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            HEIC zu JPG konvertieren
          </h1>
          <p className="page-description">
            Konvertieren Sie Apple HEIC/HEIF Bilder zu universell kompatiblen JPG-Dateien
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'image/heic': ['.heic', '.heif'],
              'image/heif': ['.heic', '.heif']
            }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && (
            <div className="p-6 bg-muted/30 rounded-lg border space-y-4">
              <h3 className="text-lg font-semibold">
                Datei geladen: {file.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Originalgröße: {formatFileSize(originalSize)}
              </p>
              
              <div>
                <Label>JPG Qualität: {Math.round(quality[0] * 100)}%</Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Höhere Qualität = größere Datei, aber besseres Bild
                </p>
              </div>

              <Button
                onClick={convertHEICToJPG}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Konvertierung...' : 'Zu JPG konvertieren'}
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

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                Konvertierung erfolgreich!
              </h3>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>HEIC Größe: {formatFileSize(originalSize)}</p>
                <p>JPG Größe: {formatFileSize(convertedSize)}</p>
                <p>Qualität: {Math.round(quality[0] * 100)}%</p>
              </div>
              <Button
                onClick={downloadJPG}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                JPG-Datei herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Was ist HEIC?</h2>
          <p className="text-muted-foreground mb-4">
            HEIC (High Efficiency Image Container) ist ein von Apple verwendetes Bildformat, das auf iPhones und iPads 
            standardmäßig verwendet wird. Obwohl es eine bessere Komprimierung als JPEG bietet, wird es nicht von 
            allen Geräten und Anwendungen unterstützt.
          </p>
          
          <h3 className="text-lg font-semibold mb-2">Warum zu JPG konvertieren?</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
            <li>Universelle Kompatibilität mit allen Geräten und Browsern</li>
            <li>Problemlose Weitergabe an Android-Nutzer oder Windows-PCs</li>
            <li>Upload auf Websites und Social Media Plattformen</li>
            <li>Bearbeitung in jeder Bildbearbeitungssoftware</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">So funktioniert's:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie eine HEIC/HEIF-Datei aus (bis zu 50MB)</li>
            <li>Stellen Sie die gewünschte JPG-Qualität ein</li>
            <li>Klicken Sie auf "Zu JPG konvertieren"</li>
            <li>Laden Sie die konvertierte JPG-Datei herunter</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Datenschutz:</strong> Alle Konvertierungen erfolgen lokal in Ihrem Browser. 
            Ihre Bilder werden nicht an externe Server übertragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HEICToJPG;
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Download, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ImageCompress = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number[]>([0.8]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setFile(null);
      setPreviewUrl(null);
      setDownloadUrl(null);
      setOriginalSize(0);
      setCompressedSize(0);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setDownloadUrl(null);
      setCompressedSize(0);
      setProgress(0);
      setIsProcessing(false);
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const compressImage = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Bild aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality[0],
        onProgress: (progress: number) => {
          setProgress(Math.round(progress));
        }
      };

      const compressedFile = await imageCompression(file, options);
      setCompressedSize(compressedFile.size);

      const url = URL.createObjectURL(compressedFile);
      setDownloadUrl(url);

      toast({
        title: "Erfolgreich",
        description: "Bild wurde erfolgreich komprimiert!"
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Komprimieren des Bildes.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressedImage = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compressed-${file.name}`;
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

  const getSavingsPercentage = () => {
    if (originalSize && compressedSize) {
      const savings = ((originalSize - compressedSize) / originalSize) * 100;
      return Math.max(0, savings);
    }
    return 0;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            Bild komprimieren
          </h1>
          <p className="page-description">
            Reduzieren Sie die Dateigröße Ihrer{' '}
            <Link to="/bild/jpeg-komprimieren" className="text-primary underline hover:text-primary/80">
              JPEG
            </Link>
            ,{' '}
            <Link to="/bild/png-komprimieren" className="text-primary underline hover:text-primary/80">
              PNG
            </Link>
            ,{' '}
            <Link to="/bild/svg-komprimieren" className="text-primary underline hover:text-primary/80">
              SVG
            </Link>
            {' '}und{' '}
            <Link to="/bild/gif-komprimieren" className="text-primary underline hover:text-primary/80">
              GIF
            </Link>
            {' '}Bilder – schnell, sicher & kostenlos.
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp'],
              'image/svg+xml': ['.svg'],
              'image/gif': ['.gif']
            }}
            multiple={false}
            maxSize={50 * 1024 * 1024} // 50MB
          />

          {file && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {previewUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Original</h3>
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="w-full h-64 object-cover rounded border"
                  />
                  <p className="text-sm text-muted-foreground">
                    Größe: {formatFileSize(originalSize)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label>Qualität: {Math.round(quality[0] * 100)}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Niedriger = kleinere Datei, aber schlechtere Qualität
                  </p>
                </div>

                <Button
                  onClick={compressImage}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? 'Komprimierung...' : 'Bild komprimieren'}
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Komprimierung läuft... {progress}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                Bild erfolgreich komprimiert!
              </h3>
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Ursprüngliche Größe: {formatFileSize(originalSize)}</p>
                <p>Komprimierte Größe: {formatFileSize(compressedSize)}</p>
                <p className="font-semibold text-green-600">
                  Ersparnis: {getSavingsPercentage().toFixed(1)}%
                </p>
              </div>
              <Button
                onClick={downloadCompressedImage}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Komprimiertes Bild herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie ein JPEG, PNG, WebP, SVG oder GIF Bild aus (bis zu 50MB)</li>
            <li>Stellen Sie die gewünschte Qualität ein</li>
            <li>Klicken Sie auf "Bild komprimieren"</li>
            <li>Laden Sie das komprimierte Bild herunter</li>
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

export default ImageCompress;
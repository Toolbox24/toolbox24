import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Download, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const SvgCompress = () => {
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setFile(null);
      setDownloadUrl(null);
      setOriginalSize(0);
      setCompressedSize(0);
      return;
    }
    
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setDownloadUrl(null);
      setCompressedSize(0);
    }
  };

  const compressSvg = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine SVG-Datei aus.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      
      // Basic SVG compression: remove unnecessary whitespace and comments
      let compressed = text
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/>\s+</g, '><') // Remove whitespace between tags
        .trim();
      
      const blob = new Blob([compressed], { type: 'image/svg+xml' });
      setCompressedSize(blob.size);
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      toast({
        title: "Erfolgreich",
        description: "SVG-Datei wurde erfolgreich komprimiert!"
      });
    } catch (error) {
      console.error('Error compressing SVG:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Komprimieren der SVG-Datei.",
        variant: "destructive"
      });
    }
  };

  const downloadCompressedSvg = () => {
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
    <>
      <Helmet>
        <title>SVG komprimieren online – kostenlos & sicher | Toolbox24</title>
        <meta name="description" content="SVG-Dateien kostenlos online komprimieren. Reduzieren Sie die Dateigröße Ihrer SVG-Grafiken schnell und sicher in Ihrem Browser." />
      </Helmet>
      
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="page-header">
            <h1 className="page-title flex items-center justify-center gap-2">
              <ImageIcon className="h-8 w-8 text-primary" />
              SVG komprimieren
            </h1>
            <p className="page-description">
              Reduzieren Sie die Dateigröße Ihrer SVG-Grafiken durch Entfernung überflüssiger Elemente und Optimierung.
            </p>
          </div>

          <div className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              accept={{ 
                'image/svg+xml': ['.svg']
              }}
              multiple={false}
              maxSize={10 * 1024 * 1024} // 10MB
            />

            {file && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Ausgewählte Datei</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>{file.name}</strong> - {formatFileSize(originalSize)}
                  </p>
                </div>

                <Button
                  onClick={compressSvg}
                  size="lg"
                  className="w-full max-w-md"
                >
                  SVG komprimieren
                </Button>
              </div>
            )}

            {downloadUrl && (
              <div className="text-center p-6 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2 text-green-600">
                  SVG erfolgreich komprimiert!
                </h3>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>Ursprüngliche Größe: {formatFileSize(originalSize)}</p>
                  <p>Komprimierte Größe: {formatFileSize(compressedSize)}</p>
                  <p className="font-semibold text-green-600">
                    Ersparnis: {getSavingsPercentage().toFixed(1)}%
                  </p>
                </div>
                <Button
                  onClick={downloadCompressedSvg}
                  size="lg"
                  className="w-full max-w-md"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Komprimierte SVG herunterladen
                </Button>
              </div>
            )}
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Wählen Sie eine SVG-Datei aus (bis zu 10MB)</li>
              <li>Klicken Sie auf "SVG komprimieren"</li>
              <li>Die Datei wird durch Entfernung von Kommentaren und überflüssigen Leerzeichen optimiert</li>
              <li>Laden Sie die komprimierte SVG-Datei herunter</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Datenschutz:</strong> Alle Verarbeitungen erfolgen lokal in Ihrem Browser. 
              Ihre SVG-Dateien werden nicht an externe Server übertragen.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SvgCompress;
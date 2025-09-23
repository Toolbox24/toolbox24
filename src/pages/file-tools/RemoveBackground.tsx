import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const RemoveBackground = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      setDownloadUrl(null);
      setResultPreviewUrl(null);
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const removeBackground = async () => {
    if (!file) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Bild aus.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      toast({
        title: "Lädt KI-Modell",
        description: "Das Hintergrund-Entfernungsmodell wird geladen..."
      });

      setProgress(30);
      
      // Load the image
      const imageElement = await loadImage(file);
      setProgress(50);

      // Create segmentation pipeline
      const segmenter = await pipeline(
        'image-segmentation', 
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );
      setProgress(70);

      // Convert image to canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Resize if needed (max 1024px)
      const maxSize = 1024;
      let { width, height } = imageElement;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(imageElement, 0, 0, width, height);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setProgress(80);

      // Process with segmentation model
      const result = await segmenter(imageData);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Invalid segmentation result');
      }

      setProgress(90);

      // Create output canvas with transparency
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Could not get output canvas context');

      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply mask to remove background
      const outputImageData = outputCtx.getImageData(0, 0, width, height);
      const data = outputImageData.data;
      
      // Find the person/object mask (usually the first result)
      const personMask = result.find(r => 
        r.label && (r.label.includes('person') || r.label.includes('object'))
      ) || result[0];

      if (personMask && personMask.mask) {
        for (let i = 0; i < personMask.mask.data.length; i++) {
          // If mask value is low (background), make transparent
          if (personMask.mask.data[i] < 0.5) {
            data[i * 4 + 3] = 0; // Set alpha to 0 (transparent)
          }
        }
      }

      outputCtx.putImageData(outputImageData, 0, 0);

      // Convert to blob and create download URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        outputCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultPreviewUrl(url);
      setProgress(100);

      toast({
        title: "Erfolgreich",
        description: "Hintergrund wurde erfolgreich entfernt!"
      });
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Entfernen des Hintergrunds. Versuchen Sie es mit einem anderen Bild.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `no-background-${file.name.replace(/\.[^/.]+$/, '.png')}`;
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
            <ImageIcon className="h-8 w-8 text-primary" />
            Hintergrund entfernen
          </h1>
          <p className="text-lg text-muted-foreground">
            Entfernen Sie automatisch den Hintergrund von Ihren Bildern mit KI
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp']
            }}
            multiple={false}
            maxSize={20 * 1024 * 1024} // 20MB
          />

          {file && (
            <div className="text-center">
              <Button
                onClick={removeBackground}
                disabled={isProcessing}
                size="lg"
                className="w-full max-w-md"
              >
                {isProcessing ? 'Verarbeitung...' : 'Hintergrund entfernen'}
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

          {(previewUrl || resultPreviewUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {previewUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Original</h3>
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="w-full h-64 object-cover rounded border"
                  />
                </div>
              )}

              {resultPreviewUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Ohne Hintergrund</h3>
                  <div className="relative">
                    <img 
                      src={resultPreviewUrl} 
                      alt="Ohne Hintergrund" 
                      className="w-full h-64 object-cover rounded border"
                      style={{
                        backgroundColor: 'transparent',
                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {downloadUrl && (
            <div className="text-center p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                Hintergrund erfolgreich entfernt!
              </h3>
              <Button
                onClick={downloadImage}
                size="lg"
                className="w-full max-w-md"
              >
                <Download className="mr-2 h-4 w-4" />
                PNG mit transparentem Hintergrund herunterladen
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie ein Bild mit einer Person oder einem Objekt aus (bis zu 20MB)</li>
            <li>Klicken Sie auf "Hintergrund entfernen"</li>
            <li>Die KI erkennt automatisch das Hauptmotiv und entfernt den Hintergrund</li>
            <li>Laden Sie das Bild mit transparentem Hintergrund als PNG herunter</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Hinweis:</strong> Diese Funktion verwendet KI und funktioniert am besten bei Bildern mit klaren Motiven vor kontrastreichem Hintergrund.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Datenschutz:</strong> Alle Verarbeitungen erfolgen lokal in Ihrem Browser. 
            Ihre Bilder werden nicht an externe Server übertragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
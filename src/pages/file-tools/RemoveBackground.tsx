import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, ImageIcon, Scissors } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline, env } from '@huggingface/transformers';
import heic2any from 'heic2any';
import { useIsMobile } from '@/hooks/use-mobile';

// Configure transformers.js for optimal performance
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;

const RemoveBackground = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // HEIC conversion function
  const convertHEICToJPEG = async (heicFile: File): Promise<File> => {
    try {
      setIsConverting(true);
      toast({
        title: "HEIC wird konvertiert",
        description: "iPhone-Bild wird für Verarbeitung vorbereitet..."
      });

      const jpegBlob = await heic2any({
        blob: heicFile,
        toType: "image/jpeg",
        quality: 0.9
      }) as Blob;

      return new File([jpegBlob], heicFile.name.replace(/\.[^/.]+$/, '.jpg'), {
        type: 'image/jpeg'
      });
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      throw new Error('HEIC-Konvertierung fehlgeschlagen');
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setFile(null);
      setPreviewUrl(null);
      setResultPreviewUrl(null);
      setDownloadUrl(null);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    if (selectedFiles.length > 0) {
      let selectedFile = selectedFiles[0];
      
      // Check if it's HEIC and convert if needed
      if (selectedFile.type === 'image/heic' || selectedFile.name.toLowerCase().endsWith('.heic')) {
        try {
          selectedFile = await convertHEICToJPEG(selectedFile);
          toast({
            title: "HEIC konvertiert",
            description: "iPhone-Bild erfolgreich zu JPEG konvertiert"
          });
        } catch (error) {
          toast({
            title: "Konvertierungsfehler",
            description: "HEIC-Bild konnte nicht konvertiert werden. Versuchen Sie es mit einem JPEG/PNG.",
            variant: "destructive"
          });
          return;
        }
      }
      
      setFile(selectedFile);
      setDownloadUrl(null);
      setResultPreviewUrl(null);
      setProgress(0);
      setIsProcessing(false);
      
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
        title: "KI-Modell wird geladen",
        description: "Das beste verfügbare Modell wird geladen..."
      });

      setProgress(20);
      
      // Load the image
      const imageElement = await loadImage(file);
      setProgress(30);

      // Load the best available background removal model
      let backgroundRemover;
      
      try {
        // Try RMBG-1.4 first (best general model)
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'briaai/RMBG-1.4',
          { device: isMobile ? 'wasm' : 'webgpu' }
        );
        toast({
          title: "RMBG-1.4 geladen",
          description: "Verwende das beste verfügbare Modell"
        });
      } catch (error) {
        // Fallback to U²-Net if RMBG fails
        console.log('RMBG failed, using U²-Net fallback...');
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'Xenova/u2net',
          { device: 'wasm' }
        );
        toast({
          title: "U²-Net geladen",
          description: "Verwende zuverlässiges Fallback-Modell"
        });
      }
      
      setProgress(50);

      // Convert image to canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Optimize image size for performance (max 1024px)
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

      setProgress(70);

      // Process with background removal model
      const result = await backgroundRemover(canvas);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Background removal failed');
      }

      setProgress(85);

      // Create output canvas with transparency
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Could not get output canvas context');

      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply mask
      const outputImageData = outputCtx.getImageData(0, 0, width, height);
      const data = outputImageData.data;
      
      // Get the mask from the result
      const mask = result[0];

      if (mask && mask.mask) {
        const maskData = mask.mask.data;
        
        // Apply mask to create transparency
        for (let i = 0; i < maskData.length; i++) {
          const maskValue = maskData[i];
          // Convert mask value to alpha (0-255)
          const alpha = Math.round(maskValue * 255);
          data[i * 4 + 3] = alpha;
        }
      }

      outputCtx.putImageData(outputImageData, 0, 0);
      setProgress(95);

      // Convert to blob and create download URL
      const blob = await new Promise<Blob>((resolve, reject) => {
        outputCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultPreviewUrl(url);
      setProgress(100);

      toast({
        title: "Erfolgreich!",
        description: "Hintergrund wurde entfernt!"
      });
    } catch (error) {
      console.error('Error removing background:', error);
      
      toast({
        title: "Fehler",
        description: "Hintergrund konnte nicht entfernt werden. Versuchen Sie es mit einem anderen Bild.",
        variant: "destructive"
      });
      
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.split('.')[0]}_ohne_hintergrund.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
          <div className="page-header">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title flex items-center justify-center gap-2">
              <Scissors className="h-8 w-8 text-primary" />
              Hintergrund entfernen
            </h1>
            <p className="page-description">
              Entfernen Sie automatisch den Hintergrund von Ihren Bildern mit KI. 
              Einfach Bild hochladen und sofort herunterladen.
            </p>
          </div>

          <div className="space-y-6">
            <FileUpload 
              onFileSelect={handleFileSelect}
              accept={{
                'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic']
              }}
              multiple={false}
              maxSize={20 * 1024 * 1024} // 20MB
            />

            
            {isConverting && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  iPhone-Bild wird konvertiert...
                </div>
              </div>
            )}

            {/* Process Button */}
            {file && !isProcessing && !downloadUrl && (
              <div className="text-center">
                <Button 
                  onClick={removeBackground}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  Hintergrund entfernen
                </Button>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Verarbeitung läuft...</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Image Preview */}
            {(previewUrl || resultPreviewUrl) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Image */}
                {previewUrl && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-center">Original</h3>
                    <div className="relative border-2 border-border rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={previewUrl} 
                        alt="Original" 
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Result Image */}
                {resultPreviewUrl && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-center">Ergebnis</h3>
                    <div className="relative border-2 border-border rounded-lg overflow-hidden bg-muted" 
                         style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                      <img 
                        src={resultPreviewUrl} 
                        alt="Ohne Hintergrund" 
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Download Button */}
            {downloadUrl && (
              <div className="text-center">
                <Button 
                  onClick={downloadImage}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Bild herunterladen
                </Button>
              </div>
            )}
          </div>

          </div>
        
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">So funktioniert's:</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Wählen Sie ein JPEG, PNG, WebP oder HEIC Bild aus (bis zu 20MB)</li>
            <li>Klicken Sie auf "Hintergrund entfernen"</li>
            <li>Warten Sie wenige Sekunden auf die KI-Verarbeitung</li>
            <li>Laden Sie das Bild mit transparentem Hintergrund herunter</li>
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

export default RemoveBackground;
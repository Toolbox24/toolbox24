import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ImageIcon } from 'lucide-react';
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
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [edgeSharpness, setEdgeSharpness] = useState<number>(70); // 0-100%
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Edge parameter mapping based on percentage (0-100%)
  const getEdgeParams = () => {
    // Convert 0-100% to threshold and edgeLimit values
    // 0% = very soft, 100% = very sharp
    const normalizedValue = edgeSharpness / 100;
    const threshold = 0.2 + (normalizedValue * 0.4); // Range: 0.2 to 0.6
    const edgeLimit = 0.6 + (normalizedValue * 0.3); // Range: 0.6 to 0.9
    return { threshold, edgeLimit };
  };

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
    setProgressMessage('Bild wird vorbereitet...');

    try {
      toast({
        title: "KI-Modell wird geladen",
        description: "Das beste verfügbare Modell wird geladen..."
      });

      setProgress(20);
      setProgressMessage('Bild wird geladen...');
      
      // Load the image
      const imageElement = await loadImage(file);
      setProgress(30);
      setProgressMessage('KI-Modell wird geladen...');

      // Continuous progress timer - never stops until model is loaded
      let progressInterval: NodeJS.Timeout | null = null;
      let currentProgress = 30;
      
      const startProgressTimer = () => {
        progressInterval = setInterval(() => {
          if (currentProgress < 95) {
            // Variable speed: faster initially, then slower
            let increment = 0.5;
            let interval = 1000;
            
            if (currentProgress < 60) {
              increment = 1.5; // Faster in first phase
              interval = 800;
            } else if (currentProgress < 85) {
              increment = 0.8; // Medium speed in second phase
              interval = 1200;
            } else {
              increment = 0.3; // Very slow in final phase
              interval = 2000;
            }
            
            currentProgress = Math.min(95, currentProgress + increment);
            setProgress(Math.floor(currentProgress));
            
            // Update messages based on progress
            if (currentProgress <= 40) {
              setProgressMessage('Modell wird heruntergeladen...');
            } else if (currentProgress <= 60) {
              setProgressMessage('Modell wird initialisiert...');
            } else if (currentProgress <= 80) {
              setProgressMessage('Modell wird optimiert...');
            } else {
              setProgressMessage('Fast bereit...');
            }
          }
        }, 1000);
      };
      
      startProgressTimer();

      // Load proven RMBG-1.4 model for reliable background removal
      let backgroundRemover;
      
      try {
        // Primary: RMBG-1.4 (most reliable)
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'briaai/RMBG-1.4',
          { device: isMobile ? 'wasm' : 'webgpu' }
        );
        toast({
          title: "RMBG-1.4 geladen",
          description: "Verwende bewährtes Modell"
        });
      } catch (error) {
        try {
          // Fallback to U²-Net
          console.log('RMBG failed, trying U²-Net...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/u2net',
            { device: 'wasm' }
          );
          toast({
            title: "U²-Net geladen",
            description: "Verwende Fallback-Modell"
          });
        } catch (error2) {
          // Final fallback
          console.log('U²-Net failed, using Segformer fallback...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/segformer-b0-finetuned-ade-512-512',
            { device: 'wasm' }
          );
          toast({
            title: "Segformer geladen",
            description: "Verwende letztes verfügbares Modell"
          });
        }
      }
      
      // Clear the mobile progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setProgress(50);
      setProgressMessage('Modell ist bereit! Bild wird verarbeitet...');

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

      setProgress(65);
      setProgressMessage('Hintergrund wird analysiert...');

      // Process with background removal model
      const result = await backgroundRemover(canvas);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('Background removal failed');
      }

      setProgress(80);
      setProgressMessage('Bild wird optimiert...');

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
        
        // Get edge parameters based on user selection
        const { threshold, edgeLimit } = getEdgeParams();
        
        // Apply mask with customizable edge handling
        for (let i = 0; i < maskData.length; i++) {
          const maskValue = maskData[i];
          
          if (maskValue >= threshold) {
            // Object pixel - apply smoothing at edges based on selection
            if (maskValue < edgeLimit) {
              // Edge pixel - smooth transition
              data[i * 4 + 3] = Math.round(maskValue * 255);
            } else {
              // Core object - fully opaque
              data[i * 4 + 3] = 255;
            }
          } else {
            // Background - transparent
            data[i * 4 + 3] = 0;
          }
        }
      }

      outputCtx.putImageData(outputImageData, 0, 0);
      setProgress(90);
      setProgressMessage('Bild wird finalisiert...');

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
      setProgressMessage('Fertig!');

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
      setProgressMessage('');
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
              <ImageIcon className="h-8 w-8 text-primary" />
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

            {/* Edge Sharpness Selection */}
            {file && !isProcessing && !downloadUrl && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Kanten-Schärfe:</Label>
                  <span className="text-sm font-medium text-primary">{edgeSharpness}%</span>
                </div>
                <Slider
                  value={[edgeSharpness]}
                  onValueChange={(value) => setEdgeSharpness(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0% - Sehr weich</span>
                  <span>50% - Ausgewogen</span>
                  <span>100% - Sehr scharf</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Niedrige Werte: Natürliche Haare/Details • Hohe Werte: Präzise Konturen für Logos/Objekte
                </p>
              </div>
            )}
            
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
                  <span className="text-sm font-medium">
                    {progressMessage || 'Verarbeitung läuft...'}
                  </span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {isMobile && progress > 25 && progress < 50 && (
                  <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                    Modell wird geladen, bitte warten...
                  </div>
                )}
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
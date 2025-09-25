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

      // Load the most precise background removal model
      let backgroundRemover;
      
      try {
        // Try Segformer first (most precise for object segmentation)
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'Xenova/segformer-b0-finetuned-ade-512-512',
          { device: isMobile ? 'wasm' : 'webgpu' }
        );
        toast({
          title: "Segformer geladen",
          description: "Verwende das präziseste Modell"
        });
      } catch (error) {
        try {
          // Fallback to RMBG-1.4
          console.log('Segformer failed, trying RMBG-1.4...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'briaai/RMBG-1.4',
            { device: isMobile ? 'wasm' : 'webgpu' }
          );
          toast({
            title: "RMBG-1.4 geladen",
            description: "Verwende zuverlässiges Modell"
          });
        } catch (error2) {
          // Final fallback to U²-Net
          console.log('RMBG failed, using U²-Net fallback...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/u2net',
            { device: 'wasm' }
          );
          toast({
            title: "U²-Net geladen",
            description: "Verwende Fallback-Modell"
          });
        }
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
        
        // AGGRESSIVE MASKING - Only keep main object, remove all background
        const aggressiveThreshold = 0.7; // High threshold - only very confident object pixels
        
        // Step 1: Apply aggressive threshold
        const binaryMask = new Uint8Array(maskData.length);
        for (let i = 0; i < maskData.length; i++) {
          binaryMask[i] = maskData[i] >= aggressiveThreshold ? 255 : 0;
        }
        
        // Step 2: Morphological erosion to remove background remnants
        const erodedMask = new Uint8Array(maskData.length);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            let minValue = 255;
            
            // Check 3x3 neighborhood - all must be object for pixel to remain
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const neighIdx = (y + dy) * width + (x + dx);
                if (neighIdx >= 0 && neighIdx < binaryMask.length) {
                  minValue = Math.min(minValue, binaryMask[neighIdx]);
                }
              }
            }
            erodedMask[idx] = minValue;
          }
        }
        
        // Step 3: Connected components - keep only largest region
        const visited = new Uint8Array(maskData.length);
        let largestComponentSize = 0;
        let largestComponent = new Set<number>();
        
        for (let i = 0; i < erodedMask.length; i++) {
          if (erodedMask[i] > 0 && !visited[i]) {
            const component = new Set<number>();
            const stack = [i];
            
            while (stack.length > 0) {
              const current = stack.pop()!;
              if (visited[current] || erodedMask[current] === 0) continue;
              
              visited[current] = 1;
              component.add(current);
              
              const y = Math.floor(current / width);
              const x = current % width;
              
              // Add 4-connected neighbors
              const neighbors = [
                (y - 1) * width + x, // up
                (y + 1) * width + x, // down
                y * width + (x - 1), // left
                y * width + (x + 1)  // right
              ];
              
              for (const neighbor of neighbors) {
                if (neighbor >= 0 && neighbor < erodedMask.length && 
                    !visited[neighbor] && erodedMask[neighbor] > 0) {
                  stack.push(neighbor);
                }
              }
            }
            
            if (component.size > largestComponentSize) {
              largestComponentSize = component.size;
              largestComponent = component;
            }
          }
        }
        
        // Step 4: Create final mask with only largest component
        const finalMask = new Uint8Array(maskData.length);
        for (const idx of largestComponent) {
          finalMask[idx] = 255;
        }
        
        // Step 5: Fill small holes in the main object
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (finalMask[idx] === 0) {
              // Count surrounding object pixels
              let objectNeighbors = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const neighIdx = (y + dy) * width + (x + dx);
                  if (neighIdx >= 0 && neighIdx < finalMask.length && finalMask[neighIdx] > 0) {
                    objectNeighbors++;
                  }
                }
              }
              // Fill holes (if surrounded by mostly object pixels)
              if (objectNeighbors >= 6) {
                finalMask[idx] = 255;
              }
            }
          }
        }
        
        // Step 6: Apply final mask with minimal edge smoothing
        for (let i = 0; i < maskData.length; i++) {
          if (finalMask[i] > 0) {
            // Object pixel - check if on edge for minimal smoothing
            const y = Math.floor(i / width);
            const x = i % width;
            let isEdge = false;
            
            // Check if neighboring pixels are background
            for (let dy = -1; dy <= 1 && !isEdge; dy++) {
              for (let dx = -1; dx <= 1 && !isEdge; dx++) {
                if (dx === 0 && dy === 0) continue;
                const neighIdx = (y + dy) * width + (x + dx);
                if (neighIdx >= 0 && neighIdx < finalMask.length && finalMask[neighIdx] === 0) {
                  isEdge = true;
                }
              }
            }
            
            // Apply minimal edge smoothing for natural look
            if (isEdge && maskData[i] < 0.9) {
              data[i * 4 + 3] = Math.round(maskData[i] * 255);
            } else {
              data[i * 4 + 3] = 255; // Fully opaque
            }
          } else {
            data[i * 4 + 3] = 0; // Completely transparent background
          }
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
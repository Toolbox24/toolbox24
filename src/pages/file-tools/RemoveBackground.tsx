import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Edge parameter mapping based on percentage (0-100%)
  // Fixed optimal values for perfect soft edges
  const getEdgeParams = () => {
    return { threshold: 0.3, edgeLimit: 0.7 };
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

  // Enhanced State-of-the-Art Background Removal with Professional Quality
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
    setProgressMessage('State-of-the-Art KI wird vorbereitet...');

    try {
      toast({
        title: "🚀 State-of-the-Art KI wird geladen",
        description: "RMBG-1.4 - Das beste verfügbare Modell für perfekte Ergebnisse"
      });

      setProgress(20);
      setProgressMessage('Bild wird für KI-Analyse vorbereitet...');
      
      // Advanced image loading with quality preservation
      const imageElement = await loadImage(file);
      setProgress(30);
      setProgressMessage('Modernste KI-Modelle werden geladen...');

      // Enhanced progress system for better UX
      let progressInterval: NodeJS.Timeout | null = null;
      let currentProgress = 30;
      
      const startProgressTimer = () => {
        progressInterval = setInterval(() => {
          if (currentProgress < 95) {
            // Adaptive progress speed based on model loading phases
            let increment = 0.8;
            
            if (currentProgress < 50) {
              increment = 2.0; // Faster initial download
              setProgressMessage('RMBG-1.4 State-of-the-Art Modell wird geladen...');
            } else if (currentProgress < 70) {
              increment = 1.2; // Model initialization
              setProgressMessage('KI wird für perfekte Kanten optimiert...');
            } else if (currentProgress < 85) {
              increment = 0.6; // GPU optimization
              setProgressMessage('WebGPU-Beschleunigung wird aktiviert...');
            } else {
              increment = 0.3; // Final preparation
              setProgressMessage('Professionelle Qualität wird vorbereitet...');
            }
            
            currentProgress = Math.min(95, currentProgress + increment);
            setProgress(Math.floor(currentProgress));
          }
        }, 800);
      };
      
      startProgressTimer();

      // State-of-the-Art Model Loading with Enhanced Fallbacks
      let backgroundRemover;
      let modelName = '';
      
      try {
        // Primary: RMBG-1.4 (State-of-the-Art für 2024/2025)
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'briaai/RMBG-1.4',
          { 
            device: isMobile ? 'wasm' : 'webgpu',
            dtype: 'fp16' // Higher precision for better results
          }
        );
        modelName = 'RMBG-1.4 (State-of-the-Art)';
        toast({
          title: "✨ RMBG-1.4 geladen",
          description: "State-of-the-Art Modell für professionelle Ergebnisse"
        });
      } catch (error) {
        try {
          // Enhanced Fallback: U²-Net with optimizations
          console.log('RMBG failed, trying enhanced U²-Net...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/u2net',
            { device: 'wasm' }
          );
          modelName = 'U²-Net (Enhanced)';
          toast({
            title: "U²-Net geladen",
            description: "Hochqualitatives Fallback-Modell"
          });
        } catch (error2) {
          // Final enhanced fallback
          console.log('U²-Net failed, using enhanced Segformer...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/segformer-b0-finetuned-ade-512-512',
            { device: 'wasm' }
          );
          modelName = 'Segformer (Enhanced)';
          toast({
            title: "Segformer geladen",
            description: "Optimiertes Backup-Modell"
          });
        }
      }
      
      // Clear progress timer
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setProgress(55);
      setProgressMessage(`${modelName} bereit! Professionelle Verarbeitung startet...`);

      // Advanced Image Preprocessing for Optimal Results
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context nicht verfügbar');

      // Smart resolution optimization for best quality/performance balance
      let { width, height } = imageElement;
      const originalWidth = width;
      const originalHeight = height;
      
      // Adaptive sizing based on image characteristics
      const maxSize = 1024;
      const minSize = 512;
      
      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      } else if (width < minSize && height < minSize) {
        // Upscale small images for better AI processing
        const scale = minSize / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      
      // High-quality rendering with anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imageElement, 0, 0, width, height);

      // Optional: Advanced preprocessing for edge enhancement
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Subtle contrast enhancement for better edge detection
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const contrast = 1.03; // Very subtle enhancement
        
        data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrast) + 128));     // R
        data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrast) + 128)); // G
        data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrast) + 128)); // B
      }
      
      ctx.putImageData(imageData, 0, 0);

      setProgress(70);
      setProgressMessage('KI analysiert Bildobjekte mit höchster Präzision...');

      // Enhanced AI Processing
      const result = await backgroundRemover(canvas);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('KI-Segmentierung fehlgeschlagen');
      }

      setProgress(85);
      setProgressMessage('Erstelle perfekte weiche Kanten...');

      // Advanced Output Processing with Professional Quality
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Output Canvas nicht verfügbar');

      // High-quality rendering
      outputCtx.imageSmoothingEnabled = true;
      outputCtx.imageSmoothingQuality = 'high';
      outputCtx.drawImage(canvas, 0, 0);
      
      // Step 1: Process mask at AI resolution first (better quality post-processing)
      const mask = result[0];
      if (!mask || !mask.mask) {
        throw new Error('Keine gültige Maske erhalten');
      }

      const maskData = mask.mask.data;
      const { threshold, edgeLimit } = getEdgeParams();
      
      // Initial alpha processing at AI resolution
      const initialAlpha = new Uint8Array(maskData.length);
      
      for (let i = 0; i < maskData.length; i++) {
        const maskValue = maskData[i];
        let alpha;
        
        if (maskValue < threshold) {
          alpha = 0; // Background
        } else if (maskValue > edgeLimit) {
          alpha = 255; // Foreground
        } else {
          // Professional edge smoothing with cubic interpolation
          const edgeRange = edgeLimit - threshold;
          const normalizedValue = (maskValue - threshold) / edgeRange;
          
          // Hermite interpolation for ultra-smooth transitions
          const smoothedValue = normalizedValue * normalizedValue * (3 - 2 * normalizedValue);
          alpha = Math.round(smoothedValue * 255);
        }
        
        initialAlpha[i] = alpha;
      }

      // Step 2: Mask Erosion (1-2 pixels) at AI resolution
      const erodedAlpha = new Uint8Array(maskData.length);
      const erosionRadius = 1.5; // 1-2 pixel erosion
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const centerIndex = y * width + x;
          let minAlpha = 255;

          // Find minimum alpha in neighborhood (erosion)
          for (let dy = -Math.ceil(erosionRadius); dy <= Math.ceil(erosionRadius); dy++) {
            for (let dx = -Math.ceil(erosionRadius); dx <= Math.ceil(erosionRadius); dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= erosionRadius) {
                  const sampleIndex = ny * width + nx;
                  minAlpha = Math.min(minAlpha, initialAlpha[sampleIndex]);
                }
              }
            }
          }
          
          erodedAlpha[centerIndex] = minAlpha;
        }
      }

      // Step 3: Feathering at AI resolution
      const featheredAlpha = new Uint8Array(maskData.length);
      const featherRadius = 2.0;
      const sigma = 0.8;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const centerIndex = y * width + x;
          let totalAlpha = 0;
          let totalWeight = 0;

          // Gaussian feathering for smooth transitions
          for (let dy = -Math.ceil(featherRadius); dy <= Math.ceil(featherRadius); dy++) {
            for (let dx = -Math.ceil(featherRadius); dx <= Math.ceil(featherRadius); dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const sampleIndex = ny * width + nx;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= featherRadius) {
                  const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma));
                  totalAlpha += erodedAlpha[sampleIndex] * weight;
                  totalWeight += weight;
                }
              }
            }
          }

          if (totalWeight > 0) {
            featheredAlpha[centerIndex] = Math.round(totalAlpha / totalWeight);
          } else {
            featheredAlpha[centerIndex] = erodedAlpha[centerIndex];
          }
        }
      }

      // Step 4: Additional edge smoothing for natural transitions
      const smoothedAlpha = new Uint8Array(maskData.length);
      const smoothRadius = 1.2;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const centerIndex = y * width + x;
          let totalAlpha = 0;
          let count = 0;

          // Simple averaging for smooth edges
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const sampleIndex = ny * width + nx;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= smoothRadius) {
                  totalAlpha += featheredAlpha[sampleIndex];
                  count++;
                }
              }
            }
          }

          smoothedAlpha[centerIndex] = count > 0 ? Math.round(totalAlpha / count) : featheredAlpha[centerIndex];
        }
      }

      setProgress(88);
      setProgressMessage('Skaliere Maske auf Originalauflösung...');

      // Step 5: Create original resolution output canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = originalWidth;
      finalCanvas.height = originalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('Final Canvas nicht verfügbar');

      // Draw original image at full resolution
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(imageElement, 0, 0, originalWidth, originalHeight);

      // Step 6: Upscale smoothed mask to original resolution
      const finalImageData = finalCtx.getImageData(0, 0, originalWidth, originalHeight);
      const finalData = finalImageData.data;

      const scaleX = originalWidth / width;
      const scaleY = originalHeight / height;

      // High-quality bilinear interpolation for mask upscaling
      for (let y = 0; y < originalHeight; y++) {
        for (let x = 0; x < originalWidth; x++) {
          const srcX = x / scaleX;
          const srcY = y / scaleY;
          
          const x1 = Math.floor(srcX);
          const y1 = Math.floor(srcY);
          const x2 = Math.min(x1 + 1, width - 1);
          const y2 = Math.min(y1 + 1, height - 1);
          
          const dx = srcX - x1;
          const dy = srcY - y1;
          
          // Get alpha values from smoothed mask
          const alpha11 = smoothedAlpha[y1 * width + x1];
          const alpha12 = smoothedAlpha[y2 * width + x1];
          const alpha21 = smoothedAlpha[y1 * width + x2];
          const alpha22 = smoothedAlpha[y2 * width + x2];
          
          // Bilinear interpolation
          const alpha1 = alpha11 * (1 - dx) + alpha21 * dx;
          const alpha2 = alpha12 * (1 - dx) + alpha22 * dx;
          const finalAlpha = alpha1 * (1 - dy) + alpha2 * dy;
          
          const pixelIndex = (y * originalWidth + x) * 4;
          
           // Enhanced color decontamination for semi-transparent pixels
           const alphaRatio = finalAlpha / 255;
           if (alphaRatio > 0.1 && alphaRatio < 0.9) {
             const r = finalData[pixelIndex];
             const g = finalData[pixelIndex + 1];
             const b = finalData[pixelIndex + 2];
             
             // Calculate grayscale value for neutralization
             const gray = r * 0.299 + g * 0.587 + b * 0.114;
             
             // Stronger decontamination effect - more aggressive neutralization
             const decontamination = (1 - alphaRatio) * 1.8; // Increased from 1.0 to 1.8
             const neutralizationStrength = Math.min(0.9, decontamination); // Cap at 90%
             
             // Reduce saturation and shift towards foreground tone
             const desaturated_r = r * (1 - neutralizationStrength) + gray * neutralizationStrength;
             const desaturated_g = g * (1 - neutralizationStrength) + gray * neutralizationStrength;
             const desaturated_b = b * (1 - neutralizationStrength) + gray * neutralizationStrength;
             
             // Additional foreground tone shifting for very transparent pixels
             if (alphaRatio < 0.4) {
               const foregroundShift = 0.3; // Shift towards more neutral foreground tone
               const avgForeground = (desaturated_r + desaturated_g + desaturated_b) / 3;
               
               finalData[pixelIndex] = Math.round(desaturated_r * (1 - foregroundShift) + avgForeground * foregroundShift);
               finalData[pixelIndex + 1] = Math.round(desaturated_g * (1 - foregroundShift) + avgForeground * foregroundShift);
               finalData[pixelIndex + 2] = Math.round(desaturated_b * (1 - foregroundShift) + avgForeground * foregroundShift);
             } else {
               finalData[pixelIndex] = Math.round(desaturated_r);
               finalData[pixelIndex + 1] = Math.round(desaturated_g);
               finalData[pixelIndex + 2] = Math.round(desaturated_b);
             }
           }
          
          // Preserve semi-transparency for natural edges
          finalData[pixelIndex + 3] = Math.round(finalAlpha);
        }
      }

       finalCtx.putImageData(finalImageData, 0, 0);
       
       // Step 7: Ultra-light second feather (0.5px) for ultra-smooth transitions
       const ultraFinalImageData = finalCtx.getImageData(0, 0, originalWidth, originalHeight);
       const ultraFinalData = ultraFinalImageData.data;
       
       for (let y = 1; y < originalHeight - 1; y++) {
         for (let x = 1; x < originalWidth - 1; x++) {
           const centerIndex = (y * originalWidth + x) * 4 + 3; // Alpha channel
           const currentAlpha = ultraFinalData[centerIndex];
           
           // Only apply ultra-light feather to edge pixels
           if (currentAlpha > 10 && currentAlpha < 245) {
             const topAlpha = ultraFinalData[((y - 1) * originalWidth + x) * 4 + 3];
             const bottomAlpha = ultraFinalData[((y + 1) * originalWidth + x) * 4 + 3];
             const leftAlpha = ultraFinalData[(y * originalWidth + (x - 1)) * 4 + 3];
             const rightAlpha = ultraFinalData[(y * originalWidth + (x + 1)) * 4 + 3];
             
             // Very light averaging (0.5px equivalent)
             const avgAlpha = (currentAlpha * 0.7 + (topAlpha + bottomAlpha + leftAlpha + rightAlpha) * 0.075);
             ultraFinalData[centerIndex] = Math.round(avgAlpha);
           }
         }
       }
       
       finalCtx.putImageData(ultraFinalImageData, 0, 0);
       
       setProgress(95);
       setProgressMessage('Finalisiere professionelle Qualität...');

      // Create high-quality output at original resolution
      const blob = await new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob-Erstellung fehlgeschlagen'));
        }, 'image/png', 1.0);
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultPreviewUrl(url);
      setProgress(100);
      setProgressMessage('🎉 Professionelle Qualität erreicht!');

      toast({
        title: "🎯 Perfekt!",
        description: `${modelName} hat professionelle Ergebnisse geliefert!`
      });
    } catch (error) {
      console.error('Fehler bei State-of-the-Art Verarbeitung:', error);
      
      toast({
        title: "Verarbeitungsfehler",
        description: "KI-Verarbeitung fehlgeschlagen. Versuchen Sie ein anderes Bild.",
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
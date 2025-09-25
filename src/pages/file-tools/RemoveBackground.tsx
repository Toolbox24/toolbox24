import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Download, ImageIcon, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pipeline, env } from '@huggingface/transformers';
import heic2any from 'heic2any';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [invertMask, setInvertMask] = useState(false);
  const [qualityMode, setQualityMode] = useState<'soft' | 'hard'>('soft');
  const [edgeSmoothing, setEdgeSmoothing] = useState([3]);
  const [feathering, setFeathering] = useState([2]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'auto' | 'rmbg-2' | 'u2net' | 'sky-removal'>('auto');
  const [processingMode, setProcessingMode] = useState<'general' | 'sky' | 'portrait' | 'product'>('general');
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
      // Reset all states when file is removed
      setFile(null);
      setPreviewUrl(null);
      setResultPreviewUrl(null);
      setDownloadUrl(null);
      setProgress(0);
      setIsProcessing(false);
      setShowComparison(false);
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
      setShowComparison(false);
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  // Advanced post-processing functions
  const applyEdgeSmoothing = (imageData: ImageData, radius: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Gaussian blur for alpha channel
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let sum = 0;
        let weightSum = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const weight = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
            const index = (ny * width + nx) * 4 + 3; // Alpha channel
            
            sum += data[index] * weight;
            weightSum += weight;
          }
        }
        
        const currentIndex = (y * width + x) * 4 + 3;
        data[currentIndex] = sum / weightSum;
      }
    }
    
    return new ImageData(data, width, height);
  };

  const applyFeathering = (imageData: ImageData, featherRadius: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Create distance field for alpha edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4 + 3;
        const alpha = data[index];
        
        if (alpha > 0 && alpha < 255) {
          // Find distance to nearest opaque/transparent pixel
          let minDist = featherRadius;
          
          for (let dy = -featherRadius; dy <= featherRadius; dy++) {
            for (let dx = -featherRadius; dx <= featherRadius; dx++) {
              const nx = Math.max(0, Math.min(width - 1, x + dx));
              const ny = Math.max(0, Math.min(height - 1, y + dy));
              const nIndex = (ny * width + nx) * 4 + 3;
              const nAlpha = data[nIndex];
              
              if (nAlpha === 0 || nAlpha === 255) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                minDist = Math.min(minDist, dist);
              }
            }
          }
          
          // Apply smooth falloff
          const factor = Math.max(0, Math.min(1, minDist / featherRadius));
          data[index] = alpha * factor;
        }
      }
    }
    
    return new ImageData(data, width, height);
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
      // Mobile-specific optimizations
      const deviceInfo = isMobile ? "Mobile-optimiert" : "Desktop-optimiert";
      toast({
        title: `Lädt ${deviceInfo} Modell`,
        description: isMobile 
          ? "Lädt mobile-optimiertes KI-Modell für Ihr Gerät..."
          : "Das spezialisierte U²-Net Hintergrund-Entfernungsmodell wird geladen..."
      });

      setProgress(20);
      
      // Load the image
      const imageElement = await loadImage(file);
      setProgress(40);

      // Advanced model selection with specialized capabilities
      let backgroundRemover;
      let modelUsed = '';
      
      const getOptimalModel = () => {
        if (selectedModel === 'auto') {
          if (processingMode === 'sky') return { model: 'Xenova/detr-resnet-50-panoptic', name: 'DETR (Sky-optimiert)' };
          if (processingMode === 'portrait') return { model: 'briaai/RMBG-1.4', name: 'RMBG-1.4 (Portrait-optimiert)' };
          if (processingMode === 'product') return { model: 'Xenova/u2net', name: 'U²-Net (Produkt-optimiert)' };
          return { model: 'briaai/RMBG-1.4', name: 'RMBG-1.4 (Automatisch)' };
        }
        
        switch (selectedModel) {
          case 'rmbg-2': return { model: 'briaai/RMBG-1.4', name: 'RMBG-1.4 (Bewährt)' };
          case 'u2net': return { model: 'Xenova/u2net', name: 'U²-Net (Bewährt)' };
          case 'sky-removal': return { model: 'Xenova/detr-resnet-50-panoptic', name: 'DETR (Himmel-Spezialist)' };
          default: return { model: 'briaai/RMBG-1.4', name: 'RMBG-1.4 (Standard)' };
        }
      };
      
      try {
        const { model, name } = getOptimalModel();
        
        if (!isMobile) {
          // Desktop: Try advanced models with WebGPU
          try {
            backgroundRemover = await pipeline(
              'image-segmentation', 
              model,
              { device: 'webgpu' }
            );
            modelUsed = `${name} (WebGPU)`;
          } catch (error) {
            console.log('WebGPU failed, trying WASM...');
            backgroundRemover = await pipeline(
              'image-segmentation', 
              'Xenova/u2net',
              { device: 'wasm' }
            );
            modelUsed = `U²-Net (WASM)`;
          }
        } else {
          // Mobile: WASM with optimized models
          try {
            backgroundRemover = await pipeline(
              'image-segmentation', 
              'Xenova/u2net',
              { device: 'wasm' }
            );
            modelUsed = `Mobile U²-Net (WASM)`;
          } catch (error) {
            backgroundRemover = await pipeline(
              'image-segmentation', 
              'Xenova/detr-resnet-50-panoptic',
              { device: 'wasm' }
            );
            modelUsed = 'Mobile DETR (WASM)';
          }
        }
        
        toast({
          title: "KI-Modell geladen",
          description: `Verwende ${modelUsed}`
        });
      } catch (error) {
        console.log('All models failed, using universal fallback...');
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'Xenova/u2net',
          { device: 'wasm' }
        );
        modelUsed = 'U²-Net Fallback (WASM)';
      }
      setProgress(60);

      // Convert image to canvas for processing with higher quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Mobile-optimized image sizing
      const maxSize = isMobile ? 1024 : 2048; // Smaller max size for mobile
      let { width, height } = imageElement;
      
      // More aggressive resizing for mobile to improve performance
      if (isMobile && (width > maxSize || height > maxSize)) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      } else if (!isMobile && (width > maxSize || height > maxSize)) {
        // Desktop: Only resize extremely large images
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

      setProgress(80);

      // Create output canvas with transparency
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Could not get output canvas context');

      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply mask with advanced processing
      let outputImageData = outputCtx.getImageData(0, 0, width, height);
      const data = outputImageData.data;
      
      // Get the mask from the result
      const mask = result[0];

      if (mask && mask.mask) {
        const maskData = mask.mask.data;
        
        // Apply mask based on quality mode
        for (let i = 0; i < maskData.length; i++) {
          const maskValue = maskData[i];
          
          let alpha;
          if (invertMask) {
            alpha = qualityMode === 'hard' 
              ? (maskValue > 0.5 ? 0 : 255)
              : Math.round((1 - maskValue) * 255);
          } else {
            alpha = qualityMode === 'hard'
              ? (maskValue > 0.5 ? 255 : 0) 
              : Math.round(maskValue * 255);
          }
          
          data[i * 4 + 3] = alpha;
        }
        
        // Apply post-processing for soft mode
        if (qualityMode === 'soft') {
          outputImageData = applyEdgeSmoothing(outputImageData, edgeSmoothing[0]);
          outputImageData = applyFeathering(outputImageData, feathering[0]);
        }
      }

      outputCtx.putImageData(outputImageData, 0, 0);
      setProgress(90);

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
      
      // More specific error messages
      let errorMessage = "Fehler beim Entfernen des Hintergrunds.";
      let suggestions = "";
      
      if (isMobile) {
        errorMessage = "Mobile Verarbeitung fehlgeschlagen.";
        suggestions = " Versuchen Sie: kleineres Bild, JPEG-Format, oder nutzen Sie ein Desktop-Gerät für beste Ergebnisse.";
      } else if (error instanceof Error && error.message.includes('WebGPU')) {
        errorMessage = "WebGPU nicht verfügbar.";
        suggestions = " Versuchen Sie einen moderneren Browser oder reduzieren Sie die Bildgröße.";
      } else if (error instanceof Error && error.message.includes('memory')) {
        errorMessage = "Nicht genügend Speicher.";
        suggestions = " Versuchen Sie ein kleineres Bild oder schließen Sie andere Browser-Tabs.";
      }
      
      toast({
        title: "Fehler",
        description: errorMessage + suggestions,
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
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            Hintergrund entfernen
          </h1>
          <p className="page-description">
            Entfernen Sie automatisch den Hintergrund von Ihren Bildern mit modernster KI. 
            Speziell optimiert für Himmel-Entfernung, Portraits und Produktfotos.
          </p>
        </div>

        <div className="space-y-6">
          {/* Mobile compatibility info */}
          {isMobile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Mobile-optimiert</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    HEIC-Dateien von iPhone werden automatisch konvertiert. 
                    Für beste Ergebnisse verwenden Sie Bilder unter 5MB.
                  </p>
                </div>
              </div>
            </div>
          )}

          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{ 
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp'],
              'image/heic': ['.heic'],
              'image/heif': ['.heif']
            }}
            multiple={false}
            maxSize={isMobile ? 10 * 1024 * 1024 : 20 * 1024 * 1024} // 10MB mobile, 20MB desktop
          />

          {file && (
            <div className="space-y-6">
              {/* Advanced Model Selection */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">KI-Modell & Modus</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bild-Typ</Label>
                    <Select value={processingMode} onValueChange={(value: 'general' | 'sky' | 'portrait' | 'product') => setProcessingMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Allgemein (Standard)</SelectItem>
                        <SelectItem value="sky">🌤️ Himmel & Landschaft</SelectItem>
                        <SelectItem value="portrait">👤 Portrait & Person</SelectItem>
                        <SelectItem value="product">📦 Produkt & Objekt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>KI-Modell</Label>
                    <Select value={selectedModel} onValueChange={(value: 'auto' | 'rmbg-2' | 'u2net' | 'sky-removal') => setSelectedModel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">🤖 Automatisch (empfohlen)</SelectItem>
                        <SelectItem value="rmbg-2">🚀 RMBG-1.4 (Bewährt)</SelectItem>
                        <SelectItem value="u2net">⚡ U²-Net (Schnell)</SelectItem>
                        <SelectItem value="sky-removal">☁️ Himmel-Spezialist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Quality Settings */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Qualitäts-Einstellungen</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entfernungs-Modus</Label>
                    <Select value={qualityMode} onValueChange={(value: 'soft' | 'hard') => setQualityMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soft">Weich entfernen (empfohlen)</SelectItem>
                        <SelectItem value="hard">Stark entfernen (harter Schnitt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="invert-mask"
                      checked={invertMask}
                      onCheckedChange={setInvertMask}
                    />
                    <Label htmlFor="invert-mask">Maske invertieren</Label>
                  </div>
                </div>

                {qualityMode === 'soft' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kanten-Glättung: {edgeSmoothing[0]}</Label>
                      <Slider
                        value={edgeSmoothing}
                        onValueChange={setEdgeSmoothing}
                        min={1}
                        max={8}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Weiche Ränder: {feathering[0]}</Label>
                      <Slider
                        value={feathering}
                        onValueChange={setFeathering}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button
                  onClick={removeBackground}
                  disabled={isProcessing || isConverting}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {isConverting ? 'HEIC wird konvertiert...' : 
                   isProcessing ? 'Verarbeitung...' : 
                   'Hintergrund entfernen'}
                </Button>
              </div>
            </div>
          )}

          {(isProcessing || isConverting) && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                {isConverting ? 'HEIC-Konvertierung läuft...' : `Verarbeitung läuft... ${progress}%`}
              </div>
              <Progress value={isConverting ? 50 : progress} className="w-full" />
            </div>
          )}

          {(previewUrl || resultPreviewUrl) && (
            <div className="space-y-4">
              {/* Toggle for comparison view */}
              {previewUrl && resultPreviewUrl && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    {showComparison ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                    {showComparison ? 'Getrennt anzeigen' : 'Vergleich anzeigen'}
                  </Button>
                </div>
              )}

              {showComparison && previewUrl && resultPreviewUrl ? (
                /* Comparison View */
                <div className="relative w-full max-w-2xl mx-auto">
                  <div className="relative h-80 rounded-lg overflow-hidden border">
                    <img 
                      src={previewUrl} 
                      alt="Original" 
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: 'inset(0 50% 0 0)' }}
                    >
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundImage: `
                            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                          `,
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                        }}
                      >
                        <img 
                          src={resultPreviewUrl} 
                          alt="Ohne Hintergrund" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-white shadow-lg z-10"></div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">Original</div>
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">Ohne Hintergrund</div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Vor/Nach-Vergleich - Linke Hälfte: Original, Rechte Hälfte: Ohne Hintergrund
                  </p>
                </div>
              ) : (
                /* Separate View */
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
                      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded border">
                        <div 
                          className="relative w-full h-64 rounded overflow-hidden"
                          style={{
                            backgroundImage: `
                              linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                            `,
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                          }}
                        >
                          <img 
                            src={resultPreviewUrl} 
                            alt="Ohne Hintergrund" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Transparente Bereiche werden durch das Schachbrettmuster dargestellt
                        </p>
                      </div>
                    </div>
                  )}
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
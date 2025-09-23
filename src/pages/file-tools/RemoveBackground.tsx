import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Download, ImageIcon, Eye, EyeOff } from 'lucide-react';
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
  const [invertMask, setInvertMask] = useState(false);
  const [qualityMode, setQualityMode] = useState<'soft' | 'hard'>('soft');
  const [edgeSmoothing, setEdgeSmoothing] = useState([3]);
  const [feathering, setFeathering] = useState([2]);
  const [showComparison, setShowComparison] = useState(false);
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
      toast({
        title: "Lädt High-Quality Modell",
        description: "Das spezialisierte U²-Net Hintergrund-Entfernungsmodell wird geladen..."
      });

      setProgress(20);
      
      // Load the image
      const imageElement = await loadImage(file);
      setProgress(40);

      // Try high-quality background removal models
      let backgroundRemover;
      try {
        // Try RMBG (high quality background removal)
        backgroundRemover = await pipeline(
          'image-segmentation', 
          'briaai/RMBG-1.4',
          { device: 'webgpu' }
        );
        toast({
          title: "High-Quality Modell geladen",
          description: "Verwende RMBG-1.4 für beste Qualität"
        });
      } catch (error) {
        console.log('RMBG model not available, trying alternative...');
        try {
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/u2net',
            { device: 'webgpu' }
          );
          toast({
            title: "U²-Net Modell geladen", 
            description: "Verwende U²-Net für hohe Qualität"
          });
        } catch (error2) {
          console.log('U2Net not available, using fallback...');
          backgroundRemover = await pipeline(
            'image-segmentation', 
            'Xenova/detr-resnet-50-panoptic',
            { device: 'webgpu' }
          );
        }
      }
      setProgress(60);

      // Convert image to canvas for processing with higher quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Use higher resolution for better quality (max 2048px)
      const maxSize = 2048;
      let { width, height } = imageElement;
      
      // Only resize if image is extremely large
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
            <div className="space-y-6">
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
                  disabled={isProcessing}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {isProcessing ? 'Verarbeitung...' : 'Hintergrund entfernen'}
                </Button>
              </div>
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
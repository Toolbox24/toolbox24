import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Crop, Image as ImageIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCrop = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setSelectedFile(null);
      setPreviewUrl("");
      setDownloadUrl("");
      setCropArea(null);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    const file = selectedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDownloadUrl("");
      setCropArea(null);
      setProgress(0);
      setIsProcessing(false);
      setDownloadUrl("");
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageRef.current) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Ensure coordinates are within image bounds
    const boundedX = Math.max(0, Math.min(x, canvas.width));
    const boundedY = Math.max(0, Math.min(y, canvas.height));
    
    setIsDragging(true);
    setDragStart({ x: boundedX, y: boundedY });
    setCropArea({ x: boundedX, y: boundedY, width: 0, height: 0 });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !canvasRef.current) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    
    // Ensure coordinates are within image bounds
    const boundedCurrentX = Math.max(0, Math.min(currentX, canvas.width));
    const boundedCurrentY = Math.max(0, Math.min(currentY, canvas.height));
    
    const width = boundedCurrentX - dragStart.x;
    const height = boundedCurrentY - dragStart.y;
    
    // Calculate proper crop area (handle negative width/height)
    const cropX = width < 0 ? boundedCurrentX : dragStart.x;
    const cropY = height < 0 ? boundedCurrentY : dragStart.y;
    const cropWidth = Math.abs(width);
    const cropHeight = Math.abs(height);
    
    setCropArea({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !previewUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx || !img.complete) return;
    
    // Set canvas size to match image natural dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    
    // Draw crop overlay if cropArea exists
    if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
      // Semi-transparent overlay over entire image
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear crop area (remove overlay from selected region)
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Redraw the image in the crop area
      ctx.drawImage(
        img, 
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height
      );
      
      // Draw crop border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Add corner handles for better UX
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      // Top-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
    }
  }, [previewUrl, cropArea]);

  // Add useEffect to redraw canvas when cropArea changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, cropArea]);

  const resetCrop = () => {
    setCropArea(null);
    setDownloadUrl("");
    drawCanvas();
  };

  const cropImage = async () => {
    if (!selectedFile || !cropArea || !imageRef.current) {
      toast.error("Bitte wählen Sie eine Datei und einen Ausschnittbereich");
      return;
    }

    if (cropArea.width < 10 || cropArea.height < 10) {
      toast.error("Der Ausschnittbereich ist zu klein");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context konnte nicht erstellt werden');
      }

      setProgress(25);

      const img = imageRef.current;
      
      // Set canvas to crop size
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      setProgress(50);

      // Draw cropped image
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );

      setProgress(75);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Konvertierung zu Blob fehlgeschlagen'));
          }
        }, selectedFile.type, 0.95);
      });

      setProgress(100);

      // Create download URL
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      toast.success(`Bild erfolgreich zugeschnitten! (${Math.round(cropArea.width)}×${Math.round(cropArea.height)}px)`);
    } catch (error) {
      console.error('Fehler beim Zuschneiden:', error);
      toast.error("Fehler beim Zuschneiden des Bildes");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCroppedImage = () => {
    if (!downloadUrl || !selectedFile || !cropArea) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `cropped_${Math.round(cropArea.width)}x${Math.round(cropArea.height)}_${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download gestartet!");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <Crop className="h-8 w-8 text-primary" />
            Bild zuschneiden
          </h1>
          <p className="page-description">
            Wählen Sie einen Bereich durch Ziehen aus und schneiden Sie Ihr Bild zurecht
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bild hochladen</CardTitle>
              <CardDescription>
                Unterstützte Formate: JPG, PNG, WEBP, GIF
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                accept={{"image/*": []}}
                maxSize={20 * 1024 * 1024}
                className="p-8"
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Klicken oder Datei hierher ziehen</p>
                  <p className="text-sm text-muted-foreground mt-2">Maximale Dateigröße: 20MB</p>
                </div>
              </FileUpload>
            </CardContent>
          </Card>

          {previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ausschnitt wählen
                  <Button variant="outline" onClick={resetCrop} size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Zurücksetzen
                  </Button>
                </CardTitle>
                <CardDescription>
                  Ziehen Sie mit der Maus einen Bereich zum Zuschneiden aus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative border rounded-lg overflow-hidden bg-checkered">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Vorschau"
                     className="hidden"
                     onLoad={() => {
                       // Small delay to ensure image is fully rendered
                       setTimeout(drawCanvas, 10);
                     }}
                  />
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="max-w-full cursor-crosshair block"
                    style={{ 
                      imageRendering: 'pixelated',
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                   {(!cropArea || cropArea.width === 0) && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white pointer-events-none">
                       <div className="text-center">
                         <Crop className="h-8 w-8 mx-auto mb-2" />
                         <p>Ziehen Sie einen Bereich zum Zuschneiden aus</p>
                       </div>
                     </div>
                   )}
                </div>

                {cropArea && cropArea.width > 0 && cropArea.height > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Ausgewählter Bereich: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} Pixel
                    </p>
                  </div>
                )}

                <Button 
                  onClick={cropImage} 
                  disabled={isProcessing || !cropArea || cropArea.width < 10 || cropArea.height < 10}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Crop className="mr-2 h-4 w-4 animate-pulse" />
                      Schneide zu...
                    </>
                  ) : (
                    <>
                      <Crop className="mr-2 h-4 w-4" />
                      Bild zuschneiden
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {downloadUrl && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Zuschneiden abgeschlossen
                </CardTitle>
                <CardDescription>
                  Neuer Ausschnitt: {cropArea && `${Math.round(cropArea.width)} × ${Math.round(cropArea.height)}`} Pixel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">Original</Badge>
                    <img 
                      src={previewUrl} 
                      alt="Original" 
                      className="max-w-full h-32 object-contain border rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">Zugeschnitten</Badge>
                    <img 
                      src={downloadUrl} 
                      alt="Zugeschnitten" 
                      className="max-w-full h-32 object-contain border rounded"
                    />
                  </div>
                </div>
                
                <Button onClick={downloadCroppedImage} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Zugeschnittenes Bild herunterladen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Crop className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Präzises Zuschneiden</h3>
            <p className="text-sm text-muted-foreground">
              Wählen Sie genau den Bildbereich aus, den Sie behalten möchten
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Live-Vorschau</h3>
            <p className="text-sm text-muted-foreground">
              Sehen Sie in Echtzeit, welcher Bereich ausgewählt ist
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Sofortiger Download</h3>
            <p className="text-sm text-muted-foreground">
              Laden Sie Ihren Bildausschnitt direkt herunter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCrop;
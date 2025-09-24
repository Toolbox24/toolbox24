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

type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l' | null;

const ImageCrop = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isMovingCrop, setIsMovingCrop] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
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

  const getEventCoordinates = useCallback((e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e && e.touches.length > 0) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      // Touch end event
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      // Mouse/Pointer event
      clientX = (e as React.MouseEvent | React.PointerEvent).clientX;
      clientY = (e as React.MouseEvent | React.PointerEvent).clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  }, []);

  const isPointInCropArea = useCallback((x: number, y: number) => {
    if (!cropArea || cropArea.width === 0 || cropArea.height === 0) return false;
    
    return x >= cropArea.x && 
           x <= cropArea.x + cropArea.width && 
           y >= cropArea.y && 
           y <= cropArea.y + cropArea.height;
  }, [cropArea]);

  const getResizeHandle = useCallback((x: number, y: number): ResizeHandle => {
    if (!cropArea || cropArea.width === 0 || cropArea.height === 0) return null;
    
    const handleSize = window.innerWidth <= 768 ? 30 : 20; // Touch-friendly handle size
    const tolerance = handleSize / 2;
    
    // Corner handles
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 'tl';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 'tr';
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'bl';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'br';
    
    // Side handles
    if (Math.abs(x - (cropArea.x + cropArea.width / 2)) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 't';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height / 2)) <= tolerance) return 'r';
    if (Math.abs(x - (cropArea.x + cropArea.width / 2)) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'b';
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height / 2)) <= tolerance) return 'l';
    
    return null;
  }, [cropArea]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const { x, y } = getEventCoordinates(e);
    
    // Ensure coordinates are within image bounds
    const boundedX = Math.max(0, Math.min(x, canvasRef.current.width));
    const boundedY = Math.max(0, Math.min(y, canvasRef.current.height));
    
    // Check for resize handles first
    const handle = getResizeHandle(boundedX, boundedY);
    if (handle) {
      e.preventDefault();
      e.stopPropagation();
      setActiveHandle(handle);
      setIsDragging(true);
      setDragStart({ x: boundedX, y: boundedY });
      canvasRef.current.setPointerCapture(e.pointerId);
      return;
    }
    
    // Check if touching inside existing crop area for moving
    if (cropArea && cropArea.width > 0 && isPointInCropArea(boundedX, boundedY)) {
      // Moving existing crop area
      e.preventDefault();
      e.stopPropagation();
      setIsMovingCrop(true);
      setIsDragging(true);
      setDragStart({ x: boundedX, y: boundedY });
      canvasRef.current.setPointerCapture(e.pointerId);
    } else if (!cropArea || cropArea.width === 0) {
      // Creating new crop area only if none exists
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: boundedX, y: boundedY });
      setCropArea({ x: boundedX, y: boundedY, width: 0, height: 0 });
      canvasRef.current.setPointerCapture(e.pointerId);
    }
    // If touching outside existing crop area, allow normal scrolling (don't prevent default)
  }, [getEventCoordinates, cropArea, isPointInCropArea, getResizeHandle]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const { x: currentX, y: currentY } = getEventCoordinates(e);
    
    // Ensure coordinates are within image bounds
    const boundedCurrentX = Math.max(0, Math.min(currentX, canvasRef.current.width));
    const boundedCurrentY = Math.max(0, Math.min(currentY, canvasRef.current.height));
    
    if (activeHandle && cropArea) {
      // Resize crop area using handles
      const deltaX = boundedCurrentX - dragStart.x;
      const deltaY = boundedCurrentY - dragStart.y;
      
      let newX = cropArea.x;
      let newY = cropArea.y;
      let newWidth = cropArea.width;
      let newHeight = cropArea.height;
      
      switch (activeHandle) {
        case 'tl': // Top-left
          newX = Math.max(0, cropArea.x + deltaX);
          newY = Math.max(0, cropArea.y + deltaY);
          newWidth = Math.max(10, cropArea.width - deltaX);
          newHeight = Math.max(10, cropArea.height - deltaY);
          break;
        case 'tr': // Top-right
          newY = Math.max(0, cropArea.y + deltaY);
          newWidth = Math.max(10, cropArea.width + deltaX);
          newHeight = Math.max(10, cropArea.height - deltaY);
          break;
        case 'bl': // Bottom-left
          newX = Math.max(0, cropArea.x + deltaX);
          newWidth = Math.max(10, cropArea.width - deltaX);
          newHeight = Math.max(10, cropArea.height + deltaY);
          break;
        case 'br': // Bottom-right
          newWidth = Math.max(10, cropArea.width + deltaX);
          newHeight = Math.max(10, cropArea.height + deltaY);
          break;
        case 't': // Top
          newY = Math.max(0, cropArea.y + deltaY);
          newHeight = Math.max(10, cropArea.height - deltaY);
          break;
        case 'r': // Right
          newWidth = Math.max(10, cropArea.width + deltaX);
          break;
        case 'b': // Bottom
          newHeight = Math.max(10, cropArea.height + deltaY);
          break;
        case 'l': // Left
          newX = Math.max(0, cropArea.x + deltaX);
          newWidth = Math.max(10, cropArea.width - deltaX);
          break;
      }
      
      // Ensure crop area doesn't go outside canvas bounds
      if (newX + newWidth > canvasRef.current.width) {
        newWidth = canvasRef.current.width - newX;
      }
      if (newY + newHeight > canvasRef.current.height) {
        newHeight = canvasRef.current.height - newY;
      }
      
      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      setDragStart({ x: boundedCurrentX, y: boundedCurrentY });
    } else if (isMovingCrop && cropArea) {
      // Move existing crop area
      const deltaX = boundedCurrentX - dragStart.x;
      const deltaY = boundedCurrentY - dragStart.y;
      
      const newX = Math.max(0, Math.min(cropArea.x + deltaX, canvasRef.current.width - cropArea.width));
      const newY = Math.max(0, Math.min(cropArea.y + deltaY, canvasRef.current.height - cropArea.height));
      
      setCropArea({
        ...cropArea,
        x: newX,
        y: newY
      });
      
      setDragStart({ x: boundedCurrentX, y: boundedCurrentY });
    } else {
      // Create new crop area
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
    }
  }, [isDragging, dragStart, getEventCoordinates, isMovingCrop, cropArea, activeHandle]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setIsMovingCrop(false);
    setActiveHandle(null);
    setDragStart(null);
    
    // Release pointer capture
    canvasRef.current.releasePointerCapture(e.pointerId);
  }, []);

  // Touch event handlers as fallback for iOS Safari
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageRef.current || e.touches.length !== 1) return;
    
    const { x, y } = getEventCoordinates(e);
    
    // Ensure coordinates are within image bounds
    const boundedX = Math.max(0, Math.min(x, canvasRef.current.width));
    const boundedY = Math.max(0, Math.min(y, canvasRef.current.height));
    
    // Check for resize handles first
    const handle = getResizeHandle(boundedX, boundedY);
    if (handle) {
      e.preventDefault();
      e.stopPropagation();
      setActiveHandle(handle);
      setIsDragging(true);
      setDragStart({ x: boundedX, y: boundedY });
      return;
    }
    
    // Check if touching inside existing crop area for moving
    if (cropArea && cropArea.width > 0 && isPointInCropArea(boundedX, boundedY)) {
      // Moving existing crop area
      e.preventDefault();
      e.stopPropagation();
      setIsMovingCrop(true);
      setIsDragging(true);
      setDragStart({ x: boundedX, y: boundedY });
    } else if (!cropArea || cropArea.width === 0) {
      // Creating new crop area only if none exists
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: boundedX, y: boundedY });
      setCropArea({ x: boundedX, y: boundedY, width: 0, height: 0 });
    }
    // If touching outside existing crop area, allow normal scrolling (don't prevent default)
  }, [getEventCoordinates, cropArea, isPointInCropArea, getResizeHandle]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !canvasRef.current || e.touches.length !== 1) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const { x: currentX, y: currentY } = getEventCoordinates(e);
    
    // Ensure coordinates are within image bounds
    const boundedCurrentX = Math.max(0, Math.min(currentX, canvasRef.current.width));
    const boundedCurrentY = Math.max(0, Math.min(currentY, canvasRef.current.height));
    
    if (activeHandle && cropArea) {
      // Resize crop area using handles
      const deltaX = boundedCurrentX - dragStart.x;
      const deltaY = boundedCurrentY - dragStart.y;
      
      let newX = cropArea.x;
      let newY = cropArea.y;
      let newWidth = cropArea.width;
      let newHeight = cropArea.height;
      
      switch (activeHandle) {
        case 'tl': // Top-left
          newX = Math.max(0, cropArea.x + deltaX);
          newY = Math.max(0, cropArea.y + deltaY);
          newWidth = Math.max(10, cropArea.width - deltaX);
          newHeight = Math.max(10, cropArea.height - deltaY);
          break;
        case 'tr': // Top-right
          newY = Math.max(0, cropArea.y + deltaY);
          newWidth = Math.max(10, cropArea.width + deltaX);
          newHeight = Math.max(10, cropArea.height - deltaY);
          break;
        case 'bl': // Bottom-left
          newX = Math.max(0, cropArea.x + deltaX);
          newWidth = Math.max(10, cropArea.width - deltaX);
          newHeight = Math.max(10, cropArea.height + deltaY);
          break;
        case 'br': // Bottom-right
          newWidth = Math.max(10, cropArea.width + deltaX);
          newHeight = Math.max(10, cropArea.height + deltaY);
          break;
        case 't': // Top
          newY = Math.max(0, cropArea.y + deltaY);
          newHeight = Math.max(10, cropArea.height - deltaY);
          break;
        case 'r': // Right
          newWidth = Math.max(10, cropArea.width + deltaX);
          break;
        case 'b': // Bottom
          newHeight = Math.max(10, cropArea.height + deltaY);
          break;
        case 'l': // Left
          newX = Math.max(0, cropArea.x + deltaX);
          newWidth = Math.max(10, cropArea.width - deltaX);
          break;
      }
      
      // Ensure crop area doesn't go outside canvas bounds
      if (newX + newWidth > canvasRef.current.width) {
        newWidth = canvasRef.current.width - newX;
      }
      if (newY + newHeight > canvasRef.current.height) {
        newHeight = canvasRef.current.height - newY;
      }
      
      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      setDragStart({ x: boundedCurrentX, y: boundedCurrentY });
    } else if (isMovingCrop && cropArea) {
      // Move existing crop area
      const deltaX = boundedCurrentX - dragStart.x;
      const deltaY = boundedCurrentY - dragStart.y;
      
      const newX = Math.max(0, Math.min(cropArea.x + deltaX, canvasRef.current.width - cropArea.width));
      const newY = Math.max(0, Math.min(cropArea.y + deltaY, canvasRef.current.height - cropArea.height));
      
      setCropArea({
        ...cropArea,
        x: newX,
        y: newY
      });
      
      setDragStart({ x: boundedCurrentX, y: boundedCurrentY });
    } else {
      // Create new crop area
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
    }
  }, [isDragging, dragStart, getEventCoordinates, isMovingCrop, cropArea, activeHandle]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setIsMovingCrop(false);
    setActiveHandle(null);
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
      
      // Draw resize handles (larger for mobile touch targets)
      const handleSize = window.innerWidth <= 768 ? 30 : 20;
      const halfHandle = handleSize / 2;
      
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      // Corner handles
      const drawHandle = (x: number, y: number) => {
        ctx.fillRect(x - halfHandle, y - halfHandle, handleSize, handleSize);
        ctx.strokeRect(x - halfHandle, y - halfHandle, handleSize, handleSize);
      };
      
      // Top-left
      drawHandle(cropArea.x, cropArea.y);
      // Top-right
      drawHandle(cropArea.x + cropArea.width, cropArea.y);
      // Bottom-left
      drawHandle(cropArea.x, cropArea.y + cropArea.height);
      // Bottom-right
      drawHandle(cropArea.x + cropArea.width, cropArea.y + cropArea.height);
      
      // Side handles (smaller)
      const sideHandleSize = window.innerWidth <= 768 ? 24 : 16;
      const halfSideHandle = sideHandleSize / 2;
      
      const drawSideHandle = (x: number, y: number) => {
        ctx.fillRect(x - halfSideHandle, y - halfSideHandle, sideHandleSize, sideHandleSize);
        ctx.strokeRect(x - halfSideHandle, y - halfSideHandle, sideHandleSize, sideHandleSize);
      };
      
      // Top
      drawSideHandle(cropArea.x + cropArea.width / 2, cropArea.y);
      // Right
      drawSideHandle(cropArea.x + cropArea.width, cropArea.y + cropArea.height / 2);
      // Bottom
      drawSideHandle(cropArea.x + cropArea.width / 2, cropArea.y + cropArea.height);
      // Left
      drawSideHandle(cropArea.x, cropArea.y + cropArea.height / 2);
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
                <CardTitle>
                  Ausschnitt wählen
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
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="max-w-full cursor-crosshair block touch-none"
                    style={{ 
                      imageRendering: 'pixelated',
                      width: '100%',
                      height: 'auto',
                      touchAction: 'none'
                    }}
                  />
                   {(!cropArea || cropArea.width === 0) && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white pointer-events-none">
                       <div className="text-center px-4">
                         <Crop className="h-8 w-8 mx-auto mb-2" />
                         <p className="text-sm md:text-base">Ziehen Sie einen Bereich zum Zuschneiden aus</p>
                         <p className="text-xs md:text-sm opacity-80 mt-1">Auf Mobile: Mit dem Finger ziehen</p>
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

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={cropImage} 
                    disabled={isProcessing || !cropArea || cropArea.width < 10 || cropArea.height < 10}
                    className="flex-1"
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
                  
                  <Button 
                    variant="outline" 
                    onClick={resetCrop} 
                    disabled={isProcessing}
                    className="sm:w-auto"
                    size="lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Zurücksetzen
                  </Button>
                </div>

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
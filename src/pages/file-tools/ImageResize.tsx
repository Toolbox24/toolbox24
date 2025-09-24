import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Download, RefreshCw, Image as ImageIcon, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

const ImageResize = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [newWidth, setNewWidth] = useState<number>(0);
  const [newHeight, setNewHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setSelectedFile(null);
      setPreviewUrl("");
      setDownloadUrl("");
      setOriginalDimensions(null);
      setNewWidth(0);
      setNewHeight(0);
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
      setProgress(0);
      setIsProcessing(false);
      
      // Get original dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setNewWidth(img.width);
        setNewHeight(img.height);
      };
      img.src = url;
    }
  };

  const calculateAspectRatio = (width: number, height: number) => {
    if (!originalDimensions) return { width, height };
    const aspectRatio = originalDimensions.width / originalDimensions.height;
    
    if (width && !height) {
      return { width, height: Math.round(width / aspectRatio) };
    } else if (height && !width) {
      return { width: Math.round(height * aspectRatio), height };
    }
    
    return { width, height };
  };

  const handleWidthChange = (value: string) => {
    const width = parseInt(value) || 0;
    setNewWidth(width);
    
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setNewHeight(Math.round(width / aspectRatio));
    }
  };

  const handleHeightChange = (value: string) => {
    const height = parseInt(value) || 0;
    setNewHeight(height);
    
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setNewWidth(Math.round(height * aspectRatio));
    }
  };

  const resizeImage = async () => {
    if (!selectedFile || !newWidth || !newHeight) {
      toast.error("Bitte wählen Sie eine Datei und geben Sie gültige Abmessungen ein");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Create canvas and load image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context konnte nicht erstellt werden');
      }

      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(selectedFile);
      });

      setProgress(25);

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      setProgress(50);

      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

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
      
      toast.success(`Bild erfolgreich auf ${newWidth}x${newHeight} skaliert!`);
    } catch (error) {
      console.error('Fehler beim Skalieren:', error);
      toast.error("Fehler beim Skalieren des Bildes");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResizedImage = () => {
    if (!downloadUrl || !selectedFile) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `resized_${newWidth}x${newHeight}_${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download gestartet!");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <RefreshCw className="h-8 w-8 text-primary" />
            Bildgröße ändern
          </h1>
          <p className="page-description">
            Skalieren Sie Ihre Bilder auf eine neue Größe mit anpassbaren Abmessungen
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

          {selectedFile && originalDimensions && (
            <Card>
              <CardHeader>
                <CardTitle>Größe anpassen</CardTitle>
                <CardDescription>
                  Aktuelle Größe: {originalDimensions.width} × {originalDimensions.height} Pixel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  {maintainAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  <Switch
                    checked={maintainAspectRatio}
                    onCheckedChange={setMaintainAspectRatio}
                  />
                  <Label>Seitenverhältnis beibehalten</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Breite (Pixel)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={newWidth || ''}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      min="1"
                      max="8000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Höhe (Pixel)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={newHeight || ''}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      min="1"
                      max="8000"
                    />
                  </div>
                </div>

                <Button 
                  onClick={resizeImage} 
                  disabled={isProcessing || !newWidth || !newHeight}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Skaliere...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Bild skalieren
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
                  Skalierung abgeschlossen
                </CardTitle>
                <CardDescription>
                  Neue Größe: {newWidth} × {newHeight} Pixel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">Original</Badge>
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Original" 
                        className="max-w-full h-32 object-contain border rounded"
                      />
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {originalDimensions?.width} × {originalDimensions?.height}px
                    </p>
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">Skaliert</Badge>
                    {downloadUrl && (
                      <img 
                        src={downloadUrl} 
                        alt="Skaliert" 
                        className="max-w-full h-32 object-contain border rounded"
                      />
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {newWidth} × {newHeight}px
                    </p>
                  </div>
                </div>
                
                <Button onClick={downloadResizedImage} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Skaliertes Bild herunterladen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Präzise Skalierung</h3>
            <p className="text-sm text-muted-foreground">
              Geben Sie exakte Pixel-Werte ein oder lassen Sie das Seitenverhältnis automatisch berechnen
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Seitenverhältnis</h3>
            <p className="text-sm text-muted-foreground">
              Behalten Sie das ursprüngliche Seitenverhältnis bei oder passen Sie es individuell an
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Sofortiger Download</h3>
            <p className="text-sm text-muted-foreground">
              Laden Sie Ihr skaliertes Bild direkt herunter - alles läuft offline in Ihrem Browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResize;
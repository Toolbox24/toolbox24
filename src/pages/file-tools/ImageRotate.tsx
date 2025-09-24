import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Image as ImageIcon, RotateCwSquare } from "lucide-react";
import { toast } from "sonner";

type RotationType = 'rotate90' | 'rotate180' | 'rotate270' | 'flipH' | 'flipV';

const ImageRotate = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [appliedTransform, setAppliedTransform] = useState<string>("");

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setSelectedFile(null);
      setPreviewUrl("");
      setDownloadUrl("");
      setAppliedTransform("");
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
      setAppliedTransform("");
      setProgress(0);
      setIsProcessing(false);
    }
  };

  const transformImage = async (transformType: RotationType) => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie zuerst eine Datei aus");
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

      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(selectedFile);
      });

      setProgress(50);

      let transformName = "";
      
      // Set canvas dimensions based on transformation
      switch (transformType) {
        case 'rotate90':
        case 'rotate270':
          canvas.width = img.height;
          canvas.height = img.width;
          transformName = transformType === 'rotate90' ? "90° im Uhrzeigersinn gedreht" : "270° im Uhrzeigersinn gedreht";
          break;
        case 'rotate180':
          canvas.width = img.width;
          canvas.height = img.height;
          transformName = "180° gedreht";
          break;
        case 'flipH':
        case 'flipV':
          canvas.width = img.width;
          canvas.height = img.height;
          transformName = transformType === 'flipH' ? "horizontal gespiegelt" : "vertikal gespiegelt";
          break;
      }

      // Apply transformation
      ctx.save();
      
      switch (transformType) {
        case 'rotate90':
          ctx.translate(canvas.width, 0);
          ctx.rotate(Math.PI / 2);
          break;
        case 'rotate180':
          ctx.translate(canvas.width, canvas.height);
          ctx.rotate(Math.PI);
          break;
        case 'rotate270':
          ctx.translate(0, canvas.height);
          ctx.rotate(-Math.PI / 2);
          break;
        case 'flipH':
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          break;
        case 'flipV':
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
          break;
      }

      ctx.drawImage(img, 0, 0);
      ctx.restore();

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
      setAppliedTransform(transformName);
      
      toast.success(`Bild erfolgreich ${transformName}!`);
    } catch (error) {
      console.error('Fehler bei der Transformation:', error);
      toast.error("Fehler bei der Bildtransformation");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTransformedImage = () => {
    if (!downloadUrl || !selectedFile) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `transformed_${selectedFile.name}`;
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
            <RotateCwSquare className="h-8 w-8 text-primary" />
            Bild drehen & spiegeln
          </h1>
          <p className="page-description">
            Drehen Sie Bilder um 90°, 180°, 270° oder spiegeln Sie sie horizontal/vertikal
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

          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle>Transformation wählen</CardTitle>
                <CardDescription>
                  Wählen Sie eine Drehung oder Spiegelung für Ihr Bild
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {previewUrl && (
                  <div className="flex justify-center mb-6">
                    <img 
                      src={previewUrl} 
                      alt="Vorschau" 
                      className="max-w-full max-h-64 object-contain border rounded"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => transformImage('rotate90')}
                    disabled={isProcessing}
                    className="h-20 flex-col gap-2"
                  >
                    <RotateCw className="h-6 w-6" />
                    <span className="text-sm">90° drehen</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => transformImage('rotate180')}
                    disabled={isProcessing}
                    className="h-20 flex-col gap-2"
                  >
                    <RotateCw className="h-6 w-6" />
                    <span className="text-sm">180° drehen</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => transformImage('rotate270')}
                    disabled={isProcessing}
                    className="h-20 flex-col gap-2"
                  >
                    <RotateCcw className="h-6 w-6" />
                    <span className="text-sm">270° drehen</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => transformImage('flipH')}
                    disabled={isProcessing}
                    className="h-20 flex-col gap-2"
                  >
                    <FlipHorizontal className="h-6 w-6" />
                    <span className="text-sm">Horizontal spiegeln</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => transformImage('flipV')}
                    disabled={isProcessing}
                    className="h-20 flex-col gap-2"
                  >
                    <FlipVertical className="h-6 w-6" />
                    <span className="text-sm">Vertikal spiegeln</span>
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Verarbeitung läuft...</span>
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
                  Transformation abgeschlossen
                </CardTitle>
                <CardDescription>
                  Bild wurde {appliedTransform}
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
                    <Badge variant="outline" className="mb-2">Transformiert</Badge>
                    <img 
                      src={downloadUrl} 
                      alt="Transformiert" 
                      className="max-w-full h-32 object-contain border rounded"
                    />
                  </div>
                </div>
                
                <Button onClick={downloadTransformedImage} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Transformiertes Bild herunterladen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <RotateCw className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Präzise Drehung</h3>
            <p className="text-sm text-muted-foreground">
              Drehen Sie Bilder in exakten 90°-Schritten ohne Qualitätsverlust
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <FlipHorizontal className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Spiegelung</h3>
            <p className="text-sm text-muted-foreground">
              Spiegeln Sie Bilder horizontal oder vertikal für kreative Effekte
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Sofortiger Download</h3>
            <p className="text-sm text-muted-foreground">
              Laden Sie Ihr transformiertes Bild direkt herunter - alles offline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageRotate;
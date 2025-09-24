import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Image as ImageIcon, FileImage } from "lucide-react";
import { toast } from "sonner";

type ConversionType = 'webp-to-jpg' | 'webp-to-png' | 'jpg-to-webp' | 'png-to-webp';

const WebPConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [conversionType, setConversionType] = useState<ConversionType>('webp-to-jpg');
  const [quality, setQuality] = useState(85);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setSelectedFile(null);
      setPreviewUrl("");
      setDownloadUrl("");
      setOriginalSize(0);
      setConvertedSize(0);
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    const file = selectedFiles[0];
    if (file) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDownloadUrl("");
      setConvertedSize(0);
      setProgress(0);
      setIsProcessing(false);
      
      // Auto-detect conversion type based on file
      if (file.type === 'image/webp') {
        setConversionType('webp-to-jpg');
      } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        setConversionType('jpg-to-webp');
      } else if (file.type === 'image/png') {
        setConversionType('png-to-webp');
      }
    }
  };

  const convertImage = async () => {
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

      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image with background for JPG
      if (conversionType === 'webp-to-jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      setProgress(75);

      // Determine output format and quality
      let outputType: string;
      let outputQuality: number;
      
      switch (conversionType) {
        case 'webp-to-jpg':
          outputType = 'image/jpeg';
          outputQuality = quality / 100;
          break;
        case 'webp-to-png':
          outputType = 'image/png';
          outputQuality = 1;
          break;
        case 'jpg-to-webp':
        case 'png-to-webp':
          outputType = 'image/webp';
          outputQuality = quality / 100;
          break;
        default:
          throw new Error('Unbekannter Konvertierungstyp');
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Konvertierung zu Blob fehlgeschlagen'));
          }
        }, outputType, outputQuality);
      });

      setProgress(100);
      setConvertedSize(blob.size);

      // Create download URL
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      const targetFormat = getTargetFormat();
      toast.success(`Bild erfolgreich zu ${targetFormat} konvertiert!`);
    } catch (error) {
      console.error('Fehler bei der Konvertierung:', error);
      toast.error("Fehler bei der Bildkonvertierung");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTargetFormat = (): string => {
    switch (conversionType) {
      case 'webp-to-jpg': return 'JPG';
      case 'webp-to-png': return 'PNG';
      case 'jpg-to-webp':
      case 'png-to-webp': return 'WEBP';
      default: return '';
    }
  };

  const getFileExtension = (): string => {
    switch (conversionType) {
      case 'webp-to-jpg': return '.jpg';
      case 'webp-to-png': return '.png';
      case 'jpg-to-webp':
      case 'png-to-webp': return '.webp';
      default: return '';
    }
  };

  const downloadConvertedImage = () => {
    if (!downloadUrl || !selectedFile) return;
    
    const extension = getFileExtension();
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${baseName}${extension}`;
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

  const getSavingsPercentage = (): number => {
    if (originalSize === 0 || convertedSize === 0) return 0;
    return Math.round(((originalSize - convertedSize) / originalSize) * 100);
  };

  const needsQualitySetting = () => {
    return conversionType === 'webp-to-jpg' || conversionType === 'jpg-to-webp' || conversionType === 'png-to-webp';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <FileImage className="h-8 w-8 text-primary" />
            WEBP Konverter
          </h1>
          <p className="page-description">
            Konvertieren Sie zwischen WEBP und JPG/PNG Formaten
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bild hochladen</CardTitle>
              <CardDescription>
                Unterstützte Formate: WEBP, PNG, JPG, JPEG
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                accept={{"image/webp": [], "image/png": [], "image/jpeg": [], "image/jpg": []}}
                maxSize={20 * 1024 * 1024}
                className="p-8"
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Klicken oder Datei hierher ziehen</p>
                  <p className="text-sm text-muted-foreground mt-2">WEBP, PNG oder JPG, max. 20MB</p>
                </div>
              </FileUpload>
            </CardContent>
          </Card>

          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle>Konvertierung wählen</CardTitle>
                <CardDescription>
                  Aktuelles Format: {selectedFile.type}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant={conversionType === 'webp-to-jpg' ? 'default' : 'outline'}
                    onClick={() => setConversionType('webp-to-jpg')}
                    className="h-16 flex-col gap-2"
                  >
                    <span className="font-semibold">WEBP → JPG</span>
                    <span className="text-xs opacity-75">Universelle Kompatibilität</span>
                  </Button>
                  
                  <Button 
                    variant={conversionType === 'webp-to-png' ? 'default' : 'outline'}
                    onClick={() => setConversionType('webp-to-png')}
                    className="h-16 flex-col gap-2"
                  >
                    <span className="font-semibold">WEBP → PNG</span>
                    <span className="text-xs opacity-75">Transparenz erhalten</span>
                  </Button>
                  
                  <Button 
                    variant={conversionType === 'jpg-to-webp' ? 'default' : 'outline'}
                    onClick={() => setConversionType('jpg-to-webp')}
                    className="h-16 flex-col gap-2"
                  >
                    <span className="font-semibold">JPG → WEBP</span>
                    <span className="text-xs opacity-75">Moderne Kompression</span>
                  </Button>
                  
                  <Button 
                    variant={conversionType === 'png-to-webp' ? 'default' : 'outline'}
                    onClick={() => setConversionType('png-to-webp')}
                    className="h-16 flex-col gap-2"
                  >
                    <span className="font-semibold">PNG → WEBP</span>
                    <span className="text-xs opacity-75">Kleinere Dateigröße</span>
                  </Button>
                </div>

                {needsQualitySetting() && (
                  <div className="space-y-4">
                    <Label>Qualität: {quality}%</Label>
                    <Slider
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Kleinere Datei</span>
                      <span>Höhere Qualität</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={convertImage} 
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Konvertiere...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Zu {getTargetFormat()} konvertieren
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
                  Konvertierung abgeschlossen
                </CardTitle>
                <CardDescription>
                  Format: {getTargetFormat()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <Badge variant="outline" className="mb-2">Original</Badge>
                    <p className="text-sm font-medium">{formatFileSize(originalSize)}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile?.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Konvertiert</Badge>
                    <p className="text-sm font-medium">{formatFileSize(convertedSize)}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTargetFormat()}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Einsparung</Badge>
                    <p className="text-sm font-medium">
                      {getSavingsPercentage() > 0 ? `${getSavingsPercentage()}%` : 'Größer'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getSavingsPercentage() > 0 ? 'kleiner' : 'als Original'}
                    </p>
                  </div>
                </div>
                
                <Button onClick={downloadConvertedImage} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Konvertiertes Bild herunterladen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <FileImage className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Moderne Kompression</h3>
            <p className="text-sm text-muted-foreground">
              WEBP bietet bis zu 30% kleinere Dateien bei gleicher Qualität im Vergleich zu JPG
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Flexible Konvertierung</h3>
            <p className="text-sm text-muted-foreground">
              Konvertieren Sie in beide Richtungen je nach Ihren Kompatibilitätsanforderungen
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Sofortiger Download</h3>
            <p className="text-sm text-muted-foreground">
              Laden Sie Ihr konvertiertes Bild direkt herunter - alles offline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebPConverter;
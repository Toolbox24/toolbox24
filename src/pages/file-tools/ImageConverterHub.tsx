import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, RefreshCw, Image as ImageIcon, FileImage, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type ConversionType = 'png-to-jpg' | 'jpg-to-png' | 'webp-to-jpg' | 'webp-to-png' | 'heic-to-jpg' | 'heic-to-png' | 'avif-to-jpg' | 'avif-to-png' | 'gif-to-mp4';

const ImageConverterHub = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [conversionType, setConversionType] = useState<ConversionType>('png-to-jpg');
  const [quality, setQuality] = useState(90);
  const [removeExif, setRemoveExif] = useState(false);
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);

  const presets = [
    { type: 'png-to-jpg' as ConversionType, label: 'PNG → JPG', description: 'Kleinere Dateigröße' },
    { type: 'jpg-to-png' as ConversionType, label: 'JPG → PNG', description: 'Transparenz unterstützt' },
    { type: 'webp-to-jpg' as ConversionType, label: 'WEBP → JPG', description: 'Universelle Kompatibilität' },
    { type: 'webp-to-png' as ConversionType, label: 'WEBP → PNG', description: 'Mit Transparenz' },
    { type: 'heic-to-jpg' as ConversionType, label: 'HEIC → JPG', description: 'iOS Fotos konvertieren' },
    { type: 'heic-to-png' as ConversionType, label: 'HEIC → PNG', description: 'iOS mit Transparenz' },
    { type: 'avif-to-jpg' as ConversionType, label: 'AVIF → JPG', description: 'Moderne zu klassisch' },
    { type: 'avif-to-png' as ConversionType, label: 'AVIF → PNG', description: 'Verlustfrei' },
    { type: 'gif-to-mp4' as ConversionType, label: 'GIF → MP4', description: 'Animationen optimieren' },
  ];

  const getSupportedTargets = (sourceType: string): ConversionType[] => {
    const type = sourceType.split('/')[1];
    switch (type) {
      case 'png':
        return ['png-to-jpg'];
      case 'jpeg':
      case 'jpg':
        return ['jpg-to-png'];
      case 'webp':
        return ['webp-to-jpg', 'webp-to-png'];
      case 'heic':
        return ['heic-to-jpg', 'heic-to-png'];
      case 'avif':
        return ['avif-to-jpg', 'avif-to-png'];
      case 'gif':
        return ['gif-to-mp4'];
      default:
        return [];
    }
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    setDownloadUrls([]);
    
    // Auto-detect conversion type based on first file
    const firstFile = files[0];
    const supportedTargets = getSupportedTargets(firstFile.type);
    if (supportedTargets.length > 0) {
      setConversionType(supportedTargets[0]);
    }
  };

  const convertImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Bitte wählen Sie zuerst Dateien aus");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const urls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProgress((i / selectedFiles.length) * 100);

        if (conversionType === 'gif-to-mp4') {
          // For GIF to MP4, we'd need ffmpeg.wasm - simplified for now
          toast.error("GIF zu MP4 Konvertierung wird noch implementiert");
          continue;
        }

        if (conversionType.includes('heic') || conversionType.includes('avif')) {
          // For HEIC/AVIF, we'd need special decoders - simplified for now
          toast.error("HEIC/AVIF Konvertierung wird noch implementiert");
          continue;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;

        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        // Set canvas dimensions (with optional resize)
        const width = customWidth > 0 ? customWidth : img.width;
        const height = customHeight > 0 ? customHeight : img.height;
        
        canvas.width = width;
        canvas.height = height;

        // Draw image
        if (conversionType.includes('jpg')) {
          // Fill white background for JPG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format and quality
        const outputType = conversionType.includes('jpg') ? 'image/jpeg' : 'image/png';
        const outputQuality = conversionType.includes('jpg') ? quality / 100 : 1;

        // Convert to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Konvertierung fehlgeschlagen'));
            }
          }, outputType, outputQuality);
        });

        const url = URL.createObjectURL(blob);
        urls.push(url);
      }

      setProgress(100);
      setDownloadUrls(urls);
      
      toast.success(`${selectedFiles.length} Bild(er) erfolgreich konvertiert!`);
    } catch (error) {
      console.error('Fehler bei der Konvertierung:', error);
      toast.error("Fehler bei der Bildkonvertierung");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllImages = () => {
    downloadUrls.forEach((url, index) => {
      const file = selectedFiles[index];
      const extension = conversionType.includes('jpg') ? '.jpg' : '.png';
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}-converted${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    
    toast.success("Downloads gestartet!");
  };

  const supportedTargets = selectedFiles.length > 0 ? getSupportedTargets(selectedFiles[0].type) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <FileImage className="h-10 w-10 text-primary" />
            Bild Konverter
          </h1>
          <p className="text-xl text-muted-foreground">
            Konvertieren Sie Bilder zwischen verschiedenen Formaten - kostenlos und direkt im Browser
          </p>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Beliebte Konvertierungen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presets.slice(0, 6).map((preset) => (
              <Card key={preset.type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setConversionType(preset.type)}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-semibold">{preset.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Direkte Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/bild/png-zu-jpg">PNG → JPG</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/bild/jpg-zu-png">JPG → PNG</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/bild/webp-zu-jpg">WEBP → JPG</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/bild/heic-zu-jpg">HEIC → JPG</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bilder hochladen</CardTitle>
              <CardDescription>
                Unterstützte Formate: PNG, JPG, JPEG, WEBP, HEIC, AVIF, GIF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept={{
                  "image/png": [],
                  "image/jpeg": [],
                  "image/jpg": [],
                  "image/webp": [],
                  "image/heic": [],
                  "image/avif": [],
                  "image/gif": []
                }}
                maxSize={50 * 1024 * 1024}
                multiple={true}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8"
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Klicken oder Dateien hierher ziehen</p>
                  <p className="text-sm text-muted-foreground mt-2">Mehrere Dateien, max. 50MB pro Datei</p>
                </div>
              </FileUpload>
            </CardContent>
          </Card>

          {selectedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Konvertierung konfigurieren</CardTitle>
                <CardDescription>
                  {selectedFiles.length} Datei(en) ausgewählt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Target Format Selection */}
                {supportedTargets.length > 0 && (
                  <div className="space-y-3">
                    <Label>Ziel-Format wählen:</Label>
                    <div className="flex flex-wrap gap-2">
                      {supportedTargets.map((target) => {
                        const preset = presets.find(p => p.type === target);
                        return (
                          <Button
                            key={target}
                            variant={conversionType === target ? 'default' : 'outline'}
                            onClick={() => setConversionType(target)}
                            size="sm"
                          >
                            {preset?.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quality Slider for JPG */}
                {conversionType.includes('jpg') && (
                  <div className="space-y-4">
                    <Label>JPG Qualität: {quality}%</Label>
                    <Slider
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                {/* EXIF Options */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remove-exif"
                    checked={removeExif}
                    onCheckedChange={setRemoveExif}
                  />
                  <Label htmlFor="remove-exif">EXIF-Daten entfernen</Label>
                </div>

                {/* Custom Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Breite (optional)</Label>
                    <input
                      id="width"
                      type="number"
                      value={customWidth || ''}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                      className="w-full p-2 border rounded"
                      placeholder="Auto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Höhe (optional)</Label>
                    <input
                      id="height"
                      type="number"
                      value={customHeight || ''}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                      className="w-full p-2 border rounded"
                      placeholder="Auto"
                    />
                  </div>
                </div>

                <Button 
                  onClick={convertImages} 
                  disabled={isProcessing || supportedTargets.length === 0}
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
                      {selectedFiles.length} Bild(er) konvertieren
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {downloadUrls.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Konvertierung abgeschlossen
                </CardTitle>
                <CardDescription>
                  {downloadUrls.length} Datei(en) bereit zum Download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadAllImages} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Alle konvertierten Bilder herunterladen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageConverterHub;
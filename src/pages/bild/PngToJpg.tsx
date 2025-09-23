import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Image as ImageIcon, FileImage, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const PngToJpg = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [quality, setQuality] = useState(90);

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      // Reset all states when file is removed
      setSelectedFile(null);
      setPreviewUrl("");
      setDownloadUrl("");
      setProgress(0);
      setIsProcessing(false);
      return;
    }
    
    const file = selectedFiles[0];
    if (file && file.type === 'image/png') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDownloadUrl("");
      setProgress(0);
      setIsProcessing(false);
    } else {
      toast.error("Bitte wählen Sie eine PNG-Datei aus");
    }
  };

  const convertImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context konnte nicht erstellt werden');

      setProgress(25);

      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(selectedFile);
      });

      setProgress(50);

      canvas.width = img.width;
      canvas.height = img.height;

      // Fill white background for JPG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      setProgress(75);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Konvertierung zu Blob fehlgeschlagen'));
          }
        }, 'image/jpeg', quality / 100);
      });

      setProgress(100);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      toast.success("PNG erfolgreich zu JPG konvertiert!");
    } catch (error) {
      console.error('Fehler bei der Konvertierung:', error);
      toast.error("Fehler bei der Bildkonvertierung");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadConvertedImage = () => {
    if (!downloadUrl || !selectedFile) return;
    
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${baseName}-converted.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download gestartet!");
  };

  return (
    <>
      <Helmet>
        <title>PNG zu JPG umwandeln – kostenlos & online (ohne Upload)</title>
        <meta name="description" content="Wandle PNG in JPG direkt im Browser um. Kostenlos, schnell, ohne Anmeldung. Qualität einstellen, EXIF optional entfernen, sofort downloaden." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="page-header">
            <h1 className="page-title flex items-center justify-center gap-2">
              <FileImage className="h-8 w-8 text-primary" />
              PNG zu JPG Konverter
            </h1>
            <p className="page-description">
              Wandeln Sie PNG-Dateien kostenlos in JPG-Format um. Kleinere Dateien für bessere Performance.
            </p>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>PNG-Datei hochladen</CardTitle>
                <CardDescription>
                  Unterstützte Formate: PNG (max. 20MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{"image/png": []}}
                  maxSize={20 * 1024 * 1024}
                  className="p-8"
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">PNG-Datei auswählen</p>
                    <p className="text-sm text-muted-foreground mt-2">Klicken oder hierher ziehen</p>
                  </div>
                </FileUpload>
              </CardContent>
            </Card>

            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    PNG <ArrowRight className="h-4 w-4" /> JPG Konvertierung
                  </CardTitle>
                  <CardDescription>
                    Datei: {selectedFile.name}
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
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Kleinere Datei</span>
                      <span>Höhere Qualität</span>
                    </div>
                  </div>

                  <Button 
                    onClick={convertImage} 
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Konvertiere PNG zu JPG...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        PNG zu JPG konvertieren
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
                    Ihre PNG-Datei wurde erfolgreich zu JPG konvertiert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadConvertedImage} className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    JPG-Datei herunterladen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SEO Content Section */}
          <div className="mt-12 space-y-8">
            <div className="prose max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Über PNG zu JPG Konvertierung</h2>
              <p className="text-muted-foreground mb-6">
                Mit unserem PNG zu JPG Konverter können Sie PNG-Bilder schnell und einfach in das JPG-Format umwandeln. 
                JPG-Dateien sind deutlich kleiner als PNG-Dateien und eignen sich perfekt für Fotos und Bilder ohne Transparenz. 
                Die Konvertierung erfolgt vollständig in Ihrem Browser - Ihre Bilder verlassen niemals Ihren Computer.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">So funktioniert's:</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8">
                <li>PNG-Datei auswählen oder per Drag & Drop hochladen</li>
                <li>JPG-Qualität nach Bedarf anpassen (10-100%)</li>
                <li>Auf "Konvertieren" klicken und wenige Sekunden warten</li>
                <li>Konvertierte JPG-Datei herunterladen</li>
              </ol>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Warum PNG zu JPG konvertieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    JPG-Dateien sind deutlich kleiner als PNG-Dateien und eignen sich besonders für Fotos und Bilder 
                    ohne Transparenz. Sie laden schneller auf Webseiten und benötigen weniger Speicherplatz.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sind meine Daten sicher?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, absolut! Die Konvertierung erfolgt vollständig in Ihrem Browser. Ihre Bilder werden niemals 
                    auf unsere Server hochgeladen oder gespeichert.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Welche Qualitätseinstellung sollte ich wählen?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Für Fotos empfehlen wir 80-90% Qualität. Für Grafiken oder wenn Dateigröße wichtiger ist, 
                    können Sie auch 60-70% wählen. Bei 100% ist die Datei größer, aber die Qualität maximal.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PngToJpg;
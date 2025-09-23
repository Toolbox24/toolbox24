import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Image as ImageIcon, FileImage, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
// @ts-ignore
import heic2any from 'heic2any';

const HeicToJpg = () => {
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
    if (file && (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic'))) {
      setSelectedFile(file);
      setDownloadUrl("");
      setPreviewUrl(""); // HEIC preview not supported
      setProgress(0);
      setIsProcessing(false);
    } else {
      toast.error("Bitte wählen Sie eine HEIC-Datei aus");
    }
  };

  const convertImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(25);

      // Convert HEIC to JPEG using heic2any
      const convertedBlob = await heic2any({
        blob: selectedFile,
        toType: "image/jpeg",
        quality: quality / 100
      }) as Blob;

      setProgress(75);

      // Create preview and download URL
      const url = URL.createObjectURL(convertedBlob);
      setDownloadUrl(url);
      setPreviewUrl(url);

      setProgress(100);
      
      toast.success("HEIC erfolgreich zu JPG konvertiert!");
    } catch (error) {
      console.error('Fehler bei der Konvertierung:', error);
      toast.error("Fehler bei der HEIC-Konvertierung. Stellen Sie sicher, dass es sich um eine gültige HEIC-Datei handelt.");
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
        <title>HEIC zu JPG umwandeln – kostenlos & online (ohne Upload)</title>
        <meta name="description" content="Wandle iPhone HEIC-Fotos in JPG direkt im Browser um. Kostenlos, schnell, ohne Anmeldung. Perfekt für iOS-Fotos zur universellen Nutzung." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <FileImage className="h-10 w-10 text-primary" />
              HEIC zu JPG Konverter
            </h1>
            <p className="text-xl text-muted-foreground">
              Wandeln Sie iPhone HEIC-Fotos kostenlos in JPG-Format um. Für universelle Kompatibilität.
            </p>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>HEIC-Datei hochladen</CardTitle>
                <CardDescription>
                  Unterstützte Formate: HEIC (iPhone-Fotos, max. 20MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div className="text-sm text-blue-800">
                    <strong>Tipp:</strong> HEIC-Dateien sind standardmäßig auf iPhones seit iOS 11. 
                    Konvertieren Sie sie zu JPG für maximale Kompatibilität.
                  </div>
                </div>
                
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{"image/heic": [], ".heic": []}}
                  maxSize={20 * 1024 * 1024}
                  className="p-8"
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">HEIC-Datei auswählen</p>
                    <p className="text-sm text-muted-foreground mt-2">Klicken oder iPhone-Foto hierher ziehen</p>
                  </div>
                </FileUpload>
              </CardContent>
            </Card>

            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    HEIC <ArrowRight className="h-4 w-4" /> JPG Konvertierung
                  </CardTitle>
                  <CardDescription>
                    Datei: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        Konvertiere HEIC zu JPG...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        HEIC zu JPG konvertieren
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
                    Ihre HEIC-Datei wurde erfolgreich zu JPG konvertiert
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {previewUrl && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={previewUrl} 
                        alt="Konvertiertes Bild" 
                        className="max-w-full max-h-64 object-contain border rounded"
                      />
                    </div>
                  )}
                  
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
              <h2 className="text-2xl font-semibold mb-4">Über HEIC zu JPG Konvertierung</h2>
              <p className="text-muted-foreground mb-6">
                Mit unserem HEIC zu JPG Konverter können Sie iPhone-Fotos im HEIC-Format schnell in das universell 
                unterstützte JPG-Format umwandeln. HEIC (High Efficiency Image Container) wird seit iOS 11 als Standard 
                verwendet, aber viele Geräte und Anwendungen können diese Dateien nicht öffnen. JPG garantiert maximale Kompatibilität.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">So funktioniert's:</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8">
                <li>HEIC-Datei auswählen oder per Drag & Drop hochladen</li>
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
                  <CardTitle className="text-lg">Was ist HEIC und warum konvertieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    HEIC (High Efficiency Image Container) ist Apples modernes Bildformat, das seit iOS 11 verwendet wird. 
                    Es bietet bessere Komprimierung als JPG, wird aber nicht von allen Geräten und Anwendungen unterstützt. 
                    JPG garantiert universelle Kompatibilität.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Geht Qualität bei der Konvertierung verloren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Minimal, ja. Da sowohl HEIC als auch JPG verlustbehaftete Formate sind, kann es zu geringen Qualitätsverlusten 
                    kommen. Mit unserer Qualitätseinstellung können Sie das optimale Verhältnis von Dateigröße und Qualität wählen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kann ich mehrere HEIC-Dateien auf einmal konvertieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Momentan unterstützen wir die Konvertierung einer Datei nach der anderen. Für Stapelverarbeitung 
                    können Sie unseren allgemeinen Bildkonverter verwenden, der Batch-Funktionen bietet.
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

export default HeicToJpg;
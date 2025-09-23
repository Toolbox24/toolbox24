import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Image as ImageIcon, FileImage, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const AvifToJpg = () => {
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
    if (file && file.type === 'image/avif') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDownloadUrl("");
      setProgress(0);
      setIsProcessing(false);
    } else {
      toast.error("Bitte wählen Sie eine AVIF-Datei aus");
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
        img.onerror = () => {
          reject(new Error('AVIF wird in diesem Browser nicht unterstützt'));
        };
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
      
      toast.success("AVIF erfolgreich zu JPG konvertiert!");
    } catch (error) {
      console.error('Fehler bei der Konvertierung:', error);
      if (error instanceof Error && error.message.includes('unterstützt')) {
        toast.error("AVIF wird in diesem Browser nicht unterstützt. Bitte verwenden Sie einen neueren Browser wie Chrome oder Firefox.");
      } else {
        toast.error("Fehler bei der Bildkonvertierung");
      }
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
        <title>AVIF zu JPG umwandeln – kostenlos & online (ohne Upload)</title>
        <meta name="description" content="Wandle AVIF in JPG direkt im Browser um. Kostenlos, schnell, ohne Anmeldung. Für maximale Kompatibilität mit allen Geräten und Anwendungen." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <FileImage className="h-10 w-10 text-primary" />
              AVIF zu JPG Konverter
            </h1>
            <p className="text-xl text-muted-foreground">
              Wandeln Sie AVIF-Dateien kostenlos in JPG-Format um. Für universelle Kompatibilität.
            </p>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>AVIF-Datei hochladen</CardTitle>
                <CardDescription>
                  Unterstützte Formate: AVIF (max. 20MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                    <strong>Hinweis:</strong> AVIF wird nicht von allen Browsern unterstützt. 
                    Verwenden Sie Chrome 85+, Firefox 93+ oder Safari 16+.
                  </div>
                </div>
                
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{"image/avif": []}}
                  maxSize={20 * 1024 * 1024}
                  className="p-8"
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">AVIF-Datei auswählen</p>
                    <p className="text-sm text-muted-foreground mt-2">Klicken oder hierher ziehen</p>
                  </div>
                </FileUpload>
              </CardContent>
            </Card>

            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    AVIF <ArrowRight className="h-4 w-4" /> JPG Konvertierung
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
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          toast.error("AVIF-Vorschau wird in diesem Browser nicht unterstützt");
                        }}
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
                        Konvertiere AVIF zu JPG...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        AVIF zu JPG konvertieren
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
                    Ihre AVIF-Datei wurde erfolgreich zu JPG konvertiert
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
              <h2 className="text-2xl font-semibold mb-4">Über AVIF zu JPG Konvertierung</h2>
              <p className="text-muted-foreground mb-6">
                Mit unserem AVIF zu JPG Konverter können Sie das moderne AVIF-Bildformat in das universell unterstützte 
                JPG-Format umwandeln. AVIF (AV1 Image File Format) bietet hervorragende Komprimierung, wird aber noch 
                nicht von allen Browsern und Anwendungen unterstützt. JPG garantiert maximale Kompatibilität überall.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">So funktioniert's:</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8">
                <li>AVIF-Datei auswählen oder per Drag & Drop hochladen</li>
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
                  <CardTitle className="text-lg">Was ist AVIF und warum konvertieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AVIF (AV1 Image File Format) ist ein sehr modernes Bildformat mit hervorragender Komprimierung. 
                    Es wird aber noch nicht von allen Browsern und Anwendungen unterstützt. JPG garantiert universelle Kompatibilität.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Welche Browser unterstützen AVIF?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AVIF wird von Chrome 85+, Firefox 93+, Safari 16+ und anderen modernen Browsern unterstützt. 
                    Ältere Browser können AVIF-Dateien nicht anzeigen, weshalb JPG die sichere Wahl ist.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sind die konvertierten JPG-Dateien größer?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, meist sind JPG-Dateien größer als AVIF-Dateien, da AVIF eine sehr effiziente Komprimierung hat. 
                    Der Vorteil von JPG liegt in der universellen Kompatibilität mit allen Geräten und Anwendungen.
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

export default AvifToJpg;
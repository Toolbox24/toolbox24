import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, Image as ImageIcon, FileImage, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const WebpToPng = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

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
    if (file && file.type === 'image/webp') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDownloadUrl("");
      setProgress(0);
      setIsProcessing(false);
    } else {
      toast.error("Bitte wählen Sie eine WEBP-Datei aus");
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
      ctx.drawImage(img, 0, 0);

      setProgress(75);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Konvertierung zu Blob fehlgeschlagen'));
          }
        }, 'image/png', 1);
      });

      setProgress(100);

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      toast.success("WEBP erfolgreich zu PNG konvertiert!");
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
    link.download = `${baseName}-converted.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download gestartet!");
  };

  return (
    <>
      <Helmet>
        <title>WEBP zu PNG umwandeln – kostenlos & online (ohne Upload)</title>
        <meta name="description" content="Wandle WEBP in PNG direkt im Browser um. Kostenlos, schnell, ohne Anmeldung. Verlustfreie Konvertierung mit Transparenz-Unterstützung." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <FileImage className="h-10 w-10 text-primary" />
              WEBP zu PNG Konverter
            </h1>
            <p className="text-xl text-muted-foreground">
              Wandeln Sie WEBP-Dateien kostenlos in PNG-Format um. Verlustfreie Qualität mit Transparenz-Unterstützung.
            </p>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>WEBP-Datei hochladen</CardTitle>
                <CardDescription>
                  Unterstützte Formate: WEBP (max. 20MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{"image/webp": []}}
                  maxSize={20 * 1024 * 1024}
                  className="p-8"
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">WEBP-Datei auswählen</p>
                    <p className="text-sm text-muted-foreground mt-2">Klicken oder hierher ziehen</p>
                  </div>
                </FileUpload>
              </CardContent>
            </Card>

            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    WEBP <ArrowRight className="h-4 w-4" /> PNG Konvertierung
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

                  <Button 
                    onClick={convertImage} 
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Konvertiere WEBP zu PNG...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        WEBP zu PNG konvertieren
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
                    Ihre WEBP-Datei wurde erfolgreich zu PNG konvertiert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadConvertedImage} className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    PNG-Datei herunterladen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SEO Content Section */}
          <div className="mt-12 space-y-8">
            <div className="prose max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Über WEBP zu PNG Konvertierung</h2>
              <p className="text-muted-foreground mb-6">
                Mit unserem WEBP zu PNG Konverter können Sie moderne WEBP-Bilder in das weit unterstützte PNG-Format umwandeln. 
                PNG bietet verlustfreie Komprimierung und unterstützt Transparenz, wodurch es sich ideal für Logos, Grafiken 
                und Bilder mit transparenten Hintergründen eignet.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">So funktioniert's:</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8">
                <li>WEBP-Datei auswählen oder per Drag & Drop hochladen</li>
                <li>Auf "Konvertieren" klicken und wenige Sekunden warten</li>
                <li>Konvertierte PNG-Datei herunterladen</li>
                <li>Profitieren Sie von verlustfreier Qualität und Transparenz</li>
              </ol>
            </div>
            
            {/* FAQ Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Warum WEBP zu PNG konvertieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    PNG bietet verlustfreie Komprimierung und wird universell unterstützt. Es eignet sich besonders für 
                    Grafiken, Logos und Bilder mit Transparenz, bei denen Qualität wichtiger ist als Dateigröße.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bleibt die Transparenz erhalten?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, sowohl WEBP als auch PNG unterstützen Transparenz. Bei der Konvertierung bleibt die Transparenz 
                    vollständig erhalten, wodurch PNG ideal für Logos und Grafiken mit transparenten Bereichen ist.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sind PNG-Dateien größer als WEBP?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, PNG-Dateien sind normalerweise größer als WEBP-Dateien, da PNG verlustfreie Komprimierung verwendet. 
                    Der Vorteil liegt in der universellen Unterstützung und der garantiert hohen Qualität.
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

export default WebpToPng;
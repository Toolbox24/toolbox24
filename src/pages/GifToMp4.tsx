import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, Image as ImageIcon, FileImage, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

const GifToMp4 = () => {
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
    if (file && file.type === 'image/gif') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDownloadUrl("");
      setProgress(0);
      setIsProcessing(false);
    } else {
      toast.error("Bitte wählen Sie eine GIF-Datei aus");
    }
  };

  const convertGifToMp4 = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // For now, show that this feature is coming soon
      // In a real implementation, we would use ffmpeg.wasm here
      setProgress(25);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(50);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(75);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(100);
      
      toast.error("GIF zu MP4 Konvertierung wird noch implementiert. Demnächst verfügbar!");
    } catch (error) {
      console.error('Fehler bei der Konvertierung:', error);
      toast.error("Fehler bei der GIF-Konvertierung");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadConvertedVideo = () => {
    if (!downloadUrl || !selectedFile) return;
    
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${baseName}-converted.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download gestartet!");
  };

  return (
    <>
      <Helmet>
        <title>GIF zu MP4 umwandeln – kostenlos & online (ohne Upload)</title>
        <meta name="description" content="Wandle GIF-Animationen in MP4-Videos direkt im Browser um. Kostenlos, schnell, ohne Anmeldung. Kleinere Dateien, bessere Qualität." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <FileImage className="h-10 w-10 text-primary" />
              GIF zu MP4 Konverter
            </h1>
            <p className="text-xl text-muted-foreground">
              Wandeln Sie GIF-Animationen kostenlos in MP4-Videos um. Kleinere Dateien, bessere Qualität.
            </p>
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>GIF-Animation hochladen</CardTitle>
                <CardDescription>
                  Unterstützte Formate: GIF (max. 50MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div className="text-sm text-orange-800">
                    <strong>Demnächst verfügbar:</strong> Die GIF zu MP4 Konvertierung wird gerade implementiert 
                    und steht bald zur Verfügung. Probieren Sie unsere anderen Konverter aus!
                  </div>
                </div>
                
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept={{"image/gif": []}}
                  maxSize={50 * 1024 * 1024}
                  className="p-8"
                >
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">GIF-Animation auswählen</p>
                    <p className="text-sm text-muted-foreground mt-2">Klicken oder animierte GIF hierher ziehen</p>
                  </div>
                </FileUpload>
              </CardContent>
            </Card>

            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    GIF <ArrowRight className="h-4 w-4" /> MP4 Konvertierung
                  </CardTitle>
                  <CardDescription>
                    Datei: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {previewUrl && (
                    <div className="flex justify-center mb-6">
                      <img 
                        src={previewUrl} 
                        alt="GIF Vorschau" 
                        className="max-w-full max-h-64 object-contain border rounded"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={convertGifToMp4} 
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Konvertiere GIF zu MP4...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        GIF zu MP4 konvertieren (Demnächst)
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
                    Ihre GIF-Animation wurde erfolgreich zu MP4 konvertiert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadConvertedVideo} className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    MP4-Video herunterladen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SEO Content Section */}
          <div className="mt-12 space-y-8">
            <div className="prose max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Über GIF zu MP4 Konvertierung</h2>
              <p className="text-muted-foreground mb-6">
                Mit unserem GIF zu MP4 Konverter können Sie animierte GIF-Dateien in das moderne MP4-Videoformat umwandeln. 
                MP4-Videos sind deutlich kleiner als GIF-Dateien bei besserer Qualität und werden von allen modernen 
                Geräten und Plattformen unterstützt, einschließlich Social Media.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">So funktioniert's:</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-8">
                <li>GIF-Animation auswählen oder per Drag & Drop hochladen</li>
                <li>Auf "Konvertieren" klicken und wenige Sekunden warten</li>
                <li>Konvertierte MP4-Datei herunterladen</li>
                <li>Profitieren Sie von kleinerer Dateigröße und besserer Qualität</li>
              </ol>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Warum GIF zu MP4 konvertieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    MP4-Videos sind deutlich kleiner als GIF-Dateien (oft 80% kleiner) bei besserer Qualität. 
                    Sie laden schneller, verbrauchen weniger Bandbreite und werden von allen Social Media Plattformen unterstützt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unterstützen alle Plattformen MP4?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, MP4 wird universell unterstützt - von Browsern über Social Media bis zu Messaging-Apps. 
                    Instagram, Twitter, WhatsApp und andere bevorzugen MP4 gegenüber GIF für bessere Performance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bleibt die Animationsqualität erhalten?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja, die Animationsqualität wird beibehalten oder sogar verbessert. MP4 verwendet moderne 
                    Videokomprimierung, die glattere Animationen bei kleineren Dateigrößen ermöglicht.
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

export default GifToMp4;
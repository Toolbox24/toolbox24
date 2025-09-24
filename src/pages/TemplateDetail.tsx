import { useParams, Navigate, useNavigate } from "react-router-dom";
import { getTemplateBySlug, getCategoryBySlug } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TemplateDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const template = getTemplateBySlug(slug);

  if (!template) {
    return <Navigate to="/" replace />;
  }

  const category = getCategoryBySlug(template.category);

  const handleDownload = (format: 'word' | 'pdf') => {
    let downloadUrl = template.downloadUrl;
    let fileName = `${template.slug}.docx`;
    
    // Handle Google Drive links - modify format for PDF
    if (template.downloadUrl.includes('docs.google.com/document')) {
      if (format === 'pdf') {
        downloadUrl = template.downloadUrl.replace('export?format=docx', 'export?format=pdf');
        fileName = `${template.slug}.pdf`;
      }
    } else {
      // For regular file URLs, keep the original logic
      fileName = format === 'pdf' ? `${template.slug}.pdf` : `${template.slug}.docx`;
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        {/* Template Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{template.title}</h1>
              {category && (
                <Badge 
                  variant="secondary" 
                  className="mt-2 cursor-pointer hover:bg-secondary/80"
                  onClick={() => navigate(`/kategorie/${category.slug}`)}
                >
                  {category.name}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Download Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download
            </CardTitle>
            <CardDescription>
              Wählen Sie Ihr bevorzugtes Format zum kostenlosen Download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                size="lg"
                onClick={() => handleDownload('word')}
                className="bg-accent hover:bg-accent-hover"
              >
                <FileText className="h-5 w-5 mr-2" />
                Download Word (.docx)
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleDownload('pdf')}
              >
                <FileText className="h-5 w-5 mr-2" />
                Download PDF
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Beide Downloads sind kostenlos und ohne Anmeldung verfügbar.
            </p>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {template.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Wichtiger Hinweis:</strong> Diese Vorlage dient ausschließlich als Muster und stellt keine Rechtsberatung dar. 
            Die Verwendung erfolgt auf eigene Verantwortung. Für rechtssichere Dokumente konsultieren Sie bitte einen 
            qualifizierten Anwalt oder die entsprechende Fachstelle.
          </AlertDescription>
        </Alert>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>So verwenden Sie diese Vorlage</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Laden Sie die Vorlage in Ihrem bevorzugten Format herunter</li>
              <li>Öffnen Sie die Datei in Microsoft Word oder einem kompatiblen Programm</li>
              <li>Ersetzen Sie die Platzhalter durch Ihre persönlichen Daten</li>
              <li>Überprüfen Sie alle Angaben auf Vollständigkeit und Richtigkeit</li>
              <li>Speichern oder drucken Sie das fertige Dokument</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplateDetail;
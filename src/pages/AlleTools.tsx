import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { categories } from "@/data/templates";
import CategoryCard from "@/components/ui/category-card";
import { Merge, FileText, Download, ImageIcon, Scissors, RotateCw, Trash2 } from "lucide-react";

const AlleTools = () => {
  const navigate = useNavigate();

  // Top PDF Tools
  const topPdfTools = [
    {
      title: "PDF zusammenfügen",
      description: "Mehrere PDF-Dateien zu einem Dokument vereinen",
      icon: Merge,
      path: "/pdf-tools/pdf-zusammenfuegen"
    },
    {
      title: "PDF komprimieren",
      description: "PDF-Dateigröße reduzieren ohne Qualitätsverlust",
      icon: Download,
      path: "/pdf-tools/pdf-komprimieren"
    },
    {
      title: "PDF teilen",
      description: "Seiten aus PDF-Dokumenten extrahieren",
      icon: Scissors,
      path: "/pdf-tools/pdf-teilen"
    },
    {
      title: "PDF in Word umwandeln",
      description: "PDF-Dateien in bearbeitbare Word-Dokumente konvertieren",
      icon: FileText,
      path: "/pdf-tools/pdf-zu-word"
    }
  ];

  // Top File Tools
  const topFileTools = [
    {
      title: "Bild komprimieren",
      description: "Bildgröße reduzieren ohne sichtbaren Qualitätsverlust",
      icon: ImageIcon,
      path: "/datei-tools/bild-komprimieren"
    },
    {
      title: "Hintergrund entfernen",
      description: "KI-basierte Hintergrundentfernung für Bilder",
      icon: Trash2,
      path: "/datei-tools/hintergrund-entfernen"
    },
    {
      title: "Bildgröße ändern",
      description: "Abmessungen von Bildern anpassen",
      icon: RotateCw,
      path: "/datei-tools/bild-groesse-aendern"
    },
    {
      title: "PNG zu JPG",
      description: "PNG Bilder in JPG Format konvertieren",
      icon: FileText,
      path: "/bild/png-zu-jpg"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Alle Tools von Toolbox24</h1>
          <p className="page-description">
            Kostenlose Vorlagen, PDF-Tools und Datei-Tools – alles an einem Ort
          </p>
        </div>

        {/* Vorlagen Block */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">📄</span>
            <h2 className="text-2xl md:text-3xl font-bold">Vorlagen</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate("/alle-vorlagen")}
            >
              Alle Vorlagen anzeigen
            </Button>
          </div>
        </section>

        {/* PDF Tools Block */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl md:text-3xl font-bold">PDF-Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {topPdfTools.map((tool) => (
              <Card 
                key={tool.title} 
                className="cursor-pointer transition-all hover:shadow-lg group border hover:border-primary/20"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader className="pb-3">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/15 transition-colors mb-3">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors text-lg">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate("/pdf-tools/alle")}
            >
              Alle PDF-Tools anzeigen
            </Button>
          </div>
        </section>

        {/* Datei Tools Block */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🖼️</span>
            <h2 className="text-2xl md:text-3xl font-bold">Datei-Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {topFileTools.map((tool) => (
              <Card 
                key={tool.title} 
                className="cursor-pointer transition-all hover:shadow-lg group border hover:border-primary/20"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader className="pb-3">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/15 transition-colors mb-3">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors text-lg">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate("/datei-tools/alle")}
            >
              Alle Datei-Tools anzeigen
            </Button>
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Warum Toolbox24 wählen?</h2>
          
          <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground text-center">
            <p className="leading-relaxed">
              Toolbox24 vereint alle wichtigen Online-Tools an einem Ort. Unsere umfassende Plattform 
              bietet über 100 kostenlose Tools für PDF-Bearbeitung, Bildkonvertierung und professionelle 
              Dokumentvorlagen. Alle Tools funktionieren direkt in Ihrem Browser - ohne Software-Installation 
              oder versteckte Kosten.
            </p>
            
            <p className="leading-relaxed">
              Besonders wichtig ist uns Ihre Privatsphäre: Alle Dateien werden lokal auf Ihrem Gerät 
              verarbeitet und niemals an unsere Server übertragen. So haben Sie die volle Kontrolle 
              über Ihre sensiblen Dokumente und Daten.
            </p>
            
            <p className="leading-relaxed">
              Ob Sie eine schnelle Kündigung erstellen, PDFs bearbeiten oder Bilder konvertieren möchten - 
              Toolbox24 macht digitale Aufgaben einfach, schnell und sicher. Entdecken Sie jetzt alle 
              Tools und sparen Sie Zeit bei Ihren täglichen digitalen Herausforderungen.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AlleTools;
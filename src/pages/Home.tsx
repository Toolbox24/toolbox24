import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Merge, Trash2, FileX, CheckCircle, Shield, Zap, Smartphone } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const popularTools = [
    {
      title: "PDF zusammenfügen",
      description: "Mehrere PDFs zu einem Dokument vereinen",
      icon: Merge,
      path: "/pdf-tools/merge"
    },
    {
      title: "Hintergrund entfernen",
      description: "KI-basierte Hintergrundentfernung für Bilder",
      icon: Trash2,
      path: "/file-tools/remove-background"
    },
    {
      title: "Kündigungsvorlage",
      description: "Rechtssichere Vorlagen für alle Kündigungen",
      icon: FileX,
      path: "/kategorie/kuendigung"
    }
  ];

  const categories = [
    {
      title: "Vorlagen",
      description: "Rechtssichere Muster für Kündigungen, Bewerbungen, Verträge und mehr. Professionell erstellt, sofort einsatzbereit.",
      buttonText: "Alle Vorlagen anzeigen",
      path: "/alle-vorlagen"
    },
    {
      title: "PDF Tools",
      description: "Umfassende PDF-Bearbeitung: Zusammenfügen, Teilen, Komprimieren, Konvertieren. Alles direkt im Browser ohne Upload.",
      buttonText: "Alle PDF Tools anzeigen",
      path: "/pdf-tools/all"
    },
    {
      title: "Datei Tools",
      description: "Professionelle Bildbearbeitung: Komprimieren, Konvertieren, Zuschneiden, Größe ändern. Schnell und einfach.",
      buttonText: "Alle Datei Tools anzeigen",
      path: "/file-tools/all"
    }
  ];

  const advantages = [
    {
      icon: CheckCircle,
      title: "Kostenlos & ohne Anmeldung",
      description: "Alle Tools sind vollständig kostenlos nutzbar"
    },
    {
      icon: Shield,
      title: "Läuft im Browser",
      description: "Kein Upload auf Server - Ihre Daten bleiben bei Ihnen"
    },
    {
      icon: Zap,
      title: "Einfach & schnell nutzbar",
      description: "Intuitive Bedienung, sofortige Ergebnisse"
    },
    {
      icon: Smartphone,
      title: "Mobilfreundlich",
      description: "Funktioniert perfekt auf allen Geräten"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Toolbox24
            </h1>
            <p className="text-xl md:text-2xl text-primary mb-4 font-medium">
              Kostenlose Online-Tools & Vorlagen
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Einfach nutzen. Direkt im Browser. Ohne Anmeldung.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/file-tools/all")}
              >
                Alle Tools entdecken
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/alle-vorlagen")}
              >
                Beliebte Vorlagen
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Beliebte Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {popularTools.map((tool) => (
              <Card key={tool.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <tool.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(tool.path)}
                  >
                    Jetzt nutzen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kategorien-Überblick</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category) => (
              <div key={category.title} className="text-center">
                <h3 className="text-2xl font-semibold mb-4">{category.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {category.description}
                </p>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate(category.path)}
                >
                  {category.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Warum Toolbox24?</h2>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-center mb-8 text-lg leading-relaxed">
                Toolbox24 ist Ihre zentrale Anlaufstelle für professionelle Online-Tools und Vorlagen, 
                die Ihren Alltag und Beruf erleichtern. Unsere Plattform bietet eine umfassende Sammlung 
                von über 100 kostenlosen Tools für PDF-Bearbeitung, Bildkonvertierung und rechtssichere 
                Dokumentvorlagen.
              </p>
              
              <p className="text-center mb-8 leading-relaxed">
                Alle unsere Tools funktionieren vollständig in Ihrem Browser - ohne Softwareinstallation, 
                ohne Anmeldung und ohne versteckte Kosten. Ihre Dateien werden niemals auf unsere Server 
                hochgeladen, sondern lokal auf Ihrem Gerät verarbeitet. Das garantiert maximale Sicherheit 
                und Datenschutz für Ihre sensiblen Dokumente.
              </p>
              
              <p className="text-center mb-8 leading-relaxed">
                Von der schnellen PDF-Bearbeitung über professionelle Bildkonvertierung bis hin zu 
                rechtssicheren Vorlagen für Kündigungen und Bewerbungen - Toolbox24 deckt alle wichtigen 
                Bereiche ab. Unsere intuitive Benutzeroberfläche macht auch komplexe Aufgaben kinderleicht 
                und spart Ihnen Zeit und Geld.
              </p>
              
              <p className="text-center leading-relaxed">
                Entdecken Sie die Vielfalt unserer Tools und erleben Sie, wie einfach digitale 
                Dokumentenbearbeitung sein kann. Ob privat oder geschäftlich - Toolbox24 ist Ihr 
                zuverlässiger Partner für alle digitalen Herausforderungen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ihre Vorteile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {advantages.map((advantage) => (
              <div key={advantage.title} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{advantage.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
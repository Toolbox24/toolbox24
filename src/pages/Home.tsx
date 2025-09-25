import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Merge, Trash2, FileX, CheckCircle, Shield, Zap, Smartphone, Clock, Star, Globe, Users } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const popularTools = [
    {
      title: "PDF zusammenfügen",
      description: "Mehrere PDFs zu einem Dokument vereinen",
      icon: Merge,
      path: "/de/pdf-tools/pdf-zusammenfuegen"
    },
    {
      title: "Hintergrund entfernen",
      description: "KI-basierte Hintergrundentfernung für Bilder",
      icon: Trash2,
      path: "/de/datei-tools/hintergrund-entfernen"
    },
    {
      title: "Kündigungsvorlage",
      description: "Rechtssichere Vorlagen für alle Kündigungen",
      icon: FileX,
      path: "/de/kategorie/kuendigung"
    }
  ];

  const categories = [
    {
      title: "Vorlagen",
      emoji: "📄",
      description: "Rechtssichere Muster für Kündigungen, Bewerbungen und Verträge",
      buttonText: "Alle Vorlagen anzeigen",
      path: "/de/alle-vorlagen"
    },
    {
      title: "PDF Tools",
      emoji: "📋",
      description: "PDF bearbeiten: Zusammenfügen, Teilen, Komprimieren",
      buttonText: "Alle PDF Tools anzeigen",
      path: "/de/pdf-tools/alle"
    },
    {
      title: "Datei Tools",
      emoji: "🖼️",
      description: "Bilder bearbeiten: Komprimieren, Konvertieren, Zuschneiden",
      buttonText: "Alle Datei Tools anzeigen",
      path: "/de/datei-tools/alle"
    }
  ];

  const advantages = [
    {
      icon: CheckCircle,
      title: "Kostenlos nutzbar",
      description: "Alle Tools ohne Gebühren"
    },
    {
      icon: Shield,
      title: "Datenschutz garantiert",
      description: "Lokale Verarbeitung im Browser"
    },
    {
      icon: Zap,
      title: "Sofort einsatzbereit",
      description: "Keine Installation erforderlich"
    },
    {
      icon: Smartphone,
      title: "Mobilfreundlich",
      description: "Funktioniert auf allen Geräten"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Toolbox24
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Kostenlose Online-Tools für PDFs, Bilder und Vorlagen
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/de/alle-tools")}
            >
              Alle Tools entdecken
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Beliebte Tools</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unsere meistgenutzten Online-Tools für den täglichen Bedarf
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {popularTools.map((tool) => (
              <Card key={tool.title} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col hover:border-primary/20">
                <CardHeader className="pb-3 flex-1">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-3">{tool.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Alle Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere drei Hauptkategorien digitaler Tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => (
              <div key={category.title} className="text-center p-6 bg-card border rounded-lg hover:shadow-sm hover:border-primary/20 transition-all h-full flex flex-col">
                <div className="text-4xl mb-4">{category.emoji}</div>
                <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  {category.description}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate(category.path)}
                >
                  {category.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Toolbox24 */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:20px_20px] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Warum Toolbox24?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Die umfassende Lösung für alle Ihre digitalen Bedürfnisse
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="group">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Alles an einem Ort</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Von PDF-Bearbeitung über Bildkonvertierung bis hin zu rechtssicheren Vorlagen - 
                    Toolbox24 vereint alle wichtigen Online-Tools an einem Ort.
                  </p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Sicher und privat</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Alle Verarbeitungen erfolgen lokal in Ihrem Browser. Ihre Dateien werden 
                    niemals hochgeladen oder gespeichert - maximaler Datenschutz garantiert.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Schnell & unkompliziert</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Intuitive Bedienung und blitzschnelle Ergebnisse. Keine langen Wartezeiten, 
                    keine komplizierte Installation - einfach loslegen.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
              Ihre Vorteile
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie, warum Millionen von Nutzern Toolbox24 für ihre digitalen Aufgaben vertrauen
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {advantages.map((advantage) => (
              <div key={advantage.title} className="text-center group">
                <div className="bg-white/70 backdrop-blur-sm border border-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300 shadow-lg">
                  <advantage.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">{advantage.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
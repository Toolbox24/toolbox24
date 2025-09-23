import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, templates } from "@/data/templates";
import CategoryCard from "@/components/ui/category-card";
import TemplateCard from "@/components/ui/template-card";
import * as Icons from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Get featured templates (first 6)
  const featuredTemplates = templates.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/suche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12 border-b border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 leading-tight text-foreground">
            Kostenlose Vorlagen – Word & PDF Muster für Kündigung, Bewerbung, Verträge & mehr
          </h1>
          <p className="text-base md:text-lg mb-6 text-muted-foreground max-w-3xl mx-auto">
            Über 100 Vorlagen sofort zum Download – ohne Anmeldung, rechtlich geprüft, direkt als Word & PDF.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Nach Vorlagen suchen (z.B. Kündigung, Bewerbung)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24 py-3 text-base bg-white text-foreground border border-border shadow-sm"
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="default"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary-hover"
              >
                Suchen
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* SEO Intro Text */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Willkommen bei VorlagenHub – Ihrer kostenlosen Quelle für professionelle <strong>Vorlagen und Muster</strong>. 
              Ob Sie eine <strong>Kündigung</strong> für Fitnessstudio oder Mietvertrag schreiben, eine perfekte <strong>Bewerbung</strong> 
              erstellen oder wichtige <strong>Verträge</strong> aufsetzen möchten – bei uns finden Sie rechtlich geprüfte Vorlagen 
              für jeden Anlass. Alle <strong>Muster</strong> stehen als Word- und PDF-Download zur Verfügung und können sofort 
              ohne Anmeldung heruntergeladen werden. Von <strong>Mahnung</strong> und Widerruf bis hin zu Arbeitsverträgen 
              und Vollmachten – unser umfangreiches Archiv bietet über 100 <strong>kostenlose Vorlagen</strong> für Privat- 
              und Geschäftskunden. Sparen Sie Zeit und Geld mit unseren professionell erstellten Dokumentvorlagen.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Beliebte Kategorien
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>;
              return (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  description={category.description}
                  icon={IconComponent}
                  slug={category.slug}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Beliebteste Vorlagen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/alle-vorlagen")}
            >
              Alle Vorlagen anzeigen
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Häufig gestellte Fragen
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-primary">Sind die Vorlagen kostenlos?</h3>
              <p className="text-muted-foreground">
                Ja, alle unsere Vorlagen sind komplett kostenlos und ohne Anmeldung verfügbar. 
                Sie können sie sofort herunterladen und verwenden.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-primary">Kann ich die Word-Dateien bearbeiten?</h3>
              <p className="text-muted-foreground">
                Selbstverständlich! Alle Word-Vorlagen können Sie nach dem Download beliebig anpassen, 
                bearbeiten und an Ihre Bedürfnisse anpassen.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-primary">Sind die Vorlagen rechtlich gültig?</h3>
              <p className="text-muted-foreground">
                Unsere Vorlagen wurden von Experten erstellt und regelmäßig aktualisiert. Sie ersetzen jedoch 
                keine individuelle Rechtsberatung. Bei komplexeren Fällen empfehlen wir die Konsultation eines Anwalts.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-primary">Welche Formate gibt es?</h3>
              <p className="text-muted-foreground">
                Alle Vorlagen stehen sowohl als Word-Dokument (.docx) als auch als PDF zur Verfügung. 
                So können Sie je nach Bedarf das passende Format wählen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
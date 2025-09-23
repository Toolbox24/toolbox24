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
      <section className="bg-gradient-to-br from-primary via-primary-hover to-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            100+ kostenlose Vorlagen
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Word & PDF Downloads ohne Anmeldung
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Nach Vorlagen suchen (z.B. Kündigung, Bewerbung)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 py-6 text-lg bg-white text-foreground border-0 shadow-lg"
              />
              <Button 
                type="submit" 
                size="lg" 
                variant="default"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent-hover"
              >
                Suchen
              </Button>
            </div>
          </form>

          <p className="text-lg opacity-80">
            Rechtlich geprüfte Muster für Kündigungen, Bewerbungen, Verträge und mehr
          </p>
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

      {/* Info Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Warum VorlagenHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sofort verfügbar</h3>
              <p className="text-muted-foreground">
                Keine Anmeldung erforderlich. Einfach herunterladen und verwenden.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rechtlich geprüft</h3>
              <p className="text-muted-foreground">
                Alle Vorlagen wurden von Experten erstellt und regelmäßig aktualisiert.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Word & PDF</h3>
              <p className="text-muted-foreground">
                Alle Vorlagen in beiden Formaten - einfach zu bearbeiten und zu verwenden.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
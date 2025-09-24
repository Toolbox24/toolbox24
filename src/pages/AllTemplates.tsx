import { categories } from "@/data/templates";
import CategoryCard from "@/components/ui/category-card";

const AllTemplates = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Alle Vorlagen</h1>
          <p className="page-description">
            Wählen Sie aus unseren Kategorien und finden Sie die passende Vorlage für Ihren Bedarf
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-16 p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Rechtlicher Hinweis:</strong> Alle Vorlagen dienen ausschließlich als Muster und stellen keine Rechtsberatung dar. 
            Für rechtssichere Dokumente konsultieren Sie bitte einen qualifizierten Anwalt oder Steuerberater.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllTemplates;
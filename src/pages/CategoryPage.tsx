import { useParams, Navigate } from "react-router-dom";
import { getCategoryBySlug, getTemplatesByCategory } from "@/data/templates";
import TemplateCard from "@/components/ui/template-card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import * as Icons from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const category = getCategoryBySlug(slug);
  const templates = getTemplatesByCategory(slug);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>;

  return (
    <>
      <Helmet>
        <title>{category.name} Vorlagen - Kostenlose Muster & Templates | Toolbox24</title>
        <meta name="description" content={`${category.description} Über ${templates.length} kostenlose Vorlagen zum Download verfügbar.`} />
        <meta name="keywords" content={`${category.name}, Vorlage, Muster, Template, kostenlos, Download`} />
      </Helmet>
      <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Category Header */}
        <div className="page-header">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconComponent className="h-10 w-10 text-primary" />
          </div>
          <h1 className="page-title">{category.name}</h1>
          <p className="page-description">{category.description}</p>
          <Badge variant="secondary" className="text-sm">
            {templates.length} Vorlagen verfügbar
          </Badge>
        </div>

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              Für diese Kategorie sind noch keine Vorlagen verfügbar.
            </p>
            <p className="text-muted-foreground">
              Schauen Sie bald wieder vorbei - wir erweitern unser Angebot ständig!
            </p>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-16 p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Rechtlicher Hinweis:</strong> Alle Vorlagen in der Kategorie "{category.name}" 
            dienen ausschließlich als Muster und stellen keine Rechtsberatung dar. 
            Für rechtssichere Dokumente konsultieren Sie bitte einen qualifizierten Anwalt oder Steuerberater.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default CategoryPage;
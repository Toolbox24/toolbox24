import { templates } from "@/data/templates";
import TemplateCard from "@/components/ui/template-card";
import { Badge } from "@/components/ui/badge";

const AllTemplates = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Alle Vorlagen</h1>
          <p className="page-description mb-6">
            Durchstöbern Sie unser komplettes Angebot an kostenlosen Vorlagen
          </p>
          <Badge variant="secondary" className="text-sm">
            {templates.length} Vorlagen verfügbar
          </Badge>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
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
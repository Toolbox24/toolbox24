import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Merge, 
  FileText, 
  Scissors, 
  FileImage,
  ImageIcon,
  Trash2,
  FileX,
  Download
} from "lucide-react";

interface PDFToolCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
}

const PDFToolCard = ({ title, description, icon: Icon, path, badge }: PDFToolCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg group border hover:border-primary/20"
      onClick={() => navigate(path)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/15 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

const AllPDFTools = () => {
  const pdfTools = [
    {
      title: "PDF zusammenfügen",
      description: "Fügen Sie mehrere PDF-Dateien zu einem einzigen Dokument zusammen",
      icon: Merge,
      path: "/pdf-tools/pdf-zusammenfuegen",
      badge: "Beliebt"
    },
    {
      title: "PDF komprimieren",
      description: "Reduzieren Sie die Dateigröße Ihrer PDF-Dokumente ohne Qualitätsverlust",
      icon: Download,
      path: "/pdf-tools/pdf-komprimieren"
    },
    {
      title: "PDF teilen",
      description: "Extrahieren Sie bestimmte Seiten aus einem PDF-Dokument",
      icon: Scissors,
      path: "/pdf-tools/pdf-teilen"
    },
    {
      title: "PDF in Word umwandeln",
      description: "Konvertieren Sie PDF-Dateien in bearbeitbare Word-Dokumente (DOCX)",
      icon: FileText,
      path: "/pdf-tools/pdf-zu-word"
    },
    {
      title: "Word in PDF umwandeln",
      description: "Wandeln Sie Word-Dokumente (DOCX) in PDF-Format um",
      icon: FileText,
      path: "/pdf-tools/word-zu-pdf"
    },
    {
      title: "PDF in Bilder umwandeln",
      description: "Konvertieren Sie PDF-Seiten in JPG oder PNG Bilder",
      icon: ImageIcon,
      path: "/pdf-tools/pdf-zu-bilder"
    },
    {
      title: "Bilder in PDF umwandeln",
      description: "Erstellen Sie PDF-Dokumente aus JPG, PNG oder anderen Bildformaten",
      icon: FileImage,
      path: "/pdf-tools/bilder-zu-pdf"
    },
    {
      title: "Seiten aus PDF löschen",
      description: "Entfernen Sie unerwünschte Seiten aus PDF-Dokumenten",
      icon: Trash2,
      path: "/pdf-tools/seiten-loeschen"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Alle PDF-Tools - Kostenlose PDF-Bearbeitung | Toolbox24</title>
        <meta name="description" content="Professionelle PDF-Tools: Zusammenfügen, Komprimieren, Teilen, PDF zu Word/Bild konvertieren. Datenschutz garantiert - lokale Verarbeitung im Browser." />
        <meta name="keywords" content="PDF Tools, PDF zusammenfügen, PDF komprimieren, PDF teilen, PDF zu Word, PDF Bearbeitung" />
      </Helmet>
      <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="page-header">
          <h1 className="page-title">
            Alle PDF-Tools
          </h1>
          <p className="page-description">
            Professionelle PDF-Bearbeitung direkt im Browser. Alle Tools funktionieren client-side 
            ohne Upload auf externe Server - Ihre Daten bleiben sicher bei Ihnen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pdfTools.map((tool) => (
            <PDFToolCard
              key={tool.path}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
              badge={tool.badge}
            />
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-3">🔒 Datenschutz garantiert</h2>
          <p className="text-muted-foreground">
            Alle Bearbeitungen erfolgen lokal in Ihrem Browser. Ihre PDFs werden niemals 
            auf unsere Server hochgeladen oder gespeichert.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default AllPDFTools;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  ImageIcon, 
  Scissors, 
  RotateCw, 
  Trash2, 
  FileImage, 
  RefreshCw,
  Video,
  Crop
} from "lucide-react";

interface FileToolCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
}

const FileToolCard = ({ title, description, icon: Icon, path, badge }: FileToolCardProps) => {
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

const AllFileTools = () => {
  const fileTools = [
    {
      title: "Bild komprimieren",
      description: "Reduzieren Sie die Dateigröße Ihrer Bilder ohne sichtbaren Qualitätsverlust",
      icon: ImageIcon,
      path: "/datei-tools/bild-komprimieren",
      badge: "Beliebt"
    },
    {
      title: "Bildgröße ändern (Resize)",
      description: "Ändern Sie die Abmessungen Ihrer Bilder durch Eingabe neuer Breite und Höhe",
      icon: RefreshCw,
      path: "/datei-tools/bild-groesse-aendern"
    },
    {
      title: "Bild zuschneiden (Crop)",
      description: "Schneiden Sie Ihre Bilder durch Ziehen eines Auswahlbereichs zurecht",
      icon: Crop,
      path: "/datei-tools/bild-zuschneiden"
    },
    {
      title: "Bild drehen/flippen",
      description: "Drehen Sie Bilder um 90°, 180°, 270° oder spiegeln Sie sie horizontal/vertikal",
      icon: RotateCw,
      path: "/datei-tools/bild-drehen"
    },
    {
      title: "Hintergrund entfernen",
      description: "Entfernen Sie automatisch den Hintergrund von Personen- und Objektbildern",
      icon: Trash2,
      path: "/datei-tools/hintergrund-entfernen",
      badge: "KI-basiert"
    }
  ];

  const converterTools = [
    {
      title: "PNG → JPG",
      description: "Konvertieren Sie PNG Bilder in JPG Format mit anpassbarer Qualität",
      icon: FileImage,
      path: "/bild/png-zu-jpg",
      badge: undefined
    },
    {
      title: "JPG → PNG",
      description: "Wandeln Sie JPG Bilder in verlustfreies PNG Format um",
      icon: FileImage,
      path: "/bild/jpg-zu-png",
      badge: undefined
    },
    {
      title: "WEBP → JPG",
      description: "Konvertieren Sie moderne WEBP Bilder in JPG Format",
      icon: FileImage,
      path: "/bild/webp-zu-jpg",
      badge: undefined
    },
    {
      title: "WEBP → PNG",
      description: "Wandeln Sie WEBP Bilder in PNG Format um",
      icon: FileImage,
      path: "/bild/webp-zu-png",
      badge: undefined
    },
    {
      title: "HEIC → JPG",
      description: "Konvertieren Sie iPhone HEIC Bilder in JPG Format",
      icon: FileImage,
      path: "/bild/heic-zu-jpg",
      badge: undefined
    },
    {
      title: "HEIC → PNG",
      description: "Wandeln Sie iPhone HEIC Bilder in PNG Format um",
      icon: FileImage,
      path: "/bild/heic-zu-jpg", // Using same converter as it supports both formats
      badge: undefined
    },
    {
      title: "AVIF → JPG",
      description: "Konvertieren Sie moderne AVIF Bilder in JPG Format",
      icon: FileImage,
      path: "/bild/avif-zu-jpg",
      badge: undefined
    },
    {
      title: "AVIF → PNG",
      description: "Wandeln Sie AVIF Bilder in PNG Format um",
      icon: FileImage,
      path: "/bild/avif-zu-jpg", // Using same converter as it supports both formats
      badge: undefined
    },
    {
      title: "GIF → MP4",
      description: "Konvertieren Sie animierte GIFs in kleinere, effizientere MP4 Videos",
      icon: Video,
      path: "/gif-zu-mp4",
      badge: undefined
    }
  ];

  return (
    <>
      <Helmet>
        <title>Alle Datei-Tools - Kostenlose Bildbearbeitung | Toolbox24</title>
        <meta name="description" content="Professionelle Datei-Tools: Bild komprimieren, Größe ändern, zuschneiden, Hintergrund entfernen, Format konvertieren. Datenschutz garantiert - lokale Verarbeitung." />
        <meta name="keywords" content="Bildbearbeitung, Bild komprimieren, Bildkonverter, Hintergrund entfernen, PNG JPG konvertieren" />
      </Helmet>
      <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="page-header">
          <h1 className="page-title">
            Alle Datei-Tools
          </h1>
          <p className="page-description">
            Professionelle Bildbearbeitung direkt im Browser. Alle Tools funktionieren client-side 
            ohne Upload auf externe Server - Ihre Daten bleiben sicher bei Ihnen.
          </p>
        </div>

        {/* Block 1: Normale Datei-Tools */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Datei-Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fileTools.map((tool) => (
              <FileToolCard
                key={tool.path}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                path={tool.path}
                badge={tool.badge}
              />
            ))}
          </div>
        </div>

        {/* Block 2: Converter-Tools */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Converter-Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {converterTools.map((tool) => (
              <FileToolCard
                key={tool.path}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                path={tool.path}
                badge={tool.badge}
              />
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-3">🔒 Datenschutz garantiert</h2>
          <p className="text-muted-foreground">
            Alle Bearbeitungen erfolgen lokal in Ihrem Browser. Ihre Bilder werden niemals 
            auf unsere Server hochgeladen oder gespeichert.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default AllFileTools;
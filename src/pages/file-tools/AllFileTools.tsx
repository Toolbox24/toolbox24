import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
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
  const tools = [
    {
      title: "Bild komprimieren",
      description: "Reduzieren Sie die Dateigröße Ihrer Bilder ohne sichtbaren Qualitätsverlust",
      icon: ImageIcon,
      path: "/file-tools/compress-image",
      badge: "Beliebt"
    },
    {
      title: "Bildgröße ändern (Resize)",
      description: "Ändern Sie die Abmessungen Ihrer Bilder durch Eingabe neuer Breite und Höhe",
      icon: RefreshCw,
      path: "/file-tools/resize-image"
    },
    {
      title: "Bild zuschneiden (Crop)",
      description: "Schneiden Sie Ihre Bilder durch Ziehen eines Auswahlbereichs zurecht",
      icon: Crop,
      path: "/file-tools/crop-image"
    },
    {
      title: "Bild drehen/flippen",
      description: "Drehen Sie Bilder um 90°, 180°, 270° oder spiegeln Sie sie horizontal/vertikal",
      icon: RotateCw,
      path: "/file-tools/rotate-image"
    },
    {
      title: "Hintergrund entfernen",
      description: "Entfernen Sie automatisch den Hintergrund von Personen- und Objektbildern",
      icon: Trash2,
      path: "/file-tools/remove-background",
      badge: "KI-basiert"
    },
    {
      title: "PNG ↔ JPG Umwandeln",
      description: "Konvertieren Sie zwischen PNG und JPG Formaten mit anpassbarer Qualität",
      icon: FileImage,
      path: "/file-tools/convert-png-jpg"
    },
    {
      title: "WEBP ↔ JPG/PNG Umwandeln",
      description: "Konvertieren Sie moderne WEBP Bilder zu JPG/PNG oder umgekehrt",
      icon: FileImage,
      path: "/file-tools/convert-webp"
    },
    {
      title: "HEIC zu JPG",
      description: "Wandeln Sie iPhone HEIC Bilder in das universelle JPG Format um",
      icon: FileImage,
      path: "/file-tools/heic-to-jpg"
    },
    {
      title: "GIF → MP4 Umwandeln",
      description: "Konvertieren Sie animierte GIFs in kleinere, effizientere MP4 Videos",
      icon: Video,
      path: "/file-tools/gif-to-mp4"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Alle Datei-Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professionelle Bildbearbeitung direkt im Browser. Alle Tools funktionieren client-side 
            ohne Upload auf externe Server - Ihre Daten bleiben sicher bei Ihnen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => (
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

        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-3">🔒 Datenschutz garantiert</h2>
          <p className="text-muted-foreground">
            Alle Bearbeitungen erfolgen lokal in Ihrem Browser. Ihre Bilder werden niemals 
            auf unsere Server hochgeladen oder gespeichert.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllFileTools;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ImageConverterHub = () => {
  const converters = [
    {
      title: "JPG ↔ PNG",
      description: "Konvertieren zwischen JPG und PNG Formaten",
      conversions: [
        { label: "PNG zu JPG", path: "/bild/png-zu-jpg", key: "png-to-jpg" },
        { label: "JPG zu PNG", path: "/bild/jpg-zu-png", key: "jpg-to-png" }
      ]
    },
    {
      title: "WEBP ↔ JPG/PNG", 
      description: "Moderne WEBP Bilder konvertieren",
      conversions: [
        { label: "WEBP zu JPG", path: "/bild/webp-zu-jpg", key: "webp-to-jpg" },
        { label: "WEBP zu PNG", path: "/bild/webp-zu-png", key: "webp-to-png" }
      ]
    },
    {
      title: "HEIC ↔ JPG/PNG",
      description: "iPhone HEIC Fotos konvertieren", 
      conversions: [
        { label: "HEIC zu JPG", path: "/bild/heic-zu-jpg", key: "heic-to-jpg" },
        { label: "HEIC zu PNG", path: "/bild/heic-zu-jpg", key: "heic-to-png" } // Note: currently only JPG available
      ]
    },
    {
      title: "AVIF ↔ JPG/PNG",
      description: "Moderne AVIF Bilder konvertieren",
      conversions: [
        { label: "AVIF zu JPG", path: "/bild/avif-zu-jpg", key: "avif-to-jpg" },
        { label: "AVIF zu PNG", path: "/bild/avif-zu-jpg", key: "avif-to-png" } // Note: currently only JPG available
      ]
    },
    {
      title: "GIF → MP4",
      description: "Animierte GIFs zu Videos konvertieren",
      conversions: [
        { label: "GIF zu MP4", path: "/gif-zu-mp4", key: "gif-to-mp4" }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title flex items-center justify-center gap-2">
            <FileImage className="h-8 w-8 text-primary" />
            Bild Konverter
          </h1>
          <p className="page-description">
            Konvertieren Sie Bilder zwischen verschiedenen Formaten - kostenlos und direkt im Browser
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          {converters.map((converter) => (
            <Card key={converter.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-primary" />
                  {converter.title}
                </CardTitle>
                <CardDescription>{converter.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {converter.conversions.map((conversion) => (
                    <Button key={conversion.key} asChild variant="outline" className="h-auto p-4">
                      <Link to={conversion.path} className="flex items-center gap-2">
                        <span>{conversion.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Section */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Häufig verwendete Konvertierungen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link to="/bild/png-zu-jpg">PNG → JPG</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/bild/jpg-zu-png">JPG → PNG</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/bild/webp-zu-jpg">WEBP → JPG</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/bild/heic-zu-jpg">HEIC → JPG</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <FileImage className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Universelle Kompatibilität</h3>
            <p className="text-sm text-muted-foreground">
              Unterstützt alle gängigen Bildformate für maximale Flexibilität
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Schnelle Konvertierung</h3>
            <p className="text-sm text-muted-foreground">
              Direkt im Browser - keine Wartezeiten, keine Uploads
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l-3-3h6l-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-semibold">100% Privat</h3>
            <p className="text-sm text-muted-foreground">
              Ihre Bilder bleiben auf Ihrem Gerät - maximaler Datenschutz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConverterHub;
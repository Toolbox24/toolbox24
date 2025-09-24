import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Tools Section */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Tools</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/alle-vorlagen")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Vorlagen
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/pdf-tools/alle")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  PDF Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/datei-tools/alle")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Datei Tools
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Ressourcen</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/blog")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/rechtliches")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Rechtliches
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/impressum")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Impressum
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/kontakt")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Kontakt
                </button>
              </li>
            </ul>
          </div>

          {/* Brand Section */}
          <div>
            <h4 
              className="font-semibold mb-4 text-primary cursor-pointer hover:text-primary-hover transition-colors"
              onClick={() => navigate("/")}
            >
              Toolbox24
            </h4>
            <p className="text-muted-foreground text-sm">
              Professionelle Tools für Dokumente, PDFs und Bilder - direkt im Browser, 
              kostenlos und sicher.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p className="mb-3">
            © 2024 Toolbox24 - Kostenlose Tools für jeden Bedarf
          </p>
          <p className="text-sm max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> Alle Tools und Vorlagen sind Muster und ersetzen keine Rechtsberatung. 
            Die Verwendung erfolgt auf eigene Verantwortung. Bei rechtlichen Fragen konsultieren Sie bitte einen Anwalt.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
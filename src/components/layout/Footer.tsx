import { useNavigate } from "react-router-dom";
import { categories } from "@/data/templates";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Categories Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Kategorien</h4>
            <ul className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => navigate(`/kategorie/${category.slug}`)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Weitere Kategorien</h4>
            <ul className="space-y-2">
              {categories.slice(4).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => navigate(`/kategorie/${category.slug}`)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Impressum
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Datenschutz
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Service</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/alle-vorlagen")}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Alle Vorlagen
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p className="mb-3">
            © 2024 VorlagenHub - Kostenlose Vorlagen für jeden Bedarf
          </p>
          <p className="text-sm max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> Alle Vorlagen sind Muster und ersetzen keine Rechtsberatung. 
            Die Verwendung erfolgt auf eigene Verantwortung. Bei rechtlichen Fragen konsultieren Sie bitte einen Anwalt.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
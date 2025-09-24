import { Search, ChevronDown, FileText, File, Settings, Menu, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { searchServices, SearchResult } from "@/data/search";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchServices(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/de/suche?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery("");
    setShowResults(false);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'template':
      case 'category':
        return <FileText className="h-4 w-4" />;
      case 'pdf-tool':
        return <File className="h-4 w-4" />;
      case 'file-tool':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setExpandedSubmenu(null);
    }
  };

  const toggleSubmenu = (submenu: string) => {
    setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setExpandedSubmenu(null);
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'template':
        return 'Vorlage';
      case 'category':
        return 'Kategorie';
      case 'pdf-tool':
        return 'PDF Tool';
      case 'file-tool':
        return 'Datei Tool';
      default:
        return '';
    }
  };

  return (
    <>
      <header className="bg-card border-b sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <h1 
                className="text-xl font-bold text-primary cursor-pointer hover:text-primary-hover transition-colors"
                onClick={() => navigate("/de/")}
              >
                Toolbox24
              </h1>
              
              {/* Desktop Navigation Menu */}
              <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Vorlagen
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4 space-y-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/kategorie/kuendigung"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Kündigungen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/kategorie/bewerbung"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Bewerbungen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/kategorie/vertraege"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Verträge & Arbeit
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/kategorie/finanzen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Finanzen
                        </Link>
                      </NavigationMenuLink>
                      <div className="border-t my-2"></div>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/alle-vorlagen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Alle Vorlagen
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    PDF Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4 space-y-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/pdf-tools/pdf-zusammenfuegen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF zusammenfügen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/pdf-tools/pdf-komprimieren"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF komprimieren
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/pdf-tools/pdf-teilen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF teilen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/pdf-tools/pdf-zu-word"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF in Word umwandeln
                        </Link>
                      </NavigationMenuLink>
                      <div className="border-t my-2"></div>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/pdf-tools/alle"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Alle PDF-Tools
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Datei-Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4 space-y-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/datei-tools/bild-komprimieren"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Bild komprimieren
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/datei-tools/hintergrund-entfernen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Hintergrund entfernen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/de/datei-tools/bild-groesse-aendern"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Bildgröße ändern (Resize)
                        </Link>
                      </NavigationMenuLink>
                       <NavigationMenuLink asChild>
                          <Link
                            to="/de/datei-tools/konverter"
                            className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                          >
                            Bild konvertieren
                          </Link>
                       </NavigationMenuLink>
                       <div className="border-t my-2"></div>
                       <NavigationMenuLink asChild>
                          <Link
                            to="/de/datei-tools/alle"
                            className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                          >
                            Alle Datei-Tools
                          </Link>
                       </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Desktop Search */}
          <div className="relative flex-1 max-w-md hidden lg:block" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Services durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  className="pl-10 pr-4"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                >
                  Suchen
                </Button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded hover:bg-muted transition-colors border-none bg-transparent"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-primary mt-0.5">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground truncate">
                              {result.title}
                            </span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Menu öffnen"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-30 lg:hidden">
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-background shadow-xl">
          <div className="p-4 h-full flex flex-col">
            
            {/* Mobile Navigation */}
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {/* Vorlagen */}
              <div>
                <button
                  onClick={() => toggleSubmenu('vorlagen')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className="font-medium">Vorlagen</span>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSubmenu === 'vorlagen' ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedSubmenu === 'vorlagen' && (
                  <div className="ml-4 mt-2 space-y-1 animate-fade-in">
                    <button
                      onClick={() => handleMobileNavigation('/de/kategorie/kuendigung')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Kündigungen
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/kategorie/bewerbung')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Bewerbungen
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/kategorie/vertraege')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Verträge & Arbeit
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/kategorie/finanzen')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Finanzen
                    </button>
                    <div className="border-t my-2"></div>
                    <button
                      onClick={() => handleMobileNavigation('/de/alle-vorlagen')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm font-medium"
                    >
                      Alle Vorlagen
                    </button>
                  </div>
                )}
              </div>

              {/* PDF Tools */}
              <div>
                <button
                  onClick={() => toggleSubmenu('pdf-tools')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className="font-medium">PDF Tools</span>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSubmenu === 'pdf-tools' ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedSubmenu === 'pdf-tools' && (
                  <div className="ml-4 mt-2 space-y-1 animate-fade-in">
                    <button
                      onClick={() => handleMobileNavigation('/de/pdf-tools/pdf-zusammenfuegen')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      PDF zusammenfügen
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/pdf-tools/pdf-komprimieren')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      PDF komprimieren
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/pdf-tools/pdf-teilen')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      PDF teilen
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/pdf-tools/pdf-zu-word')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      PDF in Word umwandeln
                    </button>
                    <div className="border-t my-2"></div>
                    <button
                      onClick={() => handleMobileNavigation('/de/pdf-tools/alle')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm font-medium"
                    >
                      Alle PDF-Tools
                    </button>
                  </div>
                )}
              </div>

              {/* Datei Tools */}
              <div>
                <button
                  onClick={() => toggleSubmenu('datei-tools')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className="font-medium">Datei Tools</span>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSubmenu === 'datei-tools' ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedSubmenu === 'datei-tools' && (
                  <div className="ml-4 mt-2 space-y-1 animate-fade-in">
                    <button
                      onClick={() => handleMobileNavigation('/de/datei-tools/bild-komprimieren')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Bild komprimieren
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/datei-tools/hintergrund-entfernen')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Hintergrund entfernen
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/datei-tools/bild-groesse-aendern')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Bildgröße ändern
                    </button>
                    <button
                      onClick={() => handleMobileNavigation('/de/datei-tools/konverter')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      Bild konvertieren
                    </button>
                    <div className="border-t my-2"></div>
                    <button
                      onClick={() => handleMobileNavigation('/de/datei-tools/alle')}
                      className="block w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm font-medium"
                    >
                      Alle Datei-Tools
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Links */}
              <div className="border-t pt-4 space-y-1">
                <button
                  onClick={() => handleMobileNavigation('/de/kontakt')}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Kontakt
                </button>
                <button
                  onClick={() => handleMobileNavigation('/de/impressum')}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Impressum
                </button>
                <button
                  onClick={() => handleMobileNavigation('/de/rechtliches')}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Rechtliches
                </button>
              </div>
            </nav>

            {/* Mobile Search - positioned at bottom */}
            <div className="border-t pt-4 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Services durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        handleMobileNavigation(`/de/suche?q=${encodeURIComponent(searchQuery.trim())}`);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
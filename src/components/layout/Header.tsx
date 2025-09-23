import { Search, ChevronDown, FileText, File, Settings } from "lucide-react";
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
      navigate(`/suche?q=${encodeURIComponent(searchQuery.trim())}`);
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
    <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <h1 
              className="text-xl font-bold text-primary cursor-pointer hover:text-primary-hover transition-colors"
              onClick={() => navigate("/")}
            >
              Toolbox24
            </h1>
            
            {/* Navigation Menu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Vorlagen
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4 space-y-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/kategorie/kuendigung"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Kündigungen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/kategorie/bewerbung"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Bewerbungen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/kategorie/vertraege"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Verträge & Arbeit
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/kategorie/finanzen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Finanzen
                        </Link>
                      </NavigationMenuLink>
                      <div className="border-t my-2"></div>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/alle-vorlagen"
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
                          to="/pdf-tools/merge"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF zusammenfügen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/pdf-tools/compress"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF komprimieren
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/pdf-tools/split"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF teilen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/pdf-tools/to-word"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          PDF in Word umwandeln
                        </Link>
                      </NavigationMenuLink>
                      <div className="border-t my-2"></div>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/pdf-tools/all"
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
                          to="/file-tools/compress-image"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Bild komprimieren
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/file-tools/remove-background"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Hintergrund entfernen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/file-tools/resize-image"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Bildgröße ändern (Resize)
                        </Link>
                      </NavigationMenuLink>
                       <NavigationMenuLink asChild>
                         <Link
                           to="/file-tools/convert"
                           className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                         >
                           Bild konvertieren
                         </Link>
                       </NavigationMenuLink>
                       <div className="border-t my-2"></div>
                       <NavigationMenuLink asChild>
                         <Link
                           to="/file-tools/all"
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
          
          <div className="relative flex-1 max-w-md" ref={searchRef}>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
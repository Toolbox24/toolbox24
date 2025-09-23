import { Search, ChevronDown } from "lucide-react";
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
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/suche?q=${encodeURIComponent(searchQuery.trim())}`);
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
              VorlagenHub
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
                          to="/alle-vorlagen"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Alle Vorlagen
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/"
                          className="block p-2 rounded hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Kategorien
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
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Vorlagen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
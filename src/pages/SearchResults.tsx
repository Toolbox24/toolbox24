import { useSearchParams, useNavigate } from "react-router-dom";
import { searchServices } from "@/data/search";
import SearchResultCard from "@/components/ui/search-result-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  
  const results = searchServices(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/de/suche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Suchergebnisse</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Services durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20"
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

          {query && (
            <p className="mt-4 text-muted-foreground">
              {results.length} {results.length === 1 ? 'Ergebnis' : 'Ergebnisse'} für "{query}"
            </p>
          )}
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              Keine Services für "{query}" gefunden.
            </p>
            <p className="text-muted-foreground mb-6">
              Versuchen Sie es mit anderen Suchbegriffen oder durchstöbern Sie unsere Services.
            </p>
            <Button onClick={() => navigate("/")}>
              Zur Startseite
            </Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              Geben Sie einen Suchbegriff ein, um Services zu finden.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "@/data/search";
import * as Icons from "lucide-react";

interface SearchResultCardProps {
  result: SearchResult;
}

const SearchResultCard = ({ result }: SearchResultCardProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (result.type) {
      case 'pdf-tool':
        return Icons.FileText;
      case 'file-tool':
        return Icons.File;
      case 'template':
        return Icons.FileImage;
      case 'category':
        return Icons.Folder;
      default:
        return Icons.FileText;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'pdf-tool':
        return 'PDF Tool';
      case 'file-tool':
        return 'Datei Tool';
      case 'template':
        return 'Vorlage';
      case 'category':
        return 'Kategorie';
      default:
        return 'Service';
    }
  };

  const Icon = getIcon();

  return (
    <Card className="h-full transition-all hover:shadow-lg group border hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/15 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {getTypeLabel()}
          </Badge>
        </div>
        <CardTitle className="group-hover:text-primary transition-colors text-lg">
          {result.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {result.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {result.keywords && result.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 flex-1 mr-3">
              {result.keywords.slice(0, 2).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(result.path)}
            className="shrink-0"
          >
            Öffnen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Template } from "@/data/templates";

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="transition-all hover:shadow-lg group border hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/15 transition-colors flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
              {template.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {template.keywords.slice(0, 2).map((keyword) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/vorlage/${template.slug}`)}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
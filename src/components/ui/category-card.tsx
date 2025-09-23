import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getTemplatesByCategory } from "@/data/templates";

interface CategoryCardProps {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  slug: string;
}

const CategoryCard = ({ name, description, icon: Icon, slug }: CategoryCardProps) => {
  const navigate = useNavigate();
  const templateCount = getTemplatesByCategory(slug).length;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg group border hover:border-primary/20"
      onClick={() => navigate(`/kategorie/${slug}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/15 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {templateCount} Vorlagen
          </Badge>
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default CategoryCard;
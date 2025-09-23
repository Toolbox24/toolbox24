import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Category, getTemplatesByCategory } from "@/data/templates";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  category?: Category;
  name?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  slug?: string;
}

const CategoryCard = ({ category, name, description, icon, slug }: CategoryCardProps) => {
  const navigate = useNavigate();
  
  // Support both interfaces for backward compatibility
  const categoryName = category?.name || name || '';
  const categoryDescription = category?.description || description || '';
  const categorySlug = category?.slug || slug || '';
  const templatesInCategory = category ? getTemplatesByCategory(category.slug).length : 0;
  
  let IconComponent: React.ComponentType<any>;
  if (category) {
    IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>;
  } else {
    IconComponent = icon || Icons.FileText;
  }

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg group border hover:border-primary/20"
      onClick={() => navigate(`/kategorie/${categorySlug}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/15 transition-colors">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {templatesInCategory} Vorlagen
            </Badge>
          )}
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">
          {categoryName}
        </CardTitle>
        <CardDescription>
          {categoryDescription}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default CategoryCard;
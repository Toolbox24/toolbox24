import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/data/blog";
import { Calendar, Clock } from "lucide-react";

const Blog = () => {
  const navigate = useNavigate();
  const blogPosts = getBlogPosts();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Blog - Toolbox24</title>
        <meta name="description" content="Tipps, Tutorials und Neuigkeiten rund um PDF-Tools, Bildbearbeitung und digitale Workflows von Toolbox24." />
        <meta name="keywords" content="PDF Tutorial, Bildbearbeitung Tipps, Freistellen, Komprimierung, Blog" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tipps, Tutorials und Neuigkeiten rund um PDF-Tools, Bildbearbeitung und digitale Workflows.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTimeMinutes} Min. Lesezeit
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="w-full sm:w-auto"
                  >
                    Weiterlesen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No posts message (in case the array is empty) */}
          {blogPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Noch keine Blog-Beiträge vorhanden. Schauen Sie bald wieder vorbei!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
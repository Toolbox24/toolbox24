import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBlogPost, getRandomPosts } from "@/data/blog";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = slug ? getBlogPost(slug) : undefined;
  const relatedPosts = slug ? getRandomPosts(slug, 3) : [];

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Beitrag nicht gefunden</h1>
          <p className="text-muted-foreground mb-8">
            Der gesuchte Blog-Beitrag existiert nicht oder wurde entfernt.
          </p>
          <Button onClick={() => navigate("/blog")}>
            Zurück zum Blog
          </Button>
        </div>
      </div>
    );
  }

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
        <title>{post.title} - Toolbox24 Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`${post.title}, PDF, Bildbearbeitung, Tutorial, Anleitung`} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/blog")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Blog
          </Button>

          {/* Article Header */}
          <article className="prose prose-lg max-w-none">
            <div className="mb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTimeMinutes} Min. Lesezeit
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">{post.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h2>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 pl-6 space-y-2">{children}</ul>,
                  li: ({ children }) => <li className="text-foreground">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">Weitere Beiträge</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg mb-2">{relatedPost.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(relatedPost.publishedAt)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                        className="w-full"
                      >
                        Lesen
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPost;
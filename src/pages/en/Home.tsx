import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Merge, Trash2, FileX, CheckCircle, Shield, Zap, Smartphone, Clock, Star, Globe, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const HomeEN = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const popularTools = [
    {
      title: t('home.popularTools.pdfMerge.title'),
      description: t('home.popularTools.pdfMerge.description'),
      icon: Merge,
      path: "/en/pdf-tools/merge-pdf"
    },
    {
      title: t('home.popularTools.removeBackground.title'),
      description: t('home.popularTools.removeBackground.description'),
      icon: Trash2,
      path: "/en/file-tools/remove-background"
    },
    {
      title: t('home.popularTools.cancellationTemplate.title'),
      description: t('home.popularTools.cancellationTemplate.description'),
      icon: FileX,
      path: "/en/category/cancellation"
    }
  ];

  const categories = [
    {
      title: t('home.services.templates.title'),
      emoji: "📄",
      description: t('home.services.templates.description'),
      buttonText: t('home.services.templates.button'),
      path: "/en/all-templates"
    },
    {
      title: t('home.services.pdfTools.title'),
      emoji: "📋",
      description: t('home.services.pdfTools.description'),
      buttonText: t('home.services.pdfTools.button'),
      path: "/en/pdf-tools/all"
    },
    {
      title: t('home.services.fileTools.title'),
      emoji: "🖼️",
      description: t('home.services.fileTools.description'),
      buttonText: t('home.services.fileTools.button'),
      path: "/en/file-tools/all"
    }
  ];

  const advantages = [
    {
      icon: CheckCircle,
      title: t('home.advantages.free.title'),
      description: t('home.advantages.free.description')
    },
    {
      icon: Shield,
      title: t('home.advantages.privacy.title'),
      description: t('home.advantages.privacy.description')
    },
    {
      icon: Zap,
      title: t('home.advantages.instant.title'),
      description: t('home.advantages.instant.description')
    },
    {
      icon: Smartphone,
      title: t('home.advantages.mobile.title'),
      description: t('home.advantages.mobile.description')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {t('home.subtitle')}
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/en/all-tools")}
            >
              {t('home.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('home.popularTools.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.popularTools.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {popularTools.map((tool) => (
              <Card key={tool.title} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col hover:border-primary/20">
                <CardHeader className="pb-3 flex-1">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-3">{tool.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(tool.path)}
                  >
                    {t('home.popularTools.pdfMerge.button')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('home.services.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => (
              <div key={category.title} className="text-center p-6 bg-card border rounded-lg hover:shadow-sm hover:border-primary/20 transition-all h-full flex flex-col">
                <div className="text-4xl mb-4">{category.emoji}</div>
                <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  {category.description}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate(category.path)}
                >
                  {category.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Toolbox24 */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:20px_20px] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t('home.about.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.about.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="group">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t('home.about.allInOne.title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('home.about.allInOne.description')}
                  </p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t('home.about.secure.title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('home.about.secure.description')}
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t('home.about.fast.title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('home.about.fast.description')}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
              {t('home.advantages.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.advantages.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {advantages.map((advantage) => (
              <div key={advantage.title} className="text-center group">
                <div className="bg-white/70 backdrop-blur-sm border border-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300 shadow-lg">
                  <advantage.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">{advantage.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeEN;
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Search, Menu, X, ChevronRight, FileText, Wrench, Image } from 'lucide-react';
import { searchServices } from '@/data/search';
import type { SearchResult } from '@/data/search';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchServices(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchPath = currentLanguage === 'en' ? '/en/search' : '/de/suche';
      navigate(`${searchPath}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'template':
      case 'category':
        return <FileText className="h-4 w-4" />;
      case 'pdf-tool':
        return <FileText className="h-4 w-4" />;
      case 'file-tool':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setExpandedSubmenu(null);
    }
  };

  const toggleSubmenu = (submenu: string) => {
    setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
  };

  const handleMobileNavigation = (path: string) => {
    const fullPath = currentLanguage === 'en' ? `/en${path}` : `/de${path}`;
    navigate(fullPath);
    setIsMobileMenuOpen(false);
    setExpandedSubmenu(null);
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'template':
        return currentLanguage === 'en' ? 'Template' : 'Vorlage';
      case 'category':
        return currentLanguage === 'en' ? 'Category' : 'Kategorie';
      case 'pdf-tool':
        return 'PDF Tool';
      case 'file-tool':
        return currentLanguage === 'en' ? 'File Tool' : 'Datei Tool';
      default:
        return '';
    }
  };

  return (
    <>
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to={currentLanguage === 'en' ? '/en/' : '/de/'} className="text-xl font-bold text-primary">
              Toolbox24
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t('navigation.templates')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to={currentLanguage === 'en' ? '/en/all-templates' : '/de/alle-vorlagen'}
                          >
                            <FileText className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {t('templates.allTemplates', { ns: 'templates' })}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {currentLanguage === 'en' 
                                ? 'Discover our complete collection of professional document templates.'
                                : 'Entdecken Sie unsere komplette Sammlung professioneller Dokumentvorlagen.'
                              }
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <NavigationMenuLink asChild>
                        <Link to={currentLanguage === 'en' ? '/en/category/kuendigungen' : '/de/kategorie/kuendigungen'} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('templates.categories.kuendigungen.name', { ns: 'templates' })}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('templates.categories.kuendigungen.description', { ns: 'templates' })}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to={currentLanguage === 'en' ? '/en/category/bewerbungen' : '/de/kategorie/bewerbungen'} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('templates.categories.bewerbungen.name', { ns: 'templates' })}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('templates.categories.bewerbungen.description', { ns: 'templates' })}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t('navigation.pdfTools')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to={currentLanguage === 'en' ? '/en/pdf-tools' : '/de/pdf-tools'}
                          >
                            <Wrench className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {t('tools.pdfTools.title', { ns: 'tools' })}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {t('tools.pdfTools.description', { ns: 'tools' })}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <NavigationMenuLink asChild>
                        <Link to={currentLanguage === 'en' ? '/en/pdf-tools/merge-pdf' : '/de/pdf-tools/pdf-zusammenfuegen'} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.pdfTools.merge.title', { ns: 'tools' })}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.pdfTools.merge.description', { ns: 'tools' })}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to={currentLanguage === 'en' ? '/en/pdf-tools/compress-pdf' : '/de/pdf-tools/pdf-komprimieren'} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.pdfTools.compress.title', { ns: 'tools' })}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.pdfTools.compress.description', { ns: 'tools' })}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t('navigation.fileTools')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to={currentLanguage === 'en' ? '/en/file-tools' : '/de/datei-tools'}
                          >
                            <Image className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {t('tools.fileTools.title', { ns: 'tools' })}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {t('tools.fileTools.description', { ns: 'tools' })}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <NavigationMenuLink asChild>
                        <Link to={currentLanguage === 'en' ? '/en/file-tools/compress-image' : '/de/datei-tools/bild-komprimieren'} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.fileTools.imageCompress.title', { ns: 'tools' })}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.fileTools.imageCompress.description', { ns: 'tools' })}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to={currentLanguage === 'en' ? '/en/file-tools/convert-image' : '/de/datei-tools/bild-konvertieren'} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.fileTools.imageConverter.title', { ns: 'tools' })}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.fileTools.imageConverter.description', { ns: 'tools' })}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Search Bar */}
            <div className="hidden md:block relative flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Button type="submit" size="sm" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Search Results Dropdown */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-3 rounded hover:bg-muted transition-colors"
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
                              <Badge variant="secondary" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
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

            {/* Language Switcher and Mobile Menu */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={toggleMobileMenu} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Search */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              <div>
                <button
                  onClick={() => toggleSubmenu('templates')}
                  className="flex items-center justify-between w-full py-2 text-sm font-medium"
                >
                  {t('navigation.templates')}
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSubmenu === 'templates' ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedSubmenu === 'templates' && (
                  <div className="ml-4 mt-2 space-y-2">
                    <button 
                      onClick={() => handleMobileNavigation('/alle-vorlagen')}
                      className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('templates.allTemplates', { ns: 'templates' })}
                    </button>
                    <button 
                      onClick={() => handleMobileNavigation('/kategorie/kuendigungen')}
                      className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('templates.categories.kuendigungen.name', { ns: 'templates' })}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSubmenu('pdf-tools')}
                  className="flex items-center justify-between w-full py-2 text-sm font-medium"
                >
                  {t('navigation.pdfTools')}
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSubmenu === 'pdf-tools' ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedSubmenu === 'pdf-tools' && (
                  <div className="ml-4 mt-2 space-y-2">
                    <button 
                      onClick={() => handleMobileNavigation('/pdf-tools')}
                      className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('tools.pdfTools.title', { ns: 'tools' })}
                    </button>
                    <button 
                      onClick={() => handleMobileNavigation(currentLanguage === 'en' ? '/pdf-tools/merge-pdf' : '/pdf-tools/pdf-zusammenfuegen')}
                      className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('tools.pdfTools.merge.title', { ns: 'tools' })}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSubmenu('file-tools')}
                  className="flex items-center justify-between w-full py-2 text-sm font-medium"
                >
                  {t('navigation.fileTools')}
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSubmenu === 'file-tools' ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedSubmenu === 'file-tools' && (
                  <div className="ml-4 mt-2 space-y-2">
                    <button 
                      onClick={() => handleMobileNavigation('/datei-tools')}
                      className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('tools.fileTools.title', { ns: 'tools' })}
                    </button>
                    <button 
                      onClick={() => handleMobileNavigation(currentLanguage === 'en' ? '/file-tools/compress-image' : '/datei-tools/bild-komprimieren')}
                      className="block w-full text-left py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('tools.fileTools.imageCompress.title', { ns: 'tools' })}
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Links */}
              <button 
                onClick={() => handleMobileNavigation('/kontakt')}
                className="block w-full text-left py-2 text-sm font-medium"
              >
                {t('navigation.contact')}
              </button>
              <button 
                onClick={() => handleMobileNavigation('/impressum')}
                className="block w-full text-left py-2 text-sm font-medium"
              >
                {t('navigation.legal')}
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const LanguageDropdown = () => {
  const { currentLanguage, switchLanguage } = useLanguage();

  const languages = [
    { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLang?.flag} {currentLang?.name}
          </span>
          <span className="sm:hidden">
            {currentLang?.flag}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={`gap-2 ${
              currentLanguage === language.code ? 'bg-accent' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
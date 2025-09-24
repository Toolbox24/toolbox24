export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  slug: string;
  downloadUrl: string; // Currently all point to same test file
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: "kuendigung",
    name: "Kündigungen",
    description: "Vorlagen für alle Arten von Kündigungen – Fitnessstudio, Mietvertrag, Handyvertrag & mehr.",
    icon: "FileX",
    slug: "kuendigung"
  },
  {
    id: "bewerbung",
    name: "Bewerbungen",
    description: "Muster für Bewerbungsschreiben, Lebenslauf und Deckblatt.",
    icon: "FileText",
    slug: "bewerbung"
  },
  {
    id: "vertraege",
    name: "Verträge & Arbeit",
    description: "Arbeitsverträge, Arbeitszeugnisse, Urlaubsanträge & mehr.",
    icon: "FileSignature",
    slug: "vertraege"
  },
  {
    id: "finanzen",
    name: "Finanzen",
    description: "Mahnungen, Ratenzahlungen, SEPA-Widerruf & Finanzdokumente.",
    icon: "Euro",
    slug: "finanzen"
  },
  {
    id: "alltag",
    name: "Alltag & Privates",
    description: "Vollmachten, Patientenverfügung, Widerruf Onlinekauf.",
    icon: "Home",
    slug: "alltag"
  },
  {
    id: "schule",
    name: "Schule & Uni",
    description: "Exmatrikulation, Abgabefrist verlängern, Praktikumsbestätigung.",
    icon: "GraduationCap",
    slug: "schule"
  },
  {
    id: "business",
    name: "Business",
    description: "Angebote, Auftragsbestätigungen, NDA, Rechnungsvorlagen.",
    icon: "Briefcase",
    slug: "business"
  }
];

export const templates: Template[] = [
  // Kündigungen
  {
    id: "kuendigung-fitnessstudio",
    title: "Kündigung Fitnessstudio",
    description: "Professionelle Vorlage zur Kündigung Ihres Fitnessstudio-Vertrags mit allen wichtigen rechtlichen Hinweisen.",
    category: "kuendigung",
    keywords: ["kündigung", "fitnessstudio", "vertrag", "sport"],
    slug: "kuendigung-fitnessstudio",
    downloadUrl: "https://docs.google.com/document/d/1tOvXdDRkLfB72i01bg3RUFhiIg9t4WyU/export?format=docx"
  },
  {
    id: "kuendigung-mietvertrag",
    title: "Kündigung Mietvertrag",
    description: "Rechtssichere Vorlage für die Kündigung Ihres Mietvertrags mit korrekten Fristen und Formulierungen.",
    category: "kuendigung",
    keywords: ["kündigung", "mietvertrag", "wohnung", "miete"],
    slug: "kuendigung-mietvertrag",
    downloadUrl: "/assets/test-vorlage.docx"
  },
  {
    id: "kuendigung-handyvertrag",
    title: "Kündigung Handyvertrag",
    description: "Einfache Vorlage zur Kündigung Ihres Mobilfunkvertrags mit allen notwendigen Angaben.",
    category: "kuendigung",
    keywords: ["kündigung", "handy", "mobilfunk", "vertrag"],
    slug: "kuendigung-handyvertrag",
    downloadUrl: "/assets/test-vorlage.docx"
  },

  // Bewerbungen
  {
    id: "bewerbungsschreiben-vorlage",
    title: "Bewerbungsschreiben Vorlage",
    description: "Moderne Bewerbungsschreiben-Vorlage mit professionellem Layout für Ihre erfolgreiche Bewerbung.",
    category: "bewerbung",
    keywords: ["bewerbung", "anschreiben", "job", "karriere"],
    slug: "bewerbungsschreiben-vorlage",
    downloadUrl: "/assets/test-vorlage.docx"
  },
  {
    id: "lebenslauf-vorlage",
    title: "Lebenslauf Vorlage",
    description: "Professionelle Lebenslauf-Vorlage im modernen Design mit optimaler Struktur für Personaler.",
    category: "bewerbung",
    keywords: ["lebenslauf", "cv", "bewerbung", "karriere"],
    slug: "lebenslauf-vorlage",
    downloadUrl: "/assets/test-vorlage.docx"
  },
  {
    id: "absage-bewerbung",
    title: "Absage Bewerbung",
    description: "Höfliche Vorlage zur Absage einer Bewerbung oder eines Jobangebots mit professionellen Formulierungen.",
    category: "bewerbung",
    keywords: ["absage", "bewerbung", "jobangebot", "höflich"],
    slug: "absage-bewerbung",
    downloadUrl: "/assets/test-vorlage.docx"
  },

  // Verträge & Arbeit
  {
    id: "arbeitsvertrag-kuendigung",
    title: "Arbeitsvertrag Kündigung",
    description: "Rechtssichere Vorlage zur Kündigung Ihres Arbeitsvertrags unter Einhaltung aller Kündigungsfristen.",
    category: "vertraege",
    keywords: ["kündigung", "arbeitsvertrag", "job", "arbeitgeber"],
    slug: "arbeitsvertrag-kuendigung",
    downloadUrl: "/assets/test-vorlage.docx"
  },

  // Finanzen
  {
    id: "mahnung-vorlage",
    title: "Mahnung Vorlage",
    description: "Professionelle Mahnungsvorlage für offene Forderungen mit rechtlich korrekten Formulierungen.",
    category: "finanzen",
    keywords: ["mahnung", "forderung", "zahlung", "schulden"],
    slug: "mahnung-vorlage",
    downloadUrl: "/assets/test-vorlage.docx"
  },
  {
    id: "sepa-widerruf",
    title: "SEPA-Widerruf",
    description: "Vorlage zum Widerruf einer SEPA-Lastschriftermächtigung mit allen notwendigen Angaben.",
    category: "finanzen",
    keywords: ["sepa", "widerruf", "lastschrift", "bank"],
    slug: "sepa-widerruf",
    downloadUrl: "/assets/test-vorlage.docx"
  },

  // Alltag
  {
    id: "widerruf-vorlage",
    title: "Widerruf Vorlage",
    description: "Allgemeine Widerrufsvorlage für Online-Käufe und Verträge mit 14-tägigem Widerrufsrecht.",
    category: "alltag",
    keywords: ["widerruf", "online", "kauf", "rückgabe"],
    slug: "widerruf-vorlage",
    downloadUrl: "/assets/test-vorlage.docx"
  }
];

// Helper functions
export const getTemplateBySlug = (slug: string): Template | undefined => {
  return templates.find(template => template.slug === slug);
};

export const getTemplatesByCategory = (categorySlug: string): Template[] => {
  return templates.filter(template => template.category === categorySlug);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
};

export const searchTemplates = (query: string): Template[] => {
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(template => 
    template.title.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};
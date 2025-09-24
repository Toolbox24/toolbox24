import { templates, categories } from "@/data/templates";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'category' | 'pdf-tool' | 'file-tool';
  path: string;
  keywords: string[];
}

// PDF Tools
const pdfTools: SearchResult[] = [
  {
    id: "pdf-merge",
    title: "PDF zusammenfügen",
    description: "Mehrere PDF-Dateien zu einem Dokument vereinen",
    type: "pdf-tool",
    path: "/pdf-tools/pdf-zusammenfuegen",
    keywords: ["pdf", "zusammenfügen", "merge", "verbinden", "vereinen"]
  },
  {
    id: "pdf-compress",
    title: "PDF komprimieren",
    description: "PDF-Dateigröße reduzieren ohne Qualitätsverlust",
    type: "pdf-tool",
    path: "/pdf-tools/pdf-komprimieren",
    keywords: ["pdf", "komprimieren", "verkleinern", "dateigröße", "compress"]
  },
  {
    id: "pdf-split",
    title: "PDF teilen",
    description: "Seiten aus PDF-Dokumenten extrahieren",
    type: "pdf-tool",
    path: "/pdf-tools/pdf-teilen",
    keywords: ["pdf", "teilen", "trennen", "seiten", "split", "extrahieren"]
  },
  {
    id: "pdf-to-word",
    title: "PDF in Word umwandeln",
    description: "PDF-Dateien in bearbeitbare Word-Dokumente konvertieren",
    type: "pdf-tool",
    path: "/pdf-tools/pdf-zu-word",
    keywords: ["pdf", "word", "docx", "konvertieren", "umwandeln"]
  },
  {
    id: "word-to-pdf",
    title: "Word in PDF umwandeln",
    description: "Word-Dokumente in PDF-Format konvertieren",
    type: "pdf-tool",
    path: "/pdf-tools/word-zu-pdf",
    keywords: ["word", "pdf", "docx", "konvertieren", "umwandeln"]
  },
  {
    id: "pdf-to-images",
    title: "PDF in Bilder umwandeln",
    description: "PDF-Seiten in JPG oder PNG Bilder konvertieren",
    type: "pdf-tool",
    path: "/pdf-tools/pdf-zu-bilder",
    keywords: ["pdf", "bilder", "jpg", "png", "konvertieren", "images"]
  },
  {
    id: "images-to-pdf",
    title: "Bilder in PDF umwandeln",
    description: "JPG, PNG und andere Bilder in PDF konvertieren",
    type: "pdf-tool",
    path: "/pdf-tools/bilder-zu-pdf",
    keywords: ["bilder", "pdf", "jpg", "png", "konvertieren", "images"]
  },
  {
    id: "pdf-delete-pages",
    title: "Seiten aus PDF löschen",
    description: "Unerwünschte Seiten aus PDF-Dokumenten entfernen",
    type: "pdf-tool",
    path: "/pdf-tools/seiten-loeschen",
    keywords: ["pdf", "seiten", "löschen", "entfernen", "delete"]
  }
];

// File Tools
const fileTools: SearchResult[] = [
  {
    id: "image-compress",
    title: "Bild komprimieren",
    description: "Bildgröße reduzieren ohne sichtbaren Qualitätsverlust",
    type: "file-tool",
    path: "/datei-tools/bild-komprimieren",
    keywords: ["bild", "komprimieren", "verkleinern", "jpg", "png", "webp"]
  },
  {
    id: "image-resize",
    title: "Bildgröße ändern",
    description: "Abmessungen von Bildern durch neue Breite und Höhe ändern",
    type: "file-tool",
    path: "/datei-tools/bild-groesse-aendern",
    keywords: ["bild", "größe", "resize", "abmessungen", "breite", "höhe"]
  },
  {
    id: "image-crop",
    title: "Bild zuschneiden",
    description: "Bilder durch Ziehen eines Auswahlbereichs zurechtschneiden",
    type: "file-tool",
    path: "/datei-tools/bild-zuschneiden",
    keywords: ["bild", "zuschneiden", "crop", "ausschnitt", "bereich"]
  },
  {
    id: "image-rotate",
    title: "Bild drehen",
    description: "Bilder um 90°, 180°, 270° drehen oder spiegeln",
    type: "file-tool",
    path: "/datei-tools/bild-drehen",
    keywords: ["bild", "drehen", "rotate", "spiegeln", "flip"]
  },
  {
    id: "remove-background",
    title: "Hintergrund entfernen",
    description: "KI-basierte Hintergrundentfernung für Personen- und Objektbilder",
    type: "file-tool",
    path: "/datei-tools/hintergrund-entfernen",
    keywords: ["hintergrund", "entfernen", "freistellen", "ki", "background"]
  },
  // Converter Tools
  {
    id: "png-to-jpg",
    title: "PNG zu JPG",
    description: "PNG Bilder in JPG Format konvertieren",
    type: "file-tool",
    path: "/bild/png-zu-jpg",
    keywords: ["png", "jpg", "jpeg", "konvertieren", "converter"]
  },
  {
    id: "jpg-to-png",
    title: "JPG zu PNG",
    description: "JPG Bilder in verlustfreies PNG Format umwandeln",
    type: "file-tool",
    path: "/bild/jpg-zu-png",
    keywords: ["jpg", "jpeg", "png", "konvertieren", "converter"]
  },
  {
    id: "webp-to-jpg",
    title: "WEBP zu JPG",
    description: "WEBP Bilder in JPG Format konvertieren",
    type: "file-tool",
    path: "/bild/webp-zu-jpg",
    keywords: ["webp", "jpg", "jpeg", "konvertieren", "converter"]
  },
  {
    id: "webp-to-png",
    title: "WEBP zu PNG",
    description: "WEBP Bilder in PNG Format umwandeln",
    type: "file-tool",
    path: "/bild/webp-zu-png",
    keywords: ["webp", "png", "konvertieren", "converter"]
  },
  {
    id: "heic-to-jpg",
    title: "HEIC zu JPG",
    description: "iPhone HEIC Bilder in JPG Format konvertieren",
    type: "file-tool",
    path: "/bild/heic-zu-jpg",
    keywords: ["heic", "jpg", "jpeg", "iphone", "apple", "konvertieren"]
  },
  {
    id: "avif-to-jpg",
    title: "AVIF zu JPG",
    description: "AVIF Bilder in JPG Format konvertieren",
    type: "file-tool",
    path: "/bild/avif-zu-jpg",
    keywords: ["avif", "jpg", "jpeg", "konvertieren", "converter"]
  },
  {
    id: "gif-to-mp4",
    title: "GIF zu MP4",
    description: "Animierte GIFs in MP4 Videos konvertieren",
    type: "file-tool",
    path: "/gif-zu-mp4",
    keywords: ["gif", "mp4", "video", "animation", "konvertieren"]
  }
];

// Convert templates to search results
const templateSearchResults: SearchResult[] = templates.map(template => ({
  id: template.id,
  title: template.title,
  description: template.description,
  type: 'template' as const,
  path: `/vorlage/${template.slug}`,
  keywords: template.keywords
}));

// Convert categories to search results
const categorySearchResults: SearchResult[] = categories.map(category => ({
  id: category.id,
  title: category.name,
  description: category.description,
  type: 'category' as const,
  path: `/kategorie/${category.slug}`,
  keywords: [category.name.toLowerCase(), category.slug]
}));

// All search results
export const allSearchResults: SearchResult[] = [
  ...templateSearchResults,
  ...categorySearchResults,
  ...pdfTools,
  ...fileTools
];

export const searchServices = (query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase().trim();
  
  return allSearchResults.filter(result => {
    const titleMatch = result.title.toLowerCase().includes(lowercaseQuery);
    const descriptionMatch = result.description.toLowerCase().includes(lowercaseQuery);
    const keywordMatch = result.keywords.some(keyword => 
      keyword.toLowerCase().includes(lowercaseQuery)
    );
    
    return titleMatch || descriptionMatch || keywordMatch;
  }).slice(0, 8); // Limit to 8 results
};
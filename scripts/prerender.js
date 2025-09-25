import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

const routes = [
  '/',
  '/de',
  '/de/pdf-tools',
  '/de/pdf-tools/compress',
  '/de/pdf-tools/split',
  '/de/pdf-tools/merge',
  '/de/pdf-tools/word-to-pdf',
  '/de/pdf-tools/pdf-to-word',
  '/de/pdf-tools/pdf-to-images',
  '/de/pdf-tools/images-to-pdf',
  '/de/pdf-tools/delete-pages',
  '/de/datei-tools',
  '/de/datei-tools/bild-komprimieren',
  '/de/datei-tools/bild-konvertieren',
  '/de/datei-tools/bild-zuschneiden',
  '/de/datei-tools/bild-groesse-aendern',
  '/de/datei-tools/bild-drehen',
  '/de/datei-tools/hintergrund-entfernen',
  '/de/datei-tools/webp-konverter',
  '/de/datei-tools/heic-to-jpg',
  '/de/datei-tools/gif-to-mp4',
  '/de/bild/jpg-to-png',
  '/de/bild/png-to-jpg',
  '/de/bild/webp-to-jpg',
  '/de/bild/webp-to-png',
  '/de/bild/heic-to-jpg',
  '/de/bild/avif-to-jpg',
  '/de/bild/jpeg-compress',
  '/de/bild/png-compress',
  '/de/bild/gif-compress',
  '/de/bild/svg-compress',
  '/de/vorlagen',
  '/de/blog',
  '/de/alle-tools',
  '/de/kontakt',
  '/de/impressum',
  '/de/rechtliches'
];

async function prerender() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:8080';
  
  for (const route of routes) {
    try {
      console.log(`Prerendering ${route}...`);
      
      await page.goto(`${baseUrl}${route}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for React to render
      await page.waitForSelector('h1', { timeout: 10000 });
      
      const html = await page.content();
      
      // Create directory structure
      const filePath = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
      const dir = path.dirname(filePath);
      
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, html);
      
      console.log(`✓ Prerendered ${route} -> ${filePath}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${route}:`, error.message);
    }
  }

  await browser.close();
  console.log('Prerendering complete!');
}

prerender().catch(console.error);
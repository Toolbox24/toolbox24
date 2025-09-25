import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

const routes = [
  '/',
  '/pdf-tools',
  '/datei-tools', 
  '/alle-tools',
  '/pdf-zusammenfuegen',
  '/pdf-komprimieren',
  '/pdf-teilen',
  '/jpg-komprimieren',
  '/png-komprimieren',
  '/jpg-zu-png',
  '/png-zu-jpg',
  '/webp-zu-jpg',
  '/heic-zu-jpg',
  '/bilder-zu-pdf',
  '/gif-zu-mp4',
  '/kontakt',
  '/impressum',
  '/rechtliches'
];

async function prerender() {
  // Check if dist directory exists
  try {
    await fs.access('dist');
  } catch {
    console.error('Error: dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Serve the dist directory using a local server
  const baseUrl = 'http://localhost:8080';
  
  for (const route of routes) {
    try {
      console.log(`Prerendering ${route}...`);
      
      await page.goto(`${baseUrl}${route}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for React to render and ensure content is loaded
      await page.waitForSelector('h1', { timeout: 15000 });
      
      // Additional wait for dynamic content
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      
      // Create directory structure
      const filePath = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
      const dir = path.dirname(filePath);
      
      await fs.mkdir(dir, { recursive: true });
      
      // Clean up the HTML for better SEO
      const cleanedHtml = html
        .replace(/data-reactroot=""/g, '')
        .replace(/data-react-helmet="true"/g, '');
      
      await fs.writeFile(filePath, cleanedHtml);
      
      console.log(`✓ Prerendered ${route} -> ${filePath}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${route}:`, error.message);
    }
  }

  await browser.close();
  console.log('Prerendering complete! Static HTML files generated for SEO.');
}

prerender().catch(console.error);
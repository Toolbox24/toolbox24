import { exec } from 'child_process';
import { promisify } from 'util';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

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

async function generateStatic() {
  console.log('🚀 Starting static site generation...');

  // First build the React app
  console.log('📦 Building React app...');
  await execAsync('npm run build');

  // Start a server to serve the built files
  console.log('🌐 Starting preview server...');
  const serverProcess = exec('npx serve -s dist -l 8081');
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:8081';
  
  for (const route of routes) {
    try {
      console.log(`⚡ Prerendering ${route}...`);
      
      await page.goto(`${baseUrl}${route}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for React to render content
      await page.waitForSelector('h1', { timeout: 15000 });
      await page.waitForTimeout(1000);
      
      const html = await page.content();
      
      // Create directory structure
      const filePath = route === '/' ? 'dist/index.html' : `dist${route}/index.html`;
      const dir = path.dirname(filePath);
      
      await fs.mkdir(dir, { recursive: true });
      
      // Enhance HTML for SEO
      const enhancedHtml = html
        .replace(/data-reactroot=""/g, '')
        .replace(/data-react-helmet="true"/g, '')
        .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove inline scripts for cleaner HTML
        .replace(/<!--.*?-->/gs, ''); // Remove comments
      
      await fs.writeFile(filePath, enhancedHtml);
      
      console.log(`✅ Generated ${route} -> ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${route}:`, error.message);
    }
  }

  await browser.close();
  
  // Kill the server
  serverProcess.kill();
  
  console.log('🎉 Static site generation complete! SEO-ready HTML files created.');
}

generateStatic().catch(console.error);
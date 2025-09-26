import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

// Only prerender the homepage for now
const routesToPrerender = ['/de/']

;(async () => {
  for (const url of routesToPrerender) {
    const { html, helmetContext } = render(url);
    let finalHtml = template.replace(`<!--app-html-->`, html)
    
    // Extract and inject helmet tags
    if (helmetContext.helmet) {
      const { title, meta, link } = helmetContext.helmet
      if (title) finalHtml = finalHtml.replace('<title>Toolbox24 - Kostenlose Tools für PDF, Bilder & Vorlagen</title>', title.toString())
      if (meta) finalHtml = finalHtml.replace('<meta name="description" content="Kostenlose Online-Tools für PDF-Bearbeitung, Bildkonvertierung und professionelle Vorlagen. Direkt im Browser, ohne Upload - sicher und effizient." />', meta.toString())
      if (link) finalHtml = finalHtml.replace('</head>', `${link.toString()}</head>`)
    }

    const filePath = `dist${url === '/de/' ? '/de/index' : url}.html`
    const dir = path.dirname(toAbsolute(filePath))
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(toAbsolute(filePath), finalHtml)
    console.log('pre-rendered:', filePath)
  }
})()
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

const routesToPrerender = [
  '/de/',
  '/de/pdf-tools/alle',
  '/de/datei-tools/alle',
  '/de/alle-tools',
  '/de/pdf-tools/pdf-zusammenfuegen',
  '/de/pdf-tools/pdf-komprimieren',
  '/de/datei-tools/bild-komprimieren'
]

;(async () => {
  for (const url of routesToPrerender) {
    const appHtml = render(url);
    const html = template.replace(`<!--app-html-->`, appHtml)

    const filePath = `dist${url === '/de/' ? '/de/index' : url}.html`
    const dir = path.dirname(toAbsolute(filePath))
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(toAbsolute(filePath), html)
    console.log('pre-rendered:', filePath)
  }
})()
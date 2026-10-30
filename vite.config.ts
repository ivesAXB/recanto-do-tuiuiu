import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Absolute site address without trailing slash, e.g. "https://ivesaxb.github.io/recanto-do-tuiuiu".
// Set by GitHub Actions (configure-pages base_url); empty locally, so links stay relative.
const siteUrl = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')

// Fills __SITE_URL__ in index.html (Open Graph, JSON-LD) and emits robots.txt and sitemap.xml.
// robots.txt/sitemap.xml only take effect at a domain root (i.e. after the custom domain switch).
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
      if (siteUrl) {
        // Hash routes (#/admin) are invisible to crawlers, so the home page is the only URL
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets VITE_BASE ("/recanto-do-tuiuiu/" on github.io, "/" with a custom domain).
  // Locally it stays "/".
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss(), siteMeta()],
})

import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { site } from './src/data/site.ts'

// Absolute site address without trailing slash, e.g. "https://ivesaxb.github.io/recanto-do-tuiuiu".
// Set by GitHub Actions (configure-pages base_url); empty locally, so links stay relative.
const siteUrl = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')

// Structured data (schema.org LodgingBusiness) built from src/data/site.ts: only confirmed facts
function jsonLd() {
  const { address, phone, hours } = site
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: site.name,
    description: site.description,
    url: `${siteUrl}/`,
    image: `${siteUrl}/og-image.jpg`,
    telephone: phone.e164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    checkinTime: `${hours.checkIn}:00${hours.utcOffset}`,
    checkoutTime: `${hours.checkOut}:00${hours.utcOffset}`,
    maximumAttendeeCapacity: site.maxGuests,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Café, almoço e janta inclusos', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Pesca esportiva', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Passeio ecológico de barco', value: true },
    ],
  }
  // Escape "<" so no value can close the <script> tag
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`
}

// Fills __SITE_URL__ and __JSON_LD__ in index.html and emits robots.txt and sitemap.xml.
// robots.txt/sitemap.xml only take effect at a domain root (i.e. after the custom domain switch).
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => html.replace('<!--__JSON_LD__-->', jsonLd()).replaceAll('__SITE_URL__', siteUrl),
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

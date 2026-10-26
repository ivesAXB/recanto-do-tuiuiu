// Uso: node scripts/optimize-images.mjs <pasta-origem> [pasta-destino]
// Gera versões WebP leves (640 e 1280 px) sem NUNCA ampliar a imagem original.
import sharp from 'sharp'
import { readdir, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [src, dest = 'public/media/img'] = process.argv.slice(2)
if (!src) {
  console.error('Uso: node scripts/optimize-images.mjs <pasta-origem> [pasta-destino]')
  process.exit(1)
}

const WIDTHS = [640, 1280] // larguras geradas
const QUALITY = 80
const EXT = /\.(jpe?g|png)$/i

// "Pôr do Sol 2.JPG" -> "por-do-sol-2"
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function walk(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await walk(full)))
    else if (EXT.test(entry.name)) found.push(full)
  }
  return found
}

await mkdir(dest, { recursive: true })
const manifest = {}

for (const file of await walk(src)) {
  const name = slug(path.parse(file).name)
  const meta = await sharp(file).metadata()
  // Nunca gera um tamanho maior que o original
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))]
  const files = []

  for (const w of widths) {
    const out = `${name}-${w}.webp`
    const info = await sharp(file)
      .rotate() // respeita a orientação da foto
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path.join(dest, out))
    files.push({ file: out, width: info.width, height: info.height, kb: Math.round(info.size / 1024) })
  }

  manifest[name] = { original: { width: meta.width, height: meta.height }, files }
  console.log(name, '->', files.map((f) => `${f.width}px ${f.kb}KB`).join(' | '))
}

await writeFile(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\nPronto: ${Object.keys(manifest).length} imagens em ${dest}`)

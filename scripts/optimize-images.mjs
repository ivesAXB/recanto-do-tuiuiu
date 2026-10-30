// Uso: npm run media:images            (lê originais/fotos e grava em public/media/img)
//      node scripts/optimize-images.mjs <pasta-origem> [pasta-destino]
//
// Gera versões WebP (640, 1280 e 1920 px) sem NUNCA ampliar a foto original.
// O tema vem da subpasta: originais/fotos/pousada/quarto.jpg -> tema "pousada".
// manifest.json: legenda, crédito e tema escritos à mão são mantidos ao rodar de novo.
import sharp from 'sharp'
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [src = 'originais/fotos', dest = 'public/media/img'] = process.argv.slice(2)

const WIDTHS = [640, 1280, 1920] // larguras geradas (para o srcset)
const QUALITY = 80
const EXT = /\.(jpe?g|png|webp|tiff?|avif)$/i

// "Pôr do Sol 2.JPG" -> "por-do-sol-2"
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

let sources
try {
  sources = await walk(src)
} catch {
  console.error(`Pasta "${src}" não encontrada. Coloque as fotos originais lá (ela não vai para o Git).`)
  process.exit(1)
}

await mkdir(dest, { recursive: true })
const manifestPath = path.join(dest, 'manifest.json')
let manifest = {}
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
} catch {
  // first run: no manifest yet
}

const seen = new Map()
for (const file of sources) {
  const name = slug(path.parse(file).name)
  if (seen.has(name)) {
    console.warn(`Aviso: "${file}" tem o mesmo nome final que "${seen.get(name)}" (${name}). Renomeie um deles.`)
    continue
  }
  seen.set(name, file)

  // First folder below the source folder is the theme
  const folder = path.relative(src, path.dirname(file)).split(path.sep)[0]
  const theme = folder && folder !== '.' ? slug(folder) : ''

  const meta = await sharp(file).rotate().metadata()
  // EXIF orientation 5-8 means the photo is stored sideways
  const rotated = (meta.orientation ?? 1) >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height
  // Never generate a size larger than the original
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, width)))]
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

  const previous = manifest[name] ?? {}
  const largest = files[files.length - 1]
  manifest[name] = {
    width: largest.width,
    height: largest.height,
    tema: previous.tema || theme,
    legenda: previous.legenda ?? '',
    credito: previous.credito ?? '',
    original: { width, height },
    files,
  }
  if (width < 1920) console.warn(`Aviso: ${name} tem só ${width}px de largura; a versão 1920 não foi gerada.`)
  console.log(name, '->', files.map((f) => `${f.width}px ${f.kb}KB`).join(' | '))
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`\nPronto: ${seen.size} imagens em ${dest}. Legenda e crédito: preencher em ${manifestPath}.`)

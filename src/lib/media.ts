// Responsive image sources from public/media/img/manifest.json (written by scripts/optimize-images.mjs).
// A data file only needs the photo name (e.g. "pousada-externa-horizontal"); widths and size come from here.
import manifest from '../../public/media/img/manifest.json'

type ManifestEntry = { files: { file: string; width: number; height: number }[] }

const base = import.meta.env.BASE_URL
const entries = manifest as Record<string, ManifestEntry>

export type ImageSources = { src: string; srcSet: string; width: number; height: number }

export function imageSources(name: string): ImageSources | null {
  const files = entries[name]?.files
  if (!files?.length) {
    if (import.meta.env.DEV) console.warn(`Foto "${name}" não está no manifest.json (rode npm run media:images).`)
    return null
  }
  const largest = files[files.length - 1]
  return {
    src: `${base}media/img/${files[Math.min(1, files.length - 1)].file}`,
    srcSet: files.map((f) => `${base}media/img/${f.file} ${f.width}w`).join(', '),
    width: largest.width,
    height: largest.height,
  }
}

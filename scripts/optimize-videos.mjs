// Uso: node scripts/optimize-videos.mjs <pasta-origem> [pasta-destino]
// Requer o ffmpeg instalado. Gera um MP4 leve (sem áudio) e um poster JPG por vídeo.
// Nunca amplia: se o vídeo original for menor que 1920 px de largura, mantém o tamanho.
import { execFileSync } from 'node:child_process'
import { readdirSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

const [src, dest = 'public/media/video'] = process.argv.slice(2)
if (!src) {
  console.error('Uso: node scripts/optimize-videos.mjs <pasta-origem> [pasta-destino]')
  process.exit(1)
}

const MAX_WIDTH = 1920
const CRF = 24 // menor = melhor qualidade e arquivo maior
const EXT = /\.(mp4|mov|m4v)$/i
const SCALE = `scale='min(${MAX_WIDTH},iw)':-2`

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const kb = (file) => Math.round(statSync(file).size / 1024)

mkdirSync(dest, { recursive: true })

const videos = readdirSync(src).filter((f) => EXT.test(f))
for (const name of videos) {
  const input = path.join(src, name)
  const base = slug(path.parse(name).name)
  const outVideo = path.join(dest, `${base}.mp4`)
  const outPoster = path.join(dest, `${base}-poster.jpg`)

  // Vídeo: H.264, sem áudio, pronto para começar a tocar antes de baixar tudo
  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-i', input, '-an', '-vf', SCALE, '-c:v', 'libx264', '-crf', String(CRF),
     '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outVideo],
    { stdio: 'inherit' },
  )

  // Poster: um quadro de 1 segundo, aparece enquanto o vídeo carrega
  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-ss', '1', '-i', input, '-frames:v', '1', '-vf', SCALE, '-q:v', '3', outPoster],
    { stdio: 'inherit' },
  )

  console.log(`${base}: ${kb(input)}KB -> ${kb(outVideo)}KB (poster ${kb(outPoster)}KB)`)
}

console.log(`\nPronto: ${videos.length} vídeos em ${dest}`)

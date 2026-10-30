// Uso: npm run media:videos            (lê originais/videos e grava em public/media/video)
//      node scripts/optimize-videos.mjs <pasta-origem> [pasta-destino]
//
// Requer o ffmpeg instalado. Gera um MP4 leve (sem áudio, até 1920 px) e um poster JPG por vídeo.
// Nunca amplia: se o vídeo original for menor que 1920 px de largura, mantém o tamanho.
// Avisa quando um vídeo passa do orçamento de peso (~8 MB), que pesa no celular.
import { execFileSync } from 'node:child_process'
import { readdirSync, mkdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'

const [src = 'originais/videos', dest = 'public/media/video'] = process.argv.slice(2)

const MAX_WIDTH = 1920
const CRF = 24 // menor = melhor qualidade e arquivo maior
const BUDGET_MB = 8 // orçamento de peso por vídeo
const EXT = /\.(mp4|mov|m4v|mkv|webm)$/i
const MAX_FPS = 30 // vídeos de 50/60 quadros por segundo ficam bem mais leves em 30
// Ajustes por vídeo (nome final sem extensão). O vídeo de abertura precisa ser leve: aparece logo ao abrir o site.
const OVERRIDES = {
  'onca-na-arvore-lambendo-a-pata': { maxWidth: 1280, crf: 27 },
}
const scale = (maxWidth) => `scale='min(${maxWidth},iw)':-2`

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const kb = (file) => Math.round(statSync(file).size / 1024)

if (!existsSync(src)) {
  console.error(`Pasta "${src}" não encontrada. Coloque os vídeos originais lá (ela não vai para o Git).`)
  process.exit(1)
}
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
} catch {
  console.error('ffmpeg não encontrado. Instale com: winget install Gyan.FFmpeg (e abra um terminal novo).')
  process.exit(1)
}

mkdirSync(dest, { recursive: true })

const videos = readdirSync(src).filter((f) => EXT.test(f))
const overBudget = []
for (const name of videos) {
  const input = path.join(src, name)
  const base = slug(path.parse(name).name)
  const outVideo = path.join(dest, `${base}.mp4`)
  const outPoster = path.join(dest, `${base}-poster.jpg`)
  const { maxWidth = MAX_WIDTH, crf = CRF } = OVERRIDES[base] ?? {}

  // Vídeo: H.264, sem áudio, pronto para começar a tocar antes de baixar tudo
  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-i', input, '-an', '-vf', `${scale(maxWidth)},fps='min(${MAX_FPS},source_fps)'`, '-c:v', 'libx264', '-crf', String(crf),
     '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outVideo],
    { stdio: 'inherit' },
  )

  // Poster: um quadro de 1 segundo, aparece enquanto o vídeo carrega
  execFileSync(
    'ffmpeg',
    ['-y', '-v', 'error', '-ss', '1', '-i', input, '-frames:v', '1', '-vf', scale(maxWidth), '-q:v', '3', outPoster],
    { stdio: 'inherit' },
  )

  const size = kb(outVideo)
  console.log(`${base}: ${kb(input)}KB -> ${size}KB (poster ${kb(outPoster)}KB)`)
  if (size > BUDGET_MB * 1024) overBudget.push(`${base} (${(size / 1024).toFixed(1)} MB)`)
}

console.log(`\nPronto: ${videos.length} vídeos em ${dest}`)
if (overBudget.length) {
  console.warn(`\nAviso: passaram de ~${BUDGET_MB} MB: ${overBudget.join(', ')}.`)
  console.warn('Sugestões: cortar o vídeo (10 a 20 s bastam), ou aumentar o CRF (ex.: 26 ou 28) neste script.')
}

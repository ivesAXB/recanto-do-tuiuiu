import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { pointerParallax } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const base = import.meta.env.BASE_URL
const imgUrl = (name: string, width: number) => `${base}media/img/${name}-${width}.webp`

// Para trocar uma foto, mude só o "image" (nome do arquivo sem o "-1280.webp").
// Atenção: use fotos que tenham as versões -640 e -1280 em public/media/img.
const PANELS = [
  {
    id: 'amanhecer',
    title: 'Amanhecer',
    text: 'Os tuiuiús chegam do ninho em busca de peixe fresco.',
    image: 'casal-de-tuiuius-comendo-horizontal',
    alt: 'Casal de tuiuiús se alimentando',
    bg: '#3b2a24', // tom quente da manhã
  },
  {
    id: 'pesca',
    title: 'Manhã de pesca',
    text: 'Barco equipado, piloteiro e a emoção de fisgar um Dourado.',
    image: 'homens-pescando-em-barco3',
    alt: 'Pescadores em um barco no rio',
    bg: '#14261f', // verde da marca
  },
  {
    id: 'entardecer',
    title: 'Fim de tarde',
    text: 'Passeio ecológico com roteiro fotográfico.',
    image: 'por-do-sol-horizontal',
    alt: 'Pôr do sol no Pantanal',
    bg: '#3a2620', // tom do entardecer
  },
  {
    id: 'fauna',
    title: 'Pantanal vivo',
    text: 'Jacarés, araras e tuiuiús: a fauna do Pantanal faz parte da paisagem.',
    image: 'imagem-jacare-dentro-da-agua-nitida',
    alt: 'Jacaré dentro da água',
    bg: '#0f1d18',
  },
]

const SIZES = '(min-width: 768px) 60vw, 100vw'

function Label() {
  return <p className="text-sm font-bold tracking-[0.14em] text-gold-400">UM DIA NO RECANTO</p>
}

// Versão para quem pediu menos movimento: grade simples, sem animação
function DayStatic() {
  return (
    <section id="dia" className="px-6 py-24 md:px-16">
      <Label />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {PANELS.map((p) => (
          <article key={p.id}>
            <img
              src={imgUrl(p.image, 1280)}
              srcSet={`${imgUrl(p.image, 640)} 640w, ${imgUrl(p.image, 1280)} 1280w`}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt={p.alt}
              loading="lazy"
              className="aspect-[16/10] w-full rounded-3xl object-cover"
            />
            <h3 className="mt-5 font-display text-3xl">{p.title}</h3>
            <p className="mt-2 text-lg text-sand-300">{p.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

// Versão animada: a seção fica fixa e as cenas trocam conforme a rolagem
function DayPinned() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    let stopPointer = () => {}
    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray<HTMLElement>('[data-day-image]')
      const texts = gsap.utils.toArray<HTMLElement>('[data-day-text]')

      // Só a primeira cena aparece no começo
      gsap.set(images.slice(1), { opacity: 0 })
      gsap.set(texts.slice(1), { opacity: 0, y: 30 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          // Duração da rolagem fixa: 80% da altura da tela por cena
          end: () => `+=${window.innerHeight * PANELS.length * 0.8}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      tl.to({}, { duration: 1 }) // segura a primeira cena

      PANELS.forEach((panel, i) => {
        if (i === 0) return
        const t = 1 + (i - 1) * 2 // cada troca dura 1, com 1 de pausa entre elas
        tl.to(images[i - 1], { opacity: 0, duration: 1 }, t)
          .to(images[i], { opacity: 1, duration: 1 }, t)
          .to(texts[i - 1], { opacity: 0, y: -30, duration: 0.6 }, t)
          .to(texts[i], { opacity: 1, y: 0, duration: 0.6 }, t + 0.5)
          .to(root.current, { backgroundColor: panel.bg, duration: 1 }, t)
      })

      tl.to({}, { duration: 1 }) // segura a última cena

      // Profundidade: a foto aproxima e desce devagar dentro da moldura, enquanto o texto sobe.
      // A escala inicial maior que 1 deixa margem para o deslocamento sem mostrar a borda.
      const total = tl.duration()
      tl.fromTo(images, { scale: 1.08, yPercent: 3 }, { scale: 1.16, yPercent: -3, duration: total }, 0)
      // Text drift only side by side (desktop): on phones the text sits right under the photo and would touch it
      if (window.matchMedia('(min-width: 768px)').matches) {
        tl.fromTo('[data-day-copy]', { y: 40 }, { y: -40, duration: total }, 0)
      }

      if (root.current) stopPointer = pointerParallax(root.current, 12)
    }, root)

    return () => {
      stopPointer()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={root}
      id="dia"
      style={{ backgroundColor: PANELS[0].bg }}
      className="flex h-svh items-center px-6 md:px-16"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.5fr_1fr] md:gap-14">
        <div data-depth="0.6" className="relative aspect-[4/3] overflow-hidden rounded-3xl md:aspect-[16/10]">
          {PANELS.map((p, i) => (
            <img
              key={p.id}
              data-day-image
              src={imgUrl(p.image, 1280)}
              srcSet={`${imgUrl(p.image, 640)} 640w, ${imgUrl(p.image, 1280)} 1280w`}
              sizes={SIZES}
              alt={p.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))}
        </div>

        <div data-day-copy>
          <Label />
          {/* Os textos ficam empilhados no mesmo lugar (grid de uma célula) */}
          {/* Scroll moves the column (y); the pointer moves this inner block, so the two never fight over y */}
          <div data-depth="-0.5" className="mt-6 grid">
            {PANELS.map((p, i) => (
              <div key={p.id} data-day-text className="col-start-1 row-start-1">
                <span className="text-sm font-bold tracking-widest text-gold-400">
                  {String(i + 1).padStart(2, '0')} / {String(PANELS.length).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-4xl md:text-6xl">{p.title}</h3>
                <p className="mt-4 max-w-sm text-lg text-sand-300">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function DayAtRecanto() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return reduced ? <DayStatic /> : <DayPinned />
}

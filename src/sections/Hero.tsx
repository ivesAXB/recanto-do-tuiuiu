import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { introDelay } from '../lib/intro'

gsap.registerPlugin(ScrollTrigger)

const base = import.meta.env.BASE_URL

// Para trocar o vídeo da abertura, mude só este nome (arquivo em public/media/video)
const HERO_VIDEO_NAME = 'video-baixo-para-cima-ate-horizonte-drone-alto-pantanal'
const HERO_VIDEO = `${base}media/video/${HERO_VIDEO_NAME}.mp4`
const HERO_POSTER = `${base}media/video/${HERO_VIDEO_NAME}-poster.jpg`

const HEADLINE = ['O', 'Pantanal', 'começa', 'quando', 'o', 'tuiuiú', 'chega.']
const EMPHASIS_INDEX = 5 // "tuiuiú"

const NAV = [
  { href: '#pesca', label: 'Pesca' },
  { href: '#epocas', label: 'Épocas' },
]

function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-16">
      <a href="#" className="font-display text-2xl font-semibold">
        Recanto do Tuiuiú
      </a>
      <nav aria-label="Principal" className="hidden gap-8 font-medium md:flex">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="transition hover:text-gold-400">
            {item.label}
          </a>
        ))}
      </nav>
      <a
        href="#reservar"
        className="rounded-full bg-tuiuiu-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
      >
        Pedir reserva
      </a>
    </header>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Quem pediu menos movimento no sistema vê tudo parado e sem animação
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause()
      return
    }

    // Wait for the opening curtain (if any) so the title rises as it lifts
    const wait = introDelay()
    const ctx = gsap.context(() => {
      // Entrada: as palavras do título sobem uma a uma, depois o resto aparece
      gsap.from('[data-hero-word]', {
        yPercent: 110,
        opacity: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.08,
        delay: 0.3 + wait,
      })
      gsap.from('[data-hero-fade]', {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 1 + wait,
      })

      // Profundidade ao rolar: o vídeo anda mais devagar que o texto
      const trigger = { trigger: root.current, start: 'top top', scrub: true }
      gsap.to('[data-hero-media]', {
        yPercent: 15,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: { ...trigger, end: 'bottom top' },
      })
      gsap.to('[data-hero-content]', {
        yPercent: -12,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { ...trigger, end: '60% top' },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div data-hero-media className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* Camada escura: dá leitura ao texto e disfarça a baixa resolução do vídeo */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/25 to-forest-900" />
      </div>

      <Header />

      <div data-hero-content className="mt-auto px-6 pb-16 md:px-16 md:pb-24">
        <h1
          aria-label={HEADLINE.join(' ')}
          className="max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl lg:text-8xl"
        >
          {HEADLINE.map((word, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="mr-[0.25em] inline-block overflow-hidden py-[0.1em] align-bottom"
            >
              <span
                data-hero-word
                className={`inline-block ${i === EMPHASIS_INDEX ? 'italic text-gold-400' : ''}`}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p data-hero-fade className="mt-6 max-w-xl text-lg text-sand-300 md:text-xl">
          Pesca esportiva, natureza e conforto rústico no coração do Pantanal matogrossense.
        </p>

        <div data-hero-fade className="mt-8 flex flex-wrap gap-4">
          <a
            href="#reservar"
            className="rounded-full bg-tuiuiu-500 px-8 py-4 font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
          >
            Pedir reserva
          </a>
          <a
            href="#dia"
            className="rounded-full border border-sand-100/70 px-8 py-4 font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
          >
            Conhecer a pousada
          </a>
        </div>
      </div>
    </section>
  )
}

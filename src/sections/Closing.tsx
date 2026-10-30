import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { whatsappUrl } from '../data/site'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const PHOTO = 'imagem-lago-drone-com-barcos'

// Full-screen photo right before the footer. It covers the footer, which waits underneath
// (sticky in Home.tsx) and is uncovered as this section scrolls away.
export default function Closing() {
  const root = useRef<HTMLElement>(null)
  const sources = imageSources(PHOTO)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      // The photo moves slower than the page: depth while it slides over the footer
      gsap.fromTo(
        '[data-closing-photo]',
        { yPercent: -16 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      aria-labelledby="closing-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden"
    >
      {sources && (
        <img
          data-closing-photo
          src={sources.src}
          srcSet={sources.srcSet}
          sizes="100vw"
          alt="Vista do alto de uma baía do Pantanal, com barcos parados perto da margem"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 h-[120%] w-full object-cover"
        />
      )}
      {/* Darker on the text side for contrast */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950/70 md:bg-gradient-to-r md:from-forest-950/20 md:via-forest-950/40 md:to-forest-950/80" />

      <div className="mx-auto w-full max-w-6xl px-6 md:px-16">
        <div className="max-w-xl md:ml-auto">
          <p className="text-sm font-bold tracking-[0.14em] text-sand-100">SUA ESTADIA</p>
          <h2 id="closing-title" className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Ficou alguma dúvida? A gente responde pelo WhatsApp.
          </h2>
          <p className="mt-6 text-lg text-sand-100/90">
            Conte as datas, quantas pessoas vêm e o que querem fazer. O resto a gente combina com você.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-tuiuiu-500 px-8 py-4 font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
          >
            Falar no WhatsApp <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Footer from '../components/Footer'
import Placeholder from '../components/Placeholder'
import { DRAWING_SLOTS, kidsBlocks } from '../data/pequenos'
import { SOON } from '../lib/cards'
import { prefersReducedMotion } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// Soft colors for the activity cards (light backgrounds with dark text: good contrast)
const CARD_COLORS = ['bg-sand-100', 'bg-sage-200', 'bg-gold-400', 'bg-sand-300']

export default function Kids() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      // Gentle "pop" as the cards appear
      gsap.set('[data-kids-pop]', { opacity: 0 })
      ScrollTrigger.batch('[data-kids-pop]', {
        start: 'top 90%',
        once: true,
        onEnter: (items) =>
          gsap.fromTo(
            items,
            { opacity: 0, y: 30, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.1 },
          ),
      })
      // Slow floating shapes in the header
      gsap.to('[data-float]', {
        y: -14,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.8, from: 'random' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <title>Pantanal para os pequenos | Recanto do Tuiuiú</title>
      <meta
        name="description"
        content="Curiosidades sobre o Pantanal para as crianças, na Pousada Recanto do Tuiuiú."
      />
      <main ref={root} className="mx-auto max-w-6xl px-6 py-10 md:px-16">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 font-medium transition hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100"
        >
          <span aria-hidden="true">←</span> Voltar ao início
        </Link>

        <header className="relative mt-10 overflow-hidden rounded-[2.5rem] bg-forest-800 px-8 py-14 md:px-14 md:py-20">
          {/* Decorative shapes */}
          <span
            data-float
            aria-hidden="true"
            className="absolute -top-6 right-10 h-24 w-24 rounded-full bg-gold-400/40"
          />
          <span
            data-float
            aria-hidden="true"
            className="absolute right-40 bottom-6 h-12 w-12 rounded-full bg-tuiuiu-500/50"
          />
          <span
            data-float
            aria-hidden="true"
            className="absolute top-10 right-64 h-8 w-8 rounded-full bg-sage-200/60"
          />
          <p className="relative text-sm font-bold tracking-[0.14em] text-gold-400">PANTANAL PARA OS PEQUENOS</p>
          <h1 className="relative mt-3 max-w-xl font-display text-5xl leading-tight md:text-6xl">
            Vamos conhecer o Pantanal?
          </h1>
          <p className="relative mt-4 max-w-lg text-lg text-sand-300">
            Um cantinho para as crianças descobrirem os bichos, a água e as cores do Pantanal.
          </p>
        </header>

        <section aria-labelledby="curiosidades" className="mt-16">
          <h2 id="curiosidades" className="font-display text-4xl">
            Curiosidades
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {kidsBlocks.map((b, i) => (
              <li
                key={b.titulo}
                data-kids-pop
                className={`rounded-[2rem] p-8 text-forest-900 ${CARD_COLORS[i % CARD_COLORS.length]}`}
              >
                <h3 className="font-display text-3xl">{b.titulo}</h3>
                <p className={`mt-3 text-lg ${b.texto ? '' : 'italic opacity-70'}`}>{b.texto || SOON}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="mural" className="mt-16">
          <h2 id="mural" className="font-display text-4xl">
            Mural de desenhos
          </h2>
          <p
            role="note"
            className="mt-4 max-w-2xl rounded-2xl border border-gold-400/50 bg-forest-800 p-5 text-sand-100"
          >
            Os desenhos das crianças só serão publicados com a autorização dos pais ou responsáveis.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
            {Array.from({ length: DRAWING_SLOTS }, (_, i) => (
              <li key={i} data-kids-pop className="overflow-hidden rounded-[2rem]">
                <Placeholder description="Desenho de criança: espaço reservado" aspect="1 / 1" />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}

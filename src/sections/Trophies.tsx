import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Placeholder from '../components/Placeholder'
import { instagramUrl } from '../data/site'
import { trophies, type Trophy } from '../data/trophies'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

const ASPECT = '4 / 5'

function caption(t: Trophy) {
  if (t.provisorio) return t.legenda
  return [t.especie, t.pesoKg ? `${t.pesoKg.toLocaleString('pt-BR')} kg` : '', t.ano, t.pescador]
    .filter(Boolean)
    .join(' · ')
}

// copy = true for the duplicated half of the loop: hidden from screen readers and from the Tab key
function TrophyCard({ trophy, copy }: { trophy: Trophy; copy?: boolean }) {
  // Never show a real photo of a person without authorization (LGPD)
  const sources = trophy.foto && trophy.autorizado ? imageSources(trophy.foto) : null
  const text = caption(trophy)
  return (
    <li className="w-60 shrink-0 md:w-72" aria-hidden={copy || undefined}>
      <figure>
        <div className="overflow-hidden rounded-3xl">
          {sources ? (
            <img
              src={sources.src}
              srcSet={sources.srcSet}
              sizes="288px"
              alt={`${trophy.pescador || 'Pescador'} com um ${trophy.especie}`}
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: ASPECT }}
              className="w-full object-cover"
            />
          ) : (
            <Placeholder description={`Foto de troféu: pescador com um ${trophy.especie}`} aspect={ASPECT} />
          )}
        </div>
        <figcaption className="mt-3 text-sm text-sand-300">{text}</figcaption>
      </figure>
    </li>
  )
}

export default function Trophies() {
  const [reduced] = useState(prefersReducedMotion)
  const track = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (reduced || !track.current) return
    // Moving half the track (one full copy) lands on the same picture: an endless loop without a seam.
    // Constant speed, never pauses (Ives's choice); "reduce motion" gets the still row below.
    const slide = gsap.to(track.current, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 })
    return () => {
      slide.revert()
    }
  }, [reduced])

  return (
    <section id="trofeus" aria-labelledby="trofeus-titulo" className="overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-16">
        <p className="text-sm font-bold tracking-[0.14em] text-gold-400">TROFÉUS</p>
        <h2 id="trofeus-titulo" className="mt-3 font-display text-4xl md:text-5xl">
          Peixes que contam história.
        </h2>
      </div>

      {reduced ? (
        // Less motion: a still row the visitor scrolls sideways
        <ul className="mt-12 flex gap-6 overflow-x-auto px-6 pb-4 md:px-16">
          {trophies.map((t, i) => (
            <TrophyCard key={i} trophy={t} />
          ))}
        </ul>
      ) : (
        <div className="mt-12">
          {/* Two copies side by side: when the first has fully passed, the loop restarts without a seam */}
          <ul ref={track} className="flex w-max gap-6 pr-6">
            {trophies.map((t, i) => (
              <TrophyCard key={i} trophy={t} />
            ))}
            {trophies.map((t, i) => (
              <TrophyCard key={`copia-${i}`} trophy={t} copy />
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-4 px-6 md:px-16">
        <Link
          to="/peixes"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-tuiuiu-500 px-8 py-4 font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
        >
          Catálogo de peixes <span aria-hidden="true">→</span>
        </Link>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-100/70 px-8 py-4 font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
        >
          Mais no Instagram @recantodotuiuiu
        </a>
      </div>
    </section>
  )
}

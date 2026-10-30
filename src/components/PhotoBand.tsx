import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Band } from '../data/bands'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// A big photo across the whole screen between two green sections, with a short caption.
// The photo moves slower than the page (parallax) and the caption rises in as it arrives.
export default function PhotoBand({ band }: { band: Band }) {
  const root = useRef<HTMLElement>(null)
  const sources = imageSources(band.foto)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      // The photo is 120% tall: room to drift without showing its edges
      gsap.fromTo(
        '[data-band-photo]',
        { yPercent: -16 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      gsap.from('[data-band-caption]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  if (!sources) return null
  return (
    <figure ref={root} className="relative isolate h-[75svh] overflow-hidden md:h-svh">
      <img
        data-band-photo
        src={sources.src}
        srcSet={sources.srcSet}
        sizes="100vw"
        alt={band.alt}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: band.posicao }}
        className="absolute inset-0 -z-10 h-[120%] w-full object-cover"
      />
      {/* Soft fade into the green sections above and below, and contrast for the caption */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-900/60 via-transparent to-forest-900" />
      <figcaption
        data-band-caption
        className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-12 font-display text-3xl leading-tight md:px-16 md:pb-20 md:text-6xl"
      >
        {band.legenda}
      </figcaption>
    </figure>
  )
}

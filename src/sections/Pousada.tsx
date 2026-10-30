import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Placeholder from '../components/Placeholder'
import { pousadaItems, type PousadaItem } from '../data/pousada'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// 3 per row on desktop, 1 on phones
const SIZES = '(min-width: 768px) 33vw, 100vw'
const ASPECT = '4 / 5'

function Photo({ item }: { item: PousadaItem }) {
  const sources = item.foto ? imageSources(item.foto) : null
  if (!sources) return <Placeholder description={item.alt} aspect={ASPECT} />
  return (
    <div className="overflow-hidden" style={{ aspectRatio: ASPECT }}>
      {/* Slightly taller than the frame: room for the parallax without showing edges */}
      <img
        data-parallax
        src={sources.src}
        srcSet={sources.srcSet}
        sizes={SIZES}
        width={sources.width}
        height={sources.height}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        className="h-[115%] w-full object-cover"
      />
    </div>
  )
}

export default function Pousada() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      // Reveal: each photo rises and fades in as it enters the screen
      gsap.set('[data-pousada-item]', { opacity: 0 })
      ScrollTrigger.batch('[data-pousada-item]', {
        start: 'top 85%',
        once: true,
        onEnter: (items) =>
          gsap.fromTo(items, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }),
      })

      // Light parallax: the photo drifts inside its frame while the page scrolls
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -12 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="pousada" className="mx-auto max-w-6xl px-6 py-24 md:px-16">
      <p className="text-sm font-bold tracking-[0.14em] text-gold-400">A POUSADA</p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl">Uma casa no meio do Pantanal.</h2>

      <ul className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
        {pousadaItems.map((item, i) => (
          // Middle column sits lower on desktop: editorial rhythm
          <li key={item.foto ?? `reservado-${i}`} data-pousada-item className={i % 3 === 1 ? 'md:mt-16' : ''}>
            <figure>
              <div className="overflow-hidden rounded-3xl">
                <Photo item={item} />
              </div>
              <figcaption className="mt-4 text-sand-300">{item.legenda}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

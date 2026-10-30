import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { animals, type Animal } from '../data/animals'
import { controlLoop } from '../lib/loop'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

// Ring size follows the screen width (phone) up to a maximum (desktop)
const RING = 'min(94vw, 860px)'
// Per photo: size and distance from the center as a fraction of the ring. Slightly uneven on purpose,
// so the squares look scattered around the text instead of a perfect wheel.
const LAYOUT = [
  { size: 0.2, radius: 0.37 },
  { size: 0.17, radius: 0.4 },
  { size: 0.22, radius: 0.36 },
  { size: 0.18, radius: 0.41 },
  { size: 0.21, radius: 0.37 },
  { size: 0.16, radius: 0.4 },
]
const SECONDS_PER_TURN = 90

function Thumb({ animal }: { animal: Animal }) {
  const sources = animal.foto ? imageSources(animal.foto) : null
  return (
    <span className="block aspect-square overflow-hidden bg-sage-200 outline-2 outline-transparent transition-[outline-color] group-hover:outline-gold-400 group-focus-visible:outline-sand-100">
      {sources ? (
        <img
          src={sources.src}
          srcSet={sources.srcSet}
          sizes="(min-width: 768px) 190px, 22vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        // Placeholder: the link label says which animal it is
        <span className="flex h-full items-center justify-center text-[10px] font-bold tracking-wider text-forest-900 uppercase md:text-xs">
          ilustrativo
        </span>
      )}
    </span>
  )
}

// No visible name (the catalog shows it); the link is still named for screen readers and on hover
function AnimalLink({ animal }: { animal: Animal }) {
  return (
    <Link
      to={`/animais/${animal.slug}`}
      aria-label={animal.nome}
      title={animal.nome}
      className="group block outline-none"
    >
      <Thumb animal={animal} />
    </Link>
  )
}

function Heading({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-bold tracking-[0.14em] text-gold-400">FAUNA</p>
      <h2 className="mt-3 font-display text-4xl leading-tight md:mt-4 md:text-5xl">Quem mora por aqui.</h2>
    </div>
  )
}

// inRing: on phones the middle of the ring is too small for the title, so only the button stays there
function Center({ inRing = false }: { inRing?: boolean }) {
  return (
    <div className="text-center">
      <Heading className={inRing ? 'hidden md:block' : ''} />
      <Link
        to="/animais"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-100/70 px-5 text-sm font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100 mt-4 md:mt-8 md:px-8 md:text-base"
      >
        Ver os animais <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}

export default function AnimalRing() {
  const [reduced] = useState(prefersReducedMotion)
  const area = useRef<HTMLElement>(null)
  const ring = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (reduced || !area.current || !ring.current) return
    let stop = () => {}
    const ctx = gsap.context(() => {
      // Ring turns clockwise; each photo turns back the same amount so it stays upright
      const spin = gsap
        .timeline({ repeat: -1 })
        .to(ring.current, { rotation: 360, duration: SECONDS_PER_TURN, ease: 'none' }, 0)
        .to('[data-ring-item]', { rotation: -360, duration: SECONDS_PER_TURN, ease: 'none' }, 0)
      // Arrives spinning fast (one full turn), then slows down to the calm speed
      stop = controlLoop(area.current!, spin, { speed: 40, settle: 3 })
    }, area)
    return () => {
      stop()
      ctx.revert()
    }
  }, [reduced])

  if (reduced) {
    // Less motion: text and a still grid
    return (
      <section id="animais" className="px-6 py-24 md:px-16">
        <Center />
        <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4">
          {animals.map((a) => (
            <li key={a.slug}>
              <AnimalLink animal={a} />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section ref={area} id="animais" className="overflow-hidden px-4 py-16 md:py-24">
      <Heading className="px-2 text-center md:hidden" />
      <div className="relative mx-auto mt-6 md:mt-0" style={{ width: RING, height: RING }}>
        <ul ref={ring} className="absolute inset-0">
          {animals.map((a, i) => {
            const { size, radius } = LAYOUT[i % LAYOUT.length]
            const angle = (360 / animals.length) * i
            return (
              <li
                key={a.slug}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: `${size * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * ${RING} * ${radius})) rotate(${-angle}deg)`,
                }}
              >
                <div data-ring-item>
                  <AnimalLink animal={a} />
                </div>
              </li>
            )
          })}
        </ul>
        {/* The text stays still in the middle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[24%]">
          <div className="pointer-events-auto">
            <Center inRing />
          </div>
        </div>
      </div>
    </section>
  )
}

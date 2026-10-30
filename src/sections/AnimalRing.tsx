import { useState } from 'react'
import { Link } from 'react-router-dom'
import { animals, type Animal } from '../data/animals'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

// Ring size and radius follow the screen width (phone) up to a maximum (desktop).
// With 6 photos, a diameter equal to the radius makes neighbouring circles touch (ring = 3 × radius).
const RING = 'min(90vw, 630px)'
const RADIUS = 'min(30vw, 210px)'

function Thumb({ animal }: { animal: Animal }) {
  const sources = animal.foto ? imageSources(animal.foto) : null
  return (
    <span className="block aspect-square overflow-hidden rounded-full border-2 border-forest-900 bg-sage-200 transition group-hover:scale-105 group-hover:border-gold-400 group-focus-visible:border-gold-400 motion-reduce:transition-none">
      {sources ? (
        <img
          src={sources.src}
          srcSet={sources.srcSet}
          sizes="(min-width: 768px) 210px, 30vw"
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
      className="group block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900"
    >
      <Thumb animal={animal} />
    </Link>
  )
}

export default function AnimalRing() {
  const [reduced] = useState(prefersReducedMotion)

  return (
    <section id="animais" className="overflow-hidden px-6 py-24 md:px-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold tracking-[0.14em] text-gold-400">FAUNA</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Quem mora por aqui.</h2>
      </div>

      {reduced ? (
        // Less motion: a still grid instead of the spinning ring
        <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4">
          {animals.map((a) => (
            <li key={a.slug}>
              <AnimalLink animal={a} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="animal-ring-area relative mx-auto mt-12" style={{ width: RING, height: RING }}>
          <ul className="animal-ring absolute inset-0">
            {animals.map((a, i) => {
              const angle = (360 / animals.length) * i
              return (
                <li
                  key={a.slug}
                  className="absolute top-1/2 left-1/2 w-1/3"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * ${RADIUS})) rotate(${-angle}deg)`,
                  }}
                >
                  <div className="animal-ring-item">
                    <AnimalLink animal={a} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          to="/animais"
          className="inline-flex min-h-11 items-center rounded-full border border-sand-100/70 px-8 font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
        >
          Ver todos os animais
        </Link>
      </div>
    </section>
  )
}

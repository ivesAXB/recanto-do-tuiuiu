import { useEffect, useRef, useState, type ReactNode } from 'react'
import Placeholder from './Placeholder'
import { SOON } from '../lib/cards'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

// One "label: value" line on the back of a card; empty values show "Em breve"
export function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wider text-forest-700 uppercase">{label}</dt>
      <dd className={value ? '' : 'italic opacity-70'}>{value || SOON}</dd>
    </div>
  )
}

export type CardPhoto = {
  nome: string // name in manifest.json
  alt: string
  credito?: string
}

type Props = {
  id: string // anchor (slug)
  nome: string
  photos: CardPhoto[] // empty = placeholder
  placeholderAlt: string // what the missing photo should show
  showCredit?: boolean // adds "Foto: …" (credit of the photo on the front) at the end of the back
  heading?: 'h2' | 'h3' // level of the name on the front (h3 when the cards sit under group titles)
  children: ReactNode // back of the card
}

const SECONDS_PER_PHOTO = 4.5
const SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'

// Card that flips: hover (mouse) or the button (touch and keyboard).
// Both faces stay in the DOM, so screen readers read the back even when it is turned away.
// Several photos: the front fades from one to the next while the card is on screen;
// the dots below pick a photo. Extra photos are only downloaded when their turn comes.
export default function FlipCard({ id, nome, photos, placeholderAlt, showCredit, heading = 'h2', children }: Props) {
  const Heading = heading
  const [flipped, setFlipped] = useState(false)
  const [current, setCurrent] = useState(0)
  const [moved, setMoved] = useState(false)
  const card = useRef<HTMLLIElement>(null)
  const count = photos.length
  // Photos in the page: the current one, the next (fetched ahead of time) and, once it has moved,
  // the previous one (so it can fade out). The rest are fetched only when their turn comes.
  const mounted = new Set([current, (current + 1) % count])
  if (moved) mounted.add((current - 1 + count) % count)

  const show = (index: number) => {
    setMoved(true)
    setCurrent(index)
  }

  // Automatic slideshow: only while the card is visible, never with "reduce motion"
  useEffect(() => {
    if (count < 2 || flipped || prefersReducedMotion() || !card.current) return
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer)
      if (entry.isIntersecting)
        timer = window.setInterval(() => {
          setMoved(true)
          setCurrent((c) => (c + 1) % count)
        }, SECONDS_PER_PHOTO * 1000)
    })
    observer.observe(card.current)
    return () => {
      observer.disconnect()
      clearInterval(timer)
    }
  }, [count, flipped])

  const credit = photos[current]?.credito

  return (
    <li ref={card} id={id} className="scroll-mt-8">
      <div className="group [perspective:1200px]">
        <div
          className={`relative aspect-[3/4] transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${
            // Full class names written out so Tailwind can find them
            flipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'
          }`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl [backface-visibility:hidden]">
            {count === 0 ? (
              <div className="absolute inset-0">
                <Placeholder description={placeholderAlt} aspect="auto" className="h-full" />
              </div>
            ) : (
              photos.map((photo, i) => {
                const sources = mounted.has(i) ? imageSources(photo.nome) : null
                if (!sources) return null
                return (
                  <img
                    key={photo.nome}
                    src={sources.src}
                    srcSet={sources.srcSet}
                    sizes={SIZES}
                    width={sources.width}
                    height={sources.height}
                    alt={photo.alt}
                    aria-hidden={i !== current || undefined}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none ${
                      i === current ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )
              })
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 to-transparent p-5 pt-16">
              <Heading className="font-display text-3xl text-sand-100">{nome}</Heading>
            </div>
          </div>
          <div className="absolute inset-0 overflow-y-auto rounded-3xl bg-sand-100 p-6 text-forest-900 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {children}
            {showCredit && <p className="mt-4 text-xs opacity-70">Foto: {credit || `crédito ${SOON.toLowerCase()}`}</p>}
          </div>
        </div>
      </div>

      {count > 1 && (
        // Outside the card, so they stay reachable while the mouse flips it
        <div className="mt-3 flex justify-center gap-1" role="group" aria-label={`Fotos de ${nome}`}>
          {photos.map((photo, i) => (
            <button
              key={photo.nome}
              type="button"
              aria-label={`Foto ${i + 1} de ${count}`}
              aria-current={i === current || undefined}
              onClick={() => show(i)}
              className="group/dot inline-flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-sand-100"
            >
              <span
                className={`block h-2 rounded-full transition-all ${i === current ? 'w-5 bg-gold-400' : 'w-2 bg-sand-100/40 group-hover/dot:bg-sand-100/70'}`}
              />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-sand-100/40 px-5 text-sm font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100"
      >
        {flipped ? 'Ver foto' : 'Ver informações'}
        <span className="sr-only"> de {nome}</span>
      </button>
    </li>
  )
}

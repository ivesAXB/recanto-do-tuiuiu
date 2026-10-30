import { useState, type ReactNode } from 'react'
import Placeholder from './Placeholder'
import { SOON } from '../lib/cards'
import { imageSources } from '../lib/media'

// One "label: value" line on the back of a card; empty values show "Em breve"
export function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wider text-forest-700 uppercase">{label}</dt>
      <dd className={value ? '' : 'italic opacity-70'}>{value || SOON}</dd>
    </div>
  )
}

type Props = {
  id: string // anchor (slug)
  nome: string
  foto: string | null // name in manifest.json; null = placeholder
  alt: string
  children: ReactNode // back of the card
}

// Card that flips: hover (mouse) or the button (touch and keyboard).
// Both faces stay in the DOM, so screen readers read the back even when it is turned away.
export default function FlipCard({ id, nome, foto, alt, children }: Props) {
  const [flipped, setFlipped] = useState(false)
  const sources = foto ? imageSources(foto) : null

  return (
    <li id={id} className="scroll-mt-8">
      <div className="group [perspective:1200px]">
        <div
          className={`relative aspect-[3/4] transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${
            // Full class names written out so Tailwind can find them
            flipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'
          }`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl [backface-visibility:hidden]">
            {sources ? (
              <img
                src={sources.src}
                srcSet={sources.srcSet}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                width={sources.width}
                height={sources.height}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0">
                <Placeholder description={alt} aspect="auto" className="h-full" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 to-transparent p-5 pt-16">
              <h2 className="font-display text-3xl text-sand-100">{nome}</h2>
            </div>
          </div>
          <div className="absolute inset-0 overflow-y-auto rounded-3xl bg-sand-100 p-6 text-forest-900 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {children}
          </div>
        </div>
      </div>
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

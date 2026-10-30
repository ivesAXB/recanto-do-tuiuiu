import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Placeholder from '../components/Placeholder'
import { animals, type Animal } from '../data/animals'
import { imageSources } from '../lib/media'

const SOON = 'Em breve'

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wider text-forest-700 uppercase">{label}</dt>
      <dd className={value ? '' : 'italic opacity-70'}>{value || SOON}</dd>
    </div>
  )
}

function Front({ animal }: { animal: Animal }) {
  const sources = animal.foto ? imageSources(animal.foto) : null
  return (
    <>
      {sources ? (
        <img
          src={sources.src}
          srcSet={sources.srcSet}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          width={sources.width}
          height={sources.height}
          alt={animal.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0">
          <Placeholder description={animal.alt} aspect="auto" className="h-full" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 to-transparent p-5 pt-16">
        <h2 className="font-display text-3xl text-sand-100">{animal.nome}</h2>
      </div>
    </>
  )
}

// Card that flips: hover (mouse) or the button (touch and keyboard).
// Both faces stay in the DOM, so screen readers read the back even when it is turned away.
function AnimalCard({ animal }: { animal: Animal }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <li id={animal.slug} className="scroll-mt-8">
      <div className="group [perspective:1200px]">
        <div
          className={`relative aspect-[3/4] transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none ${
            // Full class names written out so Tailwind can find them
            flipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'
          }`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl [backface-visibility:hidden]">
            <Front animal={animal} />
          </div>
          <div
            className={`absolute inset-0 overflow-y-auto rounded-3xl bg-sand-100 p-6 text-forest-900 [backface-visibility:hidden] [transform:rotateY(180deg)]`}
          >
            <p className="font-display text-2xl">{animal.nome}</p>
            <p className={`mt-1 ${animal.cientifico ? 'italic' : 'text-sm italic opacity-70'}`}>
              {animal.cientifico || `Nome científico: ${SOON.toLowerCase()}`}
            </p>
            <p className="mt-4">{animal.texto}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Habitat" value={animal.habitat} />
              <Detail label="Quando ver" value={animal.melhorEpoca} />
              <Detail label="Curiosidade" value={animal.curiosidade} />
            </dl>
            {!animal.revisado && (
              <p className="mt-4 text-xs font-bold tracking-wider text-forest-700 uppercase">Informações em revisão</p>
            )}
            <p className="mt-4 text-xs opacity-70">Foto: {animal.credito || `crédito ${SOON.toLowerCase()}`}</p>
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
        <span className="sr-only"> de {animal.nome}</span>
      </button>
    </li>
  )
}

export default function Animals() {
  const { slug } = useParams()

  // Coming from the ring: bring that animal's card into view and put the focus on its button
  useEffect(() => {
    const card = slug ? document.getElementById(slug) : null
    if (!card) {
      window.scrollTo({ top: 0 })
      return
    }
    card.scrollIntoView({ block: 'start' })
    card.querySelector('button')?.focus({ preventScroll: true })
  }, [slug])

  return (
    <>
      <title>Animais do Pantanal | Recanto do Tuiuiú</title>
      <meta name="description" content="Alguns dos animais que vivem no Pantanal mato-grossense, perto da Pousada Recanto do Tuiuiú." />
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-16">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 font-medium transition hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100"
        >
          <span aria-hidden="true">←</span> Voltar ao início
        </Link>
        <p className="mt-10 text-sm font-bold tracking-[0.14em] text-gold-400">FAUNA</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Animais do Pantanal</h1>
        <p className="mt-4 max-w-xl text-lg text-sand-300">
          Passe o mouse sobre um cartão, ou toque em “Ver informações”, para ler sobre cada animal.
        </p>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <AnimalCard key={a.slug} animal={a} />
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}

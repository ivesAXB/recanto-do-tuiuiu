import { Link, useParams } from 'react-router-dom'
import FlipCard, { CardDetail } from '../components/FlipCard'
import Footer from '../components/Footer'
import { animals, GROUP_TITLES, type AnimalGroup } from '../data/animals'
import { SOON, useScrollToCard } from '../lib/cards'

const GROUPS = Object.keys(GROUP_TITLES) as AnimalGroup[]

export default function Animals() {
  const { slug } = useParams()
  // Coming from the ring: bring that animal's card into view
  useScrollToCard(slug)

  return (
    <>
      <title>Animais do Pantanal | Recanto do Tuiuiú</title>
      <meta
        name="description"
        content="Alguns dos animais que vivem no Pantanal mato-grossense, perto da Pousada Recanto do Tuiuiú."
      />
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
        {/* Jump to a group. Buttons, not "#id" links: with HashRouter "#aves" would be read as a route */}
        <nav aria-label="Grupos de animais" className="mt-8 flex flex-wrap gap-3">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => document.getElementById(`grupo-${g}`)?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-100/40 px-5 text-sm font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100"
            >
              {GROUP_TITLES[g]} <span className="text-sand-300">{animals.filter((a) => a.grupo === g).length}</span>
            </button>
          ))}
        </nav>

        {GROUPS.map((g) => (
          <section key={g} id={`grupo-${g}`} aria-labelledby={`titulo-${g}`} className="mt-16 scroll-mt-8">
            <h2 id={`titulo-${g}`} className="font-display text-4xl">
              {GROUP_TITLES[g]}
            </h2>
            <ul className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {animals
                .filter((a) => a.grupo === g)
                .map((a) => (
                  <FlipCard
                    key={a.slug}
                    id={a.slug}
                    nome={a.nome}
                    photos={a.fotos}
                    placeholderAlt={a.alt}
                    showCredit
                    heading="h3"
                  >
                    <p className="font-display text-2xl">{a.nome}</p>
                    <p className={`mt-1 ${a.cientifico ? 'italic' : 'text-sm italic opacity-70'}`}>
                      {a.cientifico || `Nome científico: ${SOON.toLowerCase()}`}
                    </p>
                    <p className="mt-4">{a.texto}</p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <CardDetail label="Habitat" value={a.habitat} />
                      <CardDetail label="Quando ver" value={a.melhorEpoca} />
                      <CardDetail label="Curiosidade" value={a.curiosidade} />
                    </dl>
                    {!a.revisado && (
                      <p className="mt-4 text-xs font-bold tracking-wider text-forest-700 uppercase">
                        Informações em revisão
                      </p>
                    )}
                  </FlipCard>
                ))}
            </ul>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}

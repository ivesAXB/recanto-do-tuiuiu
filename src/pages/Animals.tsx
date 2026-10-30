import { Link, useParams } from 'react-router-dom'
import FlipCard, { CardDetail } from '../components/FlipCard'
import Footer from '../components/Footer'
import { animals } from '../data/animals'
import { SOON, useScrollToCard } from '../lib/cards'

export default function Animals() {
  const { slug } = useParams()
  // Coming from the ring: bring that animal's card into view
  useScrollToCard(slug)

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
            <FlipCard key={a.slug} id={a.slug} nome={a.nome} foto={a.foto} alt={a.alt}>
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
                <p className="mt-4 text-xs font-bold tracking-wider text-forest-700 uppercase">Informações em revisão</p>
              )}
              <p className="mt-4 text-xs opacity-70">Foto: {a.credito || `crédito ${SOON.toLowerCase()}`}</p>
            </FlipCard>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}

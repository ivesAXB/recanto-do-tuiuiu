import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FlipCard, { CardDetail } from '../components/FlipCard'
import Footer from '../components/Footer'
import { fish } from '../data/fish'
import { useScrollToCard } from '../lib/cards'
import { defesoMessage, loadNextDefeso, type Defeso } from '../lib/defeso'

// Fish catalog: same flip cards as the animals page. The back holds the fishing details
// (baits, best season…), still "Em breve" until checked with the owner.
export default function FishPage() {
  const { slug } = useParams()
  const [defeso, setDefeso] = useState<Defeso | null>(null)
  useScrollToCard(slug)

  // Defeso notice (optional): comes from the admin panel; the page works without it
  useEffect(() => {
    let alive = true
    loadNextDefeso().then((data) => {
      if (alive) setDefeso(data)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <title>Peixes do Pantanal | Recanto do Tuiuiú</title>
      <meta name="description" content="Os peixes da pesca esportiva na Pousada Recanto do Tuiuiú, no Pantanal mato-grossense." />
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-16">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 font-medium transition hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100"
        >
          <span aria-hidden="true">←</span> Voltar ao início
        </Link>
        <p className="mt-10 text-sm font-bold tracking-[0.14em] text-gold-400">PESCA ESPORTIVA</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Peixes do Pantanal</h1>
        <p className="mt-4 max-w-xl text-lg text-sand-300">
          Passe o mouse sobre um cartão, ou toque em “Ver informações”, para ver iscas, épocas e mais sobre cada peixe.
        </p>
        {defeso && (
          <p role="status" className="mt-8 max-w-2xl rounded-2xl border border-gold-400/50 bg-forest-800 p-5 text-sand-100">
            {defesoMessage(defeso)}
          </p>
        )}
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {fish.map((f) => (
            <FlipCard key={f.slug} id={f.slug} nome={f.nome} foto={f.foto} alt={f.alt}>
              <p className="font-display text-2xl">{f.nome}</p>
              {f.cientifico && <p className="mt-1 italic">{f.cientifico}</p>}
              <p className="mt-3">{f.descricao}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <CardDetail label="Iscas" value={f.iscas} />
                <CardDetail label="Melhor época" value={f.melhorEpoca} />
                <CardDetail label="Dificuldade" value={f.dificuldade} />
                <CardDetail label="Peso comum" value={f.pesoComum} />
                <CardDetail label="Observações" value={f.observacoes} />
              </dl>
              {!f.oficial && (
                <p className="mt-4 text-xs font-bold tracking-wider text-forest-700 uppercase">Informações em revisão</p>
              )}
            </FlipCard>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}

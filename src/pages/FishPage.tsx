import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Placeholder from '../components/Placeholder'
import { fish, type Fish } from '../data/fish'
import { defesoMessage, loadNextDefeso, type Defeso } from '../lib/defeso'
import { imageSources } from '../lib/media'

const SOON = 'Em breve'

const link =
  'inline-flex min-h-11 items-center gap-2 font-medium transition hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand-100'

function Photo({ item, sizes }: { item: Fish; sizes: string }) {
  const sources = item.foto ? imageSources(item.foto) : null
  if (!sources) return <Placeholder description={item.alt} aspect="4 / 3" />
  return (
    <img
      src={sources.src}
      srcSet={sources.srcSet}
      sizes={sizes}
      width={sources.width}
      height={sources.height}
      alt={item.alt}
      className="aspect-[4/3] w-full object-cover"
    />
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-forest-800 p-5">
      <dt className="text-xs font-bold tracking-wider text-gold-400 uppercase">{label}</dt>
      <dd className={`mt-1 ${value ? 'text-sand-100' : 'text-sand-300 italic'}`}>{value || SOON}</dd>
    </div>
  )
}

function Detail({ item, defeso }: { item: Fish; defeso: Defeso | null }) {
  return (
    <>
      <title>{`${item.nome} | Peixes do Pantanal | Recanto do Tuiuiú`}</title>
      <meta name="description" content={`${item.nome}: ${item.descricao}`} />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl">
          <Photo item={item} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-[0.14em] text-gold-400">PEIXES DO PANTANAL</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">{item.nome}</h1>
          {item.cientifico && <p className="mt-2 text-lg text-sand-300 italic">{item.cientifico}</p>}
          <p className="mt-6 text-lg">{item.descricao}</p>
          {!item.oficial && (
            <p className="mt-6 inline-block rounded-full bg-sand-100/10 px-3 py-1 text-xs font-bold tracking-wider text-sand-300 uppercase">
              Informações em revisão
            </p>
          )}
          {defeso && (
            <p role="status" className="mt-6 rounded-2xl border border-gold-400/50 bg-forest-800 p-5 text-sand-100">
              {defesoMessage(defeso)}
            </p>
          )}
        </div>
      </div>
      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Iscas" value={item.iscas} />
        <Field label="Melhor época" value={item.melhorEpoca} />
        <Field label="Dificuldade" value={item.dificuldade} />
        <Field label="Peso comum" value={item.pesoComum} />
        <Field label="Observações" value={item.observacoes} />
      </dl>
    </>
  )
}

function List() {
  return (
    <>
      <title>Peixes do Pantanal | Recanto do Tuiuiú</title>
      <meta name="description" content="Os peixes da pesca esportiva na Pousada Recanto do Tuiuiú, no Pantanal mato-grossense." />
      <p className="mt-10 text-sm font-bold tracking-[0.14em] text-gold-400">PESCA ESPORTIVA</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">Peixes do Pantanal</h1>
      <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {fish.map((f) => (
          <li key={f.slug}>
            <Link
              to={`/peixes/${f.slug}`}
              className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100"
            >
              <div className="overflow-hidden rounded-3xl">
                <Photo item={f} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
              </div>
              <h2 className="mt-4 font-display text-3xl transition group-hover:text-gold-400">{f.nome}</h2>
              <p className="mt-1 text-sand-300">{f.descricao}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function FishPage() {
  const { slug } = useParams()
  const item = slug ? fish.find((f) => f.slug === slug) : undefined
  const [defeso, setDefeso] = useState<Defeso | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

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
      <main className="mx-auto max-w-6xl px-6 py-10 md:px-16">
        <nav aria-label="Navegação" className="flex flex-wrap gap-x-8">
          <Link to="/" className={link}>
            <span aria-hidden="true">←</span> Voltar ao início
          </Link>
          {slug && (
            <Link to="/peixes" className={link}>
              Todos os peixes
            </Link>
          )}
        </nav>
        {item ? (
          <Detail item={item} defeso={defeso} />
        ) : slug ? (
          <>
            <h1 className="mt-10 font-display text-4xl">Peixe não encontrado.</h1>
            <p className="mt-4 text-sand-300">
              Veja a{' '}
              <Link to="/peixes" className="underline">
                lista de peixes
              </Link>
              .
            </p>
          </>
        ) : (
          <List />
        )}
      </main>
      <Footer />
    </>
  )
}

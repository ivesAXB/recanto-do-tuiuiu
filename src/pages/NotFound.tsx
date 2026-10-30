import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const button =
  'inline-flex min-h-11 items-center gap-2 rounded-full px-8 py-4 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100'

// Friendly page for addresses that do not exist (e.g. an old or mistyped link)
export default function NotFound() {
  return (
    <>
      <title>Página não encontrada | Recanto do Tuiuiú</title>
      <meta name="robots" content="noindex" />
      <main className="mx-auto flex min-h-[70svh] max-w-3xl flex-col justify-center px-6 py-20 md:px-16">
        <p className="text-sm font-bold tracking-[0.14em] text-gold-400">PÁGINA NÃO ENCONTRADA</p>
        <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">Esse caminho o tuiuiú não conhece.</h1>
        <p className="mt-6 text-lg text-sand-300">
          O endereço pode estar errado ou a página mudou de lugar. Que tal voltar ao início?
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/" className={`${button} bg-tuiuiu-500 font-bold text-white hover:brightness-110`}>
            <span aria-hidden="true">←</span> Voltar ao início
          </Link>
          <Link to="/reservar" className={`${button} border border-sand-100/70 hover:bg-sand-100/10`}>
            Pedir reserva
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

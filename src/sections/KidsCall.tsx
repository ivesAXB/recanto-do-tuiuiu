import { Link } from 'react-router-dom'

// Call on the home page for the kids' page (#/pequenos)
export default function KidsCall() {
  return (
    <section id="pequenos" className="mx-auto max-w-6xl px-6 py-16 md:px-16">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-sand-100 px-8 py-12 text-forest-900 md:flex md:items-center md:justify-between md:gap-10 md:px-14">
        <span aria-hidden="true" className="absolute -right-8 -bottom-10 h-40 w-40 rounded-full bg-gold-400/50" />
        <span aria-hidden="true" className="absolute right-28 -bottom-4 h-14 w-14 rounded-full bg-tuiuiu-500/40" />
        <div className="relative">
          <p className="text-sm font-bold tracking-[0.14em] text-forest-700">PANTANAL PARA OS PEQUENOS</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Vamos conhecer o Pantanal?</h2>
          <p className="mt-3 max-w-lg text-lg">Curiosidades sobre os bichos e a água, em linguagem de criança.</p>
        </div>
        <Link
          to="/pequenos"
          className="relative mt-6 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-forest-900 px-8 py-4 font-bold text-sand-100 transition hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-900 md:mt-0"
        >
          Entrar <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

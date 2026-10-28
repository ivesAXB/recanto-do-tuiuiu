import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Hero from './sections/Hero'
import DayAtRecanto from './sections/DayAtRecanto'
import Packages from './sections/Packages'
import Fishing from './sections/Fishing'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  // Rolagem suave. Desligada para quem pediu menos movimento no sistema.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return (
    <main>
      <Hero />
      <DayAtRecanto />
      {/* Seção temporária, só para testar a rolagem. Será substituída. */}
      <section id="pousada" className="min-h-screen px-6 py-24 md:px-16">
        <h2 className="font-display text-4xl md:text-5xl">Em construção</h2>
        <p className="mt-4 max-w-xl text-sand-300">
          As próximas seções entram aqui: um dia no Recanto, a pesca, os pacotes e o pedido de reserva.
        </p>
      </section>
      <Fishing />
      <Packages />
    </main>
  )
}

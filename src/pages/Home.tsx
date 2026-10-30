import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Cursor from '../components/Cursor'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { isIntroPlaying, shouldPlayIntro } from '../lib/intro'
import AnimalRing from '../sections/AnimalRing'
import Hero from '../sections/Hero'
import DayAtRecanto from '../sections/DayAtRecanto'
import Packages from '../sections/Packages'
import Pousada from '../sections/Pousada'
import Fishing from '../sections/Fishing'
import Reserve from '../sections/Reserve'
import Trophies from '../sections/Trophies'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const lenis = useRef<Lenis | null>(null)
  const { pathname } = useLocation()
  // Decided once per page load (see src/lib/intro.ts)
  const [showIntro, setShowIntro] = useState(() => shouldPlayIntro(pathname))

  // Rolagem suave. Desligada para quem pediu menos movimento no sistema.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({ lerp: 0.1 })
    lenis.current = instance
    instance.on('scroll', ScrollTrigger.update)
    // No scrolling under the opening curtain; Loader restarts it when it lifts
    if (isIntroPlaying()) instance.stop()

    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis.current = null
    }
  }, [])

  // With HashRouter, "#pesca" would be read as the route "/pesca".
  // Intercept in-page links so they only scroll and never change the route.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      const link = (event.target as Element).closest('a')
      const href = link?.getAttribute('href')
      if (!href || !href.startsWith('#') || href.startsWith('#/')) return

      event.preventDefault()
      const target = href === '#' ? 0 : document.getElementById(href.slice(1))
      if (target === null) return
      if (lenis.current) lenis.current.scrollTo(target)
      else if (target === 0) window.scrollTo({ top: 0 })
      else target.scrollIntoView()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Old shared links like "site/#reservar" arrive as the route "/reservar": scroll to that section on first load.
  // Pinned scenes and data loading grow the page afterwards, so re-scroll on each ScrollTrigger refresh for a few seconds.
  useEffect(() => {
    const el = document.getElementById(pathname.slice(1))
    if (!el) return
    const go = () => {
      if (!lenis.current) return el.scrollIntoView()
      lenis.current.resize() // Lenis caches the page height; refresh it or the scroll gets clamped
      lenis.current.scrollTo(el, { immediate: true, force: true })
    }
    const frame = requestAnimationFrame(go)
    ScrollTrigger.addEventListener('refresh', go)
    const stop = () => ScrollTrigger.removeEventListener('refresh', go)
    const timer = window.setTimeout(stop, 3000)
    // The visitor started scrolling: stop correcting
    window.addEventListener('wheel', stop, { once: true, passive: true })
    window.addEventListener('touchstart', stop, { once: true, passive: true })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      stop()
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
    }
    // Only on first load: later in-page clicks are handled above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <main>
        {showIntro && (
          <Loader
            onDone={() => {
              setShowIntro(false)
              lenis.current?.start()
            }}
          />
        )}
        <Hero />
        <DayAtRecanto />
        <Pousada />
        <AnimalRing />
        <Fishing />
        <Packages />
        <Trophies />
        <Reserve />
      </main>
      <Footer />
      <Cursor />
    </>
  )
}

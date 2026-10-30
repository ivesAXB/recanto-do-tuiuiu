import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { INTRO_REVEAL_AT, finishIntro } from '../lib/intro'

const NAME = 'Recanto do Tuiuiú'
// Letters that stay and become the "RT" monogram
const KEEP = new Set([0, NAME.indexOf('T')])

type Props = {
  onDone: () => void
}

// Opening curtain: the name folds into "RT", then the screen lifts and reveals the home page,
// which keeps loading underneath. Any click or key skips it.
export default function Loader({ onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden' // Lenis is stopped by Home; this covers native touch scrolling

    let timeline: gsap.core.Timeline | null = null
    const ctx = gsap.context(() => {
      timeline = gsap
        .timeline({
          onComplete: () => {
            html.style.overflow = previousOverflow
            finishIntro()
            done.current()
          },
        })
        .from('[data-letter]', { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out', stagger: 0.015 })
        .to('[data-drop]', { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.75)
        .to('[data-drop]', { width: 0, duration: 0.5, ease: 'power3.inOut' }, 0.9)
        .to('[data-name]', { scale: 1.25, duration: 0.5, ease: 'power3.inOut' }, 0.9)
        .from('[data-line]', { scaleX: 0, duration: 0.3, ease: 'power2.out' }, 1.25)
        .to(el, { yPercent: -100, duration: 0.6, ease: 'power3.inOut' }, INTRO_REVEAL_AT + 0.15)
    }, el)

    const skip = () => timeline?.progress(1)
    window.addEventListener('keydown', skip, { once: true })
    el.addEventListener('pointerdown', skip, { once: true })

    return () => {
      window.removeEventListener('keydown', skip)
      el.removeEventListener('pointerdown', skip)
      // revert() (not kill) undoes the "from" states, so a StrictMode remount starts clean
      ctx.revert()
      html.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-forest-900">
      <span role="status" className="sr-only">
        Carregando
      </span>
      <div aria-hidden="true" className="flex flex-col items-center">
        <p data-name className="flex whitespace-nowrap font-display text-4xl text-sand-100 md:text-6xl">
          {[...NAME].map((char, i) => (
            <span
              key={i}
              data-letter
              {...(KEEP.has(i) ? {} : { 'data-drop': '' })}
              className="inline-block overflow-hidden"
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </p>
        <span data-line className="mt-3 block h-0.5 w-10 bg-tuiuiu-500" />
      </div>
    </div>
  )
}

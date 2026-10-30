import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { canUsePointerEffects } from '../lib/motion'

// Elements that make the ring grow (links, buttons, cards)
const INTERACTIVE = 'a, button, [role="button"], label, summary, article'
// Over form fields the ring disappears and only the native cursor is left
const FIELDS = 'input, textarea, select, [contenteditable="true"]'

// A ring that follows the mouse, on desktop only. The native cursor is never hidden:
// the ring is decoration, so precision and accessibility stay the same.
export default function Cursor() {
  const [enabled] = useState(canUsePointerEffects)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ring.current
    if (!enabled || !el) return

    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
    let state = ''

    const setState = (next: '' | 'hover' | 'field' | 'out') => {
      if (next === state) return
      state = next
      gsap.to(el, {
        scale: next === 'hover' ? 1.8 : 1,
        opacity: next === 'field' || next === 'out' ? 0 : 1,
        duration: 0.25,
        ease: 'power2.out',
      })
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return setState('out')
      x(event.clientX)
      y(event.clientY)
      const target = event.target as Element | null
      if (target?.closest(FIELDS)) setState('field')
      else if (target?.closest(INTERACTIVE)) setState('hover')
      else setState('')
    }
    const leave = () => setState('out')

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 })
    state = 'out'
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      gsap.killTweensOf(el)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[110] h-8 w-8 rounded-full border border-sand-100/80 mix-blend-difference"
    />
  )
}

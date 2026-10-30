import gsap from 'gsap'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Mouse/trackpad (not touch) and motion allowed: pointer effects and the custom cursor
export const canUsePointerEffects = () =>
  window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion()

// Moves each [data-depth] element inside `area` a little with the pointer (transform only).
// depth 1 = up to `range` px; negative depths move the opposite way, which reads as depth.
export function pointerParallax(area: HTMLElement, range = 16): () => void {
  if (!canUsePointerEffects()) return () => {}

  const movers = gsap.utils.toArray<HTMLElement>('[data-depth]', area).map((el) => ({
    depth: Number(el.dataset.depth) || 0,
    x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
  }))

  const move = (event: PointerEvent) => {
    const box = area.getBoundingClientRect()
    // -0.5 … 0.5 from the center of the area
    const nx = (event.clientX - box.left) / box.width - 0.5
    const ny = (event.clientY - box.top) / box.height - 0.5
    for (const m of movers) {
      m.x(nx * m.depth * range * 2)
      m.y(ny * m.depth * range * 2)
    }
  }
  const reset = () => {
    for (const m of movers) {
      m.x(0)
      m.y(0)
    }
  }

  area.addEventListener('pointermove', move)
  area.addEventListener('pointerleave', reset)
  return () => {
    area.removeEventListener('pointermove', move)
    area.removeEventListener('pointerleave', reset)
  }
}

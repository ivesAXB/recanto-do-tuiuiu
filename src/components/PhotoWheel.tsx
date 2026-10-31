import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { imageSources } from '../lib/media'
import { prefersReducedMotion } from '../lib/motion'

// A wheel of photos that turns with the scroll (adapted from the "Works Wheel" prompt Ives sent).
//
// At rest it is a ring of cards around the title, each card tangent to the circle. The first scroll opens the ring
// into a vertical drum: the front card stands straight and large, with its name beside it, and the ones above and
// below turn away in strong perspective, pulled to the left like a wheel seen from the side. Each scroll brings the
// next photo to the front; the list jumps straight to any of them.
//
// Everything is one number, `turn`: 0 is the ring, 1 is the drum with item 0 in front, and each integer after that is
// one more item turned. One pass per frame (requestAnimationFrame) moves `turn` toward the target and writes the
// transforms straight to the DOM, without React renders; when the wheel is still, the loop sleeps.
//
// Project adaptations: Tailwind classes and the site fonts/colors instead of an inline <style>; cards are router
// Links; the scroll is only taken while the wheel is (almost) fully on screen, and Lenis never sees it; on touch
// screens a horizontal swipe turns the wheel and a vertical one keeps scrolling the page; on phones the card is
// larger, the name goes under it and the list goes below the wheel.

export type WheelItem = { slug: string; nome: string; foto: string | null }

type Props = {
  id: string // section id (anchor)
  label: string // small text above the title, e.g. "FAUNA"
  title: string // in the middle of the ring
  items: WheelItem[]
  basePath: string // each card links to `${basePath}/${slug}`
  ctaText: string
  actionText?: string // hover tag on the front card
  autoPlay?: boolean
  interval?: number // ms on each stop while auto-playing (1.5x on the ring)
}

/* Geometry. The card is measured from the wheel; everything else from the card, so a narrow wheel shrinks as a whole.
   STEP against DRUM sets how far the neighbors turn away, and DRUM against LENS whether they leave the frame. */
const CARD_H = 0.38 // front card height, relative to the wheel
const CARD_MAX_W = 0.34 // ... but never wider than this share of the wheel width
const CARD_MAX_W_NARROW = 0.8 // on phones the card would be tiny at 34%
const NARROW = 640 // px: below this the wheel uses the phone layout
const CARD_RATIO = 1.45 // width / height
const STEP = 40 // degrees between cards on the drum
const DRUM = 2.22 // drum radius, in card heights (and everything below too)
const LENS = 2.7 // perspective distance
const RING_R = 1.14 // ring radius
const RING_MAX_W = 0.36 // ... but the ring must fit the width (phones)
// The strip bends in an arc centered to the LEFT: the front card is in the middle, the neighbors fall back to the left
const BOW = 1.82
const BOW_NARROW = 0.9
const TITLE = 0.14 // ring title and front card name
const INDEX = 0.045 // list
const MIN_TITLE = 20
const MIN_INDEX = 13
const CULL = 1.6 // items drawn on each side of the front

const WHEEL_UNITS = 900 // px of scroll per item
const DRAG_SHARE = 0.45 // drag per item, as a share of the wheel size on screen
const SETTLE = 140 // ms of silence before the wheel settles on an item
const MIN_GESTURE = 0.04 // smallest scroll (in items) that counts as a gesture
const EASE = 0.12 // share of the remaining distance closed per 60 Hz frame
const DRAG_SLOP = 4 // px before a press becomes a drag
const MIN_DRAG = 0.1 // smallest drag (in items) that still moves to the next one
const IN_VIEW = 0.8 // share of the wheel that must be on screen before it takes the scroll

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rad = (deg: number) => (deg * Math.PI) / 180

// How far the arc pulled a card that turned drumDeg away from the front (zero at the front)
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)))

// Both states in one chain: ring terms fade out as m reaches the drum, drum terms are zero on the ring
function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  )
}

export default function PhotoWheel({
  id,
  label,
  title,
  items,
  basePath,
  ctaText,
  actionText = 'Conhecer',
  autoPlay = false,
  interval = 2600,
}: Props) {
  const uid = useId()
  const stageRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const labelRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)

  // Where the wheel is and where it goes. Only the front item is state: turning the wheel is not a render.
  const turn = useRef(0)
  const target = useRef(0)
  const wake = useRef<() => void>(() => {})
  const [active, setActive] = useState(0)
  const [stage, setStage] = useState({ w: 0, h: 0 })
  const [reduced] = useState(prefersReducedMotion)

  const drag = useRef<{
    id: number
    x: number
    y: number
    sx: number
    sy: number
    px: number
    from: number
    touch: boolean
    moved: boolean
  } | null>(null)
  const dragged = useRef(false) // the click right after a drag does not count
  const taken = useRef(false) // someone used the wheel: auto-play stops
  const hovered = useRef(false) // auto-play pauses under the mouse

  const count = items.length
  const last = Math.max(count - 1, 0)
  const narrow = stage.w > 0 && stage.w < NARROW

  // Wheel size from clientWidth/clientHeight (not affected by transforms)
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const metrics = useMemo(() => {
    const { w, h } = stage
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * (narrow ? CARD_MAX_W_NARROW : CARD_MAX_W))
    const cardH = cardW / CARD_RATIO
    const ringR = Math.min(cardH * RING_R, w * RING_MAX_W)
    // ring cards shrink until the circle reads as a closed loop, whatever the number of items
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR: cardH * DRUM,
      bow: cardH * (narrow ? BOW_NARROW : BOW),
      depth: cardH * LENS,
      title: Math.max(cardH * TITLE, MIN_TITLE),
      index: Math.max(cardH * INDEX, MIN_INDEX),
    }
  }, [stage, count, narrow])

  // One pass per frame: move turn toward the target and write every transform. Sleeps when it arrives.
  useLayoutEffect(() => {
    if (!stage.h) return
    const { ringR, ringScale, drumR, bow } = metrics
    let frame = 0
    let then = 0

    const paint = () => {
      const t = turn.current
      const m = clamp(t, 0, 1)
      const pos = Math.max(0, t - 1)
      // The drum moves back so its front face lands on the picture plane
      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`
      for (let i = 0; i < count; i++) {
        const card = cardRefs.current[i]
        if (!card) continue
        const d = i - pos
        card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m)
        // Hidden by distance, not by angle (a full turn would bring the back to the front); hidden takes no clicks
        const hidden = m > 0.5 && Math.abs(d) > CULL
        card.style.opacity = hidden ? '0' : '1'
        card.style.visibility = hidden ? 'hidden' : ''
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2))
        const face = card.firstElementChild as HTMLElement | null
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`
      }
      if (labelRef.current) labelRef.current.style.opacity = String(1 - m)
      if (nameRef.current) nameRef.current.style.opacity = String(m)
      return clamp(Math.round(pos), 0, last)
    }

    const step = (now: number) => {
      frame = 0
      const dt = then ? Math.min((now - then) / 1000, 0.1) : 1 / 60
      then = now
      const gap = target.current - turn.current
      if (Math.abs(gap) < 0.0005) turn.current = target.current
      else turn.current += gap * (reduced ? 1 : 1 - Math.pow(1 - EASE, dt * 60))
      const near = paint()
      setActive((prev) => (prev === near ? prev : near))
      if (turn.current !== target.current) frame = requestAnimationFrame(step)
      else then = 0
    }

    wake.current = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }
    paint()
    wake.current()
    return () => {
      cancelAnimationFrame(frame)
      wake.current = () => {}
    }
  }, [metrics, stage.h, count, last, reduced])

  const to = useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1)
      wake.current()
    },
    [last],
  )

  // Native listener, because the scroll must be cancelable. It is taken only while the wheel still has somewhere to
  // go and is (almost) fully on screen; at the ends, or half visible, the page keeps scrolling.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    let settling = 0
    let from: number | null = null // where the burst of scroll events started
    const onWheel = (event: WheelEvent) => {
      const rect = el.getBoundingClientRect()
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
      if (visible < rect.height * IN_VIEW) return
      const dy =
        event.deltaMode === 1
          ? event.deltaY * 16
          : event.deltaMode === 2
            ? event.deltaY * el.clientHeight
            : event.deltaY
      const next = target.current + dy / WHEEL_UNITS
      if (next <= 0 || next >= last + 1) {
        if (from === null) return // at an end: the page scrolls (Lenis handles it)
      } else {
        event.preventDefault()
        event.stopPropagation() // keeps Lenis from scrolling the page as well
      }
      taken.current = true
      if (from === null) from = Math.round(target.current)
      to(next)
      // A scroll arrives as a burst of events with no marked end: settle on an item, at least one ahead in the
      // direction of the scroll, so one notch of a mouse wheel already opens the ring or changes the photo.
      window.clearTimeout(settling)
      settling = window.setTimeout(() => {
        const start = from ?? 0
        const moved = target.current - start
        const near = Math.round(target.current)
        from = null
        if (moved > MIN_GESTURE) to(Math.max(near, start + 1))
        else if (moved < -MIN_GESTURE) to(Math.min(near, start - 1))
        else to(near)
      }, SETTLE)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(settling)
    }
  }, [to, last])

  // Auto-play: ring, each item in front, back to the ring; only while on screen and not under the mouse
  useEffect(() => {
    const el = stageRef.current
    if (!el || !autoPlay || reduced || !count) return
    let timer = 0
    const hold = (at: number) => (at === 0 ? interval * 1.5 : interval)
    const tick = () => {
      if (taken.current) return
      if (!hovered.current) {
        const at = Math.round(target.current)
        to(at >= last + 1 ? 0 : at + 1)
      }
      timer = window.setTimeout(tick, hold(Math.round(target.current)))
    }
    const io = new IntersectionObserver((entries) => {
      window.clearTimeout(timer)
      if (entries[entries.length - 1].isIntersecting && !taken.current) {
        timer = window.setTimeout(tick, hold(Math.round(target.current)))
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [autoPlay, reduced, count, last, interval, to])

  const settleDrag = (from: number) => {
    const moved = target.current - from
    const near = Math.round(target.current)
    if (moved > MIN_DRAG) to(Math.max(near, from + 1))
    else if (moved < -MIN_DRAG) to(Math.min(near, from - 1))
    else to(near)
  }

  const list = (className: string, style?: CSSProperties) => (
    <ol className={className} style={style}>
      {items.map((item, i) => (
        <li key={item.slug}>
          <button
            type="button"
            aria-current={i === active || undefined}
            onClick={() => {
              taken.current = true
              to(i + 1)
            }}
            className="min-h-6 cursor-pointer text-sand-100/55 transition-colors hover:text-sand-100 focus-visible:outline-1 focus-visible:outline-sand-100 aria-[current]:font-medium aria-[current]:text-sand-100"
          >
            {item.nome}
          </button>
        </li>
      ))}
    </ol>
  )

  return (
    <section id={id} aria-label={title} className="py-10 md:py-16">
      <div className="relative mx-auto h-[min(68svh,540px)] min-h-[440px] overflow-hidden select-none md:h-[min(100svh,900px)] md:min-h-[600px]">
        <div
          ref={stageRef}
          tabIndex={0}
          role="listbox"
          aria-label={`${title} Use as setas para girar.`}
          aria-activedescendant={count ? `${uid}-${active}` : undefined}
          className="absolute inset-0 cursor-grab touch-pan-y outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-sand-100 active:cursor-grabbing"
          style={{ perspective: `${metrics.depth}px` }}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') hovered.current = true
          }}
          onPointerLeave={() => (hovered.current = false)}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            const rect = event.currentTarget.getBoundingClientRect()
            const touch = event.pointerType !== 'mouse'
            drag.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              sx: event.clientX,
              sy: event.clientY,
              // mouse drags vertically; a finger swipes sideways (the vertical swipe scrolls the page)
              px: Math.max((touch ? rect.width : rect.height) * DRAG_SHARE, 1),
              from: Math.round(target.current),
              touch,
              moved: false,
            }
            dragged.current = false
          }}
          onPointerMove={(event) => {
            const d = drag.current
            if (!d || d.id !== event.pointerId) return
            if (!d.moved) {
              const travel = d.touch ? Math.abs(event.clientX - d.sx) : Math.abs(event.clientY - d.sy)
              if (travel < DRAG_SLOP) return
              d.moved = true
              dragged.current = true
              taken.current = true
              event.currentTarget.setPointerCapture(event.pointerId)
            }
            const delta = d.touch ? d.x - event.clientX : d.y - event.clientY
            to(target.current + delta / d.px)
            d.x = event.clientX
            d.y = event.clientY
          }}
          onPointerUp={(event) => {
            const d = drag.current
            if (!d || d.id !== event.pointerId) return
            drag.current = null
            if (!d.moved) return
            settleDrag(d.from)
            window.setTimeout(() => (dragged.current = false), 0)
          }}
          onPointerCancel={() => {
            if (drag.current?.moved) to(Math.round(target.current))
            drag.current = null
            dragged.current = false
          }}
          onClickCapture={(event) => {
            if (!dragged.current) return
            dragged.current = false
            event.preventDefault()
            event.stopPropagation()
          }}
          onKeyDown={(event) => {
            const at = Math.round(target.current)
            if (event.key === 'ArrowDown') to(at + 1)
            else if (event.key === 'ArrowUp') to(at - 1)
            else if (event.key === 'Home') to(0)
            else if (event.key === 'End') to(last + 1)
            else if (event.key === 'Enter' && at >= 1) cardRefs.current[at - 1]?.click()
            else return
            taken.current = true
            event.preventDefault()
          }}
        >
          <div ref={wheelRef} className="absolute top-1/2 left-1/2 transform-3d">
            {items.map((item, i) => {
              const sources = item.foto ? imageSources(item.foto) : null
              return (
                // Cards stay out of the Tab order: the wheel is one list, turned with the arrows (Enter opens)
                <Link
                  key={item.slug}
                  id={`${uid}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-label={item.nome}
                  to={`${basePath}/${item.slug}`}
                  tabIndex={-1}
                  draggable={false}
                  ref={(node) => {
                    cardRefs.current[i] = node
                  }}
                  className="group absolute top-0 left-0 block outline-none backface-hidden"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                  // off the front, a click turns the wheel to the card; on the front, the link opens
                  onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
                    if (Math.round(target.current) === i + 1) return
                    event.preventDefault()
                    taken.current = true
                    to(i + 1)
                  }}
                >
                  <span className="relative block h-full w-full overflow-hidden rounded-md bg-sage-200 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]">
                    {sources && (
                      <img
                        src={sources.src}
                        srcSet={sources.srcSet}
                        sizes="(min-width: 640px) 34vw, 80vw"
                        alt=""
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="block h-full w-full object-cover"
                      />
                    )}
                    {i === active && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full bg-forest-950/85 px-3 py-1 text-xs text-sand-100 opacity-0 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        {actionText} <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Ring title (center) and front card name (left on desktop, under the card on phones) swap places */}
        <div
          ref={labelRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <p className="text-xs font-bold tracking-[0.14em] text-gold-400 md:text-sm">{label}</p>
          <h2
            className="mt-2 font-display leading-tight"
            style={{ fontSize: metrics.title, maxWidth: narrow ? metrics.ringR * 1.1 : undefined }}
          >
            {title}
          </h2>
        </div>
        <div
          ref={nameRef}
          aria-hidden="true"
          className={
            'pointer-events-none absolute font-display leading-tight opacity-0 ' +
            (narrow ? 'left-0 w-full text-center' : 'top-1/2 left-[6%] -translate-y-1/2')
          }
          style={{
            fontSize: metrics.title,
            top: narrow ? `calc(50% + ${metrics.cardH / 2 + 14}px)` : undefined,
            // the space left of the front card, so long names ("Arara-azul-grande") wrap instead of covering it
            maxWidth: narrow ? undefined : stage.w * 0.44 - metrics.cardW / 2 - 24,
          }}
        >
          {items[active]?.nome}
        </div>

        {!narrow && list('absolute top-[7.5%] right-[2.5%] text-right leading-[1.75]', { fontSize: metrics.index })}
      </div>

      <div className="mt-2 flex flex-col items-center gap-5 px-6 text-center">
        {narrow && list('flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm')}
        <Link
          to={basePath}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-100/70 px-6 text-sm font-medium transition hover:bg-sand-100/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100 md:px-8 md:text-base"
        >
          {ctaText} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

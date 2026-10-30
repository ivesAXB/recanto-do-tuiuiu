import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Controls an endless animation (animal ring, trophies strip):
// - runs only while `area` is on screen, starting gently (no jump when the section arrives);
// - slows to a stop while the mouse is over it, a finger is touching it or the keyboard focus is inside;
// - resumes smoothly afterwards (touch: a moment after the finger leaves).
export function controlLoop(area: HTMLElement, loop: gsap.core.Animation): () => void {
  let visible = false
  let holds = 0
  let touchTimer = 0

  loop.timeScale(0).pause()
  const update = () => {
    const speed = visible && holds === 0 ? 1 : 0
    if (speed && loop.paused()) loop.play()
    gsap.to(loop, {
      timeScale: speed,
      duration: speed ? 1.2 : 0.4,
      ease: speed ? 'power1.in' : 'power2.out',
      overwrite: true,
      onComplete: () => {
        if (!speed) loop.pause()
      },
    })
  }
  const hold = () => {
    holds++
    update()
  }
  const release = () => {
    holds = Math.max(0, holds - 1)
    update()
  }

  const trigger = ScrollTrigger.create({
    trigger: area,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      visible = self.isActive
      update()
    },
  })

  let mouseInside = false
  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || mouseInside) return
    mouseInside = true
    hold()
  }
  const leave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !mouseInside) return
    mouseInside = false
    release()
  }
  let touching = false
  const touchStart = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    clearTimeout(touchTimer)
    if (!touching) {
      touching = true
      hold()
    }
  }
  const touchEnd = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' || !touching) return
    clearTimeout(touchTimer)
    touchTimer = window.setTimeout(() => {
      touching = false
      release()
    }, 1500)
  }
  let focused = false
  const focusIn = () => {
    if (focused) return
    focused = true
    hold()
  }
  const focusOut = (e: FocusEvent) => {
    if (!focused || area.contains(e.relatedTarget as Node | null)) return
    focused = false
    release()
  }

  area.addEventListener('pointerenter', enter)
  area.addEventListener('pointerleave', leave)
  area.addEventListener('pointerdown', touchStart)
  window.addEventListener('pointerup', touchEnd)
  window.addEventListener('pointercancel', touchEnd)
  area.addEventListener('focusin', focusIn)
  area.addEventListener('focusout', focusOut)

  return () => {
    clearTimeout(touchTimer)
    gsap.killTweensOf(loop)
    trigger.kill()
    area.removeEventListener('pointerenter', enter)
    area.removeEventListener('pointerleave', leave)
    area.removeEventListener('pointerdown', touchStart)
    window.removeEventListener('pointerup', touchEnd)
    window.removeEventListener('pointercancel', touchEnd)
    area.removeEventListener('focusin', focusIn)
    area.removeEventListener('focusout', focusOut)
  }
}

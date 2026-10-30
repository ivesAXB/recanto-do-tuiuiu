import { useEffect, useRef, useState } from 'react'
import { whatsappUrl } from '../data/site'

// Main menu: in-page sections ("#id", scrolled by Home.tsx) and the kids page ("#/pequenos")
const NAV = [
  { href: '#pousada', label: 'A pousada' },
  { href: '#animais', label: 'Fauna' },
  { href: '#pesca', label: 'Pesca' },
  { href: '#pacotes', label: 'Pacotes' },
  { href: '#/pequenos', label: 'Para os pequenos' },
]

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand-100'

// Phones and tablets: full-screen menu behind a "Menu" button
function MobileMenu() {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    panel.current?.querySelector('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      // Keep Tab inside the open menu (the page behind is covered)
      if (e.key !== 'Tab' || !panel.current) return
      const items = panel.current.querySelectorAll<HTMLElement>('a, button')
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    const trigger = button.current
    return () => {
      html.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      trigger?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="menu-celular"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-100/60 px-4 text-sm font-medium lg:hidden ${focusRing}`}
      >
        <span aria-hidden="true" className="flex flex-col gap-1">
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
        </span>
        Menu
      </button>
      {open && (
        <div
          ref={panel}
          id="menu-celular"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-forest-950 px-6 py-6"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-semibold">Recanto do Tuiuiú</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`inline-flex min-h-11 items-center rounded-full border border-sand-100/60 px-4 text-sm font-medium ${focusRing}`}
            >
              Fechar
            </button>
          </div>
          <nav aria-label="Principal" className="mt-12">
            <ul className="space-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block py-2 font-display text-4xl transition hover:text-gold-400 ${focusRing}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-10">
            <a
              href="#reservar"
              onClick={() => setOpen(false)}
              className={`inline-flex min-h-11 items-center justify-center rounded-full bg-tuiuiu-500 px-8 py-4 font-bold text-white ${focusRing}`}
            >
              Pedir reserva
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-11 items-center justify-center rounded-full border border-sand-100/60 px-8 py-4 font-medium ${focusRing}`}
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  )
}

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-6 md:px-16">
      <a href="#" className={`font-display text-2xl font-semibold ${focusRing}`}>
        Recanto do Tuiuiú
      </a>
      <nav aria-label="Principal" className="hidden gap-8 font-medium lg:flex">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className={`transition hover:text-gold-400 ${focusRing}`}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <a
          href="#reservar"
          className={`hidden rounded-full bg-tuiuiu-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 sm:inline-flex ${focusRing}`}
        >
          Pedir reserva
        </a>
        <MobileMenu />
      </div>
    </header>
  )
}

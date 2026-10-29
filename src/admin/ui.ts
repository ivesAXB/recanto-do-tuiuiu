// Shared Tailwind classes for the admin panel (same look as the public site)

export const buttonClass =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 font-bold transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900'

export const primaryButton = `${buttonClass} bg-gold-400 text-forest-900`
export const dangerButton = `${buttonClass} bg-tuiuiu-500 text-white`
export const ghostButton = `${buttonClass} border border-sand-100/40`

export const inputClass =
  'mt-2 block min-h-12 w-full rounded-xl border border-sand-100/25 bg-forest-950 px-4 text-base text-sand-100 [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 aria-[invalid=true]:border-tuiuiu-500 disabled:opacity-50'

export const errorText = 'mt-2 text-sm font-bold text-[#ff8a80]'

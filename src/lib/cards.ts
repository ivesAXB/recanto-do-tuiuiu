import { useEffect } from 'react'

// Shown on cards for fields still waiting for official information
export const SOON = 'Em breve'

// Opening a card's address (e.g. #/peixes/dourado): scroll to that card and focus its button
export function useScrollToCard(slug: string | undefined) {
  useEffect(() => {
    const card = slug ? document.getElementById(slug) : null
    if (!card) {
      window.scrollTo({ top: 0 })
      return
    }
    card.scrollIntoView({ block: 'start' })
    card.querySelector('button')?.focus({ preventScroll: true })
  }, [slug])
}

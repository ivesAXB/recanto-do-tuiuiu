// Shared state for the opening loader (src/components/Loader.tsx).
// The decision is taken once per page load, so StrictMode double renders and
// Home remounts (e.g. coming back from /admin) never replay it.

const SEEN_KEY = 'rt-intro-seen'

// Seconds from page load until the curtain starts lifting; Hero delays its entrance by this
export const INTRO_REVEAL_AT = 1.4

let decision: boolean | null = null
let playing = false

// Show only on the plain home page ("/"), once per browser session, and never with reduced motion
export function shouldPlayIntro(pathname: string): boolean {
  // Already decided: replay only while it is still running (StrictMode), never after it finished
  if (decision !== null) return decision && playing
  decision = false
  if (pathname !== '/') return decision
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return decision
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return decision
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage blocked (private mode, previews): skip the intro rather than replay it on every visit
    return decision
  }
  decision = true
  playing = true
  return decision
}

export const isIntroPlaying = () => playing

export function finishIntro() {
  playing = false
}

// Extra delay for entrance animations that should start as the curtain lifts
export const introDelay = () => (playing ? INTRO_REVEAL_AT : 0)

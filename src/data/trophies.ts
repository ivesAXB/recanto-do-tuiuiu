// Fishing trophies strip (src/sections/Trophies.tsx).
// LGPD: an identifiable person only goes on the site with image and name authorization ("autorizado").
// Species and weight are checked by the owner before a real item goes live.
// While there are no real authorized photos, the items below are clearly fictitious examples:
// no person's name, no weight, no record.

export type Trophy = {
  foto: string | null // name in public/media/img/manifest.json; null = placeholder
  especie: string
  pesoKg: number | null
  ano: number | null
  pescador: string // name or nickname, only with authorization
  autorizado: boolean // image + name authorization; a photo is never shown without it
  legenda: string // for examples: "Exemplo: …"
  provisorio: boolean
}

const example = (legenda: string, especie: string): Trophy => ({
  foto: null,
  especie,
  pesoKg: null,
  ano: null,
  pescador: '',
  autorizado: false,
  legenda,
  provisorio: true,
})

export const trophies: Trophy[] = [
  example('Exemplo: 1º lugar, categoria Pintado', 'Pintado'),
  example('Exemplo: 1º lugar, categoria Dourado', 'Dourado'),
  example('Exemplo: 1º lugar, categoria Pacu', 'Pacu'),
  example('Exemplo: 2º lugar, categoria Pintado', 'Pintado'),
  example('Exemplo: 2º lugar, categoria Dourado', 'Dourado'),
]

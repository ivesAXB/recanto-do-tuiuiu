// Fish species: ring on the home page (src/sections/FishRing.tsx) and the /peixes pages.
// Ives's decision: build the structure now with GENERIC information. Only broadly known facts
// (e.g. "peixe de couro" / "de escamas"); no numbers, seasons, baits or records.
// Specific fields stay empty with oficial: false and show "Em breve" until checked with the owner.
// The defeso always comes from the database (closed_periods), never from here.

export type Fish = {
  slug: string
  nome: string
  cientifico: string // only when certain; to be confirmed with Ives
  foto: string | null // name in public/media/img/manifest.json; null = placeholder
  alt: string
  descricao: string // short, general and consensual
  iscas: string
  melhorEpoca: string
  dificuldade: string
  pesoComum: string
  observacoes: string
  oficial: boolean // true only after the owner checks the specific fields
}

const pending = { iscas: '', melhorEpoca: '', dificuldade: '', pesoComum: '', observacoes: '', oficial: false }

export const fish: Fish[] = [
  {
    slug: 'dourado',
    nome: 'Dourado',
    cientifico: 'Salminus brasiliensis',
    foto: null,
    alt: 'Foto de um dourado',
    descricao: 'Peixe de escamas, de cor dourada, muito procurado na pesca esportiva.',
    ...pending,
  },
  {
    slug: 'pintado',
    nome: 'Pintado',
    cientifico: 'Pseudoplatystoma corruscans',
    foto: null,
    alt: 'Foto de um pintado',
    descricao: 'Peixe de couro, com o corpo coberto de pintas escuras.',
    ...pending,
  },
  {
    slug: 'pacu',
    nome: 'Pacu',
    cientifico: 'Piaractus mesopotamicus',
    foto: null,
    alt: 'Foto de um pacu',
    descricao: 'Peixe de escamas, de corpo alto e arredondado.',
    ...pending,
  },
]

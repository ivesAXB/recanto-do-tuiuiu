// Animal catalog: ring on the home page (src/sections/AnimalRing.tsx) and the /animais page.
// Rule: no invented biology. Until Ives brings the official information, only the popular name
// and one broadly known sentence; every specific field stays empty and shows "Em breve".
// Scientific names are left empty on purpose: fill them only from a reliable source (cite it in RELATORIO.md).

export type Animal = {
  slug: string
  nome: string
  cientifico: string
  foto: string | null // name in public/media/img/manifest.json; null = placeholder
  alt: string
  texto: string // one generic, safe sentence
  habitat: string
  melhorEpoca: string // habit / best time to see
  curiosidade: string
  credito: string // photo credit
  revisado: boolean // true only after Ives (or a cited source) checks the specific fields
}

export const animals: Animal[] = [
  {
    slug: 'tuiuiu',
    nome: 'Tuiuiú',
    cientifico: '',
    foto: 'casal-de-tuiuius-asa-aberta',
    alt: 'Casal de tuiuiús de asas abertas no campo',
    texto: 'Ave símbolo do Pantanal, de pescoço preto e colar vermelho.',
    habitat: '',
    melhorEpoca: '',
    curiosidade: '',
    credito: '',
    revisado: false,
  },
  {
    slug: 'jacare',
    nome: 'Jacaré',
    cientifico: '',
    foto: 'imagem-jacare-dentro-da-agua-nitida',
    alt: 'Jacaré dentro da água',
    texto: 'Réptil comum nas baías e nos rios do Pantanal.',
    habitat: '',
    melhorEpoca: '',
    curiosidade: '',
    credito: '',
    revisado: false,
  },
  {
    slug: 'arara-azul',
    nome: 'Arara-azul',
    cientifico: '',
    foto: null,
    alt: 'Foto de uma arara-azul',
    texto: 'Arara de plumagem azul intensa, uma das aves mais conhecidas do Pantanal.',
    habitat: '',
    melhorEpoca: '',
    curiosidade: '',
    credito: '',
    revisado: false,
  },
  {
    slug: 'capivara',
    nome: 'Capivara',
    cientifico: '',
    foto: null,
    alt: 'Foto de uma capivara',
    texto: 'O maior roedor do mundo, sempre por perto da água.',
    habitat: '',
    melhorEpoca: '',
    curiosidade: '',
    credito: '',
    revisado: false,
  },
  {
    slug: 'garca-branca',
    nome: 'Garça-branca',
    cientifico: '',
    foto: null,
    alt: 'Foto de uma garça-branca',
    texto: 'Ave branca de pernas longas, vista à beira da água.',
    habitat: '',
    melhorEpoca: '',
    curiosidade: '',
    credito: '',
    revisado: false,
  },
  {
    slug: 'martim-pescador',
    nome: 'Martim-pescador',
    cientifico: '',
    foto: null,
    alt: 'Foto de um martim-pescador',
    texto: 'Pequena ave que mergulha na água para pescar.',
    habitat: '',
    melhorEpoca: '',
    curiosidade: '',
    credito: '',
    revisado: false,
  },
]

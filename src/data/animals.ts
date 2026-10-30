// Animal catalog: ring on the home page (src/sections/AnimalRing.tsx) and the /animais page.
// Rule: no invented biology. Until Ives brings the official information, only the popular name
// and one broadly known sentence; every specific field stays empty and shows "Em breve".
// Scientific names are left empty on purpose: fill them only from a reliable source (cite it in RELATORIO.md).
//
// fotos: names in public/media/img/manifest.json (run `npm run media:images` after adding originals).
// The first photo is the one used in the ring; the card fades through all of them.
// destaque: true = appears in the ring on the home page (keep it to 6).

import type { CardPhoto } from '../components/FlipCard'

export type Animal = {
  slug: string
  nome: string
  cientifico: string
  fotos: CardPhoto[] // empty = placeholder
  alt: string // what the photo should show, used while there is no photo
  texto: string // one generic, safe sentence
  habitat: string
  melhorEpoca: string // habit / best time to see
  curiosidade: string
  destaque: boolean
  revisado: boolean // true only after Ives (or a cited source) checks the specific fields
}

const pending = { cientifico: '', habitat: '', melhorEpoca: '', curiosidade: '', revisado: false }

export const animals: Animal[] = [
  {
    slug: 'onca-pintada',
    nome: 'Onça-pintada',
    fotos: [
      { nome: 'onca-pintada-2', alt: 'Onça-pintada deitada em um galho grosso, olhando para a câmera' },
      { nome: 'onca-pintada-5', alt: 'Onça-pintada deitada na beira do rio, bocejando' },
      { nome: 'onca-pintada-3', alt: 'Onça-pintada descansando com a cabeça apoiada em um tronco' },
      { nome: 'onca-pintada-10', alt: 'Onça-pintada saindo da água perto da vegetação da margem' },
      { nome: 'onca-pintada-8', alt: 'Duas onças-pintadas junto a uma árvore grande' },
      { nome: 'onca-pintada-7', alt: 'Onça-pintada em um barranco de areia' },
      { nome: 'onca-pintada-6', alt: 'Onça-pintada caminhando em uma praia de rio' },
      { nome: 'onca-pintada-4', alt: 'Onça-pintada entre raízes de árvore na mata' },
      { nome: 'onca-pintada-1', alt: 'Duas onças-pintadas em um tronco de árvore' },
    ],
    alt: 'Foto de uma onça-pintada',
    texto: 'O maior felino das Américas, com a pelagem coberta de pintas em forma de roseta.',
    destaque: true,
    ...pending,
  },
  {
    slug: 'tuiuiu',
    nome: 'Tuiuiú',
    fotos: [
      { nome: 'tuiuiu-com-asa-aberta', alt: 'Tuiuiú de asas abertas na beira da água' },
      { nome: 'foto-linda-tuiuiu-em-pe', alt: 'Tuiuiú em pé no campo verde' },
      { nome: 'tuiuiu-no-ninho', alt: 'Tuiuiú em pé no ninho, no alto de uma árvore, com céu azul' },
      { nome: 'casal-de-tuiuiu-voando-no-por-do-sol', alt: 'Dois tuiuiús voando no céu alaranjado do pôr do sol' },
    ],
    alt: 'Foto de um tuiuiú',
    texto: 'Ave símbolo do Pantanal, de pescoço preto e colar vermelho.',
    destaque: true,
    ...pending,
  },
  {
    slug: 'arara-azul',
    nome: 'Arara-azul',
    fotos: [
      { nome: 'ave-arara-azul-grande-3', alt: 'Três araras-azuis em galhos secos, contra o céu' },
      { nome: 'ave-arara-azul-grande', alt: 'Arara-azul comendo coquinhos em uma palmeira' },
      { nome: 'ave-arara-azul-grande-2', alt: 'Arara-azul pousada entre as folhas de uma palmeira' },
    ],
    alt: 'Foto de uma arara-azul',
    texto: 'Arara de plumagem azul intensa, uma das aves mais conhecidas do Pantanal.',
    destaque: true,
    ...pending,
  },
  {
    slug: 'jacare',
    nome: 'Jacaré',
    fotos: [
      { nome: 'jacare', alt: 'Jacaré com a cabeça para fora da água, entre aguapés' },
      { nome: 'jacare-2', alt: 'Jacaré com um peixe na boca, dentro do rio' },
      { nome: 'jacare-em-grupo', alt: 'Vários jacarés deitados lado a lado na margem' },
      { nome: 'jacare-jovem', alt: 'Jacaré jovem na terra, perto de plantas da margem' },
      { nome: 'foto-linda-jacare-e-capivara', alt: 'Jacaré na água e uma capivara na margem, logo atrás' },
    ],
    alt: 'Foto de um jacaré',
    texto: 'Réptil comum nas baías e nos rios do Pantanal.',
    destaque: true,
    ...pending,
  },
  {
    slug: 'ariranha',
    nome: 'Ariranha',
    fotos: [
      { nome: 'ariranha-grupo', alt: 'Ariranhas juntas no barranco do rio, com uma garça ao fundo' },
      { nome: 'ariranha', alt: 'Ariranha com a cabeça para fora da água, perto de aguapés' },
      { nome: 'ariranha-2', alt: 'Ariranhas na margem do rio' },
    ],
    alt: 'Foto de uma ariranha',
    texto: 'Uma lontra grande, que vive em grupos nos rios do Pantanal.',
    destaque: true,
    ...pending,
  },
  {
    slug: 'tucano',
    nome: 'Tucano',
    fotos: [
      { nome: 'ave-tucano-2', alt: 'Tucano de bico laranja pousado em um galho' },
      { nome: 'ave-tucano-3', alt: 'Tucano entre os galhos de uma árvore' },
      { nome: 'ave-tucano-4', alt: 'Tucano em um galho, com a água do rio ao fundo' },
    ],
    alt: 'Foto de um tucano',
    texto: 'Ave de bico grande e colorido, fácil de reconhecer.',
    destaque: true,
    ...pending,
  },
  {
    slug: 'capivara',
    nome: 'Capivara',
    fotos: [{ nome: 'capivara', alt: 'Grupo de capivaras na beira da água' }],
    alt: 'Foto de uma capivara',
    texto: 'O maior roedor do mundo, sempre por perto da água.',
    destaque: false,
    ...pending,
  },
  {
    slug: 'anta',
    nome: 'Anta',
    fotos: [
      { nome: 'anta', alt: 'Anta dentro do rio, com aguapés floridos atrás' },
      { nome: 'anta-3', alt: 'Anta nadando com a cabeça para fora da água' },
      { nome: 'anta-2', alt: 'Anta na água, com uma garça na margem' },
    ],
    alt: 'Foto de uma anta',
    texto: 'O maior mamífero terrestre do Brasil, que gosta de ficar perto da água.',
    destaque: false,
    ...pending,
  },
  {
    slug: 'bugio-preto',
    nome: 'Bugio-preto',
    fotos: [
      { nome: 'bugio-preto-familia', alt: 'Família de bugios em um galho de árvore' },
      { nome: 'bugio-preto-femea-com-folhote', alt: 'Bugio fêmea com o filhote no alto da árvore' },
      { nome: 'bugio-preto-femea', alt: 'Bugio fêmea sentada entre os galhos' },
      { nome: 'bugio-preto-macho', alt: 'Bugio macho, de pelagem preta, pendurado na árvore' },
    ],
    alt: 'Foto de um bugio-preto',
    texto: 'Macaco conhecido pelo ronco forte, que se ouve de longe na mata.',
    destaque: false,
    ...pending,
  },
  {
    slug: 'cervo-do-pantanal',
    nome: 'Cervo-do-pantanal',
    fotos: [{ nome: 'cervo-do-pantanal', alt: 'Cervo-do-pantanal comendo entre o capim alto' }],
    alt: 'Foto de um cervo-do-pantanal',
    texto: 'O maior cervo da América do Sul, que vive em áreas alagadas.',
    destaque: false,
    ...pending,
  },
  {
    slug: 'martim-pescador',
    nome: 'Martim-pescador',
    fotos: [
      { nome: 'ave-martim-pescador-grande-2', alt: 'Martim-pescador-grande pousado em um galho fino' },
      { nome: 'ave-martim-pescador-verde', alt: 'Martim-pescador-verde pousado em um fio' },
      { nome: 'ave-martim-pescador-grande', alt: 'Martim-pescador-grande em um tronco seco' },
      { nome: 'ave-martim-pescador-pequeno', alt: 'Martim-pescador-pequeno entre os galhos de uma árvore' },
    ],
    alt: 'Foto de um martim-pescador',
    texto: 'Pequena ave que mergulha na água para pescar.',
    destaque: false,
    ...pending,
  },
  {
    slug: 'quati',
    nome: 'Quati',
    fotos: [{ nome: 'quati', alt: 'Quati de cauda listrada farejando o chão de terra' }],
    alt: 'Foto de um quati',
    texto: 'Mamífero de focinho comprido e cauda listrada.',
    destaque: false,
    ...pending,
  },
]

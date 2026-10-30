// Gallery "A pousada" (src/sections/Pousada.tsx).
// Only real photos of the property: no video and no AI-generated images for rooms or facilities.
// To replace a placeholder: put the photo name (from public/media/img/manifest.json) in "foto"
// and set "provisorio: false". Captions written by the agent still need Ives's review.

export type PousadaItem = {
  foto: string | null // name in manifest.json; null = placeholder
  legenda: string
  alt: string // describes the real photo; for placeholders, what should be there
  provisorio: boolean
}

export const pousadaItems: PousadaItem[] = [
  {
    foto: 'imagem-muito-alto-mostrando-casa-lago-barcos-vegetacao-pantaneira',
    legenda: 'A casa entre a baía e a mata, vista do alto.',
    alt: 'Vista aérea da pousada, cercada de mata pantaneira, com barcos na água em frente',
    provisorio: false,
  },
  {
    foto: 'pousada-externa-ampliada-horizontal',
    legenda: 'Chegando de barco, a pousada aparece no gramado.',
    alt: 'A pousada ao fundo de um gramado, vista da água, com um píer de madeira',
    provisorio: false,
  },
  {
    foto: 'pousada-externa-horizontal',
    legenda: 'Dois andares, varanda no alto e muito verde em volta.',
    alt: 'Fachada da pousada de dois andares com telhado de telhas e varanda no andar de cima',
    provisorio: false,
  },
  {
    foto: null,
    legenda: 'Os quartos.',
    alt: 'Foto do quarto: camas arrumadas e janela',
    provisorio: true,
  },
  {
    foto: null,
    legenda: 'Café, almoço e janta inclusos na diária.',
    alt: 'Foto de uma refeição servida na pousada',
    provisorio: true,
  },
  {
    foto: null,
    legenda: 'A varanda ao fim do dia.',
    alt: 'Foto da varanda ao fim do dia',
    provisorio: true,
  },
]

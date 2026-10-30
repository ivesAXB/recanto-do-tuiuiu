// Full-width photo bands between sections of the home page (src/components/PhotoBand.tsx).
// To change a photo: put another name from public/media/img/manifest.json in "foto".
// Captions only describe what is in the photo (Ives can rewrite them).

export type Band = {
  foto: string
  alt: string
  legenda: string
  posicao?: string // CSS object-position: which part of the photo stays visible when it is cropped
}

export const bands = {
  araras: {
    foto: 'ave-arara-azul-grande-3',
    alt: 'Três araras-azuis pousadas em galhos secos, contra o céu azul',
    legenda: 'Araras-azuis no céu do Pantanal.',
    posicao: '50% 35%',
  },
  onca: {
    foto: 'onca-pintada-5',
    alt: 'Onça-pintada deitada na beira do rio, bocejando',
    legenda: 'A onça-pintada na beira do rio.',
    posicao: '40% 50%',
  },
  entardecer: {
    foto: 'por-do-sol',
    alt: 'Pôr do sol alaranjado sobre o horizonte do Pantanal',
    legenda: 'Fim de tarde no Pantanal.',
    posicao: '50% 60%',
  },
} satisfies Record<string, Band>

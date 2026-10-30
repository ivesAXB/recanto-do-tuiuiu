// "Pantanal para os pequenos" (src/pages/Kids.tsx and the call on the home page).
// Rules (CLAUDE.md + TAREFAS.md F10): only generic, safe facts about Pantanal life, simple language;
// never invent services or activities the pousada does not offer ("Em breve" instead).
// Children's drawings: placeholders only. No upload, no database (images of minors need
// moderation, guardian authorization and LGPD care: a separate task, with a pause).

export type KidsBlock = {
  titulo: string
  texto: string // empty = "Em breve"
  provisorio: boolean
}

export const kidsBlocks: KidsBlock[] = [
  {
    titulo: 'Quem é o tuiuiú?',
    texto: 'É uma ave bem grande, de pescoço preto e um colar vermelho. Ela é o símbolo do Pantanal!',
    provisorio: true,
  },
  {
    titulo: 'A água sobe e desce',
    texto:
      'Em uma época do ano, a água dos rios sobe e cobre os campos. Depois, ela baixa de novo. Por isso o Pantanal muda tanto de cara!',
    provisorio: true,
  },
  {
    titulo: 'Quem mora perto da água?',
    texto: 'Jacarés, peixes, capivaras e muitas aves vivem perto dos rios e das baías.',
    provisorio: true,
  },
  {
    titulo: 'Atividades na pousada',
    texto: '', // pending: only what the pousada really offers, confirmed by Ives
    provisorio: true,
  },
]

// Spaces in the drawings wall (placeholders until there are authorized drawings)
export const DRAWING_SLOTS = 6

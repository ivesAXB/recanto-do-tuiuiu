// Animal catalog: ring on the home page (src/sections/AnimalRing.tsx) and the /animais page.
// Texts (scientific name, habitat, when to see, curiosity) come from the identification guide Ives sent
// on 2026-10-30 ("Guia de identificação - Fauna do Pantanal"); "texto" is a short line written for the card.
//
// fotos: names in public/media/img/manifest.json (run `npm run media:images` after adding originals).
// The first photo is the one used in the ring; the card fades through all of them.
// destaque: true = appears in the ring on the home page (keep it to 6).

import type { CardPhoto } from '../components/FlipCard'

export type AnimalGroup = 'mamiferos' | 'aves' | 'repteis'

export const GROUP_TITLES: Record<AnimalGroup, string> = {
  mamiferos: 'Mamíferos',
  aves: 'Aves',
  repteis: 'Répteis',
}

export type Animal = {
  slug: string
  nome: string
  grupo: AnimalGroup
  cientifico: string
  fotos: CardPhoto[] // empty = placeholder
  alt: string // what the photo should show, used while there is no photo
  texto: string // one short line
  habitat: string
  melhorEpoca: string // when / how to see it
  curiosidade: string
  destaque: boolean
  revisado: boolean // true = specific fields checked (here: from Ives's guide)
}

export const animals: Animal[] = [
  // Mamíferos
  {
    slug: 'onca-pintada',
    nome: 'Onça-pintada',
    grupo: 'mamiferos',
    cientifico: 'Panthera onca',
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
    habitat: 'Matas ciliares, florestas tropicais, áreas de transição e margens de rios alagados do Pantanal.',
    melhorEpoca:
      'O ano todo, principalmente ao amanhecer, ao entardecer ou à noite, embora no Pantanal seja frequentemente avistada à luz do dia nas margens de rios.',
    curiosidade:
      'É uma excelente nadadora. Diferente de outros grandes felinos, adora a água e caça com frequência animais aquáticos como jacarés e capivaras.',
    destaque: true,
    revisado: true,
  },
  {
    slug: 'ariranha',
    nome: 'Ariranha',
    grupo: 'mamiferos',
    cientifico: 'Pteronura brasiliensis',
    fotos: [
      { nome: 'ariranha-grupo', alt: 'Ariranhas juntas no barranco do rio, com uma garça ao fundo' },
      { nome: 'ariranha', alt: 'Ariranha com a cabeça para fora da água, perto de aguapés' },
      { nome: 'ariranha-2', alt: 'Ariranhas na margem do rio' },
    ],
    alt: 'Foto de uma ariranha',
    texto: 'Uma lontra grande, que vive em grupos nos rios do Pantanal.',
    habitat: 'Rios, riachos, lagos e áreas alagadas de água doce no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, nadando em grupos sociais ruidosos ou descansando nas margens.',
    curiosidade:
      'Maior espécie de lontra do mundo. Cada indivíduo possui manchas brancas únicas na garganta, funcionando como uma digital.',
    destaque: true,
    revisado: true,
  },
  {
    slug: 'capivara',
    nome: 'Capivara',
    grupo: 'mamiferos',
    cientifico: 'Hydrochoerus hydrochaeris',
    fotos: [{ nome: 'capivara', alt: 'Grupo de capivaras na beira da água' }],
    alt: 'Foto de uma capivara',
    texto: 'O maior roedor do mundo, sempre por perto da água.',
    habitat: 'Margens de rios, lagos, lagoas e áreas alagadas com vegetação abundante.',
    melhorEpoca: 'O ano todo, durante o dia ou no crepúsculo, reunidas em grupos familiares perto da água.',
    curiosidade:
      'Possui membranas entre os dedos que facilitam a natação, e consegue ficar submersa por vários minutos para escapar de predadores.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'anta',
    nome: 'Anta',
    grupo: 'mamiferos',
    cientifico: 'Tapirus terrestris',
    fotos: [
      { nome: 'anta', alt: 'Anta dentro do rio, com aguapés floridos atrás' },
      { nome: 'anta-3', alt: 'Anta nadando com a cabeça para fora da água' },
      { nome: 'anta-2', alt: 'Anta na água, com uma garça na margem' },
    ],
    alt: 'Foto de uma anta',
    texto: 'O maior mamífero terrestre nativo do Brasil.',
    habitat: 'Florestas, matas ciliares e margens de rios e pântanos no Pantanal.',
    melhorEpoca:
      'O ano todo, no início da manhã, no final da tarde ou à noite, frequentemente nadando para se refrescar.',
    curiosidade: 'Sua tromba flexível serve para colher plantas e como snorkel na água.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'bugio-preto',
    nome: 'Bugio-preto',
    grupo: 'mamiferos',
    cientifico: 'Alouatta caraya',
    fotos: [
      { nome: 'bugio-preto-familia', alt: 'Família de bugios em um galho de árvore' },
      {
        nome: 'bugio-preto-femea-com-folhote',
        alt: 'Bugio fêmea, de pelagem dourada, com o filhote no alto da árvore',
      },
      { nome: 'bugio-preto-femea', alt: 'Bugio fêmea, de pelagem dourada, sentada entre os galhos' },
      { nome: 'bugio-preto-macho', alt: 'Bugio macho adulto, de pelagem preta, pendurado na árvore' },
    ],
    alt: 'Foto de um bugio-preto',
    texto: 'Macaco que vive em grupos familiares nas copas das árvores.',
    habitat: 'Florestas, matas ciliares, cerrados e capões do Pantanal.',
    melhorEpoca:
      'O ano todo nas copas das árvores, deslocando-se em grupos familiares, especialmente nas primeiras horas da manhã.',
    curiosidade:
      'As fêmeas e os filhotes são dourados, enquanto os machos adultos são totalmente pretos. O rabo preênsil, com a ponta pelada, funciona como um "quinto membro" para se pendurar.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'cervo-do-pantanal',
    nome: 'Cervo-do-pantanal',
    grupo: 'mamiferos',
    cientifico: 'Blastocerus dichotomus',
    fotos: [{ nome: 'cervo-do-pantanal', alt: 'Cervo-do-pantanal comendo entre o capim alto' }],
    alt: 'Foto de um cervo-do-pantanal',
    texto: 'O maior cervo da América do Sul.',
    habitat: 'Zonas úmidas, pântanos profundos, margens de rios e ilhas de vegetação em áreas alagadas.',
    melhorEpoca:
      'O ano todo, de preferência nas primeiras horas da manhã ou no final da tarde, circulando por áreas pantanosas inundadas.',
    curiosidade:
      'Suas longas pernas têm cascos alargados com membranas elásticas, uma adaptação que evita que o animal afunde na lama mole do Pantanal.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'quati',
    nome: 'Quati',
    grupo: 'mamiferos',
    cientifico: 'Nasua nasua',
    fotos: [{ nome: 'quati', alt: 'Quati de cauda listrada farejando o chão de terra' }],
    alt: 'Foto de um quati',
    texto: 'Mamífero de focinho comprido e cauda listrada.',
    habitat: 'Florestas, matas ciliares, cerrados e áreas florestadas de transição no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, em bandos pelo solo ou subindo em árvores em busca de comida.',
    curiosidade:
      'O focinho longo e muito flexível, com olfato apurado, examina fendas e o solo à procura de insetos e frutos.',
    destaque: false,
    revisado: true,
  },

  {
    slug: 'tamandua-bandeira',
    nome: 'Tamanduá-bandeira',
    grupo: 'mamiferos',
    cientifico: 'Myrmecophaga tridactyla',
    fotos: [{ nome: 'tamandua-bandeira', alt: 'Tamanduá-bandeira caminhando no campo, com a cauda grande e peluda' }],
    alt: 'Foto de um tamanduá-bandeira',
    texto: 'O maior tamanduá, de cauda enorme em forma de bandeira.',
    habitat: 'Áreas abertas, savanas, cerrados, campos e bordas de matas do Pantanal.',
    melhorEpoca:
      'O ano todo, durante o dia ou no crepúsculo, andando calmamente pelo chão à procura de cupinzeiros e formigueiros.',
    curiosidade:
      'Tem uma língua longa e pegajosa, com mais de 40 cm, que entra e sai da boca muito rápido para comer milhares de insetos por dia.',
    destaque: false,
    revisado: true,
  },

  // Aves
  {
    slug: 'tuiuiu',
    nome: 'Tuiuiú',
    grupo: 'aves',
    cientifico: 'Jabiru mycteria',
    fotos: [
      { nome: 'tuiuiu-com-asa-aberta', alt: 'Tuiuiú de asas abertas na beira da água' },
      { nome: 'foto-linda-tuiuiu-em-pe', alt: 'Tuiuiú em pé no campo verde' },
      { nome: 'tuiuiu-no-ninho', alt: 'Tuiuiú em pé no ninho, no alto de uma árvore, com céu azul' },
      { nome: 'casal-de-tuiuiu-voando-no-por-do-sol', alt: 'Dois tuiuiús voando no céu alaranjado do pôr do sol' },
    ],
    alt: 'Foto de um tuiuiú',
    texto: 'A ave-símbolo do Pantanal, também conhecida como jaburu.',
    habitat: 'Áreas alagadas, margens de lagoas e grandes extensões de campos abertos inundados do Pantanal.',
    melhorEpoca: 'O ano todo, especialmente durante o dia, sozinho ou em grandes bandos nas áreas de várzea.',
    curiosidade:
      'Tem um imenso bico preto, levemente curvado para cima, e um papo vermelho na base do pescoço que infla durante as exibições de acasalamento.',
    destaque: true,
    revisado: true,
  },
  {
    slug: 'arara-azul',
    nome: 'Arara-azul-grande',
    grupo: 'aves',
    cientifico: 'Anodorhynchus hyacinthinus',
    fotos: [
      { nome: 'ave-arara-azul-grande-3', alt: 'Três araras-azuis em galhos secos, contra o céu' },
      { nome: 'ave-arara-azul-grande', alt: 'Arara-azul comendo coquinhos em uma palmeira' },
      { nome: 'ave-arara-azul-grande-2', alt: 'Arara-azul pousada entre as folhas de uma palmeira' },
    ],
    alt: 'Foto de uma arara-azul-grande',
    texto: 'Arara de plumagem azul intensa, uma das aves mais conhecidas do Pantanal.',
    habitat: 'Áreas abertas, cerrados, bordas de matas e palmeirais no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, em pares ou bandos, voando ou se alimentando em palmeiras.',
    curiosidade: 'Maior psitacídeo do mundo. Seu bico poderoso quebra cocos nativos duros, como acuri e bocaiúva.',
    destaque: true,
    revisado: true,
  },
  {
    slug: 'tucano',
    nome: 'Tucano-toco',
    grupo: 'aves',
    cientifico: 'Ramphastos toco',
    fotos: [
      { nome: 'ave-tucano-2', alt: 'Tucano-toco de bico laranja pousado em um galho' },
      { nome: 'ave-tucano-3', alt: 'Tucano-toco entre os galhos de uma árvore' },
      { nome: 'ave-tucano-4', alt: 'Tucano-toco em um galho, com a água do rio ao fundo' },
      { nome: 'tucano-familia', alt: 'Grupo de tucanos-toco no chão, entre galhos caídos' },
    ],
    alt: 'Foto de um tucano-toco',
    texto: 'Ave de bico grande e colorido, fácil de reconhecer.',
    habitat: 'Áreas abertas, cerrados, bordas de florestas e matas no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, nos galhos mais altos das árvores ou voando entre as copas.',
    curiosidade:
      'Maior espécie de tucano. O bico imenso é oco e leve, ajuda a alcançar frutos e a regular a temperatura do corpo.',
    destaque: true,
    revisado: true,
  },
  {
    slug: 'martim-pescador-grande',
    nome: 'Martim-pescador-grande',
    grupo: 'aves',
    cientifico: 'Megaceryle torquata',
    fotos: [
      { nome: 'ave-martim-pescador-grande-2', alt: 'Martim-pescador-grande pousado em um galho fino' },
      { nome: 'ave-martim-pescador-grande', alt: 'Martim-pescador-grande em um tronco seco' },
    ],
    alt: 'Foto de um martim-pescador-grande',
    texto: 'O maior martim-pescador das Américas.',
    habitat: 'Margens de rios, lagos, lagoas e áreas alagadas por todo o Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, empoleirado em galhos secos e troncos, observando a água.',
    curiosidade: 'Tem uma vocalização forte e ruidosa, emitida durante o voo.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'martim-pescador-verde',
    nome: 'Martim-pescador-verde',
    grupo: 'aves',
    cientifico: 'Chloroceryle amazona',
    fotos: [{ nome: 'ave-martim-pescador-verde', alt: 'Martim-pescador-verde pousado em um fio' }],
    alt: 'Foto de um martim-pescador-verde',
    texto: 'Muito comum à beira dos rios do Pantanal.',
    habitat: 'Margens de rios, córregos, lagos e áreas alagadas da América do Sul, muito abundante no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, pousado em galhos baixos sobre a água, observando as presas.',
    curiosidade: 'Mergulha em alta velocidade direto na água para capturar pequenos peixes com extrema precisão.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'martim-pescador-pequeno',
    nome: 'Martim-pescador-pequeno',
    grupo: 'aves',
    cientifico: 'Chloroceryle americana',
    fotos: [
      { nome: 'ave-martim-pescador-pequeno', alt: 'Martim-pescador-pequeno macho, de peito ferrugem, em um galho' },
    ],
    alt: 'Foto de um martim-pescador-pequeno',
    texto: 'Uma das menores espécies de martim-pescador.',
    habitat: 'Margens de rios, córregos, lagos e lagoas no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, empoleirado em galhos baixos e na vegetação à beira da água.',
    curiosidade: 'Os machos têm o peito avermelhado (ferrugem); as fêmeas têm o peito verde e listrado.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'garca-branca-grande',
    nome: 'Garça-branca-grande',
    grupo: 'aves',
    cientifico: 'Ardea alba',
    fotos: [{ nome: 'aves-garca-branca-e-colheiro', alt: 'Garça-branca-grande e um colhereiro rosa na água rasa' }],
    alt: 'Foto de uma garça-branca-grande',
    texto: 'Grande ave branca, sempre na beira da água.',
    habitat: 'Áreas alagadas, margens de rios, lagos, pântanos e campos irrigados por todo o Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, caminhando nas partes rasas da água ou empoleirada em árvores.',
    curiosidade:
      'Caçadora muito paciente: fica imóvel por longos períodos antes de dar um bote rápido para capturar peixes.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'colhereiro',
    nome: 'Colhereiro',
    grupo: 'aves',
    cientifico: 'Platalea ajaja',
    fotos: [
      { nome: 'colhereiro', alt: 'Colhereiro cor-de-rosa entre as plantas de uma área alagada' },
      { nome: 'aves-garca-branca-e-colheiro', alt: 'Colhereiro rosa ao lado de uma garça-branca-grande na água rasa' },
    ],
    alt: 'Foto de um colhereiro',
    texto: 'A ave cor-de-rosa de bico em forma de colher.',
    habitat: 'Zonas úmidas, margens de lagoas lodosas, pântanos e áreas alagadas rasas.',
    melhorEpoca: 'O ano todo, durante o dia, procurando alimento em grupos nas partes rasas dos banhados.',
    curiosidade:
      'Move o bico de um lado para o outro na água para filtrar alimentos. Sua cor rosa vem de pigmentos da dieta.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'garca-azul',
    nome: 'Garça-azul',
    grupo: 'aves',
    cientifico: 'Egretta caerulea',
    fotos: [{ nome: 'ave-garca-azul', alt: 'Garça-azul entre plantas aquáticas' }],
    alt: 'Foto de uma garça-azul',
    texto: 'Garça de plumagem azul-escura, que caça devagar na água rasa.',
    habitat: 'Margens de rios, lagoas, banhados, pântanos e estuários.',
    melhorEpoca: 'O ano todo, durante o dia, procurando alimento devagar em águas rasas.',
    curiosidade:
      'Quando jovens, estas garças são totalmente brancas e mudam aos poucos para a plumagem azul-escura ao amadurecer.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'soco-boi',
    nome: 'Socó-boi',
    grupo: 'aves',
    cientifico: 'Tigrisoma lineatum',
    fotos: [{ nome: 'ave-soco-boi', alt: 'Socó-boi pousado em um galho seco sobre a água' }],
    alt: 'Foto de um socó-boi',
    texto: 'Ave de pescoço ferrugem, mestre da camuflagem.',
    habitat: 'Margens de rios com mata, lagos, pântanos e áreas alagadas.',
    melhorEpoca: 'O ano todo, principalmente no início da manhã ou no final da tarde, perto da água.',
    curiosidade: 'Para se camuflar, estica o pescoço e aponta o bico para cima, confundindo-se com a vegetação.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'soco-dorminhoco',
    nome: 'Socó-dorminhoco',
    grupo: 'aves',
    cientifico: 'Nycticorax nycticorax',
    fotos: [{ nome: 'ave-soco-dorminhoco', alt: 'Socó-dorminhoco escondido no capim verde' }],
    alt: 'Foto de um socó-dorminhoco',
    texto: 'Ave noturna, que passa o dia quieta na vegetação.',
    habitat: 'Margens de rios, lagos, pântanos, manguezais e áreas alagadas no Pantanal.',
    melhorEpoca:
      'O ano todo. Mais ativo ao anoitecer e à noite; durante o dia fica escondido entre a vegetação densa perto da água.',
    curiosidade:
      'Tem grandes olhos vermelhos, adaptados para enxergar à noite, e espera a penumbra para emboscar peixes, anfíbios e crustáceos.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'gaviao-belo',
    nome: 'Gavião-belo',
    grupo: 'aves',
    cientifico: 'Busarellus nigricollis',
    fotos: [{ nome: 'ave-gaviao-belo', alt: 'Gavião-belo, de penas cor de canela, pousado em um arbusto' }],
    alt: 'Foto de um gavião-belo',
    texto: 'Gavião especialista em pescar.',
    habitat: 'Margens de rios, lagoas, pântanos e áreas alagadas do Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, empoleirado em galhos sobre a água, atento ao movimento dos peixes.',
    curiosidade: 'Tem espinhos nas solas das patas que ajudam a segurar os peixes escorregadios.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'ema',
    nome: 'Ema',
    grupo: 'aves',
    cientifico: 'Rhea americana',
    fotos: [{ nome: 'ave-ema', alt: 'Ema caminhando em um campo aberto' }],
    alt: 'Foto de uma ema',
    texto: 'A maior ave da América do Sul.',
    habitat: 'Campos abertos, savanas, pastagens, cerrados e áreas de transição no Pantanal.',
    melhorEpoca:
      'O ano todo, durante o dia, caminhando em áreas abertas em busca de sementes, frutos e pequenos animais.',
    curiosidade: 'O macho é quem constrói o ninho, choca os ovos e cuida sozinho dos filhotes.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'urubu',
    nome: 'Urubu',
    grupo: 'aves',
    cientifico: 'Cathartes aura / Coragyps atratus',
    fotos: [{ nome: 'ave-urubu', alt: 'Urubu de penas pretas na areia, perto da água' }],
    alt: 'Foto de um urubu',
    texto: 'O "faxineiro da natureza". No Pantanal há mais de uma espécie.',
    habitat: 'Áreas abertas, pastagens, margens de rodovias, matas e proximidades de rios em todo o Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, planando nas correntes de ar quente em busca de carcaças.',
    curiosidade:
      'Com olfato muito apurado (urubu-de-cabeça-vermelha) ou visão excelente (urubu-preto), acelera a decomposição da matéria orgânica e ajuda a prevenir doenças.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'joao-pinto',
    nome: 'João-pinto',
    grupo: 'aves',
    cientifico: 'Icterus croconotus',
    fotos: [{ nome: 'ave-joao-pinto', alt: 'João-pinto, de plumagem laranja e preta, dentro da água rasa' }],
    alt: 'Foto de um joão-pinto, ave laranja e preta',
    texto: 'Ave de plumagem laranja e preta, de canto bonito.',
    habitat: 'Áreas abertas, bordas de matas, cerrados e margens de rios no Pantanal.',
    melhorEpoca: 'O ano todo, durante o dia, em árvores ou descendo à margem para beber água e se banhar.',
    curiosidade: 'Tem um canto melodioso, capaz de imitar outras espécies de aves.',
    destaque: false,
    revisado: true,
  },

  {
    slug: 'garca-moura',
    nome: 'Garça-moura',
    grupo: 'aves',
    cientifico: 'Ardea cocoi',
    fotos: [
      { nome: 'ave-garca-moura', alt: 'Garça-moura, cinza e branca, entre galhos secos na margem' },
      { nome: 'ave-garca-moura-2', alt: 'Garça-moura em pé sobre galhos caídos' },
    ],
    alt: 'Foto de uma garça-moura',
    texto: 'A maior garça do Brasil, com mais de um metro de altura.',
    habitat: 'Margens de rios, lagos, lagoas, pântanos e áreas alagadas do Pantanal.',
    melhorEpoca:
      'O ano todo, principalmente no início da manhã ou no final da tarde, caçando sozinha nas margens ou empoleirada em árvores altas.',
    curiosidade: 'Caça com extrema paciência: fica totalmente imóvel até dar um bote rápido com o bico afiado.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'mutum-de-penacho',
    nome: 'Mutum-de-penacho',
    grupo: 'aves',
    cientifico: 'Crax fasciolata',
    fotos: [
      { nome: 'ave-mutum-de-penacho', alt: 'Mutum-de-penacho macho, preto, com topete crespo e bico amarelo' },
      { nome: 'ave-mutum-de-penacho-2', alt: 'Mutum-de-penacho macho olhando para a câmera' },
    ],
    alt: 'Foto de um mutum-de-penacho',
    texto: 'Ave grande, de topete crespo, que anda pelo chão da mata.',
    habitat: 'Matas de galeria, bordas de florestas tropicais, cerrados e capões do Pantanal.',
    melhorEpoca:
      'O ano todo, durante o dia, caminhando pelo chão da mata em busca de frutos e sementes ou empoleirado nos galhos do meio das árvores.',
    curiosidade:
      'O macho é preto, com barriga branca e topete de penas crespas pretas; a fêmea tem o corpo estriado de preto e branco e a barriga amarelada.',
    destaque: false,
    revisado: true,
  },
  {
    slug: 'ariramba-de-cauda-ruiva',
    nome: 'Ariramba-de-cauda-ruiva',
    grupo: 'aves',
    cientifico: 'Galbula ruficauda',
    fotos: [
      {
        nome: 'ave-ariramba-de-cauda-ruiva',
        alt: 'Ariramba-de-cauda-ruiva macho, verde brilhante e peito ferrugem, em um galho',
      },
    ],
    alt: 'Foto de uma ariramba-de-cauda-ruiva',
    texto: 'Pequena ave verde-brilhante, caçadora de insetos em pleno voo.',
    habitat: 'Bordas de matas ciliares, capoeiras, vegetação secundária e áreas de arbustos perto de cursos de água.',
    melhorEpoca: 'O ano todo, durante o dia, parada e quieta em galhos abertos, à espera das presas.',
    curiosidade:
      'Lança-se em voos acrobáticos para capturar borboletas, libélulas e vespas no ar. O macho tem a garganta toda branca.',
    destaque: false,
    revisado: true,
  },

  // Répteis
  {
    slug: 'jacare',
    nome: 'Jacaré-do-pantanal',
    grupo: 'repteis',
    cientifico: 'Caiman yacare',
    fotos: [
      { nome: 'jacare', alt: 'Jacaré com a cabeça para fora da água, entre aguapés' },
      { nome: 'jacare-2', alt: 'Jacaré com um peixe na boca, dentro do rio' },
      { nome: 'jacare-em-grupo', alt: 'Vários jacarés deitados lado a lado na margem' },
      { nome: 'jacare-jovem', alt: 'Jacaré jovem na terra, perto de plantas da margem' },
      { nome: 'foto-linda-jacare-e-capivara', alt: 'Jacaré na água e uma capivara na margem, logo atrás' },
    ],
    alt: 'Foto de um jacaré-do-pantanal',
    texto: 'Também chamado de jacaré-do-papo-amarelo, é comum em toda a região.',
    habitat: 'Rios, lagoas, baías, pântanos e áreas alagadas rasas de toda a região pantaneira.',
    melhorEpoca: 'O ano todo, durante o dia, tomando sol nas margens ou com os olhos e as narinas à flor da água.',
    curiosidade:
      'Na seca, quando as lagoas evaporam, os jacarés podem se concentrar em grande número nas últimas poças de água.',
    destaque: true,
    revisado: true,
  },
  {
    slug: 'iguana',
    nome: 'Iguana',
    grupo: 'repteis',
    cientifico: 'Iguana iguana',
    fotos: [
      { nome: 'iguana', alt: 'Iguana-verde tomando sol em um galho, no meio das folhas' },
      { nome: 'iguana-2', alt: 'Iguana caminhando no chão de terra, perto da mata' },
    ],
    alt: 'Foto de uma iguana',
    texto: 'Também chamada de iguana-verde, vive nas árvores perto dos rios.',
    habitat: 'Árvores e galhos perto das margens de rios, matas ciliares e áreas de vegetação densa.',
    melhorEpoca:
      'O ano todo, principalmente nas horas mais quentes do dia, quando sobe em galhos expostos para tomar sol.',
    curiosidade:
      'Tem ótima camuflagem e uma crista de escamas pontudas nas costas. Quando ameaçada no alto das árvores, pode se soltar e cair direto na água para fugir nadando.',
    destaque: false,
    revisado: true,
  },
]

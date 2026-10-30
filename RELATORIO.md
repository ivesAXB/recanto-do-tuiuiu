# RELATORIO.md

Relatórios da fila (TAREFAS.md). Mais recentes no topo.

---

## Manutenção do Ives (lista fixa, sempre atualizada)

O que o Ives precisa fazer para o projeto continuar estável depois do lançamento. Cada tarefa da fila acrescenta aqui o que criar de rotina nova.

| Quando | O que fazer | Por quê | Origem |
|---|---|---|---|
| Se chegar e-mail do GitHub sobre workflow desativado (só acontece após **60 dias seguidos sem push**) | GitHub → aba **Actions** → *Supabase keep-alive* → **Enable workflow**. Qualquer push também resolve. | Sem o keep-alive, o Supabase gratuito pausa e o site para de carregar preços e receber pedidos. | P2 |
| Se chegar e-mail do GitHub com o keep-alive **falhando** (vermelho) | Abrir o Supabase: se o projeto estiver pausado, clicar em *Restore*. Se a chave pública tiver mudado, atualizar o Secret `VITE_SUPABASE_ANON_KEY` no GitHub e o `.env`. | O site depende do banco ativo. | P2 |
| Se o deploy falhar (e-mail do GitHub, *Deploy to GitHub Pages* vermelho) | Ver o erro na aba Actions. Se for "Falta …", conferir as Variables/Secret do repositório. | Sem o deploy, as mudanças não chegam ao site. | P1 |
| Uma vez por ano, quando saírem as datas oficiais | Cadastrar o defeso do ano no painel (aba **Períodos**). | O site avisa o defeso a partir do banco; as datas mudam todo ano. | C1 |
| Quando os preços mudarem | Atualizar diária, sinal e experiências no painel (aba **Valores**). | Os preços do site vêm do banco. | C1 |
| Quando a pousada fechar ou lotar | Cadastrar um **bloqueio** no painel (aba **Períodos**). | O formulário impede pedidos nas noites bloqueadas. | C1 |
| Opcional (melhoria futura) | Pedir ao agente um workflow que faça um commit pequeno por mês. | Elimina o risco do item dos 60 dias. | P2 |
| Se os pedidos pelo site pararem e aparecer "verificação de segurança" ou erro genérico | Supabase → *Edge Functions → submit-reservation → Logs*: ver o erro. Conferir se o secret `TURNSTILE_SECRET_KEY` existe e se o widget no Cloudflare continua ativo. Enquanto isso, os pedidos chegam pelo WhatsApp. | Com o captcha ligado, o pedido depende da Edge Function e da Cloudflare. | P4 |
| Nunca apagar a variável `VITE_TURNSTILE_SITE_KEY` do GitHub (ou do `.env`) | Se precisar desligar o captcha, peça ao agente: é preciso devolver a permissão no banco (o `grant` comentado na migração 20261029180000) **antes** de remover a variável. | Desde a migração, o caminho antigo está fechado: sem a variável, o site volta a usá-lo e todo pedido falha. | P4 |
| `npm run dev` no computador | Usar a porta padrão 5173. | A Edge Function só aceita `http://localhost:5173` entre os endereços locais. | P4 |
| Ao trocar ou adicionar um domínio (ex.: na troca para recantodotuiuiu.com.br) | Adicionar o domínio (1) no widget do Turnstile no Cloudflare e (2) nas listas `ALLOWED_ORIGINS`/`ALLOWED_HOSTNAMES` da Edge Function (pedir ao agente), e publicar a função de novo. | O captcha e a função só aceitam domínios listados. Os domínios `recantodotuiuiu.com.br` e `www.` já estão na lista. | P4 |
| Se as chaves do Turnstile forem trocadas no Cloudflare | Atualizar `VITE_TURNSTILE_SITE_KEY` (GitHub e `.env`) e `TURNSTILE_SECRET_KEY` (Supabase). | Chaves desencontradas fazem todo pedido falhar no captcha. | P4 |
| Uma vez por mês | Backup: exportar em CSV as tabelas de pedidos, passeios, períodos, experiências e configurações (Table Editor → Export), guardando em pasta privada e apagando as cópias antigas. | O plano gratuito do Supabase não tem backup para baixar. | P6 |
| Quando chegarem fotos ou vídeos novos | 1) Fotos em `originais/fotos/<tema>/` (ex.: `pousada/varanda.jpg`; animais com o nome do animal no arquivo: `animais/tuiuiu.jpg`, `tuiuiu-2.jpg`, sem pasta por animal). Vídeos em `originais/videos/`. 2) Na pasta raiz do projeto: `npm run media:images` e/ou `npm run media:videos`. 3) Preencher `legenda` e `credito` em `public/media/img/manifest.json`. 4) Avisar o agente ou fazer commit de `public/media/img` e `public/media/video`. A pasta `originais/` nunca vai para o Git. | Os originais pesados ficam só no computador; o site usa as versões otimizadas. Nomes de arquivo iguais em pastas diferentes colidem (o script avisa e pula). | F4 |
| Ao lançar e ao criar contas | Manter desligado o cadastro público no Supabase (Authentication → Allow new users to sign up). Admin novo: criar o usuário e dar o papel pelo SQL (P6, item 3). | Sem isso, qualquer pessoa poderia criar conta. | P6 |

---

## F11 — Pronto para apresentação

- **Resultado:** pronto. **Marco visual: a fila para aqui para o Ives ver.** Commit local, **sem push** (aguardando o Ives). O push da F10 foi feito.
- **Arquivos criados:**
  - `src/components/SiteHeader.tsx`: menu do topo, que antes ficava dentro do Hero.
    - Itens: **A pousada · Fauna · Pesca · Pacotes · Para os pequenos**, mais o botão "Pedir reserva".
    - **Menu de celular e tablet** (abaixo de 1024 px), aberto pelo botão "Menu": tela cheia com os mesmos itens em letra grande, "Pedir reserva" e "Falar no WhatsApp".
    - Fecha ao escolher um item, com "Fechar" ou com Esc. O foco vai para o primeiro item ao abrir, o Tab fica preso dentro do menu e, ao fechar, o foco volta ao botão.
    - A página atrás não rola enquanto o menu está aberto.
  - `src/pages/NotFound.tsx`: **404 amigável** ("Esse caminho o tuiuiú não conhece."), com "Voltar ao início", "Pedir reserva", `noindex` e rodapé.
- **Arquivos alterados:**
  - `src/App.tsx`: endereços que não existem mostram a 404. Os links antigos de seção (`site/#reservar`, `#pesca`…) **continuam abrindo a Home** e rolando até a seção (lista `SECTIONS`).
  - `src/sections/Hero.tsx`: usa o `SiteHeader`.
  - `TAREFAS.md`: F11 marcada como `[x]`.
- **Ordem da Home conferida:** Hero → Um dia no Recanto → A pousada → Fauna → Pesca (calendário e "Conheça os peixes") → Pacotes → Troféus → Pequenos → Reserva → Foto final → Rodapé.
- **Verificação (1440 px e 375 px):**
  - Lint e build passam. O único aviso do build é o do arquivo grande, que já existia: o code-splitting está pendente de decisão.
  - **Nenhum link de âncora quebrado:** todos os `#id` da página existem.
  - **Nenhum "undefined", "TODO", "lorem" ou "NaN"** no texto visível.
  - **13 espaços reservados na Home, todos com a etiqueta "ilustrativo".**
  - O menu do desktop rola até a seção certa.
  - `#/nao-existe` mostra a 404, e `#/reservar` abre a Home na seção de reserva.
  - `#/animais`, `#/peixes` e `#/pequenos` têm "Voltar ao início".
  - No celular, o menu abre, foca o primeiro item, leva a "Fauna", fecha com Esc e devolve o foco ao botão, sem rolagem lateral.
  - Sem erros no console.

### Lista final de pendências do Ives (por seção)

Tudo o que falta para trocar o conteúdo provisório pelo real. O caminho indica onde cada coisa é editada; nenhuma troca exige mexer em componente.

| Seção | Pendência | Onde fica |
|---|---|---|
| **Geral** | Aprovar título, descrição e foto de compartilhamento (WhatsApp/Google) | `index.html` |
| Geral | Conferir se a Variable `VITE_WHATSAPP_NUMBER` do GitHub (e o `.env`) é `5565999713778` | GitHub → Settings → Variables |
| Geral | Remover o `noindex` só no lançamento, sem conteúdo provisório (P6, item 7) | `index.html` |
| Geral | Decidir o code-splitting (deixa o site mais rápido) | — |
| **Hero** | Revisar o título "O Pantanal começa quando o tuiuiú chega." sobre o vídeo da onça | `src/sections/Hero.tsx` |
| **Um dia no Recanto** | Revisar os textos das 4 cenas | `src/sections/DayAtRecanto.tsx` |
| **A pousada** | 3 fotos: quarto, refeição, varanda ao fim do dia (verticais 4:5) | `originais/fotos/pousada/` e depois `src/data/pousada.ts` |
| A pousada | Revisar o título e as legendas | `src/data/pousada.ts` |
| **Fauna** | Fotos de arara-azul, capivara, garça-branca e martim-pescador, e créditos de todas | `originais/fotos/animais/` e `src/data/animals.ts` |
| Fauna | Nome científico, habitat, quando ver e curiosidade de cada animal (com o tio ou uma fonte citada) | `src/data/animals.ts` |
| Fauna | Confirmar quais animais mostrar; autorização de imagem para as fotos com pessoas (araras) | — |
| **Pesca** | Revisar os textos das épocas e os meses do calendário (vieram do site antigo) | `src/sections/Fishing.tsx` |
| Pesca | Confirmar as datas oficiais do defeso de cada ano | Painel → Períodos |
| **Peixes** (`#/peixes`) | Com o tio: iscas, melhor época, dificuldade, peso comum e observações; depois, `oficial: true` | `src/data/fish.ts` |
| Peixes | Confirmar os nomes científicos, fotos de cada espécie e outras espécies | `src/data/fish.ts` |
| **Pacotes** | Conferir preços e textos | Painel → Valores |
| **Troféus** | Fotos reais (pescador com o peixe), espécie, peso, ano, nome ou apelido; **autorização de imagem e nome** de cada um; peso e espécie conferidos pelo tio | `src/data/trophies.ts` |
| **Pequenos** (`#/pequenos`) | Quais atividades para crianças a pousada **realmente** oferece | `src/data/pequenos.ts` |
| Pequenos | Revisar os textos; desenhos reais só com autorização (o envio pelo site é uma tarefa futura, com pausa) | `src/data/pequenos.ts` |
| **Foto final** | Revisar "Ficou alguma dúvida? A gente responde pelo WhatsApp." e o texto abaixo | `src/sections/Closing.tsx` |
| **Rodapé** | Redes sociais, crédito das fotos e revisão do texto de privacidade (rascunho) | `src/data/site.ts` |
| **Lançamento** | Itens da P6: limpar pedidos de teste, conta de admin do tio, conferir RLS, testar em celular real, Lighthouse, troca de domínio, backup | P6, mais acima |

---

## F10 — "Pantanal para os pequenos" (estrutura com placeholders)

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives). O push dos commits anteriores (F8 e ajustes, até `53cb356`) foi feito.
- **Arquivos criados:**
  - `src/data/pequenos.ts`: os blocos de curiosidades (`titulo`, `texto`, `provisorio`) e o número de espaços do mural.
  - `src/pages/Kids.tsx`: página `#/pequenos`, carregada sob demanda (4 kB).
    - Topo com formas coloridas que flutuam devagar e o título "Vamos conhecer o Pantanal?".
    - 4 cartões coloridos que aparecem com um leve "pulo".
    - Mural com 6 espaços reservados ("Desenho de criança: espaço reservado").
    - **Aviso visível:** "Os desenhos das crianças só serão publicados com a autorização dos pais ou responsáveis."
    - Botão "Voltar ao início", título e descrição próprios, e rodapé.
    - Com "reduzir movimento", nada se mexe.
  - `src/sections/KidsCall.tsx`: chamada clara (cartão areia) na Home, entre Troféus e Reserva (a ordem da F11), com o botão "Entrar →".
- **Arquivos alterados:**
  - `src/App.tsx`: rota `/pequenos`.
  - `src/pages/Home.tsx`: inclui a chamada.
  - `src/sections/Hero.tsx`: item **"Para os pequenos"** no menu.
  - `TAREFAS.md`: F10 marcada como `[x]`.
- **Conteúdo** (genérico, seguro e em linguagem simples):
  - "Quem é o tuiuiú?" (ave grande, pescoço preto, colar vermelho, símbolo do Pantanal);
  - "A água sobe e desce" (cheia e seca);
  - "Quem mora perto da água?" (jacarés, peixes, capivaras, aves);
  - **"Atividades na pousada": "Em breve"**, para não inventar serviços (CLAUDE.md: só publicar o que a pousada realmente oferece).
- **Não implementado de propósito:** envio de desenhos, upload ou banco. Envolve imagem de menores, moderação e LGPD; fica para uma tarefa própria, com pausa.
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - O menu mostra "Para os pequenos", e o botão "Entrar" abre `#/pequenos` com o título certo, os 4 cartões, os 6 espaços do mural e o aviso.
- **Observação:** o menu do topo só aparece do tablet para cima. No celular não há menu (já era assim); fica para a F11.
- **Pendências do Ives:**

| Onde | O que falta |
|---|---|
| Pequenos | Quais atividades para crianças a pousada **realmente** oferece (para substituir o "Em breve") |
| Pequenos | Revisar os textos das curiosidades e da chamada na Home |
| Pequenos | Desenhos reais, só com autorização dos responsáveis; o envio pelo site fica para uma tarefa própria |

---

## Ajuste da F8 + vídeo novo de abertura (pedido do Ives)

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives).
- **Peixes sem anel na Home:** o anel de peixes saiu. O pedido era só a faixa de troféus andando sem parar, o que já estava feito.
- **`#/peixes` com cartões que viram**, iguais aos de `#/animais`.
  - O verso mostra nome, nome científico, descrição, iscas, melhor época, dificuldade, peso comum, observações (por enquanto "Em breve") e "informações em revisão".
  - O aviso do defeso, vindo do banco, aparece no topo da página.
  - `#/peixes/<slug>` rola até o cartão do peixe.
  - A seção de pesca ganhou o botão **"Conheça os peixes →"**, que leva à página.
- **Cartão reutilizável:** o cartão que vira saiu de `Animals.tsx` para `src/components/FlipCard.tsx`, usado pelas duas páginas. `SOON` ("Em breve") e `useScrollToCard` foram para `src/lib/cards.ts`.
- **Vídeo de abertura trocado** para `onca-na-arvore-lambendo-a-pata`:
  - Original: 1920×1080, 50 quadros/s, 22,5 s, **197 MB**.
  - Pelo padrão do script sairia com 13,3 MB, pesado demais para o primeiro vídeo do site.
  - Versão publicada: **1280×720, 30 quadros/s, 4,4 MB**, mais o poster de 115 kB. O vídeo antigo tinha 848×480 e 2 MB.
  - `scripts/optimize-videos.mjs`: passou a **limitar todo vídeo a 30 quadros/s** e ganhou a lista `OVERRIDES` com ajustes por vídeo (o da onça: 1280 px e CRF 27). Assim, rodar `npm run media:videos` de novo gera a mesma versão leve.
  - O original ficou em `originais/videos/` (fora do Git). O vídeo antigo continua em `public/media/video`, sem uso no momento.
- **Arquivos:**
  - novos: `src/components/FlipCard.tsx`, `src/lib/cards.ts`, `public/media/video/onca-na-arvore-lambendo-a-pata.mp4` e `-poster.jpg`;
  - alterados: `src/pages/FishPage.tsx` (reescrita), `src/pages/Animals.tsx`, `src/pages/Home.tsx`, `src/sections/Fishing.tsx`, `src/sections/Hero.tsx`, `src/data/fish.ts` e `scripts/optimize-videos.mjs`;
  - removido: `src/sections/FishRing.tsx`.
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - O vídeo novo carrega e toca (1280 px).
  - A Home não tem mais o anel de peixes, e o botão da pesca abre `#/peixes`, com 3 cartões e o aviso do defeso.
  - O cartão do Pintado vira, com os 5 campos "Em breve".
  - `#/animais/capivara` continua funcionando (6 cartões, foco no botão da capivara).
- **Observação:** o título do Hero ("O Pantanal começa quando o tuiuiú chega.") continua igual, agora sobre o vídeo da onça. O Ives pode querer revisar a combinação.

---

## F8 — Peixes: anel + página por espécie (conteúdo genérico)

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives).
- **Arquivos criados:**
  - `src/components/PhotoRing.tsx`: o anel da F6 virou um componente reutilizável (título, itens, link, texto do botão). Quando há menos de 6 itens, ele repete os itens para preencher o anel; as cópias ficam escondidas do leitor de tela e do Tab.
  - `src/data/fish.ts`: `nome`, `cientifico`, `foto`, `alt`, `descricao`, `iscas`, `melhorEpoca`, `dificuldade`, `pesoComum`, `observacoes`, `oficial`.
  - `src/sections/FishRing.tsx`: anel "Os peixes da pesca esportiva.", logo depois do calendário de pesca.
  - `src/pages/FishPage.tsx`: rotas `#/peixes` (lista) e `#/peixes/<slug>` (uma página por espécie), carregadas sob demanda.
    - Cada página tem foto (espaço reservado), nome, nome científico, descrição, a etiqueta "Informações em revisão" e os 5 campos específicos com **"Em breve"**.
    - **O aviso do defeso vem do banco** (`closed_periods`).
    - Botões "Voltar ao início" e "Todos os peixes", título e descrição próprios, e mensagem "Peixe não encontrado" para um endereço errado.
  - `src/lib/defeso.ts`: busca do próximo defeso e a mensagem, agora usadas pela seção de pesca e pela página do peixe (antes ficavam só dentro de `Fishing.tsx`).
- **Arquivos alterados:**
  - `src/sections/AnimalRing.tsx`: passou a usar o `PhotoRing`, sem mudança visual.
  - `src/sections/Fishing.tsx`: usa `src/lib/defeso.ts`, sem mudança visual.
  - `src/App.tsx`: rota `/peixes/:slug?`, com o carregamento sob demanda organizado num componente `Lazy`.
  - `src/pages/Home.tsx`: inclui o anel de peixes.
  - `TAREFAS.md`: F8 marcada como `[x]`.
- **Conteúdo:**
  - Espécies: **Dourado e Pintado** (as do `Fishing.tsx`) e **Pacu** (no CLAUDE.md).
  - Descrições só com fatos amplamente conhecidos ("peixe de escamas" ou "de couro", a cor, as pintas).
  - **Nenhum número, época, isca ou recorde.**
  - Nomes científicos preenchidos porque são consagrados (*Salminus brasiliensis*, *Pseudoplatystoma corruscans*, *Piaractus mesopotamicus*), mas **devem ser confirmados** junto com o resto.
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - O anel de peixes mostra 6 quadrados: os 3 peixes mais 3 cópias escondidas; só os 3 peixes e o botão recebem foco.
  - Clicar no Pintado abre `#/peixes/pintado` com o título certo, os 5 campos "Em breve" e o aviso do defeso cadastrado ("Estamos no defeso até 31/01/2027").
  - `#/peixes` lista 3 peixes, e `#/peixes/tilapia` mostra "Peixe não encontrado".
  - O anel de animais continua funcionando.
- **Pendências do Ives:**

| Onde | O que falta |
|---|---|
| Peixes (todos) | **Validar com o tio:** iscas, melhor época, dificuldade, peso comum e observações. Depois, marcar `oficial: true` |
| Peixes (todos) | Confirmar os nomes científicos |
| Peixes | Fotos de cada espécie (sem pessoas, ou com autorização) |
| Peixes | Outras espécies que o Ives quiser listar |
| Peixes | Revisar o título "Os peixes da pesca esportiva." |

---

## Ajuste: chegada do anel e troféus contínuos (pedido do Ives)

- **Anel:** na primeira vez que a seção aparece, ele chega girando bem rápido (40 vezes a velocidade normal, cerca de 2 s por volta). Depois de uma volta completa, desacelera em 3 s até o giro calmo (uma volta a cada 90 s). Medido no navegador: cerca de 80° a cada meio segundo na primeira volta, caindo até 2°. A pausa com mouse, toque e teclado continua.
- **Troféus:** velocidade sempre igual e **sem pausa** (nem com mouse, toque ou foco). Os itens deixaram de receber foco pelo Tab, porque não faz sentido focar algo que não para. Com "reduzir movimento", a faixa continua parada, com rolagem manual.
  - Observação de acessibilidade: a recomendação WCAG 2.2.2 pede um jeito de pausar movimentos longos. Quem ativa "reduzir movimento" no aparelho já recebe a faixa parada; fica registrado como decisão do Ives.
- **Arquivos:** `src/lib/loop.ts` (opção `intro`), `src/sections/AnimalRing.tsx` e `src/sections/Trophies.tsx`.
- **Verificação:** lint e build passam. No navegador, a faixa continuou andando durante um toque simulado.

---

## F6/F7 (ajustes pedidos pelo Ives) + encerramento que destampa o rodapé

- **Resultado:** pronto e enviado (push autorizado pelo Ives).
- **Pausa ao tocar:** o anel e a faixa de troféus agora param ao tocar em qualquer ponto da seção e voltam 1,5 s depois de tirar o dedo. Também param com o mouse em cima e com o foco do teclado. Antes era só CSS `:hover`, que no celular não funciona.
- **Sem o "arremesso":** a rotação passou do CSS para o GSAP (`src/lib/loop.ts`, `controlLoop`). A animação **só roda com a seção na tela**, começa parada e acelera suavemente (e desacelera ao pausar). Fora da tela, fica parada, o que também poupa bateria.
- **Anel em quadrados** (como na referência):
  - 6 quadrados de tamanhos um pouco diferentes (16% a 22% do anel), a distâncias levemente diferentes do centro, girando no sentido horário e sempre em pé.
  - No centro, parados: "FAUNA", o título e o botão "Ver os animais →".
  - **No celular**, o título fica acima do anel e só o botão fica no centro, porque o meio é pequeno demais para o texto.
- **Encerramento que destampa o rodapé** (`src/sections/Closing.tsx`, novo, depois de "Peça sua reserva"):
  - Foto de tela cheia (`imagem-lago-drone-com-barcos`) com leve paralaxe e o texto à direita: "Ficou alguma dúvida? A gente responde pelo WhatsApp." e o botão "Falar no WhatsApp".
  - O rodapé fica **parado embaixo** (`position: sticky`) e a página passa por cima dele. Ao rolar até o fim, a foto sobe e o rodapé aparece, como na referência.
  - **Só do tablet para cima:** no celular, o rodapé (909 px) é mais alto que a tela (812 px), e o efeito mostraria primeiro a parte de baixo dele. Lá, ele segue a rolagem normal.
- **Arquivos:**
  - novos: `src/lib/loop.ts`, `src/sections/Closing.tsx`;
  - alterados: `src/sections/AnimalRing.tsx`, `src/sections/Trophies.tsx`, `src/components/Footer.tsx` (aceita `className`), `src/pages/Home.tsx`;
  - `src/index.css`: as animações CSS antigas foram removidas.
- **Verificação:**
  - Lint e build passam, sem erros no console (inclusive navegando entre a Home e `#/animais`).
  - O anel começa em 0° ao entrar na tela.
  - Com um toque simulado, o anel e a faixa pararam (ângulo e posição iguais em 0,8 s) e voltaram depois de soltar.
  - Rodapé: no desktop ele fica fixo embaixo enquanto a página sobe. Celular (375 px) sem rolagem lateral.
- **Textos para o Ives revisar:**
  - "SUA ESTADIA";
  - "Ficou alguma dúvida? A gente responde pelo WhatsApp.";
  - "Conte as datas, quantas pessoas vêm e o que querem fazer. O resto a gente combina com você."

---

## F7 — Troféus de pesca (faixa horizontal)

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives).
- **Arquivos criados:**
  - `src/data/trophies.ts`: `foto`, `especie`, `pesoKg`, `ano`, `pescador`, `autorizado`, `legenda`, `provisorio`.
  - `src/sections/Trophies.tsx`: seção "Troféus" (`id="trofeus"`).
    - Faixa que anda **da direita para a esquerda** em velocidade fixa (uma volta a cada 45 s), sem depender da rolagem.
    - Loop sem emenda: a lista está duplicada, e a segunda cópia fica escondida do leitor de tela e do Tab.
    - **Pausa com o mouse em cima e ao focar um item com o Tab.**
    - Com "reduzir movimento", a faixa fica parada e rola para o lado com o dedo ou o mouse.
- **Arquivos alterados:**
  - `src/index.css`: animação da faixa.
  - `src/pages/Home.tsx`: a seção entra **depois de Pacotes e antes da Reserva**. A F7 dizia "antes do rodapé", mas a ordem final da F11 coloca Troféus antes de Pequenos e Reserva. Segui a F11.
  - `TAREFAS.md`: F7 marcada como `[x]`.
- **Conteúdo:**
  - 5 espaços reservados com legendas **claramente fictícias** ("Exemplo: 1º lugar, categoria Pintado", Dourado, Pacu…), sem nome de pessoa, peso ou recorde.
  - **Trava de LGPD no código:** uma foto só aparece se `autorizado: true`; sem isso, o item mostra o espaço reservado mesmo que a foto esteja preenchida.
- **Correção junto (F6):** a página `#/animais` gerava um erro no console ao abrir sem um animal escolhido. O efeito devolvia o resultado de `window.scrollTo`, que neste navegador não vem vazio. Corrigido; navegar entre a Home e `#/animais` ficou sem erros.
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - A faixa anda para a esquerda (medido pelo `transform`) e tem 10 itens, 5 deles escondidos (a cópia).
  - Os 5 itens visíveis recebem foco pelo Tab, e o foco pausa a faixa.
- **Pendências do Ives:**

| Onde | O que falta |
|---|---|
| Troféus | Trocar os 5 exemplos por troféus reais: foto do pescador com o peixe, espécie, peso (kg), ano e nome ou apelido |
| Troféus | **Autorização de imagem e nome** de cada pescador antes de marcar `autorizado: true` |
| Troféus | Espécie e peso conferidos pelo tio |
| Troféus | Revisar o título "Peixes que contam história." |

---

## F6 (ajustes pedidos pelo Ives)

- **Anel:** as fotos ficaram maiores, em círculos que se encostam (com 6 animais, o diâmetro é igual ao raio do anel). Cada círculo tem até 210 px no desktop (antes eram cerca de 120 px) e cerca de 30% da largura no celular.
- **Sem nome visível** em cada animal, porque o catálogo já mostra. O nome continua no link para leitores de tela e aparece ao parar o mouse em cima (`title`).
- Ao passar o mouse, o círculo aumenta um pouco e ganha a borda dourada.
- **"Um dia no Recanto" no celular:** a subida do texto (F3) agora só acontece no desktop, onde foto e texto ficam lado a lado. No celular, o texto fica embaixo da foto e encostava nela no fim da rolagem. Medido no fim da cena "Pantanal vivo" em 375 px: 32 px de distância entre a foto e o texto.
- **Verificação:** lint e build passam; conferido no desktop e no celular (375 px), sem rolagem lateral.

---

## F6 — Catálogo de animais (anel + página de cards que viram)

- **Resultado:** pronto. **Marco visual: a fila para aqui para o Ives ver no navegador.** Há commits locais aguardando push (F6).
- **Arquivos criados:**
  - `src/data/animals.ts`: `slug`, `nome`, `cientifico`, `foto`, `alt`, `texto`, `habitat`, `melhorEpoca`, `curiosidade`, `credito`, `revisado`.
  - `src/sections/AnimalRing.tsx`: seção "Fauna" na Home, depois de "A pousada".
    - Anel de fotos que gira no **sentido horário** em velocidade fixa (uma volta a cada 80 s), sem depender da rolagem.
    - As fotos ficam sempre em pé.
    - **Pausa com o mouse em cima ou com o foco do teclado** dentro do anel.
    - Cada animal leva a `#/animais/<slug>`, e o botão "Ver todos os animais" leva a `#/animais`.
    - Com "reduzir movimento", vira uma grade parada.
  - `src/pages/Animals.tsx`: página `#/animais`, carregada só quando aberta (4 kB).
    - Cards com a foto na frente. Viram com o mouse (desktop) ou com o botão "Ver informações" (toque e teclado), que é um botão de verdade com `aria-pressed`.
    - O verso mostra: nome, nome científico, texto, habitat, quando ver, curiosidade, a etiqueta "informações em revisão" e o crédito da foto.
    - **As duas faces ficam sempre na página**, então o leitor de tela lê o verso.
    - Botão "Voltar ao início", título e descrição próprios da página, e rodapé.
    - Chegando por um animal do anel, a página rola até o card dele e coloca o foco no botão.
- **Arquivos alterados:**
  - `src/App.tsx`: rota `/animais/:slug?`.
  - `src/pages/Home.tsx`: inclui o anel.
  - `src/index.css`: animação do anel.
  - `TAREFAS.md`: F6 marcada como `[x]`.
- **Conteúdo (regra: nada de biologia inventada):**
  - 6 animais: tuiuiú, jacaré, arara-azul, capivara, garça-branca e martim-pescador.
  - **Fotos reais só do tuiuiú e do jacaré**; os outros 4 são espaços reservados.
  - Cada um tem só o nome popular e **uma frase amplamente conhecida** (ex.: "O maior roedor do mundo, sempre por perto da água.").
  - Habitat, quando ver, curiosidade e crédito mostram **"Em breve"**.
  - **Nome científico vazio de propósito:** só entra com fonte citada. Posso preencher com uma fonte confiável (ICMBio ou IUCN) se o Ives quiser.
  - As fotos com pessoas (`mulher-com-araras`, `rogaciano-com-arara`) **não foram usadas**, porque mostram pessoas identificáveis (LGPD); só entram com autorização.
- **Como trocar um espaço reservado por foto real:** `npm run media:images` com a foto em `originais/fotos/animais/<animal>.jpg`, depois preencher `foto` em `src/data/animals.ts`.
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - O anel gira no sentido horário (medido pelo `transform`).
  - Clicar na capivara abre `#/animais/capivara`, rola até o card e coloca o foco no botão.
  - O botão vira o card (`aria-pressed="true"`, "Ver foto de Capivara"), e o verso mostra "Em breve" nos campos vazios.
  - Celular (375 px): anel e página sem rolagem lateral.
- **Pendências do Ives:**

| Onde | O que falta |
|---|---|
| Animais: arara-azul, capivara, garça-branca, martim-pescador | Fotos (quadradas ou verticais 3:4) e crédito |
| Animais: tuiuiú, jacaré | Crédito das fotos |
| Todos os animais | Nome científico, habitat, quando ver e curiosidade (validar com o tio ou com fonte citada); depois, marcar `revisado: true` |
| Lista de animais | Confirmar quais animais mostrar (trocar ou acrescentar à vontade) |
| Fotos com pessoas e araras | Autorização de imagem, se quiser usá-las |

---

## F5 — Seção "A pousada": galeria com legenda

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives).
- **Arquivos criados:**
  - `src/components/Placeholder.tsx`: espaço reservado reutilizável (regra geral de placeholders). É um bloco verde-claro na proporção da foto final, com a descrição visível do que vai ali e a etiqueta "ilustrativo". Leitores de tela ouvem "Espaço reservado para foto: …".
  - `src/lib/media.ts`: `imageSources(nome)` monta `src`, `srcset`, largura e altura a partir do `public/media/img/manifest.json`. Quando o script da F4 gerar a versão 1920, ela entra no `srcset` sozinha.
  - `src/data/pousada.ts`: os itens da galeria (`foto`, `legenda`, `alt`, `provisorio`).
  - `src/sections/Pousada.tsx`: seção `id="pousada"`, depois de "Um dia no Recanto" (a ordem do F11):
    - 3 colunas no desktop, com a coluna do meio mais baixa (ritmo editorial), e 1 no celular;
    - as fotos sobem e aparecem ao entrar na tela, e deslizam levemente dentro da moldura ao rolar;
    - com "reduzir movimento", tudo fica parado.
- **Arquivos alterados:**
  - `src/index.css`: novo token `--color-sage-200` (verde-claro dos espaços reservados).
  - `src/pages/Home.tsx`: inclui a seção.
  - `index.html`: **`<meta name="robots" content="noindex">`** enquanto houver conteúdo provisório (regra geral). Remover é decisão do Ives no lançamento (P6, item 7).
  - `TAREFAS.md`: F5 marcada como `[x]`.
- **Conteúdo:**
  - **3 fotos reais** já existentes: vista aérea da casa, a pousada vista da água e a fachada.
  - **3 espaços reservados:** quartos, refeições e varanda.
  - Nada de vídeo nem de imagem gerada por IA.
- **Como trocar um espaço reservado por foto real** (sem mexer em componente):
  1. Rodar `npm run media:images` com a foto em `originais/fotos/pousada/`.
  2. Em `src/data/pousada.ts`, preencher `foto` com o nome gerado (ex.: `quarto-casal`), ajustar `alt` para descrever a foto real e marcar `provisorio: false`.
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - Desktop: 3 colunas, as 3 fotos carregam a versão de 640 px e os 3 espaços reservados mostram a etiqueta.
  - Celular (375 px): 1 coluna, sem rolagem lateral.
  - Imagens com `srcset`, `loading="lazy"`, largura e altura (para não "pular" a página).
- **Pendências do Ives (fotos):**

| Onde | O que falta | Formato |
|---|---|---|
| A pousada, item 4 | Foto do quarto (camas e janela) | Vertical 4:5, de preferência 1920 px ou mais na largura do original |
| A pousada, item 5 | Foto de uma refeição servida | Vertical 4:5 |
| A pousada, item 6 | Foto da varanda ao fim do dia | Vertical 4:5 |

- **Textos para o Ives revisar:**
  - o título "Uma casa no meio do Pantanal.";
  - as legendas das fotos reais, escritas pelo agente a partir do que aparece nas fotos;
  - as legendas dos espaços reservados ("Os quartos.", "Café, almoço e janta inclusos na diária.", "A varanda ao fim do dia.").

---

## F4 — Mídia em alta qualidade (scripts)

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives). A fila não para aqui.
- **Situação encontrada:** os dois scripts já existiam desde o começo do projeto (640/1280, manifest simples). Foram ampliados em vez de recriados.
- **Arquivos alterados:**
  - `scripts/optimize-images.mjs`:
    - gera também a largura **1920**;
    - aceita WebP, TIFF e AVIF;
    - lê por padrão `originais/fotos`;
    - o **tema** vem da subpasta;
    - o `manifest.json` ganhou `width`, `height`, `tema`, `legenda` e `credito`, e **preserva o que foi escrito à mão** ao rodar de novo;
    - avisa quando dois arquivos ficariam com o mesmo nome, quando a foto é menor que 1920 px e quando a pasta não existe;
    - respeita fotos de celular giradas (EXIF).
  - `scripts/optimize-videos.mjs`:
    - lê por padrão `originais/videos`;
    - aceita MKV e WebM;
    - verifica se o ffmpeg está instalado;
    - **avisa os vídeos acima de ~8 MB**, com sugestões.
  - `package.json`: comandos `npm run media:images` e `npm run media:videos`.
  - `README.md`: nova seção "Fotos e vídeos (otimização)" com a estrutura de pastas e o uso.
  - `TAREFAS.md`: F4 marcada como `[x]`.
- **Já estava pronto:** `originais/` no `.gitignore`, vídeos sem áudio até 1920 px com poster e `faststart`.
- **Verificação:**
  - Lint e build passam.
  - Teste numa pasta temporária (fora do projeto):
    - uma foto 2400×1600 numa subpasta `pousada` gerou 640, 1280 e 1920, com tema "pousada";
    - uma PNG de 900 px gerou 640 e 900, com aviso;
    - legenda e crédito escritos à mão continuaram no manifest depois de rodar de novo;
    - um vídeo MOV 2560×1440 com som virou MP4 1920×1080 só com vídeo, mais o poster;
    - uma pasta inexistente gerou uma mensagem clara e código de saída 1.
- **Nenhuma mídia do site foi alterada.** O `manifest.json` atual continua no formato antigo e passa para o novo na primeira vez que o Ives rodar o script com as fotos originais.
- **Observação:** `video-pescaria-no-rio.mp4` tem 7,5 MB, perto do orçamento.
- **Pendência do Ives:** colocar as fotos em `originais/fotos/<tema>/` e os vídeos em `originais/videos/`, rodar os dois comandos e preencher legenda e crédito no manifest. As tarefas F5 a F8 seguem com placeholders enquanto isso.

---

## F3 — Profundidade e movimento com rolagem e cursor

- **Resultado:** pronto. **Marco visual: a fila para aqui para o Ives ver no navegador.** Há commits locais aguardando push (F2 e F3).
- **Arquivos criados:**
  - `src/lib/motion.ts`: `prefersReducedMotion`, `canUsePointerEffects` (mouse + movimento permitido) e `pointerParallax`. Esta última move os elementos marcados com `data-depth` conforme o mouse, só com `transform`. O componente da galeria (F5) pode reaproveitar.
  - `src/components/Cursor.tsx`: anel que segue o mouse.
- **Arquivos alterados:**
  - `src/sections/Hero.tsx`: agora com 3 velocidades ao rolar: o vídeo desce devagar, o texto sobe, e o título sobe mais rápido que o resto. No desktop, o vídeo e o título se movem em sentidos opostos com o mouse; o vídeo fica 6% maior para não mostrar a borda.
  - `src/sections/DayAtRecanto.tsx`: durante a cena fixa, a foto aproxima e desliza dentro da moldura e a coluna de texto sobe. No desktop, a foto e o texto se movem em sentidos opostos com o mouse.
  - `src/pages/Home.tsx`: inclui o Cursor.
  - `TAREFAS.md`: F3 marcada como `[x]`.
- **Cursor:**
  - Aparece só com mouse (`pointer: fine`) e sem "reduzir movimento".
  - Cresce sobre links, botões e cartões, e some sobre campos de formulário.
  - **O cursor normal do sistema nunca é escondido**: o anel é só decoração.
  - Não aparece no painel `#/admin`.
- **Escopo:** a tarefa citava "a nova galeria, quando existir". Ela ainda não existe (F5); quando for criada, basta usar `data-depth` e `pointerParallax`.
- **Desempenho:**
  - Só `transform` e `opacity` são animados, sem vídeo extra e sem `will-change` fixo.
  - O movimento do mouse usa `gsap.quickTo`, que reaproveita a mesma animação em vez de criar uma nova a cada movimento.
  - O arquivo JS principal cresceu cerca de 10 kB (de 643 para 654 kB, sem dependências novas).
- **Verificação:**
  - Lint e build passam, sem erros no console.
  - No navegador: o vídeo e o título se deslocam com o mouse (medido pelo `transform`).
  - O anel cresce 1,8× sobre "Pedir reserva" e some sobre um campo, com o cursor de texto normal mantido.
  - Com "reduzir movimento", nada disso roda: o código não liga os efeitos.
  - Os 60 fps precisam ser conferidos pelo Ives num notebook comum.
- **Para o Ives ver:** passe o mouse pelo topo do site e pela seção "Um dia no Recanto", role devagar e passe o mouse sobre os botões e o formulário.

---

## F2 — Rodapé

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives).
- **Arquivos criados:**
  - `src/components/Footer.tsx`.
- **Arquivos alterados:**
  - `src/data/site.ts`: frase, redes sociais, crédito de fotos, texto de privacidade e os links de WhatsApp e telefone.
  - `src/pages/Home.tsx`: o rodapé entra depois do `<main>`.
  - `CLAUDE.md`: a pendência "rodapé diz Pousada Pantanal" foi marcada como resolvida.
  - `TAREFAS.md`: F2 marcada como `[x]`.
- **Conteúdo do rodapé:**
  - Nome e frase da pousada. A frase é a mesma do Hero, para não inventar texto novo.
  - Endereço.
  - "Como chegar", que abre a busca do endereço no Google Maps.
  - WhatsApp e "Ligar", ambos com (65) 99971-3778.
  - Check-in e check-out com o fuso.
  - Aviso de privacidade.
  - © com o ano atual.
- **Verificação:**
  - Lint e build passam.
  - Testado no desktop (3 colunas) e no celular em 375 px (1 coluna, sem rolagem lateral).
  - Os 3 links têm 44 px de altura.
  - Contraste: texto areia e títulos dourados sobre o verde mais escuro, bem acima do mínimo AA.
- **Pendências do Ives (tudo editável em `src/data/site.ts`, sem mexer no componente):**
  - **Redes sociais:** nenhuma confirmada. A estrutura está pronta e só aparece quando houver itens em `footer.social`.
  - **Crédito das fotos:** campo `footer.photoCredit`, escondido enquanto estiver vazio.
  - **Texto de privacidade (rascunho, `provisorio: true`):** revisar.
- **Nota:** o botão de reserva continua usando `VITE_WHATSAPP_NUMBER`, e o rodapé usa o telefone confirmado. Ver a pendência da P7.

---

## F1 — Tela de carregamento "Recanto do Tuiuiú"

- **Resultado:** pronto. **Marco visual: a fila para aqui para o Ives ver no navegador.** Há commits locais aguardando push (P7 e F1).
- **Arquivos criados:**
  - `src/components/Loader.tsx`: tela cheia verde (`forest-900`) com o nome em Fraunces. As letras somem até sobrar "RT", com um traço vermelho do colar do tuiuiú embaixo, e então a tela sobe. Duração total de cerca de 2,15 s. **Qualquer clique ou tecla pula a animação.**
  - `src/lib/intro.ts`: decide uma vez por carregamento se a abertura toca e informa as outras partes do site.
- **Arquivos alterados:**
  - `src/pages/Home.tsx`: mostra o Loader e pausa a rolagem suave (Lenis) enquanto ele está na tela.
  - `src/sections/Hero.tsx`: o título espera a cortina para subir junto com ela. Sem a abertura, anima como antes.
  - `TAREFAS.md`: F1 marcada como `[x]`.
- **Quando aparece:**
  - Só na página inicial e só 1 vez por sessão do navegador. Recarregar a página não repete.
  - Não aparece em `#/admin`.
  - Não aparece em links que levam direto a uma seção (ex.: `#/reservar`), porque quem chega por eles quer a seção.
  - Com "reduzir movimento" ligado no aparelho, não aparece. A tarefa permitia "fade de 300 ms ou nada"; escolhi nada.
  - Se o navegador bloquear o `sessionStorage`, também não aparece, para não repetir a cada visita.
- **Desempenho e acessibilidade:**
  - A Home carrega por baixo (vídeo e dados) desde o início.
  - O texto oculto "Carregando" é lido por leitores de tela, e o foco nunca fica preso.
  - A rolagem fica travada só enquanto a tela está visível.
- **Verificação:**
  - Lint e build passam.
  - Testado no navegador, no desktop e no celular (375 px): a animação toca, "RT" aparece, a tela sobe e o título anima.
  - Recarregar não repete. Uma tecla pula a animação e libera a rolagem na hora.
  - `#/reservar` não mostra a tela.
- **Para o Ives ver:**
  - Abra o site e veja a abertura uma vez.
  - Para ver de novo, abra uma aba anônima ou feche e reabra a aba.

---

## P7 — Dados confirmados (endereço, telefone, horários)

- **Resultado:** pronto. Commit local, **sem push** (aguardando o Ives).
- **Arquivos criados:**
  - `src/data/site.ts`: endereço, telefone, horários com fuso, link do Google Maps. É a fonte única desses dados; o rodapé (F2) vai ler daqui.
- **Arquivos alterados:**
  - `vite.config.ts`: o JSON-LD agora é montado no build a partir de `src/data/site.ts`, sem cópia dos dados no HTML. Novos campos: `telephone`, endereço completo, `checkinTime` e `checkoutTime` (`05:00:00-04:00` e `18:00:00-04:00`; Cuiabá é UTC-4 o ano todo).
  - `index.html`: o bloco JSON-LD fixo virou um marcador preenchido no build.
  - `CLAUDE.md`, seção 2: endereço, telefone e horários.
  - `TAREFAS.md`: P7 marcada como `[x]`.
- **Verificação:** lint e build passam. No build de teste, o JSON-LD saiu válido, com os dados exatos e sem marcadores sobrando. O aviso de "chunk grande" já existia (code-splitting ainda pendente).
- **Não havia texto antigo** no site com endereço, telefone ou horários para trocar.
- **Decisões do Ives (2026-10-29):**
  - Defeso: manter o que está cadastrado, sem alterar agora.
  - Conta de admin do tio: fica para depois.
  - `admin_notes` visível ao hóspede caso o login do visitante seja ligado um dia: o Ives aceita esse risco. Se o login for ligado, escrever as notas internas sabendo que o hóspede pode lê-las.
- **O que ainda falta do Ives:**
  - Conferir se a Variable `VITE_WHATSAPP_NUMBER` do GitHub (e o `.env`) é `5565999713778`. O botão de reserva usa essa variável; o agente não lê o `.env`.
  - Faixa de preço, redes sociais e crédito das fotos.
  - Aprovar título, descrição e foto de compartilhamento.
  - Decidir o code-splitting.

---

## P6 — Checklist de lançamento (somente relatório, nada foi executado)

- **Resultado:** checklist pronta. Nenhum comando foi rodado no banco, no GitHub nem no DNS. A fila para aqui (a tarefa pede PARAR).
- **Push:** a P5 (`d3d28ce`) foi enviada ao GitHub com autorização do Ives em 2026-10-29.
- **Ordem sugerida:** 1 → 2 → 3 → 4 → 5 → 6 → 8 → 7. O backup (8) vem antes da troca de domínio (7) para ter uma cópia antes do lançamento.

### 1. Remover reservas de teste (SQL para o Ives rodar)

Supabase → **SQL Editor**. Rode **primeiro a consulta** e confira se só aparecem testes:

```sql
-- 1) Conferir (não apaga nada)
select id, guest_name, whatsapp, check_in, status, created_at
from public.reservation_requests
where guest_name ilike '%teste%'
order by created_at;
```

Se a lista estiver certa, rode:

```sql
-- 2) Apagar SÓ os testes (os passeios ligados saem junto, por "on delete cascade")
delete from public.reservation_requests
where guest_name ilike '%teste%'
returning id, guest_name;
```

- Apagar é **definitivo**. Se algum teste não tiver "teste" no nome, troque o `where` por `where id in ('…', '…')` com os ids da consulta.
- A trava de status (migração 20261029120000) só vale para `update`, por isso não atrapalha o `delete`.
- Depois, confira no painel (aba Pedidos) se os contadores zeraram.

### 2. Datas do defeso cadastradas

- [ ] Confirmar as datas oficiais do defeso 2026/2027 para os rios da região (Barão de Melgaço, MT). A fonte é a portaria estadual (SEMA-MT/Conselho Estadual de Pesca).
- [ ] Painel → aba **Períodos** → novo período, tipo **Defeso**, com início, fim e um rótulo curto. O rótulo **aparece no site**, então nada de dados pessoais.
- [ ] Testar no site: escolher datas dentro do defeso deve mostrar o aviso, sem bloquear o pedido.

### 3. Conta de administrador do tio

O cadastro público está desligado, então a conta é criada à mão:

1. Supabase → **Authentication → Users → Add user → Send invitation** (ou *Create new user*), com o e-mail do tio. O perfil `visitor` é criado sozinho.
2. SQL Editor (troque o e-mail):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'EMAIL_DO_TIO');

-- conferir
select p.role, u.email from public.profiles p join auth.users u on u.id = p.id;
```

3. O tio entra em `…/#/admin`, define uma senha forte e testa: ver um pedido, mudar o status de um pedido de teste.
- [ ] Ensinar o tio a sair (botão Sair) em computador compartilhado.
- [ ] Manter **Authentication → Sign In / Providers → Allow new users to sign up** desligado.

### 4. Revisão de RLS (lida nas 4 migrações, não no banco ao vivo)

| Tabela | RLS | Visitante sem login (`anon`) | Logado comum | Admin | Observação |
|---|---|---|---|---|---|
| `profiles` | ligado | nada | lê só o próprio | lê todos | Ninguém altera papel pelo site: não há política de insert/update/delete. O papel só muda pelo SQL Editor. ✅ |
| `experiences` | ligado | lê só as ativas | lê só as ativas | tudo | ✅ |
| `closed_periods` | ligado | lê tudo | lê tudo | tudo | O rótulo é público (avisado acima). ✅ |
| `site_settings` | ligado | lê tudo | lê tudo | tudo | **Toda chave é pública.** Nunca guardar segredo ou dado pessoal aqui. ✅ |
| `reservation_requests` | ligado | **nada** (nem insert direto) | lê só os próprios (`user_id`) | tudo | Pedidos entram só pela Edge Function. ⚠️ Ver nota 1. |
| `reservation_experiences` | ligado | nada | lê os do próprio pedido | tudo | ✅ |

Funções:

| Função | Quem executa | Observação |
|---|---|---|
| `create_reservation_request` | **só `service_role`** (Edge Function) | Limites de 3 pedidos por WhatsApp por hora e 60 no total por hora. Chamada direta pelo site já foi testada: erro 42501. ✅ |
| `is_admin()` | qualquer um | Só responde verdadeiro ou falso para o próprio usuário. `security definer` com `search_path` vazio. ✅ |
| `handle_new_user`, `set_updated_at`, `check_reservation_status_transition` | gatilhos | Não podem ser chamadas pelo site. ✅ |

Storage: nenhum bucket é usado hoje.

**Nota 1 (só importa no futuro):** se um dia o login do visitante for ligado, a política "usuario ve as proprias" deixa o hóspede ler a linha inteira do próprio pedido, **incluindo `admin_notes`**. Antes de ligar o login, a nota interna precisa ir para uma tabela separada, só de admin. Isso pede uma migração nova e uma pausa. Hoje não há risco: o cadastro está desligado.

Para o Ives conferir no banco ao vivo (só leitura):

```sql
-- Tabelas do schema public com RLS desligado (o esperado é: nenhuma linha)
select tablename from pg_tables where schemaname = 'public' and not rowsecurity;

-- Todas as políticas (comparar com a tabela acima)
select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' order by tablename;

-- Quem pode executar a função de pedidos (o esperado é: só service_role e postgres)
select grantee from information_schema.routine_privileges
where routine_schema = 'public' and routine_name = 'create_reservation_request';
```

Em seguida, rodar **Advisors → Security Advisor** no Supabase. O esperado é nenhum alerta vermelho.

### 5. Teste em celular real (Android e iPhone, se possível, pelo 4G)

- [ ] O vídeo do hero toca sem som, e a foto aparece enquanto ele carrega.
- [ ] Menu e âncoras (Pesca, Épocas, "Conhecer a pousada") rolam até a seção certa.
- [ ] Reserva completa: datas, pessoas, experiências, contato, captcha e envio, com o WhatsApp abrindo com a mensagem pronta. Depois, cancelar esse pedido no painel ou apagar pelo item 1.
- [ ] O aviso de defeso aparece. Um bloqueio impede o envio.
- [ ] Painel no celular: login, lista, detalhe, calendário.
- [ ] Ativar "reduzir movimento" no aparelho e ver se as animações param.
- [ ] Compartilhar o link no WhatsApp e ver se a prévia mostra a foto dos tuiuiús e o título. Depois da troca de domínio, conferir de novo.

### 6. Lighthouse

- Chrome no computador → abrir o site publicado → F12 → aba **Lighthouse** → *Mobile* → *Analyze*. Repetir em aba anônima, para as extensões não pesarem.
- Meta: Desempenho ≥ 80, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO ≥ 95.
- Ponto já conhecido: o arquivo JS principal tem 643 kB. A proposta de code-splitting (P5, opção 1) melhora o Desempenho e está esperando a decisão do Ives.
- A revisão completa de front está na fila como **F9**.

### 7. Troca de domínio (decisão e execução do Ives, no lançamento)

Antes:
- [ ] Liberar a indexação: se as tarefas F tiverem colocado `noindex` (regra de placeholders), removê-lo só quando não houver mais conteúdo provisório. Isso é decisão do Ives.
- [ ] Turnstile (Cloudflare): conferir se `recantodotuiuiu.com.br` e `www.recantodotuiuiu.com.br` estão na lista de hostnames do widget. A Edge Function já aceita os dois.

Troca:
1. GitHub → repositório → **Settings → Pages → Custom domain**: `www.recantodotuiuiu.com.br` → *Save*. O GitHub cria o CNAME pelo próprio Pages; não é preciso criar arquivo no código.
2. No registro do domínio (Registro.br ou onde estiver o DNS), **trocar** os registros do site antigo:
   - `www` → CNAME → `ivesaxb.github.io`
   - raiz (`@`) → 4 registros A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Esperar a verificação do DNS (de minutos a algumas horas) e marcar **Enforce HTTPS**.
4. Rodar o workflow *Deploy to GitHub Pages* de novo (aba Actions → *Run workflow*). O endereço base vira `/` e o `og:url`/sitemap passam a usar o domínio sozinhos.
5. Supabase → **Authentication → URL Configuration**: *Site URL* = `https://www.recantodotuiuiu.com.br` (e o github.io nas *Redirect URLs*, enquanto ele existir).

Depois:
- [ ] Testar uma reserva completa no domínio novo (o captcha depende do hostname).
- [ ] Google Search Console: adicionar o domínio e enviar `https://www.recantodotuiuiu.com.br/sitemap.xml`.
- [ ] Desligar o site antigo só depois de tudo funcionar. Se ele tinha o WhatsApp em destaque, o botão de WhatsApp do site novo cobre isso.
- [ ] Atualizar o link em perfis (Instagram, Google Meu Negócio, WhatsApp Business).

### 8. Backup

O plano gratuito do Supabase **não oferece backup para baixar**. Opções, da mais simples para a mais completa:

1. **Mensal, manual (recomendado para começar):** Supabase → *Table Editor* → em `reservation_requests`, `reservation_experiences`, `closed_periods`, `experiences` e `site_settings`, usar **Export → CSV**. Guardar numa pasta privada (Google Drive pessoal). Contém dados pessoais de hóspedes (LGPD): não compartilhar e apagar as cópias antigas.
2. **Completo, pelo terminal:** com a Supabase CLI, `supabase db dump --data-only -f backup.sql`. Pede a senha do banco, que o Ives digita: o agente nunca vê essa senha. O esquema já está versionado em `supabase/migrations/`.
3. **Automático (melhoria futura):** um workflow do GitHub que faça o dump. Exige guardar a senha do banco como Secret e a decisão do Ives (segurança), então só com pausa.

- [ ] Fazer o primeiro backup antes da troca de domínio.

### Pendências que continuam com o Ives

- Executar os itens 1 a 8 acima.
- Decidir o code-splitting (P5).
- A P7 (dados confirmados: endereço, telefone, check-in e check-out) é a próxima tarefa da fila.

---

## P5 — SEO e desempenho

- **Resultado:** pronto. A fila continua pausada, porque há conteúdos que dependem do Ives (lista abaixo).
- **Arquivos criados:**
  - `public/og-image.jpg`: 1200×630, 230 kB.
- **Arquivos alterados:**
  - `index.html`: descrição, `theme-color`, Open Graph (título, descrição, imagem, endereço, `pt_BR`), Twitter/X `summary_large_image` e JSON-LD `LodgingBusiness`.
  - `vite.config.ts`: plugin que preenche o endereço absoluto e gera `robots.txt` e `sitemap.xml`.
  - `.github/workflows/deploy.yml`: passa `VITE_SITE_URL`.
  - `TAREFAS.md`: P5 marcada como `[x]`.
- **Verificação:**
  - `npm run build` e `npm run lint` passam.
  - Build de teste com o endereço do github.io:
    - `og:url` e `og:image` absolutos;
    - JSON-LD válido (lido como JSON);
    - `robots.txt` e `sitemap.xml` corretos.
  - No build local, sem endereço, não sobra nenhum marcador.
  - **Não testado:** a prévia real do link no WhatsApp, que só funciona depois do push. Dá para testar colando o link numa conversa ou no depurador de compartilhamento do Facebook.
- **Desempenho (medido):**
  - **Imagens:** já usam WebP, `srcset` 640/1280, `loading="lazy"` abaixo da dobra e proporção fixa (sem pulos de layout).
  - **Painel:** já carrega sob demanda (66 kB, separado).
  - **Arquivo principal:** 643 kB (199 kB comprimido). Composição pelo código-fonte:

    | Parte | Tamanho |
    |---|---|
    | react-dom | ~620 kB |
    | Supabase completo (auth, storage, realtime e postgrest) | ~810 kB |
    | gsap | ~370 kB |
    | react-router | ~370 kB |
    | código do projeto | ~70 kB |

- **Proposta de code-splitting (não aplicada, precisa de aprovação):**
  1. **Separar as bibliotecas em arquivos próprios** (`react`, `gsap`, `supabase`) via `manualChunks`. Risco baixo. O tamanho total não muda, mas o navegador guarda em cache as partes que não mudam entre versões do site, e a volta do visitante fica mais rápida.
  2. **Carregar o cliente do Supabase só quando a seção Pacotes se aproxima da tela.** Risco médio. Tira cerca de 60 a 70 kB comprimidos da primeira carga. Exige mudar como as seções importam o `supabase`.
  3. **No site público, usar só os módulos do Supabase que ele precisa** (consultas e Edge Function, sem login, storage e realtime), deixando o cliente completo para o painel. Risco médio. É o maior ganho na página inicial, mas são dois clientes para manter.
  - **Recomendação:** fazer o (1) agora e avaliar o (2) depois de medir no Lighthouse em celular (P6).
- **Precisa do Ives (pendências de conteúdo; nada foi inventado):**
  1. **Endereço** (cidade, estrada ou rio de referência) e, se quiser, coordenadas do mapa, para o JSON-LD e a futura seção "Como chegar".
  2. **Telefone ou WhatsApp público** que pode aparecer para o Google.
  3. **Horários de check-in e check-out.**
  4. **Faixa de preço** para o Google (ex.: "R$ 300 por pessoa/dia"), se quiser exibir.
  5. **Aprovar ou trocar** o título, a descrição e a foto de compartilhamento (tuiuiús de asas abertas).
  6. **Depois da troca de domínio:** cadastrar o site no Google Search Console e enviar o `sitemap.xml`. O agente pode guiar.
  7. **Decidir sobre o code-splitting:** o agente recomenda a opção (1).
- **Commit local:** `feat: SEO meta, Open Graph image, JSON-LD and sitemap` (sem push).
- **Próxima tarefa:** P6 — Checklist de lançamento (somente relatório).

---

## P4 (continuação) — Captcha implementado, aguardando as etapas do Ives

- **Resultado:** código pronto. **A ativação depende do Ives**: chaves, publicação da função e migração.
- **Aprovação:** o Ives aprovou em 2026-10-29 ("vamos fazer isso já… seguir com tudo completo").
- **Arquivos criados:**
  - `supabase/functions/submit-reservation/index.ts`: Edge Function. Confere a origem, valida os dados, confere o token na Cloudflare e grava pela função do banco. Responde `captcha`, `limite`, `dados`, `origem` ou `erro`.
  - `supabase/migrations/20261029180000_reservation_via_edge_function.sql`: tira dos visitantes a permissão de chamar a função direto. **Não executada**, registrada como pendente em `MIGRACOES.md`, com a ordem obrigatória escrita no próprio arquivo.
  - `src/components/TurnstileWidget.tsx`: widget, carregado só no passo 4.
- **Arquivos alterados:**
  - `src/sections/Reserve.tsx`: envia pela Edge Function quando há site key, senão usa o caminho antigo. Também traz a mensagem de captcha, o botão que espera a verificação e o aviso de widget bloqueado.
  - `src/vite-env.d.ts`, `.github/workflows/deploy.yml` (variável opcional `VITE_TURNSTILE_SITE_KEY`), `README.md` (seção Captcha) e `supabase/MIGRACOES.md`.
- **Decisões:** ativação em etapas pela variável, função sem JWT, conferência de hostname e action. Detalhes em `LOG_DECISOES.md`.
- **Verificação:**
  - `npm run build` e `npm run lint` passam.
  - No navegador, num servidor local com a **site key de teste** da Cloudflare (que sempre aprova) e a resposta da função **simulada**:
    - o botão espera o token e depois libera;
    - o erro de captcha e o de limite mostram as mensagens certas;
    - depois de cada erro, o widget gera um token novo;
    - o sucesso mostra o número do pedido;
    - a chamada direta ao banco nunca foi usada;
    - nenhum pedido foi criado.
  - **Não testado:** a Edge Function de verdade, porque não há Deno nem a Supabase CLI neste computador. Ela será testada depois que o Ives publicar, com um pedido real pelo site.
- **Manutenção:** três linhas novas na tabela "Manutenção do Ives".
- **Precisa do Ives:**
  1. ~~Criar o widget Turnstile no Cloudflare.~~ Feito (2026-10-29).
  2. ~~Cadastrar `TURNSTILE_SECRET_KEY` e publicar `submit-reservation` sem verificação de JWT.~~ Feito (2026-10-29).
  3. ~~Criar `VITE_TURNSTILE_SITE_KEY` no GitHub e no `.env`.~~ Feito (2026-10-29).
  4. ~~Fazer um pedido de teste real pelo site publicado.~~ Feito: o pedido chegou ao painel.
  5. ~~Rodar a migração `20261029180000_reservation_via_edge_function.sql`.~~ Feito (2026-10-29).
- **Verificação final (2026-10-29):**
  - A Edge Function publicada passou nos 3 testes sem criar dados: CORS aceito para o site, chamada sem origem recusada e token falso recusado com `captcha`.
  - O widget aparece no site publicado.
  - Depois da migração, a chamada direta antiga foi recusada pelo banco (`42501 permission denied`) e nenhum pedido foi criado.
  - **O captcha está totalmente ativo.**

---

## P4 — Captcha (Cloudflare Turnstile): plano, sem código

- **Resultado:** **pausado** de propósito. É uma tarefa de segurança, então foi entregue só o plano, sem nenhum código de produção. Para implementar, é preciso a aprovação do Ives e as contas e chaves listadas abaixo.

### O problema que o captcha precisa resolver
Hoje o pedido chega ao banco assim: o navegador chama a função `create_reservation_request`, e o banco permite que **qualquer visitante anônimo** chame essa função diretamente (`grant execute … to anon`). As proteções atuais são:
- o campo escondido contra robôs, que só existe no formulário;
- o limite no banco: 3 pedidos por WhatsApp e 60 no total, por hora.

**Um captcha só no formulário não adianta.** Um robô pode chamar a função direto pela API, sem abrir o site. Por isso, o captcha precisa ser **conferido num servidor**, e o banco precisa **parar de aceitar a chamada direta** de visitantes.

### Como ficaria (arquitetura)
1. **No formulário (passo 4, Resumo):** o widget do Turnstile no modo "gerenciado".
   - Na maioria das vezes ele é invisível. Só mostra um desafio quando desconfia.
   - O script é carregado de `challenges.cloudflare.com` só quando o visitante chega ao passo 4, para não pesar no resto da página.
   - O widget gera um **token** válido por 5 minutos e de uso único.
   - O botão "Enviar pedido" só fica ativo depois que o token existe.
   - Se der erro, o widget é reiniciado e o botão do WhatsApp continua como alternativa.
2. **Uma Edge Function nova no Supabase**, `submit-reservation`, escrita em Deno e rodando no próprio Supabase:
   1. Recebe os dados do formulário e o token.
   2. Confere o token com a Cloudflare (`siteverify`) usando a **chave secreta** do Turnstile. Essa chave fica guardada como *secret* no Supabase e nunca vai para o site nem para o GitHub.
   3. Confere também o domínio de origem (hostname) e a ação esperada.
   4. Se tudo estiver certo, chama `create_reservation_request` com a credencial interna que o próprio Supabase dá às Edge Functions. As regras e o limite por hora continuam valendo dentro da função.
   5. Responde com o id do pedido ou com um código de erro simples (`captcha`, `limite`, `dados`, `erro`), e o site traduz para mensagens amigáveis.
   6. Ela só aceita chamadas vindas dos endereços do site (CORS): `ivesaxb.github.io`, `recantodotuiuiu.com.br`, `www.recantodotuiuiu.com.br` e `localhost`.
3. **Uma migração nova:** `revoke execute … from anon, authenticated`. Assim, só a Edge Function pode criar pedidos.

### Impacto no banco (RLS e função)
- **As tabelas e o RLS não mudam.** A tabela continua bloqueada para visitantes.
- **Só a permissão da função muda.** Hoje "qualquer visitante pode chamar"; depois, "só o servidor (Edge Function) pode chamar".
- **Efeito colateral:** dentro da função, `auth.uid()` passaria a ser vazio, porque quem chama é o servidor, e não o visitante. Hoje isso **não afeta nada**, porque não existe login de visitante. Se um dia existir, a Edge Function passaria o id do visitante, conferido por ela, num parâmetro novo da função.
- **A ordem de publicação importa:**
  1. publicar a Edge Function;
  2. publicar o site novo;
  3. **só então** rodar a migração.
  
  Na ordem errada, o formulário para de funcionar. **Para desfazer:** uma migração com o `grant` de volta.

### O que depende do Ives (contas e chaves)
1. **Conta gratuita na Cloudflare.** Não precisa transferir o domínio.
2. **Criar um widget Turnstile** com os domínios `ivesaxb.github.io`, `recantodotuiuiu.com.br`, `www.recantodotuiuiu.com.br` e `localhost`. Isso gera duas chaves:
   - **Site key**, que é pública. Vai para o `.env` e para uma Repository variable no GitHub chamada `VITE_TURNSTILE_SITE_KEY`.
   - **Secret key**, que é **secreta**. Vai **só** para o Supabase, em *Edge Functions → Secrets*, com o nome `TURNSTILE_SECRET_KEY`. Nunca no GitHub nem no `.env` do site.
3. **Publicar a Edge Function.** Pode ser pelo editor do painel do Supabase, colando o código que o agente escrever, ou pela Supabase CLI. O agente prepara o código e o passo a passo; quem publica é o Ives.
4. **Rodar a migração** de permissão no SQL Editor, no momento certo da ordem acima.

### Custos e limites
- **Turnstile:** gratuito.
- **Edge Functions no plano gratuito do Supabase:** 500 mil chamadas por mês, muito acima do uso de uma pousada.

### Riscos e cuidados
- **Se a Cloudflare ou a Edge Function ficarem fora do ar:** o pedido não é salvo. Continua existindo o botão "Enviar pelo WhatsApp", que não depende disso.
- **Bloqueadores de anúncio** às vezes bloqueiam `challenges.cloudflare.com`. A mensagem de erro precisa orientar o visitante a usar o WhatsApp.
- **LGPD:** o Turnstile coleta sinais do aparelho para detectar robôs. Vale citar isso no texto de privacidade e no consentimento do formulário. O texto final é decisão do Ives.
- **Segredos:** a chave secreta do Turnstile e a credencial interna do Supabase ficam só no servidor. O agente nunca lê nem grava essas chaves.
- **Testes:** a Cloudflare tem chaves de teste que sempre aprovam e outras que sempre recusam. Elas servem para testar no `localhost` sem gastar desafios reais e sem expor as chaves verdadeiras.
- **Manutenção nova:** a função passa a ser mais uma peça a acompanhar. Se ela falhar, os pedidos param, mas o WhatsApp continua funcionando. Isso entraria na tabela de manutenção.

### Recomendação do agente
- As proteções atuais (campo escondido + limite por hora no banco) provavelmente bastam para o lançamento de uma pousada pequena.
- O Turnstile vale a pena **antes da troca para o domínio principal**, ou **assim que aparecer spam**. O CLAUDE.md já lista o captcha como requisito.
- **Proposta de implementação**, em uma tarefa nova com pausas:
  - (a) o agente escreve a Edge Function, a migração (sem rodar) e as mudanças no formulário, e testa com as chaves de teste no `localhost`;
  - (b) o Ives cria a conta e as chaves e publica a função;
  - (c) o site é publicado;
  - (d) o Ives roda a migração;
  - (e) teste em produção.

- **Arquivos alterados:**
  - `RELATORIO.md`: este plano.
  - `TAREFAS.md`: P4 marcada como `[x]`, com o plano entregue.
- **Verificação:** não se aplica. Nenhum código foi alterado.
- **Commit local:** `docs: plan Turnstile captcha (no code)` (sem push).
- **Precisa do Ives:**
  1. Decidir **se** e **quando** implementar: antes do lançamento, antes da troca de domínio ou só se aparecer spam.
  2. Se for implementar, criar a conta na Cloudflare e as chaves, como descrito acima.
- **Próxima tarefa:** P5 — SEO e desempenho.

---

## P3 — Mensagem de limite de envios no formulário público

- **Resultado:** pronto.
- **Arquivos alterados:**
  - `src/sections/Reserve.tsx`: reconhece o erro de limite e mostra "Recebemos muitos pedidos agora. Tente em alguns minutos ou fale pelo WhatsApp.", com o botão do WhatsApp. O erro genérico continua igual.
  - `TAREFAS.md`: P3 marcada como `[x]`.
- **Banco:** nenhuma migração. A função `create_reservation_request` (migração `20261028210000`) já distingue o limite pelo texto da mensagem. O `errcode` é o padrão `P0001`, igual ao do erro de data no passado.
- **Decisões:** o limite é reconhecido pelo início da mensagem. Detalhes em `LOG_DECISOES.md`.
- **Verificação:**
  - `npm run build` e `npm run lint` passam.
  - A regra foi testada com quatro mensagens: só a de limite é reconhecida.
  - No navegador (servidor local), a resposta do Supabase foi **simulada**, sem criar pedido real. O limite mostrou a mensagem nova com o botão do WhatsApp, e um erro genérico mostrou a mensagem antiga. As 2 chamadas foram interceptadas e nada chegou ao banco.
  - **Não testado:** estourar o limite de verdade no banco (3 pedidos do mesmo WhatsApp em 1 hora).
- **Commit local:** `feat: friendly message when reservation rate limit is hit` (sem push).
- **Precisa do Ives:**
  - Nada obrigatório.
  - Se um dia mudar o texto "Muitos pedidos em pouco tempo" na função do banco, o site volta a mostrar a mensagem genérica. Se quiser blindar isso, dá para criar uma migração com um código de erro próprio.
- **Próxima tarefa:** P4 — Captcha (Cloudflare Turnstile), **somente planejar** (tarefa de segurança: o agente para depois de entregar o plano).

---

## P2 — Keep-alive do Supabase

- **Resultado:** pronto. **Fila pausada** (a P2 manda parar: sem push).
- **Arquivos criados:**
  - `.github/workflows/keepalive.yml`: cron diário às 08:00 de Cuiabá, mais acionamento manual. Faz um GET em `/rest/v1/experiences?select=id&limit=1` com a chave pública e falha se a resposta não for 200.
- **Arquivos alterados:**
  - `README.md`: nova seção "Keep-alive do Supabase", com o aviso dos 60 dias sem atividade.
  - `TAREFAS.md`: P2 marcada como `[x]`.
- **Decisões:**
  - Reaproveita as variáveis da P1, sem secrets novos. **Isso é um desvio** da tarefa.
  - Usa só o cabeçalho `apikey`, com `permissions: {}`.
  - Detalhes em `LOG_DECISOES.md`.
- **Verificação:**
  - `npm run build` e `npm run lint` passam.
  - O YAML passou na checagem estrutural (sem tabs, indentação consistente, campos presentes, nenhuma menção a chave secreta).
  - O script foi conferido com `bash -n`.
  - **Não testado:** a execução real no GitHub, que depende do push. Depois do push, dá para testar em *Actions → Supabase keep-alive → Run workflow*.
- **Commit local:** `ci: add daily Supabase keep-alive workflow` (sem push).
- **Atualização (2026-10-29):** o Ives autorizou; o push foi feito (`140069f`) e o deploy daquele commit terminou com sucesso. O keep-alive roda pela primeira vez no próximo horário agendado (08:00 de Cuiabá), ou antes, se o Ives rodar manualmente.
- **Precisa do Ives:**
  1. ~~Autorizar o push.~~ Feito.
  2. ~~Depois do push, rodar o workflow uma vez manualmente e conferir se ficou verde.~~ Feito pelo Ives em 2026-10-29: "Supabase respondeu HTTP 200".
  3. Ficar atento ao e-mail do GitHub se o repositório passar 60 dias sem push: os workflows agendados são desativados e é só reativar.
- **Próxima tarefa:** P3 — Mensagem de limite de envios no formulário público.

---

## P1 — Deploy no GitHub Pages (workflow preparado, sem publicar)

- **Resultado:** pronto. **Fila pausada** (a P1 manda parar: o Ives revisa e ativa o Pages).
- **Arquivos criados:**
  - `.github/workflows/deploy.yml`: roda em push na `main` e manualmente; executa `npm ci`, lint, checagem das variáveis e build, e publica com `configure-pages`, `upload-pages-artifact` e `deploy-pages`.
- **Arquivos alterados:**
  - `vite.config.ts`: `base` vem de `VITE_BASE`, com `/` como padrão.
  - `README.md`: README do projeto, com o passo a passo de publicação e da troca de domínio.
  - `TAREFAS.md`: P1 marcada como `[x]`.
- **Decisões:**
  - Mantido o nome `VITE_SUPABASE_ANON_KEY`. **Isso é um desvio** do nome citado na tarefa.
  - O workflow também exige `VITE_WHATSAPP_NUMBER`.
  - A chave fica como Secret; a URL e o WhatsApp ficam como Variables.
  - O `base` é automático.
  - Não há `CNAME` nem `404.html`.
  - Detalhes em `LOG_DECISOES.md`.
- **Verificação:**
  - `npm run build` e `npm run lint` passam.
  - Build de teste com `VITE_BASE=/recanto-do-tuiuiu/`: o favicon, o JS, o CSS, os vídeos do Hero e o pacote do painel saem com o caminho do repositório.
  - O YAML foi conferido por leitura e por uma checagem estrutural (sem tabs, indentação consistente, actions oficiais presentes). Não há validador de YAML instalado no projeto, e o agente não baixou nenhum.
  - **Não testado:** a execução real no GitHub, que depende do push e das variáveis.
- **Commit local:** `ci: add GitHub Pages deploy workflow` (sem push).
- **Precisa do Ives:**
  1. **O repositório é público ou privado?** Pages em repositório privado exige plano pago do GitHub.
  2. Criar no GitHub (*Settings → Secrets and variables → Actions*):
     - Variables: `VITE_SUPABASE_URL` e `VITE_WHATSAPP_NUMBER`;
     - Secret: `VITE_SUPABASE_ANON_KEY` (a chave pública).
  3. Ativar *Settings → Pages → Source: GitHub Actions*.
  4. Autorizar o push. **Atenção:** o primeiro push na `main` depois disso já publica no endereço de teste `https://ivesaxb.github.io/recanto-do-tuiuiu/`. Se o Pages ainda não estiver ativado, o workflow falha sem publicar nada.
  5. A troca para o domínio `recantodotuiuiu.com.br` fica para o fim da fase 4. O passo a passo está no README.
- **Atualização (2026-10-29):**
  - O Ives confirmou que o repositório é público, criou as variáveis como Repository, ativou o Pages (Source: GitHub Actions) e autorizou o push.
  - O primeiro deploy (run 40972696157, commit `431b16d`) terminou com sucesso.
  - No site publicado, `https://ivesaxb.github.io/recanto-do-tuiuiu/`:
    - o vídeo carrega;
    - os preços vêm do Supabase;
    - não há recursos com 404 nem erros no console;
    - `#/admin` abre o login, com `noindex`, e o pacote do painel carrega (200).
- **Próxima tarefa:** P2 — Keep-alive do Supabase.

---

## C2 — Calendário e passeios por hospedagem

- **Resultado:** pronto. **Fila pausada** (marco visual: o Ives precisa olhar no navegador).
- **Arquivos criados:**
  - `src/admin/CalendarPanel.tsx`: aba "Calendário", mês a mês, com pessoas por noite, destaque acima da capacidade, faixas de defeso (dourado) e bloqueio (vermelho) e lista do dia.
  - `src/admin/calendar.ts`: consultas do mês e cálculo por noite.
  - `src/admin/ReservationTours.tsx`: bloco "Passeios" no detalhe de reservas confirmadas e concluídas, para agendar, editar e remover.
  - `src/admin/tours.ts`: consultas de `reservation_experiences`.
  - `LOG_DECISOES.md` e `RELATORIO.md`.
- **Arquivos alterados:**
  - `src/admin/AdminApp.tsx`: aba e rota `#/admin/calendario`.
  - `src/admin/ReservationDetail.tsx`: mostra o bloco Passeios.
  - `src/admin/reservations.ts`: `loadReservation` e nomes de experiências sem repetição.
  - `src/lib/dates.ts`: data de hoje em Cuiabá, dia da semana, dias do mês e nomes dos meses.
  - `TAREFAS.md`: C2 marcada como `[x]`.
- **Banco:** nada mudou. A política `reserva_experiencias: admin gerencia` (`for all`, `is_admin()`) já permite ao admin inserir, editar e excluir. Nenhuma migração.
- **Decisões:** passeios do pedido aparecem como "Sem data"; a data vale de check-in a check-out, incluindo os dois dias; a validação fica só no painel; o calendário começa no domingo; o dia de saída não conta pessoas. Detalhes em `LOG_DECISOES.md`.
- **Verificação:**
  - `npm run build` e `npm run lint` passam. O pacote do painel ficou com 66,5 kB (15,9 kB comprimido) e continua separado da página inicial.
  - Lógica testada com script (sem banco): 10 + 9 pessoas na mesma noite = 19, acima de 18; o dia de saída não conta; defeso e bloqueio caem nos dias certos; fevereiro tem 28 ou 29 dias; os dias da semana estão corretos; chegada e saída aparecem marcadas.
  - No navegador, `#/admin/calendario` abre o login sem erros no console.
  - **Não testado:** as telas logadas, porque o agente não entra com senha. É preciso conferir se o calendário reflete as reservas reais e se é possível agendar, editar e remover passeios de verdade.
- **Commit local:** `feat: admin calendar and tours per stay` (sem push).
- **Precisa do Ives:**
  1. Olhar no navegador (logado):
     - aba Calendário, inclusive no celular;
     - agendar, editar e remover um passeio numa reserva confirmada;
     - tentar uma data fora da estadia, que deve ser recusada com mensagem.
  2. ~~Decidir se quer uma migração para o banco também recusar passeio fora das datas.~~ **Ives decidiu (2026-10-29): não precisa.** A regra fica só no painel.
  3. ~~Autorizar a próxima tarefa (P1).~~ Autorizada.
- **Próxima tarefa:** P1 — Deploy no GitHub Pages (workflow preparado, sem publicar).

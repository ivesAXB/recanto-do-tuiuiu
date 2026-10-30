# TAREFAS.md — fila de trabalho do agente

## Como executar esta fila (instruções para o Claude Code)
1. Leia CLAUDE.md, DECISOES.md, supabase/MIGRACOES.md e RELATORIO.md (se existir).
2. Pegue a PRIMEIRA tarefa com status `[ ]`. Faça só ela.
3. Siga o escopo, os requisitos e o "pronto quando". Respeite os limites de DECISOES.md.
4. Verifique: `npm run build` e `npm run lint` (e os testes manuais listados, quando possível).
5. Se passou: commit local (sem push), marque `[x]`, anexe o relatório em RELATORIO.md.
6. Se a próxima tarefa não tiver gatilho de pausa, siga para ela. Senão, PARE.
7. Ao parar, escreva em RELATORIO.md: o que foi feito, o que falta, a decisão que precisa do Ives.

### Formato do relatório (RELATORIO.md, acrescentar no topo)
- Tarefa: id e título
- Resultado: pronto / pausado / bloqueado
- Arquivos criados e alterados
- Decisões tomadas (resumo; detalhes em LOG_DECISOES.md)
- Verificação: build, lint, testes feitos e o que NÃO foi testado
- Commit local: hash e mensagem
- Precisa do Ives: lista objetiva (ou "nada")
- Próxima tarefa

---

## Fase C — Painel admin

### [x] C2 — Calendário e passeios por hospedagem
Escopo: src/admin/ (nova aba "Calendário" e bloco "Passeios" no detalhe da reserva confirmada).
Requisitos:
- Calendário mensal (navegar mês anterior/próximo) mostrando, por noite, o total de pessoas das
  reservas `confirmada`, com destaque se passar da capacidade (site_settings.capacidade_maxima)
  e faixas dos períodos de closed_periods (defeso e bloqueio com cores distintas).
- Clicar em um dia lista as hospedagens daquele dia.
- No detalhe de reserva `confirmada`/`concluida`: adicionar, editar e remover passeios por dia
  (tabela reservation_experiences: experience_id, scheduled_on, quantity, notes). A data do passeio
  deve estar entre check_in e check_out. Usar experiências ativas.
- Datas sempre tratadas como yyyy-mm-dd (sem new Date com fuso); fuso America/Cuiaba.
- Erros amigáveis em pt-BR (reaproveitar friendlyError), foco e aria-live como nas outras telas,
  alvos de toque de 44px, funciona no celular.
- Atualização por .select().maybeSingle() para detectar linha inexistente/sem permissão.
Pronto quando: build e lint passam; calendário reflete reservas confirmadas; é possível agendar,
editar e remover um passeio; passeio fora das datas da estadia é recusado com mensagem clara.
PAUSA se: for necessário alterar tabela, política RLS ou criar função no banco (gerar o arquivo de
migração, registrar em MIGRACOES.md como "pendente" e parar). Antes, verifique se as políticas
atuais de reservation_experiences permitem ao admin insert/update/delete; se não permitirem, PARE.
Fim da tarefa: PARE para o Ives olhar no navegador (marco visual).

---

## Fase 4 — Publicação

### [x] P1 — Deploy no GitHub Pages (workflow preparado, sem publicar)
Escopo: .github/workflows/deploy.yml, vite.config.ts (base), documentação.
Requisitos:
- Workflow que roda em push na main: npm ci, lint, build e publica dist no GitHub Pages
  (actions oficiais actions/configure-pages, upload-pages-artifact, deploy-pages).
- Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY lidas de GitHub Variables/Secrets
  (nunca no repositório). Documentar em README quais nomes criar e onde.
- Verificar o `base` do Vite para o domínio próprio (recantodotuiuiu.com.br) e HashRouter.
- Incluir 404.html/CNAME conforme necessário para domínio próprio.
Pronto quando: workflow válido (yaml correto), build local passa, README descreve o passo a passo.
PAUSA: NÃO fazer push. Ives revisa e ativa o Pages no GitHub. Parar ao final.

### [x] P2 — Keep-alive do Supabase (plano gratuito pausa após 1 semana sem uso)
Escopo: .github/workflows/keepalive.yml.
Requisitos: cron diário que faz uma leitura leve e pública (ex.: select de 1 linha em
experiences via REST com a chave publishable), usando secrets do GitHub. Sem chave secreta.
Pronto quando: yaml válido e documentado. PAUSA: sem push; Ives cria os secrets.

### [x] P3 — Mensagem de limite de envios no formulário público
Escopo: src/sections/Reserve.tsx e tratamento de erro do rpc create_reservation_request.
Requisitos: identificar o erro de limite do banco (ver migração 20261028210000, mensagem/errcode) e
mostrar texto amigável: "Recebemos muitos pedidos agora. Tente em alguns minutos ou fale pelo
WhatsApp", com botão do WhatsApp. Não expor detalhes técnicos.
Pronto quando: build/lint passam; erro genérico continua genérico; limite mostra a mensagem nova.
PAUSA se a função do banco não distinguir o erro de limite (precisaria de migração: gerar e parar).

### [x] P4 — Captcha (Cloudflare Turnstile) — SOMENTE PLANEJAR
Esta tarefa é de segurança: PARAR sempre. Entregar em RELATORIO.md um plano com: como o widget
entra no formulário, onde o token é validado no servidor (Supabase Edge Function), o que precisa de
conta/chaves do Ives, impacto na RLS/função create_reservation_request e riscos. Nenhum código
de produção sem aprovação.

### [x] P5 — SEO e desempenho
Escopo: index.html, meta tags, Open Graph, sitemap/robots, imagens, bundle.
Requisitos: title/description em pt-BR, og:image com foto otimizada, JSON-LD LodgingBusiness
(sem inventar dados: usar só o que está em CLAUDE.md; o que faltar, listar como pendência),
lazy-load abaixo da dobra, avisar o tamanho do bundle e propor code-splitting seguro.
Pronto quando: build/lint passam e há relatório com pontos de melhoria que dependem do Ives.
PAUSA: textos/endereço/telefone que não estiverem confirmados no CLAUDE.md.

### [x] P6 — Checklist de lançamento (somente relatório)
Gerar em RELATORIO.md uma checklist: remover reservas de teste (SQL para o Ives rodar), datas de
defeso cadastradas, conta admin do tio, revisão de RLS (listar todas as tabelas e políticas),
teste em celular real, Lighthouse, troca de domínio, backup. NÃO executar nada. PARAR.

---

## Fase 7 — Conteúdo confirmado e rodapé

### [x] P7 — Dados confirmados do Ives (SEO, JSON-LD, rodapé) + push da P5
Dados confirmados pelo Ives em 2026-10-29 (usar EXATAMENTE assim):
- Endereço: Rio Mutum com Baía Siá Mariana, Zona Rural, Barão de Melgaço - MT, 78190-000
- Telefone/WhatsApp público: (65) 99971-3778
- Check-in: 05h (horário de Cuiabá, 06h em Brasília). Check-out: 18h (horário de Cuiabá).
  Sempre escrever o fuso junto, para ninguém chegar na hora errada.
Requisitos: aplicar nos JSON-LD (LodgingBusiness: address, telephone, checkinTime/checkoutTime
em formato válido), no CLAUDE.md (seção 2) e onde já houver texto sobre isso. Não inventar faixa de
preço nem horários além dos acima. Registrar em RELATORIO.md o que ainda falta do Ives.
Pronto quando: build/lint passam; nada hardcoded duplicado (centralizar em src/data/site.ts).
Sem push (só o Ives faz). NÃO pausar aqui: seguir para a próxima tarefa e lembrar no relatório que há commits locais aguardando push.

### [x] F1 — Tela de carregamento "Recanto do Tuiuiú"
Escopo: componente Loader no topo do app (src/components/Loader.tsx), GSAP.
Requisitos:
- Tela cheia na cor forest-900, nome "Recanto do Tuiuiú" centralizado (Fraunces, claro) que se
  comprime até virar o monograma "RT" e, em seguida, a tela sobe/some revelando a Home, que já
  anima do jeito atual. Duração total máxima ~2,2 s.
- Mostra só 1 vez por sessão (sessionStorage dentro de try/catch). Não bloqueia o conteúdo: a Home
  carrega por baixo; o loader não atrasa o LCP nem o formulário. Não aparece em /admin.
- prefers-reduced-motion: sem animação, apenas um fade curto de 300 ms ou nada.
- Acessível: role="status" com texto oculto "Carregando", foco liberado ao terminar, scroll
  travado só enquanto visível (compatível com Lenis).
- Não copiar o logotipo ou a identidade de outro site: o conceito é o nosso nome virando "RT".
Pronto quando: build/lint passam; funciona em mobile; segunda visita na mesma sessão não repete.
Fim: PARE para o Ives ver no navegador (marco visual).

### [x] F2 — Rodapé
Escopo: src/components/Footer.tsx, usado na Home.
Requisitos: nome e frase curta da pousada; endereço, telefone e WhatsApp (src/data/site.ts);
horários de check-in/check-out com fuso; link "Como chegar" abrindo o Google Maps; redes sociais
só se estiverem em CLAUDE.md (se não, deixar a estrutura pronta e listar como pendência);
aviso curto de privacidade/LGPD (dados do pedido de reserva usados só para contato; texto marcado
como rascunho para revisão do Ives); crédito de fotografia (campo configurável, pendente do Ives).
Visual coerente com o design system, links com alvo de toque de 44px, contraste AA.
Pronto quando: build/lint passam; responsivo; nenhum dado inventado.

## Regra geral de PLACEHOLDERS (vale para todas as tarefas F)
Objetivo do Ives: site COMPLETO e navegável para apresentação, mesmo sem as fotos finais.
- Criar UM componente reutilizável `Placeholder` (src/components/Placeholder.tsx): bloco verde
  claro (token do design system) na proporção da imagem final, com a descrição do que deve entrar
  ali (ex.: "Foto do quarto: cama de casal, vista da varanda") e uma etiqueta discreta "ilustrativo".
  Acessível: texto visível, sem alt enganoso (alt descreve que é espaço reservado).
- Todo conteúdo provisório (placeholder, texto genérico, troféu de exemplo) carrega a flag
  `provisorio: true` no arquivo de dados. Nunca inventar nome de pessoa, peso, recorde ou dado
  técnico. Rótulos de exemplo devem ser claramente fictícios e marcados ("Exemplo: 1º lugar,
  categoria Pintado"), sem nome de pescador.
- Trocar placeholder por foto real = só preencher o campo `foto` no arquivo de dados (sem mexer
  em componente). Documentar isso em RELATORIO.md.
- Cada placeholder gera uma linha na lista de pendências em RELATORIO.md (onde, o que falta,
  formato/proporção da foto).
- Enquanto houver conteúdo provisório, o site NÃO deve ser indexado: manter `noindex` (meta robots)
  e sitemap sem as páginas provisórias, até o Ives liberar. Remover o noindex é decisão do Ives
  no lançamento (item da P6).

## Fase F — Front mais vivo (animações e conteúdo visual)

### [x] F3 — Profundidade e movimento com rolagem e cursor
Escopo: Hero e 2 outras seções (DayAtRecanto e a nova galeria, quando existir).
Requisitos:
- Camadas em paralaxe que se movem em velocidades diferentes com a rolagem (GSAP ScrollTrigger),
  e no desktop leve movimento pelo ponteiro (mouse) com transform apenas (sem layout thrash).
- Cursor personalizado SÓ em dispositivos com ponteiro fino (pointer: fine); desligado em touch e
  com prefers-reduced-motion. Estado de hover em links/botões/cards. Nunca esconder o cursor
  nativo em campos de formulário.
- Desempenho: animar só transform/opacity, will-change com cuidado, sem vídeo extra.
Pronto quando: build/lint passam; 60 fps percebidos em notebook comum; reduced-motion respeitado.
Fim: PARE para o Ives ver (marco visual).

### [x] F4 — Mídia em alta qualidade (scripts)
Escopo: scripts/optimize-images.mjs e optimize-videos.mjs.
Requisitos: aceitar originais em HD; gerar imagens webp em larguras 640/1280/1920 (srcset) e
manifest.json com largura, altura, tema e legenda/crédito; vídeos mp4 sem áudio até 1920px
com poster e orçamento de peso por vídeo (avisar se passar de ~8 MB). Originais ficam FORA do
repositório (pasta ignorada no .gitignore); só os arquivos otimizados são commitados.
Pronto quando: scripts rodam com uma pasta de teste e documentam o uso no README.
NÃO pausar por falta de fotos: as tarefas F5 a F8 seguem com placeholders (regra geral). Só
registrar em RELATORIO.md que o Ives deve colocar as fotos na pasta de entrada.

### [x] F5 — Seção "A pousada": galeria com legenda
Escopo: nova seção (id="pousada") com fotos reais em colunas e uma frase curta abaixo de cada foto
(estilo galeria editorial: 3 fotos por linha no desktop, 1 no celular), com revelação suave ao
rolar e leve paralaxe.
Requisitos: lê os itens de src/data/pousada.ts (foto, legenda, alt em pt-BR). NÃO usar vídeo nem
imagem gerada por IA para mostrar quartos ou instalações (decisão do Ives e do consumidor: o
hóspede decide com base no que vê). Se faltarem fotos, criar a estrutura com placeholders
claramente marcados e listar em RELATORIO.md o que falta (quartos, refeições, varanda, noite).
Pronto quando: build/lint passam; imagens com srcset e loading="lazy" abaixo da dobra.

### [x] F6 — Catálogo de animais (anel + página de cards que viram)
Escopo: src/sections/AnimalRing.tsx (na Home) e rota /animais (src/pages/Animals.tsx).
Requisitos:
- Home: anel de fotos de animais girando no sentido horário em rotação fixa (CSS/GSAP,
  independente da rolagem), pausa ao passar o mouse e com foco; clicar em um animal leva à rota
  /animais (âncora do animal). prefers-reduced-motion: grade estática no lugar do anel.
- /animais: grade de cards, um por animal, com foto na frente. Ao passar o mouse (desktop) ou
  tocar/Enter (mobile e teclado) o card vira e mostra o verso com: nome popular, nome
  científico, habitat, hábito/melhor época para ver, curiosidade. O verso precisa ser acessível:
  botão real para virar (aria-pressed), conteúdo do verso lido por leitor de tela, nada some
  do DOM, e funciona sem hover.
- Dados em src/data/animals.ts (slug, nome, científico, foto, texto, crédito, revisado: boolean).
- Não inventar informação biológica. Preencher só com o que o Ives passar ou o que for verificável
  em fonte confiável (citar a fonte no RELATORIO.md). Até o Ives trazer as informações oficiais, usar texto genérico e seguro (nome popular e uma
  frase consensual); campos específicos mostram "Em breve" e ficam como pendência no RELATORIO.md.
- Crédito/autor da foto visível no verso do card.
Pronto quando: build/lint passam; navegação por teclado completa; funciona em celular.
NÃO pausar por falta de fotos ou dados: usar placeholders e texto genérico (regra geral) e listar
o que falta. Fim: marco visual.

### [x] F7 — Troféus de pesca (faixa horizontal, direita para a esquerda)
Escopo: seção antes do rodapé, uma faixa (marquee) com rotação horizontal contínua da direita
para a esquerda, em velocidade fixa, sem depender da rolagem. Cada item = foto do pescador com o
peixe, espécie e peso.
Requisitos: loop infinito sem emenda (lista duplicada), animação em CSS/GSAP só com transform,
pausa ao passar o mouse e ao focar um item; reduced-motion: faixa parada com rolagem horizontal
manual. Dados em src/data/trophies.ts (foto, espécie, peso em kg, ano, nome ou apelido do
pescador, `autorizado: boolean`). Enquanto não houver fotos reais autorizadas, usar 4 a 6
placeholders (regra geral acima) com legenda de exemplo, ex.: "Exemplo: 1º lugar, categoria
Pintado", sem nome de pessoa, e listar em RELATORIO.md como pendência "trocar por troféus reais". LGPD: pessoa identificável só com
autorização de imagem e nome. Peso e espécie conferidos pelo tio antes de ir ao ar de verdade.
Pronto quando: build/lint passam; nenhum item real sem `autorizado: true`.
NÃO pausar por falta de fotos: seguir com placeholders; fotos e autorizações reais ficam como pendência.

### [x] F8 — Peixes: anel + página por espécie (conteúdo genérico por enquanto)
Escopo: anel de peixes (reaproveitar o componente do F6) e rota /peixes/:slug.
Decisão do Ives: construir a estrutura agora com informações GENÉRICAS e deixar as oficiais como
pendência. Dados em src/data/fish.ts: nome popular, nome científico (só se tiver certeza),
descrição geral curta e consensual, e os campos específicos (iscas, melhor época, dificuldade,
peso comum, observações) ainda vazios com `oficial: false`.
Regras: o texto genérico só pode conter fatos amplamente conhecidos e seguros (ex.: "peixe de
couro", "peixe de escamas"); NADA de números, épocas, iscas ou recordes inventados. Na página, os
campos sem dado mostram "Em breve" e uma etiqueta discreta "informações em revisão". Espécies
iniciais: as que já estão no Fishing.tsx (Dourado, Pintado) e as que o Ives listar.
Defeso continua vindo do banco (closed_periods), nunca hardcoded.
Pendências registrar em RELATORIO.md: "validar com o tio: iscas, época, dificuldade, peso".
Pronto quando: build/lint passam; páginas navegáveis; nenhum dado específico inventado.

### [x] F10 — Área infantil "Pantanal para os pequenos" (estrutura com placeholders)
Escopo: rota /pequenos e uma chamada na Home.
Requisitos: página lúdica (cores e movimentos mais suaves, linguagem simples) com: mural de
desenhos (grade de placeholders "Desenho de criança: espaço reservado"), 3 a 4 blocos de
atividades/curiosidades com texto genérico e seguro sobre a vida no Pantanal (sem dado técnico
específico, sem inventar atividades que a pousada não oferece: usar "Em breve" onde faltar),
e um aviso visível de que os desenhos só serão publicados com autorização dos responsáveis.
NÃO implementar envio de desenhos, upload nem banco agora: isso envolve imagem de menores e
exige moderação e LGPD, e fica para uma tarefa própria com PAUSA.
Pronto quando: build/lint passam; navegável no menu; sem coleta de dado nenhum.

### [ ] F11 — Pronto para apresentação
Escopo: Home e menu.
Requisitos: todas as seções (Hero, Dia na pousada, Pousada, Animais, Peixes/Pesca, Pacotes, Troféus,
Pequenos, Reserva, Rodapé) existem, na ordem narrativa, com navegação por âncoras/rotas sem links
mortos; menu com os itens certos; todas as páginas filhas têm botão de voltar; nenhum texto "lorem",
"TODO" ou "undefined" visível; todos os placeholders com etiqueta; 404 amigável.
Conferir em tela de 375 px e 1440 px e gerar em RELATORIO.md a lista final de pendências
(fotos, textos oficiais, autorizações) agrupada por seção, para o Ives me trazer de uma vez.
Pronto quando: build/lint passam; `npm run build` sem avisos novos. Fim: PARAR (marco visual).

### [ ] F9 — Revisão final de front
Rodar Lighthouse (mobile), checar CLS/LCP, peso das mídias, reduced-motion, teclado e contraste;
gerar relatório com notas e o que corrigir. Corrigir só o que estiver no escopo; o resto vira lista.
PARAR ao final.

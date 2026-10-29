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
  2. Depois do push, rodar o workflow uma vez manualmente e conferir se ficou verde.
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

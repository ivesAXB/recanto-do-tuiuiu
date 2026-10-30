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

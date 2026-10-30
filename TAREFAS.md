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

### [ ] P6 — Checklist de lançamento (somente relatório)
Gerar em RELATORIO.md uma checklist: remover reservas de teste (SQL para o Ives rodar), datas de
defeso cadastradas, conta admin do tio, revisão de RLS (listar todas as tabelas e políticas),
teste em celular real, Lighthouse, troca de domínio, backup. NÃO executar nada. PARAR.

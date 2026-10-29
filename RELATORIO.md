# RELATORIO.md

Relatórios da fila (TAREFAS.md). Mais recentes no topo.

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
  2. Decidir se quer uma migração para o banco também recusar passeio fora das datas. Hoje essa regra vale só no painel.
  3. Autorizar a próxima tarefa (P1).
- **Próxima tarefa:** P1 — Deploy no GitHub Pages (workflow preparado, sem publicar).

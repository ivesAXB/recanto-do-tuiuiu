# LOG_DECISOES.md

Decisões tomadas pelo agente sem perguntar (DECISOES.md, seção 2). Mais recentes no topo.

## 2026-10-29 — C2: Calendário e passeios por hospedagem

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Passeios usam as linhas existentes de `reservation_experiences`. As que o hóspede escolheu no pedido aparecem como "Sem data" e podem ser editadas para receber data; "Agendar passeio" cria uma linha nova. | Converter automaticamente as linhas do pedido em passeios agendados. | Mantém o que o hóspede pediu visível e não altera dados sem ação do admin. |
| Data do passeio aceita de `check_in` a `check_out`, incluindo os dois dias. | Só as noites (sem o dia de saída). | Passeio no dia da chegada ou da saída é plausível (ex.: passeio cedo antes de ir embora). |
| Regra "data dentro da estadia" validada só no painel. | Constraint/trigger no banco. | Exigiria migração (pausa obrigatória). O RLS já limita quem escreve a admins. Pode virar migração depois, se o Ives quiser. |
| Na lista de pedidos, nomes de experiências aparecem sem repetição. | Repetir o nome a cada passeio agendado. | Com vários dias de pesca, a lista ficaria "Diária de pesca, Diária de pesca, …". |
| Calendário começa no domingo. | Começar na segunda. | Padrão mais comum em calendários no Brasil. |
| Noite do dia D = reservas com `check_in <= D < check_out` (dia de saída não conta pessoas). A lista do dia mostra também quem chega e quem sai, com rótulo. | Contar o dia de saída na ocupação. | É a mesma regra de capacidade do detalhe do pedido; no dia de saída o quarto fica livre para a noite. |
| Calendário abre no mês atual no fuso de Cuiabá, com o dia de hoje selecionado. | Abrir sem dia selecionado. | Mostra de cara quem está na pousada hoje. |
| Tocar numa hospedagem da lista do dia não abre o detalhe do pedido. | Abrir o detalhe a partir do calendário. | Fora do escopo da C2; o detalhe está na aba Pedidos. Fica como melhoria. |
| Campo "Quantidade" rotulado como "barcos ou saídas", padrão 1. | Rótulo genérico "quantidade". | As experiências são cobradas por barco/saída. |

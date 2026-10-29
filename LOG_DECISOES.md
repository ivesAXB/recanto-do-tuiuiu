# LOG_DECISOES.md

Decisões tomadas pelo agente sem perguntar (DECISOES.md, seção 2). Mais recentes no topo.

## 2026-10-29 — P2: Keep-alive do Supabase

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| **Desvio:** reaproveita a Variable `VITE_SUPABASE_URL` e o Secret `VITE_SUPABASE_ANON_KEY` da P1. | Criar secrets novos só para o keep-alive (a tarefa previa "Ives cria os secrets"). | Os valores já existem no repositório; duplicar só aumentaria o que precisa ser mantido. |
| Envia só o cabeçalho `apikey`. | `apikey` + `Authorization: Bearer`. | Funciona tanto com a chave anon antiga quanto com a nova publishable (que não é um JWT). |
| Horário: todo dia às 12:00 UTC (08:00 em Cuiabá), com acionamento manual. | Várias vezes por dia. | Uma requisição por dia basta para a pausa de 1 semana, e o horário da manhã facilita ver o resultado. |
| O job falha (vermelho, com e-mail do GitHub) se a resposta não for HTTP 200, com 3 tentativas. | Ignorar erros. | Avisa cedo se o projeto pausou ou se a chave mudou. |
| `permissions: {}` no workflow. | Permissões padrão. | Ele não precisa acessar o repositório. |

## 2026-10-29 — P1: Deploy no GitHub Pages (preparado, sem publicar)

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| **Desvio:** a chave se chama `VITE_SUPABASE_ANON_KEY`, como no código e no `.env` atual. | `VITE_SUPABASE_PUBLISHABLE_KEY` (nome citado no TAREFAS.md). | Trocar o nome quebraria o `.env` local, que o agente não pode ler nem editar. Dá para renomear depois, junto com o `.env`. |
| **Desvio:** o workflow também exige `VITE_WHATSAPP_NUMBER`. | Só as duas variáveis do Supabase. | Sem ele, o botão de WhatsApp da reserva some do site publicado. |
| A chave fica como **Secret**; a URL e o WhatsApp ficam como **Variables**. | Tudo como Variables. | A chave é pública (vai no site), mas como Secret não aparece nos logs. A URL e o WhatsApp não são sensíveis. |
| O `base` do Vite vem de `actions/configure-pages` (`base_path`): `/recanto-do-tuiuiu/` no github.io e `/` com domínio próprio. Localmente fica `/`. | Fixar `/` ou o caminho do repositório. | Funciona no endereço de teste e, depois, no domínio, sem precisar editar código. |
| **Sem arquivo `CNAME`** por enquanto. | Criar `CNAME` com `www.recantodotuiuiu.com.br`. | O domínio aponta para o site antigo; ativar o Pages com CNAME aqui disputaria o domínio. A troca de domínio é decisão do Ives (DECISOES.md, seção 3). |
| **Sem `404.html`.** | Truque do `404.html` para SPA. | Com `HashRouter`, o Pages sempre entrega o `index.html`. |
| O README do template Vite foi substituído pelo README do projeto, com o passo a passo de publicação. | Acrescentar uma seção ao README do template. | O conteúdo do template não servia para o projeto. |
| Node 24 no workflow, com cache do npm. | Node 20 ou 22. | É a mesma versão usada localmente (v24.21). |
| Workflow em dois jobs (build e deploy), com `concurrency: pages` e `cancel-in-progress: false`. | Um job só. | Segue o modelo oficial do GitHub e não interrompe um deploy em andamento. |

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

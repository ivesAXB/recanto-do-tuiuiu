# LOG_DECISOES.md

Decisões tomadas pelo agente sem perguntar (DECISOES.md, seção 2). Mais recentes no topo.

## 2026-10-30 — Ajustes do anel, dos troféus e do rodapé

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Loops em GSAP, ligados só com a seção visível e com aceleração suave. | Manter o CSS. | O CSS não pausa com o toque e dava o "arremesso" ao chegar na seção. |
| Toque pausa e retoma 1,5 s depois de soltar. | Pausar até tocar de novo. | Natural no celular, sem botão extra. |
| Rodapé sticky (CSS puro) sob o `main` com fundo sólido. | Animar o rodapé com GSAP. | Sem JavaScript e sem custo de desempenho; dá exatamente o efeito de "destampar". |
| Efeito do rodapé só a partir de 768 px. | Também no celular. | No celular o rodapé é mais alto que a tela. |
| Botão do encerramento leva ao WhatsApp. | Botão "Pedir reserva". | Logo depois do formulário, outra chamada para a reserva seria repetitiva; o WhatsApp atende quem ficou com dúvida. |
| Foto do encerramento: `imagem-lago-drone-com-barcos` (real, da região). | Pôr do sol. | É a mais parecida com a referência (vista aérea de água e mata) e mostra os barcos. |

## 2026-10-30 — F7: Troféus

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| A seção entra entre Pacotes e Reserva. | Logo antes do rodapé. | A ordem final da F11 manda assim; evita mudar de novo. |
| Itens focáveis pelo Tab (`tabIndex=0`) só na primeira cópia. | Nenhum item focável. | A tarefa pede pausar ao focar um item; a cópia duplicada não confunde o teclado nem o leitor de tela. |
| Foto sem `autorizado: true` nunca aparece (trava no componente). | Confiar só no preenchimento correto dos dados. | LGPD: um erro de digitação não expõe ninguém. |
| Animação em CSS. | GSAP. | Movimento contínuo simples, com pausa por `:hover` e `:focus-within`. |
| 5 exemplos com as espécies do CLAUDE.md (Pintado, Dourado, Pacu). | Espécies variadas. | São os peixes confirmados do negócio. |

## 2026-10-30 — F6: Catálogo de animais

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Nome científico vazio ("Em breve"). | Preencher de memória. | A tarefa exige fonte citada; preencho com fonte se o Ives pedir. |
| Âncora do animal como rota `#/animais/<slug>`. | `#/animais#tuiuiu`. | Com HashRouter não existe um segundo `#`; a rota permite rolar até o card e focar o botão. |
| Anel em CSS (`@keyframes`), não GSAP. | GSAP. | Rotação contínua simples; o CSS pausa com `:hover`/`:focus-within` sem JavaScript. |
| Botão "Ver informações" abaixo do card. | Card inteiro clicável. | Um botão real com `aria-pressed` é a forma acessível pedida, e o alvo de toque fica com 44 px. |
| Fotos com pessoas não usadas. | Usar as fotos com araras. | LGPD: pessoa identificável só com autorização. |
| 6 animais (os citados no site + comuns no Pantanal). | Só os 3 citados. | Um anel com 3 fotos ficaria vazio; frases genéricas e seguras, marcadas como em revisão. |
| Página `/animais` com carregamento sob demanda. | Junto com a Home. | Não pesa na página inicial. |

## 2026-10-30 — F5: Galeria "A pousada"

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| 6 itens: 3 fotos reais da pousada e 3 espaços reservados (quartos, refeições, varanda). | Um espaço reservado também para "noite". | 6 fecham duas linhas de 3; noite e varanda viraram "varanda ao fim do dia". |
| A segunda foto da fachada (`pousada-externa-ampliada-horizontal2`) ficou de fora. | Usar todas as fotos externas. | É quase igual à fachada escolhida. |
| As fotos vêm do `manifest.json` (`src/lib/media.ts`), e o dado só guarda o nome. | Listar as larguras em cada item. | A tarefa pede "trocar = só preencher `foto`"; as larguras novas entram sozinhas. |
| Legendas dos espaços reservados neutras ("Os quartos."). | Adjetivos ("simples e confortáveis"). | Seriam afirmações não confirmadas. |
| `noindex` no `index.html` agora. | Esperar o F11. | A regra geral manda ligar enquanto houver placeholder, e a F5 é a primeira tarefa com placeholders. |
| A etiqueta "ilustrativo" é ignorada por leitores de tela; o `aria-label` diz "Espaço reservado para foto: …". | Ler a etiqueta e a descrição separadas. | Uma frase só, clara, sem `alt` enganoso. |
| Menu sem o item "A pousada" por enquanto. | Acrescentar agora. | O menu completo é escopo da F11. |

## 2026-10-30 — F4: Scripts de mídia

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Ampliar os scripts existentes. | Reescrever do zero. | Já funcionavam e geraram as mídias atuais; os nomes dos arquivos continuam compatíveis com o site. |
| Tema = primeira subpasta dentro de `originais/fotos`. | Tema digitado à mão para cada foto. | Organizar em pastas é natural; dá para corrigir no manifest. |
| O manifest mescla os dados: legenda, crédito e tema escritos à mão nunca são apagados. | Sobrescrever o manifest a cada execução. | O Ives vai preencher legendas à mão. |
| Vídeo acima do orçamento só gera aviso. | Recomprimir sozinho com mais perda. | A escolha entre cortar e perder qualidade é do Ives. |
| Os componentes atuais continuam com o `srcset` 640/1280. | Acrescentar a versão 1920 neles agora. | Os arquivos 1920 ainda não existem para as fotos atuais (os originais tinham 1280 px); as seções novas (F5+) já podem usar a de 1920. |

## 2026-10-30 — F3: Profundidade e cursor

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| O cursor normal continua visível; o anel só acompanha. | Esconder o cursor do sistema e desenhar outro. | Mantém a precisão e a acessibilidade; a tarefa proíbe esconder o cursor em campos, e assim ele nunca some. |
| O anel some sobre campos de formulário. | Mudar de forma. | Não atrapalha a digitação. |
| Cartões (`article`) contam como elementos interativos para o anel. | Só links e botões. | A tarefa pede o estado de hover também em cards. |
| Rolagem e mouse usam propriedades diferentes (`yPercent` ou `y` em elementos separados). | Animar o mesmo `y` nos dois. | Evita que uma animação apague a outra. |
| Vídeo do Hero 6% maior só quando o efeito do mouse está ligado. | Sempre maior. | No celular e com "reduzir movimento" nada muda no visual. |
| Galeria fica para a F5. | Criar a galeria agora. | Ela é escopo da F5; o código de profundidade já está pronto para reaproveitar. |

## 2026-10-29 — F2: Rodapé

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| A frase do rodapé reaproveita o texto do Hero. | Escrever uma frase nova. | Nada inventado; o Ives pode trocar em `site.ts`. |
| O link do WhatsApp do rodapé usa o telefone confirmado (`site.ts`). | Usar `VITE_WHATSAPP_NUMBER`. | É o número público confirmado pelo Ives. |
| "Rascunho" do texto de privacidade marcado só no arquivo de dados (`provisorio: true`) e no relatório. | Etiqueta "rascunho" visível no site. | O site precisa estar apresentável; a etiqueta visível é para placeholders de imagem. |
| O texto de privacidade diz para que servem os dados e como pedir correção ou exclusão, sem prometer "não compartilhamos". | Prometer "nunca compartilhamos". | Os dados passam por serviços como Supabase e Cloudflare; uma promessa absoluta seria imprecisa. |
| Redes sociais e crédito ficam escondidos enquanto vazios. | Mostrar "Em breve". | Um rodapé com "Em breve" parece inacabado. |

## 2026-10-29 — F1: Tela de carregamento

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Com "reduzir movimento", a abertura não aparece. | Fade de 300 ms. | A tarefa permitia as duas opções; sem nada, a pessoa chega ao conteúdo mais rápido. |
| Não aparece em links diretos para uma seção (`#/reservar`). | Mostrar sempre na Home. | Quem recebe o link do formulário quer ir direto a ele. |
| Clique ou tecla pula a animação. | Esperar sempre os 2,2 s. | Respeita quem tem pressa e não atrasa o formulário. |
| Se o `sessionStorage` estiver bloqueado, não mostra. | Mostrar mesmo assim. | Sem como lembrar que já viu, apareceria a cada visita. |
| Traço vermelho embaixo do "RT". | Só o monograma. | É um detalhe na cor do colar do tuiuiú (CLAUDE.md: vermelho só em detalhes). |
| O título do Hero espera a cortina (`introDelay`). | Animar por baixo da tela. | Senão a animação do título aconteceria escondida. |

## 2026-10-29 — P7: Dados confirmados

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| O JSON-LD é gerado no build (`vite.config.ts`) importando `src/data/site.ts`. | Manter o JSON-LD escrito no `index.html`. | A tarefa pede dado sem duplicação; assim o rodapé e o SEO leem da mesma fonte. |
| O botão de reserva continua usando `VITE_WHATSAPP_NUMBER`. | Trocar para o telefone de `site.ts`. | Se os números forem diferentes, a troca mudaria quem recebe os pedidos sem aviso. Ficou para o Ives conferir. |
| Textos: "Check-in a partir das 05h" e "Check-out até as 18h (… 19h em Brasília)". | Só "05h"/"18h". | Deixa claro o sentido de cada horário. O horário de Brasília do check-out é só conversão (+1h). |
| Link "Como chegar" é uma busca do endereço no Google Maps. | Coordenadas fixas. | Coordenadas não foram confirmadas. |

## 2026-10-29 — P6: Checklist de lançamento

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| SQL de limpeza filtra por `guest_name ilike '%teste%'`, com uma consulta de conferência antes do `delete`. | Entregar só o `delete`. | Apagar é definitivo; o Ives vê a lista antes. |
| Revisão de RLS feita lendo as 4 migrações, mais consultas só de leitura para o Ives conferir no banco ao vivo. | Consultar o banco diretamente. | O agente não usa credenciais do banco nem chave secreta. |
| Registrado como risco futuro: `admin_notes` ficaria visível ao hóspede se o login do visitante for ligado. | Criar a migração já. | Hoje não há risco (cadastro desligado); mudar o esquema pede pausa. |
| Backup recomendado: exportar CSV uma vez por mês, com `supabase db dump` como opção completa. | Workflow automático de backup. | O automático exige guardar a senha do banco como Secret, uma decisão de segurança do Ives. |

## 2026-10-29 — P5: SEO e desempenho

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Endereço absoluto do site (`og:url`, `og:image`, JSON-LD, sitemap) vem do `base_url` de `actions/configure-pages`, injetado no build por um pequeno plugin no `vite.config.ts`. | Fixar o endereço no `index.html`. | O WhatsApp e as redes exigem `og:image` com endereço completo; assim ele acompanha sozinho a troca de domínio. |
| Imagem de compartilhamento: casal de tuiuiús de asas abertas (foto original), recorte 1200×630, JPEG 230 kB, em `public/og-image.jpg`. | Vista aérea da pousada. | Combina com o conceito "O tuiuiú chega" (CLAUDE.md). O Ives pode trocar. |
| JSON-LD `LodgingBusiness` só com fatos do CLAUDE.md: nome, descrição, região MT/Brasil, capacidade 18 e comodidades (pensão completa, pesca, passeio). | Incluir endereço, telefone, coordenadas e preços. | Não estão confirmados (DECISOES.md, seção 3). Ficaram como pendências do Ives. |
| `robots.txt` (libera tudo) e `sitemap.xml` (só a página inicial) gerados no build. | Arquivos fixos em `public/`. | Precisam do endereço absoluto. Rotas com `#` (`#/admin`) não são vistas por buscadores; o painel já tem `noindex`. Observação: robots e sitemap só valem na raiz de um domínio, ou seja, depois da troca de domínio. |
| Textos de título e descrição montados com os fatos do CLAUDE.md, marcados como provisórios. | Esperar o texto do tio. | São fáceis de trocar; o site precisa de alguma descrição já. |
| Vídeo do hero continua com `preload="auto"`. | `preload="metadata"` (CLAUDE.md, seção 8). | É o vídeo de abertura com autoplay, acima da dobra: o navegador baixa de qualquer forma. As imagens abaixo da dobra já usam `loading="lazy"` e `srcset`. |
| Code-splitting **só proposto**, não aplicado. | Aplicar já. | A tarefa pede proposta; as opções mexem na forma como o Supabase é carregado e merecem aprovação. |

## 2026-10-29 — P4: Implementação do captcha (aprovada pelo Ives)

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| O formulário só usa o captcha e a Edge Function **se existir `VITE_TURNSTILE_SITE_KEY`**; sem ela, usa a chamada direta antiga. | Trocar tudo de uma vez. | Permite ligar em etapas na ordem segura (função → site → migração) e desfazer só removendo a variável, enquanto a migração não for rodada. |
| A Edge Function chama `create_reservation_request` com a credencial interna que o Supabase injeta (`SUPABASE_SERVICE_ROLE_KEY`, só no servidor). | Chamar com a chave pública. | Depois da migração, a chave pública não pode mais chamar a função. O código só lê a variável de ambiente; o valor nunca passa pelo agente nem pelo repositório. |
| A Edge Function é publicada **sem verificação de JWT**. | Exigir JWT. | A chave nova *publishable* não é um JWT, e o visitante não tem login. A proteção é o captcha conferido no servidor mais a lista de origens permitidas (CORS + checagem de `Origin`). |
| A função confere `hostname` e `action` do token (exceto com as chaves de teste da Cloudflare). | Conferir só `success`. | Impede reaproveitar tokens gerados em outros sites com a mesma site key. |
| Validação básica de tipos e tamanhos na função antes de chamar o banco. | Deixar tudo para o banco. | Responde rápido com `dados` e evita chamadas inúteis; as regras definitivas continuam no banco. |
| O script do Turnstile só é carregado no passo 4 (Resumo). | Carregar com a página. | Não pesa na página inicial (CLAUDE.md, desempenho). |
| O botão "Enviar pedido" fica desativado e mostra "Aguardando verificação…" até existir o token. Depois de qualquer erro, o widget gera um token novo. | Deixar enviar sem o token. | Os tokens são de uso único e o envio sem token sempre falharia. |
| Se o widget não carregar (bloqueador de anúncios), aparece um aviso com o botão do WhatsApp. | Só uma mensagem de erro genérica. | O visitante não fica sem saída. |
| O componente fica em `src/components/TurnstileWidget.tsx` (pasta nova). | Dentro de `Reserve.tsx`. | É reutilizável e independente da seção (CLAUDE.md: componentes pequenos e reutilizáveis). |

## 2026-10-29 — P3: Mensagem de limite de envios

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| O erro de limite é reconhecido pelo **início da mensagem** do banco ("Muitos pedidos em pouco tempo"). | Pausar e criar uma migração com um `errcode` próprio. | A função já distingue o erro pelo texto, que é controlado pelo projeto (o `errcode` é o padrão `P0001`, igual ao erro de data no passado). Sem migração, a tarefa não precisou pausar. O risco é alguém mudar esse texto no banco; ficou um comentário no código avisando. |
| A mensagem de limite usa o texto pedido e omite "ou fale pelo WhatsApp" se `VITE_WHATSAPP_NUMBER` não estiver configurado. | Mostrar sempre a frase completa. | Sem número, o botão do WhatsApp não aparece; a frase ficaria incoerente. |
| Teste com a resposta do Supabase simulada no navegador (interceptando só `create_reservation_request`). | Enviar 3 pedidos reais para estourar o limite. | Não cria pedidos de teste no banco real. |

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

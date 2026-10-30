# PENDENCIAS.md: o que falta para o site ficar perfeito

Lista única, em 2026-10-30. Junta as pendências espalhadas pelo RELATORIO.md (P5 a F11 e ajustes).
Marque `[x]` conforme for resolvendo. **Quem faz:** 🧑 Ives / tio · 🤖 agente (basta pedir) · 🤝 os dois.

Estado atual: site publicado em https://ivesaxb.github.io/recanto-do-tuiuiu/ com todas as tarefas da fila feitas
(Lighthouse no celular: Desempenho 97, Acessibilidade 100, Boas práticas 100). O que segue é conteúdo, decisões e lançamento.

---

## 1. Feito em 2026-10-30 (guia de fauna e Instagram)

- [x] Guia de fauna aplicado nos **23 animais** (nome científico, habitat, quando ver, curiosidade), separados em Mamíferos (7), Aves (15) e Répteis (1).
- [x] Martins-pescadores em 3 cartões (grande, verde, pequeno), como no guia.
- [x] Aves novas no catálogo: socó-dorminhoco, socó-boi, ema, garça-branca-grande, colhereiro, garça-azul, gavião-belo e urubu.
- [x] Instagram @recantodotuiuiu no rodapé, nos dados do Google (`sameAs`) e num botão embaixo dos troféus, ao lado do botão **"Catálogo de peixes"**.
- [ ] 🧑 **Foto do João-pinto** (o cartão existe, com espaço reservado).

## 2. Conteúdo que ainda falta (Ives / tio)

### Animais (`#/animais`)
- [ ] 🧑 **Crédito de cada foto** (nome do fotógrafo). Hoje aparece "crédito em breve".
- [ ] 🧑 Revisar a frase curta de cada cartão (escrita pelo agente a partir do guia).

### Peixes (`#/peixes`)
- [ ] 🧑 Com o tio, para Dourado, Pintado e Pacu: **iscas, melhor época, dificuldade, peso comum, observações**. Depois, `oficial: true`.
- [ ] 🧑 Confirmar os nomes científicos (preenchidos pelo agente).
- [ ] 🧑 Fotos de cada peixe (sem pessoas, ou com autorização).
- [ ] 🧑 Outras espécies que devam aparecer.

### Pesca (calendário da Home)
- [ ] 🧑 Validar os **meses de cada época** e a melhor época do Dourado (jun–set) e do Pintado (mai–set): vieram do site antigo.
- [ ] 🧑 Revisar os textos de Defeso, Cheia, Baías e Rio.

### A pousada (galeria)
- [ ] 🧑 **3 fotos:** quarto, refeição servida, varanda ao fim do dia (de preferência verticais e de boa qualidade; as fotos de celular verticais da fachada ficaram abaixo das atuais).
- [ ] 🧑 Revisar o título "Uma casa no meio do Pantanal." e as legendas.

### Troféus
- [ ] 🧑 Trocar os 5 exemplos por **troféus reais**: foto do pescador com o peixe, espécie, peso (kg), ano, nome ou apelido.
- [ ] 🧑 **Autorização de imagem e nome** de cada pescador (LGPD). Sem ela, o site não mostra a foto.
- [ ] 🧑 Espécie e peso conferidos pelo tio.

### Pantanal para os pequenos (`#/pequenos`)
- [ ] 🧑 Quais **atividades para crianças a pousada realmente oferece** (hoje: "Em breve").
- [ ] 🧑 Revisar os textos das curiosidades.
- [ ] 🧑 Desenhos de crianças: só com autorização dos responsáveis. Envio pelo site = tarefa futura, com pausa (LGPD, moderação).

### Rodapé
- [x] Instagram no rodapé. 🧑 Outras redes (Facebook, YouTube…), se houver.
- [ ] 🧑 Crédito geral das fotos (ex.: "Fotos: Fulano").
- [ ] 🧑 Revisar o **texto de privacidade** (rascunho).

### Textos para revisar (escritos pelo agente)
- [ ] 🧑 Hero: "O Pantanal começa quando o tuiuiú chega." (agora sobre o vídeo da onça: combina?).
- [ ] 🧑 "Um dia no Recanto": as 4 cenas.
- [ ] 🧑 Legendas das faixas de foto: "Araras-azuis no céu do Pantanal.", "A onça-pintada na beira do rio.", "Fim de tarde no Pantanal."
- [ ] 🧑 Foto final: "Ficou alguma dúvida? A gente responde pelo WhatsApp."
- [ ] 🧑 Títulos: "Quem mora por aqui.", "Peixes que contam história.", "Vamos conhecer o Pantanal?"
- [ ] 🧑 Pacotes: preços e textos (painel → Valores).

## 3. Decisões do Ives

- [ ] 🧑 Conferir se a Variable **`VITE_WHATSAPP_NUMBER`** do GitHub (e o `.env`) é `5565999713778`. É para onde vão os pedidos de reserva.
- [ ] 🧑 **Code-splitting** (deixa o site mais rápido; risco baixo): sim ou não. 🤖 faz em seguida.
- [ ] 🧑 Apagar as **fotos antigas sem uso** (lista no RELATORIO.md, seção "Fotos novas do Ives"). 🤖 apaga.
- [ ] 🧑 Aprovar o **título, a descrição e a foto de compartilhamento** (o que aparece no WhatsApp/Google).
- [ ] 🧑 Tela de abertura (cerca de 2 s): manter ou encurtar.

## 4. Painel e banco (Ives, no Supabase/painel)

- [ ] 🧑 **Datas oficiais do defeso** de cada ano (hoje cadastrado até 31/01/2027): conferir.
- [ ] 🧑 **Conta de admin do tio** (P6, item 3: criar o usuário e rodar o SQL do papel).
- [ ] 🧑 **Apagar os pedidos de teste** (P6, item 1: consultar primeiro, depois apagar).
- [ ] 🧑 Rodar as 3 consultas de conferência do RLS e o **Security Advisor** (P6, item 4).
- [ ] 🧑 Manter desligado o cadastro público (Authentication → Allow new users to sign up).

## 5. Lançamento (P6, na ordem)

- [ ] 🧑 Teste completo num **celular real** (Android e iPhone, pelo 4G): vídeo, menu, reserva com captcha e WhatsApp, painel.
- [ ] 🧑 **Lighthouse no site publicado** (F12 → Lighthouse → Mobile).
- [ ] 🧑 **Primeiro backup** (exportar CSV das tabelas) antes da troca de domínio.
- [ ] 🤝 **Tirar o `noindex`** quando não houver mais conteúdo provisório (🤖 tira quando o Ives liberar).
- [ ] 🧑 **Troca de domínio** para `www.recantodotuiuiu.com.br`:
  - GitHub Pages: Custom domain.
  - DNS: `www` → CNAME para `ivesaxb.github.io`; raiz → os 4 registros A do GitHub.
  - Enforce HTTPS.
  - Supabase → URL Configuration.
  - Turnstile: conferir os hostnames.
  - Rodar o deploy de novo.
- [ ] 🧑 Testar uma reserva no domínio novo.
- [ ] 🧑 **Google Search Console**: adicionar o domínio e enviar o `sitemap.xml`.
- [ ] 🧑 Desligar o site antigo (só depois de tudo funcionando).
- [ ] 🧑 Atualizar o link no Instagram, no Google Meu Negócio e no WhatsApp Business.

## 6. Melhorias opcionais (agente, quando o Ives quiser)

- [ ] 🤖 Versões de 960 px das fotos (o Lighthouse aponta até 830 kB de sobra no celular).
- [ ] 🤖 Alerta automático mensal para evitar a desativação do keep-alive depois de 60 dias sem push.
- [ ] 🤖 Envio de desenhos das crianças com moderação (tarefa própria, com pausa por LGPD).
- [ ] 🤖 Login opcional do visitante para acompanhar os pedidos (CLAUDE.md, seção 5). Antes, mover as notas internas para uma tabela só de admin.

## 7. Rotinas depois do lançamento

Estão na tabela **"Manutenção do Ives"**, no topo do RELATORIO.md:
- cadastrar o defeso todo ano;
- atualizar preços;
- cadastrar bloqueios;
- fazer o backup mensal;
- fotos novas → `npm run media:images`;
- reativar o keep-alive, se o GitHub avisar.

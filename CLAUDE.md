# Recanto do Tuiuiú: instruções do projeto

Leia este arquivo inteiro antes de qualquer tarefa. Ele guarda as decisões já tomadas.
Se algo aqui entrar em conflito com um pedido, avise antes de seguir.

## 1. O que é o projeto

Site da **Pousada Recanto do Tuiuiú**, no coração do Pantanal matogrossense (Mato Grosso).
O nome homenageia uma família de tuiuiús que visita a pousada quase todo dia, vinda do ninho, em busca de peixe fresco.

Objetivos:
1. Site lindo, cinematográfico, com animações e sensação de profundidade (efeito 3D leve).
2. Visitante pode pedir reserva **sem login** (conta é opcional).
3. Painel de administração (somente o desenvolvedor e o dono da pousada) para gerenciar pedidos, estadias e passeios.

Domínio: `recantodotuiuiu.com.br`. Site antigo (só redireciona para o WhatsApp) segue no ar até o novo ficar pronto.

## 2. Negócio (regras que o site precisa respeitar)

- Produto principal: **pesca esportiva** (Dourado, Pintado, Pacu) + hospedagem. Ecoturismo e fotografia de fauna também.
- Endereço: Rio Mutum com Baía Siá Mariana, Zona Rural, Barão de Melgaço - MT, 78190-000.
- Telefone/WhatsApp público: (65) 99971-3778.
- Check-in: 05h (horário de Cuiabá, 06h em Brasília). Check-out: 18h (horário de Cuiabá). Sempre escrever o fuso junto.
- Esses dados ficam centralizados em `src/data/site.ts` (confirmados pelo Ives em 2026-10-29).
- Capacidade: até 18 pessoas hospedadas.
- Hospedagem: diária por pessoa, com café, almoço e janta inclusos.
- Experiências exclusivas para hóspedes: **diária de pesca** (por barco, grupo de até 3) e **passeio ecológico** (por barco, grupo de até 3).
- **Pacote fechado**: hospedagem + barco + iscas + translado de Cuiabá. Preço sob cotação.
- Confirmação da reserva: sinal de 50% da hospedagem.
- **Defeso (piracema)**: aproximadamente de outubro a janeiro a pesca não é permitida, apenas contemplação. As datas mudam por ano.
- Épocas: baías (abril a junho), rio (julho a setembro), cheia (fevereiro e março).
- **Preços, datas de defeso e textos NÃO ficam fixos no código.** Ficam no banco e são editáveis no painel.
- Em construção: seção "Pantanal para os pequenos" (pousada amiga de crianças). Só publicar o que a pousada realmente oferece. Nunca inventar serviços.

## 3. Stack (proposta inicial, pode ser ajustada)

- Vite + React + TypeScript
- Tailwind CSS, com variáveis CSS para as cores da marca
- GSAP + ScrollTrigger para animações; Lenis para rolagem suave
- Three.js / react-three-fiber **somente** se um efeito justificar o peso; preferir paralaxe em camadas e shaders leves
- Supabase (Postgres, Auth, Storage), região São Paulo
- Hospedagem: GitHub Pages com deploy por GitHub Actions
- Rotas: GitHub Pages não suporta rotas "limpas" no refresh; usar `HashRouter` ou o truque do `404.html`

## 4. Identidade visual

Conceito: **"O tuiuiú chega."** A página acompanha um dia no Pantanal (amanhecer, pesca, entardecer, noite).

- Referência principal: tengilemalamala.com (hero em vídeo tela cheia, tema escuro verde, tipografia grande, fotos em colagem).
- Paleta (valores provisórios, ajustar com as fotos reais):
  - verde profundo do rio e do mato (fundo principal)
  - areia quente (textos e cartões claros)
  - azul do rio (detalhes)
  - **vermelho do colar do tuiuiú** (cor de destaque, só em botões e detalhes)
- Tipografia: serifa elegante nos títulos, sans-serif limpa no texto.
- Hero: vídeo real dos tuiuiús/rio. Sempre ter imagem de fallback.
- Tom do texto: acolhedor, direto, pt-BR. Sem exageros nem clichês de turismo.

## 5. Fluxo de reserva (sem login obrigatório)

1. Visitante escolhe datas, número de pessoas e experiências.
2. Informa nome e WhatsApp (e-mail opcional).
3. O pedido é salvo no banco com status `interesse` e o site abre o WhatsApp do dono com a mensagem pronta.
4. O dono, no painel, muda o status: `interesse` → `confirmada` (registrando o sinal) → `concluida`, ou `cancelada`.
5. Para cada estadia confirmada, o painel registra os passeios previstos por dia.
6. Datas dentro do defeso mostram aviso de que a pesca não está disponível.
7. Proteção contra spam: captcha invisível (ex.: Cloudflare Turnstile) e limite de pedidos.
8. Login do visitante é **opcional** (para acompanhar pedidos). Login obrigatório **apenas** no painel.

## 6. Banco de dados (esboço, validar antes de criar)

- `profiles` (id, papel: `admin`)
- `reservation_requests` (nome, whatsapp, email, check_in, check_out, pessoas, status, sinal_pago, observações, user_id opcional)
- `experiences` (nome, descrição, preço, unidade: por pessoa/por barco, exige hospedagem)
- `reservation_experiences` (reserva, experiência, data, quantidade)
- `closed_periods` (início, fim, tipo: `defeso` | `bloqueio`, descrição)
- `site_settings` (textos e valores editáveis)

Toda alteração no banco vira um arquivo SQL em `supabase/migrations/` (versionado no Git).

## 7. Segurança (inegociável)

- **RLS ligado em todas as tabelas**, sempre. Tabela sem política é tabela bloqueada.
- Visitante anônimo só pode **inserir** pedidos. Nunca ler pedidos de outros.
- Somente usuários com papel `admin` leem e alteram tudo.
- **Nunca** colocar `service_role`/chave secreta no repositório, no código do site ou em mensagens. No site só vão a URL do projeto e a chave pública (`anon`/`publishable`).
- Chaves ficam em variáveis de ambiente (`.env` no `.gitignore`; `.env.example` versionado, sem valores).
- Validar dados no banco (constraints) e não só no formulário.
- Dados pessoais de hóspedes: coletar o mínimo necessário (LGPD).

## 8. Desempenho, acessibilidade e SEO

- Mobile primeiro: a maioria dos hóspedes chega pelo celular e pelo WhatsApp.
- Respeitar `prefers-reduced-motion`: animações desligadas ou simplificadas.
- Vídeos comprimidos (poster + `preload="metadata"`), imagens em WebP/AVIF com `loading="lazy"`.
- 3D e efeitos pesados carregam sob demanda e têm versão simplificada no celular.
- Meta: boa pontuação no Lighthouse (desempenho e acessibilidade).
- Contraste adequado, navegação por teclado, `alt` em todas as imagens.
- SEO: título e descrição por página, Open Graph, dados estruturados de hospedagem local.

## 9. Convenções de trabalho

- Código e comentários em inglês; textos do site em pt-BR.
- Commits em formato convencional (`feat:`, `fix:`, `chore:`).
- Componentes pequenos e reutilizáveis; seções do site em `src/sections/`.
- Antes de decisões grandes (trocar stack, mudar banco, mexer em segurança), **perguntar**.
- Explicar o que foi feito de forma curta, pois o desenvolvedor quer aprender o porquê.
- Não instalar dependências pesadas sem justificar o impacto no desempenho.
- Responder ao desenvolvedor sempre em português do Brasil.

## 10. Pendências

- Definir o conteúdo real da seção "Pantanal para os pequenos".
- Organizar fotos e vídeos enviados pelo dono (otimizar antes de usar).
- Confirmar datas oficiais do defeso do ano.
- ~~Corrigir no conteúdo antigo: rodapé diz "Pousada Pantanal".~~ Resolvido: o rodapé novo (F2) usa o nome certo.

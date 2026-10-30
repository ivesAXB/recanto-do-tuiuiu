# Recanto do Tuiuiú

Site da Pousada Recanto do Tuiuiú (Pantanal, MT): página pública com pedido de reserva sem login e painel de administração em `#/admin`.

Stack: Vite + React + TypeScript, Tailwind CSS, GSAP/Lenis, Supabase. Regras do projeto em [CLAUDE.md](CLAUDE.md); planejamento em [ROADMAP.md](ROADMAP.md).

## Rodar no computador

```bash
npm install
npm run dev
```

Crie um arquivo `.env` na raiz (ele não vai para o Git) com:

| Nome | O que é |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase (Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Chave **pública** (anon/publishable). Nunca a `service_role`/secret |
| `VITE_WHATSAPP_NUMBER` | WhatsApp da pousada, só dígitos com 55 (ex.: `5565999999999`) |

Antes de publicar: `npm run lint` e `npm run build`.

## Publicação (GitHub Pages)

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) roda a cada push na `main` (ou manualmente pela aba **Actions**): instala, roda o lint, faz o build e publica a pasta `dist` no GitHub Pages.

### Passo a passo (uma vez só)

1. **Repositório:** o GitHub Pages em repositório **privado** exige plano pago (GitHub Pro/Team). Em repositório público é gratuito.
2. **Ativar o Pages:** no GitHub, *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
3. **Variáveis** (*Settings → Secrets and variables → Actions*):
   - Aba **Variables** → *New repository variable*:
     - `VITE_SUPABASE_URL`
     - `VITE_WHATSAPP_NUMBER`
   - Aba **Secrets** → *New repository secret*:
     - `VITE_SUPABASE_ANON_KEY` (a chave pública; fica como secret só para não aparecer nos logs, mas ela vai dentro do site de qualquer forma)
   - **Nunca** cadastre a chave `service_role`/secret.
4. Fazer push na `main` (ou *Actions → Deploy to GitHub Pages → Run workflow*). Se faltar alguma variável, o workflow para com a mensagem "Falta …".
5. O endereço de teste fica em `https://ivesaxb.github.io/recanto-do-tuiuiu/`.

### Endereço e domínio próprio

- O `base` do Vite é definido automaticamente pelo workflow (`actions/configure-pages`): `/recanto-do-tuiuiu/` no endereço de teste e `/` quando houver domínio próprio. No computador ele é `/`.
- As rotas usam `HashRouter` (`#/`, `#/admin`), então **não é preciso `404.html`**: o GitHub Pages sempre entrega o `index.html`.
- **Domínio `recantodotuiuiu.com.br`:** hoje ele aponta para o site antigo (arquivo `CNAME` com `www.recantodotuiuiu.com.br` no repositório antigo). Por isso este repositório **ainda não tem `CNAME`**. Na troca de domínio (fase 4, último passo):
  1. Remover o domínio do Pages do repositório antigo.
  2. Neste repositório, em *Settings → Pages → Custom domain*, informar `www.recantodotuiuiu.com.br` e marcar *Enforce HTTPS*. Com deploy por Actions não é preciso arquivo `CNAME`: o domínio fica salvo nessa configuração.
  3. Conferir o DNS (registro CNAME de `www` apontando para `ivesaxb.github.io`).
  4. Rodar o workflow de novo: o `base` passa a ser `/` automaticamente.

## Captcha (Cloudflare Turnstile)

Com o captcha ligado, o pedido de reserva não vai mais direto ao banco: o formulário manda os dados e um token do Turnstile para a Edge Function [supabase/functions/submit-reservation](supabase/functions/submit-reservation/index.ts), que confere o token na Cloudflare e só então grava o pedido.

| Onde | Nome | Valor |
|---|---|---|
| `.env` e GitHub (*Repository variable*) | `VITE_TURNSTILE_SITE_KEY` | **Site key** do Turnstile (pública) |
| Supabase → *Edge Functions → Secrets* | `TURNSTILE_SECRET_KEY` | **Secret key** do Turnstile. Nunca no GitHub nem no `.env` |

- Sem `VITE_TURNSTILE_SITE_KEY`, o formulário usa o caminho antigo (chamada direta ao banco). Isso permite ligar o captcha por etapas.
- A Edge Function deve ser publicada com **verificação de JWT desligada** (no painel: função → *Details* → desmarcar *Enforce JWT verification*; pela CLI: `supabase functions deploy submit-reservation --no-verify-jwt`). Quem protege a função é o captcha e a lista de origens permitidas no código.
- **Ordem para ligar:** (1) publicar a função e cadastrar o secret; (2) criar a variável no GitHub e publicar o site; (3) fazer um pedido de teste pelo site publicado; (4) só então rodar a migração `20261029180000_reservation_via_edge_function.sql`, que impede o caminho antigo.
- Para testar no computador sem as chaves reais, use a site key de teste da Cloudflare `1x00000000000000000000AA` (sempre aprova).

## Keep-alive do Supabase

No plano gratuito, o Supabase **pausa o projeto depois de cerca de 1 semana sem uso** (o site para de carregar preços e de receber pedidos). O workflow [.github/workflows/keepalive.yml](.github/workflows/keepalive.yml) evita isso:

- Roda **todo dia às 08:00 (Cuiabá)** e também manualmente (*Actions → Supabase keep-alive → Run workflow*).
- Faz uma leitura leve e pública (1 linha da tabela `experiences`) com a chave pública.
- Usa as **mesmas** variáveis da publicação: `VITE_SUPABASE_URL` (Repository variable) e `VITE_SUPABASE_ANON_KEY` (Repository secret). Não é preciso criar nada novo.
- Se falhar, o GitHub envia e-mail e a execução aparece em vermelho na aba Actions.

**Atenção:** em repositório público, o GitHub **desativa workflows agendados depois de 60 dias sem atividade no repositório** (sem push). Ele avisa por e-mail antes; basta clicar em *Enable workflow* na aba Actions ou fazer qualquer push.

## Banco de dados

Migrações em [supabase/migrations](supabase/migrations), executadas manualmente no SQL Editor do Supabase. Controle do que já foi aplicado em [supabase/MIGRACOES.md](supabase/MIGRACOES.md).

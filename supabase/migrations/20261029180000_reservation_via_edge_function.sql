-- Pedidos de reserva passam a entrar SOMENTE pela Edge Function "submit-reservation",
-- que confere o captcha (Cloudflare Turnstile) antes de gravar.
-- Visitantes (anon) e usuários logados (authenticated) deixam de poder chamar a função direto.
--
-- ORDEM OBRIGATÓRIA (senão o formulário do site para de funcionar):
--   1. Edge Function publicada e TURNSTILE_SECRET_KEY cadastrado no Supabase
--   2. Variável VITE_TURNSTILE_SITE_KEY criada no GitHub e site novo publicado
--   3. Pedido de teste pelo site publicado funcionando
--   4. SÓ ENTÃO rodar este arquivo no SQL Editor
--
-- Para desfazer (voltar ao comportamento anterior):
--   grant execute on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) to anon, authenticated;

revoke execute on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) from anon, authenticated;
grant execute on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) to service_role;

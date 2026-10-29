-- Correção 1: a data de chegada passa a ser comparada com o fuso de Cuiabá
--   (antes usava a data de Greenwich e recusava "hoje" depois das 20h).
-- Correção 2: limite simples de pedidos por hora, contra spam e inundação.
-- Rodar uma vez no SQL Editor do Supabase. Salvar em supabase/migrations/.

create or replace function public.create_reservation_request(
  p_guest_name text,
  p_whatsapp text,
  p_email text,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_message text,
  p_experience_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_today date := (now() at time zone 'America/Cuiaba')::date;
begin
  if p_check_in < v_today then
    raise exception 'A data de chegada não pode estar no passado';
  end if;

  -- Limites por hora (ajuste os números se a pousada receber muitos pedidos legítimos)
  if (select count(*) from public.reservation_requests
      where whatsapp = trim(p_whatsapp) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Muitos pedidos em pouco tempo. Tente novamente mais tarde.';
  end if;

  if (select count(*) from public.reservation_requests
      where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Muitos pedidos em pouco tempo. Tente novamente mais tarde.';
  end if;

  insert into public.reservation_requests
    (user_id, guest_name, whatsapp, email, check_in, check_out, guests, message)
  values
    (auth.uid(), trim(p_guest_name), trim(p_whatsapp), nullif(trim(p_email), ''),
     p_check_in, p_check_out, p_guests, nullif(trim(p_message), ''))
  returning id into v_id;

  insert into public.reservation_experiences (reservation_id, experience_id)
  select v_id, e.id
  from public.experiences e
  where e.id = any (coalesce(p_experience_ids, '{}')) and e.active;

  return v_id;
end;
$$;

-- "create or replace" mantém as permissões anteriores; reafirmamos para ficar explícito.
revoke all on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) from public;
grant execute on function public.create_reservation_request(text, text, text, date, date, integer, text, uuid[]) to anon, authenticated;

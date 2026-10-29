-- Regra de transição de status dos pedidos, garantida pelo banco (não só pelo painel).
-- Permitido:
--   interesse  -> confirmada | cancelada
--   confirmada -> concluida  | cancelada
--   cancelada  -> interesse  (reabrir)
--   concluida  -> (nenhuma)
-- Rodar uma vez no SQL Editor do Supabase. Salvar em supabase/migrations/.
-- Atenção: vale para qualquer UPDATE, inclusive feito pelo SQL Editor.

create function public.check_reservation_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and not (
       (old.status = 'interesse'  and new.status in ('confirmada', 'cancelada'))
    or (old.status = 'confirmada' and new.status in ('concluida', 'cancelada'))
    or (old.status = 'cancelada'  and new.status = 'interesse')
  ) then
    raise exception 'Transição de status não permitida: % -> %', old.status, new.status
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger reservation_requests_status_transition
  before update of status on public.reservation_requests
  for each row execute function public.check_reservation_status_transition();

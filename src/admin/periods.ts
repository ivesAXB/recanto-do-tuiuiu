import { supabase } from '../lib/supabase'
import { StaleError } from './errors'

export type PeriodKind = 'defeso' | 'bloqueio'

export type ClosedPeriod = {
  id: string
  kind: PeriodKind
  starts_on: string
  ends_on: string
  label: string | null
}

export type PeriodInput = Omit<ClosedPeriod, 'id'>

export const KIND_LABEL: Record<PeriodKind, string> = {
  defeso: 'Defeso',
  bloqueio: 'Bloqueio',
}

export const KIND_HELP: Record<PeriodKind, string> = {
  defeso: 'Pesca suspensa. O hóspede pode reservar e recebe um aviso.',
  bloqueio: 'Datas indisponíveis. O site não deixa enviar pedido nessas noites.',
}

const SELECT = 'id, kind, starts_on, ends_on, label'

export async function loadPeriods(): Promise<ClosedPeriod[]> {
  const { data, error } = await supabase.from('closed_periods').select(SELECT).order('starts_on')
  if (error) throw error
  return data as ClosedPeriod[]
}

export async function savePeriod(input: PeriodInput, id?: string): Promise<ClosedPeriod> {
  const query = id
    ? supabase.from('closed_periods').update(input).eq('id', id)
    : supabase.from('closed_periods').insert(input)
  const { data, error } = await query.select(SELECT).maybeSingle()
  if (error) throw error
  if (!data) throw new StaleError()
  return data as ClosedPeriod
}

export async function deletePeriod(id: string): Promise<void> {
  const { data, error } = await supabase.from('closed_periods').delete().eq('id', id).select('id')
  if (error) throw error
  if (!data?.length) throw new StaleError()
}

export type ConfirmedMatch = { id: string; guest_name: string; check_in: string; check_out: string; guests: number }

// Confirmed requests with at least one night inside the block (same rule as the booking form)
export async function loadConfirmedInPeriod(p: PeriodInput): Promise<ConfirmedMatch[]> {
  const { data, error } = await supabase
    .from('reservation_requests')
    .select('id, guest_name, check_in, check_out, guests')
    .eq('status', 'confirmada')
    .lte('check_in', p.ends_on)
    .gt('check_out', p.starts_on)
    .order('check_in')
  if (error) throw error
  return data as ConfirmedMatch[]
}

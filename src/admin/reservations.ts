import { supabase } from '../lib/supabase'
import { addDays, toBR } from '../lib/dates'
import { StaleError } from './errors'

export type Status = 'interesse' | 'confirmada' | 'concluida' | 'cancelada'

export const STATUSES: Status[] = ['interesse', 'confirmada', 'concluida', 'cancelada']

export const STATUS_LABEL: Record<Status, string> = {
  interesse: 'Interesse',
  confirmada: 'Confirmada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

// Allowed status changes (also enforced by the database trigger in migration 20261029120000)
export const TRANSITIONS: Record<Status, { to: Status; label: string }[]> = {
  interesse: [
    { to: 'confirmada', label: 'Confirmar pedido' },
    { to: 'cancelada', label: 'Cancelar pedido' },
  ],
  confirmada: [
    { to: 'concluida', label: 'Marcar como concluída' },
    { to: 'cancelada', label: 'Cancelar pedido' },
  ],
  cancelada: [{ to: 'interesse', label: 'Reabrir pedido' }],
  concluida: [],
}

export type Reservation = {
  id: string
  guest_name: string
  whatsapp: string
  email: string | null
  check_in: string
  check_out: string
  guests: number
  status: Status
  deposit_paid: boolean
  message: string | null
  admin_notes: string | null
  created_at: string
  experiences: string[]
}

export type Overlap = Pick<Reservation, 'id' | 'guest_name' | 'check_in' | 'check_out' | 'guests'>

const SELECT =
  'id, guest_name, whatsapp, email, check_in, check_out, guests, status, deposit_paid, message, admin_notes, created_at, reservation_experiences(experiences(name))'

type Row = Omit<Reservation, 'experiences'> & {
  reservation_experiences: { experiences: { name: string } | null }[] | null
}

const fromRow = ({ reservation_experiences, ...rest }: Row): Reservation => ({
  ...rest,
  experiences: (reservation_experiences ?? []).map((re) => re.experiences?.name).filter((n): n is string => !!n),
})

export async function loadReservations(filter: Status | 'todos'): Promise<Reservation[]> {
  let query = supabase.from('reservation_requests').select(SELECT).order('created_at', { ascending: false }).limit(200)
  if (filter !== 'todos') query = query.eq('status', filter)
  const { data, error } = await query
  if (error) throw error
  return (data as unknown as Row[]).map(fromRow)
}

export async function loadCounts(): Promise<Record<Status, number>> {
  const results = await Promise.all(
    STATUSES.map((s) => supabase.from('reservation_requests').select('id', { count: 'exact', head: true }).eq('status', s)),
  )
  const counts = {} as Record<Status, number>
  results.forEach((r, i) => {
    if (r.error) throw r.error
    counts[STATUSES[i]] = r.count ?? 0
  })
  return counts
}

export async function loadCapacity(): Promise<number> {
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'capacidade_maxima').maybeSingle()
  const value = Number(data?.value)
  return Number.isFinite(value) && value > 0 ? value : 18
}

type Patch = Partial<Pick<Reservation, 'status' | 'deposit_paid' | 'admin_notes'>>

// expectedStatus: only apply if the status in the database is still the one on screen.
// Zero rows changed (stale status or silent RLS refusal) throws StaleError.
export async function updateReservation(id: string, patch: Patch, expectedStatus?: Status): Promise<Reservation> {
  let query = supabase.from('reservation_requests').update(patch).eq('id', id)
  if (expectedStatus) query = query.eq('status', expectedStatus)
  const { data, error } = await query.select(SELECT).maybeSingle()
  if (error) throw error
  if (!data) throw new StaleError()
  return fromRow(data as unknown as Row)
}

// Other confirmed requests sharing at least one night with this one
export async function loadOverlaps(r: Reservation): Promise<Overlap[]> {
  const { data, error } = await supabase
    .from('reservation_requests')
    .select('id, guest_name, check_in, check_out, guests')
    .eq('status', 'confirmada')
    .neq('id', r.id)
    .lt('check_in', r.check_out)
    .gt('check_out', r.check_in)
    .order('check_in')
  if (error) throw error
  return data as Overlap[]
}

// Guests per night (not a plain sum: two overlaps may not overlap each other)
export function nightsOverCapacity(r: Reservation, overlaps: Overlap[], capacity: number) {
  const over: { night: string; total: number }[] = []
  for (let night = r.check_in; night < r.check_out; night = addDays(night, 1)) {
    const total = overlaps
      .filter((o) => o.check_in <= night && night < o.check_out)
      .reduce((sum, o) => sum + o.guests, r.guests)
    if (total > capacity) over.push({ night, total })
  }
  return over
}

export function guestWhatsAppHref(r: Reservation) {
  let digits = r.whatsapp.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
  const firstName = r.guest_name.trim().split(/\s+/)[0]
  const text =
    `Olá, ${firstName}! Aqui é da Pousada Recanto do Tuiuiú. ` +
    `Recebemos seu pedido de reserva de ${toBR(r.check_in)} a ${toBR(r.check_out)}, ` +
    `para ${r.guests} ${r.guests === 1 ? 'pessoa' : 'pessoas'}. Podemos conversar sobre os detalhes?`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

const createdFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Cuiaba',
  dateStyle: 'short',
  timeStyle: 'short',
})
export const formatCreatedAt = (iso: string) => createdFormat.format(new Date(iso))

import { supabase } from '../lib/supabase'
import { StaleError } from './errors'

// A tour = one row of reservation_experiences. Rows created by the booking form have no date yet.
export type Tour = {
  id: string
  experience_id: string
  scheduled_on: string | null
  quantity: number
  notes: string | null
  experience_name: string
}

export type TourInput = Pick<Tour, 'experience_id' | 'scheduled_on' | 'quantity' | 'notes'>

const SELECT = 'id, experience_id, scheduled_on, quantity, notes, experiences(name)'

type Row = Omit<Tour, 'experience_name'> & { experiences: { name: string } | null }

const fromRow = ({ experiences, ...rest }: Row): Tour => ({ ...rest, experience_name: experiences?.name ?? 'Experiência' })

export async function loadTours(reservationId: string): Promise<Tour[]> {
  const { data, error } = await supabase
    .from('reservation_experiences')
    .select(SELECT)
    .eq('reservation_id', reservationId)
    .order('scheduled_on', { ascending: true, nullsFirst: true })
  if (error) throw error
  return (data as unknown as Row[]).map(fromRow)
}

export async function saveTour(reservationId: string, input: TourInput, id?: string): Promise<Tour> {
  const query = id
    ? supabase.from('reservation_experiences').update(input).eq('id', id).eq('reservation_id', reservationId)
    : supabase.from('reservation_experiences').insert({ ...input, reservation_id: reservationId })
  const { data, error } = await query.select(SELECT).maybeSingle()
  if (error) throw error
  if (!data) throw new StaleError()
  return fromRow(data as unknown as Row)
}

export async function deleteTour(id: string): Promise<void> {
  const { data, error } = await supabase.from('reservation_experiences').delete().eq('id', id).select('id')
  if (error) throw error
  if (!data?.length) throw new StaleError()
}

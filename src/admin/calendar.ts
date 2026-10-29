import { supabase } from '../lib/supabase'
import { addDays, daysInMonth } from '../lib/dates'
import type { ClosedPeriod } from './periods'

export type Stay = { id: string; guest_name: string; check_in: string; check_out: string; guests: number }

export type CalendarDay = {
  iso: string
  day: number
  guests: number // guests sleeping there that night (confirmed only)
  over: boolean
  defeso: boolean
  bloqueio: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')
export const monthStart = (year: number, month: number) => `${year}-${pad(month)}-01`
export const monthEnd = (year: number, month: number) => `${year}-${pad(month)}-${pad(daysInMonth(year, month))}`

// Confirmed stays touching the month (including check-out days) and periods overlapping it
export async function loadMonth(year: number, month: number) {
  const first = monthStart(year, month)
  const last = monthEnd(year, month)
  const [stays, periods] = await Promise.all([
    supabase
      .from('reservation_requests')
      .select('id, guest_name, check_in, check_out, guests')
      .eq('status', 'confirmada')
      .lte('check_in', last)
      .gte('check_out', first)
      .order('check_in'),
    supabase.from('closed_periods').select('id, kind, starts_on, ends_on, label').lte('starts_on', last).gte('ends_on', first),
  ])
  if (stays.error) throw stays.error
  if (periods.error) throw periods.error
  return { stays: stays.data as Stay[], periods: periods.data as ClosedPeriod[] }
}

// A night "d" belongs to a stay when check_in <= d < check_out (check-out day has no night)
export const sleepsOn = (s: Stay, iso: string) => s.check_in <= iso && iso < s.check_out

export function buildMonth(year: number, month: number, stays: Stay[], periods: ClosedPeriod[], capacity: number) {
  const days: CalendarDay[] = []
  for (let iso = monthStart(year, month), day = 1; day <= daysInMonth(year, month); iso = addDays(iso, 1), day++) {
    const guests = stays.filter((s) => sleepsOn(s, iso)).reduce((sum, s) => sum + s.guests, 0)
    const inKind = (kind: ClosedPeriod['kind']) => periods.some((p) => p.kind === kind && p.starts_on <= iso && iso <= p.ends_on)
    days.push({ iso, day, guests, over: guests > capacity, defeso: inKind('defeso'), bloqueio: inKind('bloqueio') })
  }
  return days
}

// Stays related to a day: sleeping there, arriving or leaving
export function staysOn(stays: Stay[], iso: string) {
  return stays
    .filter((s) => s.check_in <= iso && iso <= s.check_out)
    .map((s) => ({ ...s, arriving: s.check_in === iso, leaving: s.check_out === iso }))
}

import { supabase } from './supabase'

// Next (or current) defeso registered in the admin panel. Never hardcoded: the dates change every year.
export type Defeso = { starts_on: string; ends_on: string }

export const todayISO = () => new Date().toLocaleDateString('en-CA') // AAAA-MM-DD no fuso local
export const toBR = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')

export async function loadNextDefeso(): Promise<Defeso | null> {
  const { data, error } = await supabase
    .from('closed_periods')
    .select('starts_on, ends_on')
    .eq('kind', 'defeso')
    .gte('ends_on', todayISO())
    .order('starts_on')
    .limit(1)
    .maybeSingle()
  if (error) console.error('Erro ao carregar defeso:', error)
  return data ?? null
}

export function defesoMessage(defeso: Defeso): string {
  return defeso.starts_on <= todayISO()
    ? `Estamos no defeso (piracema) até ${toBR(defeso.ends_on)}. A pesca está suspensa, e a pousada oferece contemplação da natureza.`
    : `Próximo defeso: de ${toBR(defeso.starts_on)} a ${toBR(defeso.ends_on)}. Nesse período a pesca fica suspensa.`
}

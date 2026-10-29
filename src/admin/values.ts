import { supabase } from '../lib/supabase'
import { StaleError } from './errors'

export type Unit = 'por_pessoa_dia' | 'por_barco_dia' | 'por_barco' | 'sob_cotacao'

export const UNITS: Unit[] = ['por_pessoa_dia', 'por_barco_dia', 'por_barco', 'sob_cotacao']

export const UNIT_LABEL: Record<Unit, string> = {
  por_pessoa_dia: 'por pessoa/dia',
  por_barco_dia: 'por barco/dia',
  por_barco: 'por barco',
  sob_cotacao: 'sob cotação',
}

export type Experience = {
  id: string
  slug: string
  name: string
  description: string | null
  price_cents: number | null // null = sob cotação
  unit: Unit
  max_people: number | null
  active: boolean
  sort_order: number
}

export type ExperienceInput = Omit<Experience, 'id' | 'slug'>

const EXP_SELECT = 'id, slug, name, description, price_cents, unit, max_people, active, sort_order'

export async function loadExperiences(): Promise<Experience[]> {
  // Admin RLS policy also returns inactive ones
  const { data, error } = await supabase.from('experiences').select(EXP_SELECT).order('sort_order').order('name')
  if (error) throw error
  return data as Experience[]
}

// The slug is created from the name once and never changes afterwards (stable identifier)
export async function saveExperience(input: ExperienceInput, id?: string): Promise<Experience> {
  const query = id
    ? supabase.from('experiences').update(input).eq('id', id)
    : supabase.from('experiences').insert({ ...input, slug: slugify(input.name) })
  const { data, error } = await query.select(EXP_SELECT).maybeSingle()
  if (error) throw error
  if (!data) throw new StaleError()
  return data as Experience
}

export async function setExperienceActive(id: string, active: boolean): Promise<void> {
  const { data, error } = await supabase.from('experiences').update({ active }).eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new StaleError()
}

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// "350", "350,5", "350,00", "1.234,56", "R$ 1234,56" -> cents. Returns null when invalid.
export function parseBRL(text: string): number | null {
  const t = text.replace(/R\$/i, '').replace(/\s/g, '')
  if (!/^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/.test(t)) return null
  const [int, dec = ''] = t.replace(/\./g, '').split(',')
  return Number(int) * 100 + Number(dec.padEnd(2, '0'))
}

// cents -> "1.234,56" for editing in an input
export const centsToInput = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100)

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const formatBRL = (cents: number) => brl.format(cents / 100)

// ---- site_settings ----

export type SettingKey = 'diaria_hospedagem_cents' | 'sinal_percentual' | 'capacidade_maxima'

export async function loadSettings(): Promise<Partial<Record<SettingKey, unknown>>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['diaria_hospedagem_cents', 'sinal_percentual', 'capacidade_maxima'])
  if (error) throw error
  return Object.fromEntries(data.map((row) => [row.key, row.value]))
}

// Keeps the JSON type already stored (number stays number, string stays string)
export async function saveSetting(key: SettingKey, value: number, current: unknown): Promise<unknown> {
  const stored = typeof current === 'string' ? String(value) : value
  const { data, error } = await supabase
    .from('site_settings')
    .update({ value: stored, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select('value')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new StaleError()
  return data.value
}

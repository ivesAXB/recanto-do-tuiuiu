// Dates are kept as local "YYYY-MM-DD" strings to avoid timezone off-by-one bugs

export const todayISO = () => new Date().toLocaleDateString('en-CA')

const toUTC = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export const addDays = (iso: string, days: number) => new Date(toUTC(iso) + days * 86_400_000).toISOString().slice(0, 10)

export const nightsBetween = (from: string, to: string) => Math.round((toUTC(to) - toUTC(from)) / 86_400_000)

export const toBR = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')

// Today in the pousada's timezone (Cuiabá), regardless of the visitor's device
export const todayCuiabaISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba' }).format(new Date())

// 0 = Sunday. Computed in UTC from the string, so no timezone shift.
export const weekdayOf = (iso: string) => new Date(toUTC(iso)).getUTCDay()

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate() // month: 1-12

export const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

import { useEffect, useState } from 'react'
import { MONTH_NAMES, toBR, todayCuiabaISO, weekdayOf } from '../lib/dates'
import { friendlyError } from './errors'
import { KIND_LABEL } from './periods'
import { loadCapacity } from './reservations'
import { buildMonth, loadMonth, monthStart, staysOn, type Stay } from './calendar'
import type { ClosedPeriod } from './periods'
import { ghostButton } from './ui'

type Loaded = { key: string; stays: Stay[]; periods: ClosedPeriod[]; error: string | null }

const WEEKDAYS = [
  ['D', 'domingo'],
  ['S', 'segunda'],
  ['T', 'terça'],
  ['Q', 'quarta'],
  ['Q', 'quinta'],
  ['S', 'sexta'],
  ['S', 'sábado'],
]

export default function CalendarPanel() {
  const [today] = useState(todayCuiabaISO)
  const [ym, setYm] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }))
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [capacity, setCapacity] = useState(18)
  const [selected, setSelected] = useState<string | null>(today)

  const key = `${ym.year}-${ym.month}`
  useEffect(() => {
    let cancelled = false
    loadMonth(ym.year, ym.month)
      .then(({ stays, periods }) => !cancelled && setLoaded({ key, stays, periods, error: null }))
      .catch(
        (err) =>
          !cancelled &&
          setLoaded({ key, stays: [], periods: [], error: friendlyError(err, 'Não foi possível carregar o calendário.') }),
      )
    return () => {
      cancelled = true
    }
  }, [ym.year, ym.month, key])

  useEffect(() => {
    loadCapacity().then(setCapacity)
  }, [])

  const current = loaded?.key === key ? loaded : null
  const days = current ? buildMonth(ym.year, ym.month, current.stays, current.periods, capacity) : []
  const blanks = weekdayOf(monthStart(ym.year, ym.month))
  const cells: (typeof days[number] | null)[] = [...Array(blanks).fill(null), ...days]
  while (cells.length % 7) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  const selectedInMonth = selected?.startsWith(monthStart(ym.year, ym.month).slice(0, 8)) ? selected : null
  const dayStays = current && selectedInMonth ? staysOn(current.stays, selectedInMonth) : []
  const dayPeriods =
    current && selectedInMonth ? current.periods.filter((p) => p.starts_on <= selectedInMonth && selectedInMonth <= p.ends_on) : []
  const dayInfo = days.find((d) => d.iso === selectedInMonth)

  function move(delta: number) {
    setYm(({ year, month }) => {
      const m = month + delta
      return m < 1 ? { year: year - 1, month: 12 } : m > 12 ? { year: year + 1, month: 1 } : { year, month: m }
    })
    setSelected(null)
  }

  return (
    <section aria-labelledby="calendar-title">
      <h2 id="calendar-title" className="font-display text-3xl">
        Calendário de hospedagens
      </h2>
      <p className="mt-2 max-w-2xl text-sand-300">
        Pessoas por noite nas reservas confirmadas. Toque em um dia para ver quem está hospedado.
      </p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => move(-1)} className={ghostButton} aria-label="Mês anterior">
          ‹ <span className="hidden sm:inline">&nbsp;Anterior</span>
        </button>
        <p aria-live="polite" className="text-center font-display text-2xl capitalize">
          {MONTH_NAMES[ym.month - 1]} de {ym.year}
        </p>
        <button type="button" onClick={() => move(1)} className={ghostButton} aria-label="Próximo mês">
          <span className="hidden sm:inline">Próximo&nbsp;</span> ›
        </button>
      </div>

      <div aria-live="polite" className="mt-4">
        {!current && <p className="text-sand-300">Carregando…</p>}
        {current?.error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{current.error}</p>}
      </div>

      {current && !current.error && (
        <>
          <table className="mt-2 w-full table-fixed border-separate border-spacing-1">
            <thead>
              <tr>
                {WEEKDAYS.map(([short, full]) => (
                  <th key={full} scope="col" className="pb-1 text-xs font-bold text-sand-300">
                    <abbr title={full} className="no-underline">
                      {short}
                    </abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((d, di) =>
                    d ? (
                      <td key={d.iso} className="p-0">
                        <button
                          type="button"
                          aria-pressed={selected === d.iso}
                          aria-label={[
                            `${d.day} de ${MONTH_NAMES[ym.month - 1]}`,
                            d.guests ? `${d.guests} ${d.guests === 1 ? 'pessoa' : 'pessoas'}` : 'sem hóspedes',
                            d.over && 'passa da capacidade',
                            d.defeso && 'defeso',
                            d.bloqueio && 'bloqueio',
                            d.iso === today && 'hoje',
                          ]
                            .filter(Boolean)
                            .join(', ')}
                          onClick={() => setSelected(d.iso)}
                          className={`relative flex min-h-14 w-full flex-col items-center justify-start overflow-hidden rounded-lg pt-1 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 md:min-h-20 md:text-base ${
                            d.over ? 'bg-tuiuiu-500/40' : d.guests ? 'bg-forest-700' : 'bg-forest-800'
                          } ${selected === d.iso ? 'ring-2 ring-sand-100' : ''}`}
                        >
                          <span className={d.iso === today ? 'rounded-full bg-gold-400 px-1.5 font-bold text-forest-900' : ''}>
                            {d.day}
                          </span>
                          {d.guests > 0 && <span className="mt-0.5 text-xs font-bold md:text-sm">{d.guests}p</span>}
                          {/* Period stripes at the bottom of the cell */}
                          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 flex">
                            {d.defeso && <span className="h-1.5 flex-1 bg-gold-400" />}
                            {d.bloqueio && <span className="h-1.5 flex-1 bg-tuiuiu-500" />}
                          </span>
                        </button>
                      </td>
                    ) : (
                      <td key={`blank-${wi}-${di}`} />
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand-300">
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-1.5 w-8 rounded bg-gold-400" /> Defeso
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-1.5 w-8 rounded bg-tuiuiu-500" /> Bloqueio
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block size-4 rounded bg-tuiuiu-500/40" /> Acima de {capacity} pessoas
            </li>
            <li>"12p" = 12 pessoas na noite</li>
          </ul>

          <div aria-live="polite" className="mt-8">
            {selectedInMonth && dayInfo && (
              <div className="rounded-3xl bg-forest-800 p-6">
                <h3 className="font-display text-2xl">{toBR(selectedInMonth)}</h3>
                <p className={`mt-1 ${dayInfo.over ? 'font-bold text-[#ff8a80]' : 'text-sand-300'}`}>
                  {dayInfo.guests} {dayInfo.guests === 1 ? 'pessoa' : 'pessoas'} na noite
                  {dayInfo.over ? ` (passa da capacidade de ${capacity})` : ''}
                </p>
                {dayPeriods.map((p) => (
                  <p key={p.id} className="mt-2">
                    <b>{KIND_LABEL[p.kind]}:</b> {toBR(p.starts_on)} a {toBR(p.ends_on)}
                    {p.label ? ` (${p.label})` : ''}
                  </p>
                ))}
                {dayStays.length === 0 ? (
                  <p className="mt-4 text-sand-300">Nenhuma hospedagem confirmada neste dia.</p>
                ) : (
                  <ul className="mt-4 grid gap-2">
                    {dayStays.map((s) => (
                      <li key={s.id} className="rounded-2xl bg-forest-950/60 p-4">
                        <p className="font-bold">
                          {s.guest_name} · {s.guests} {s.guests === 1 ? 'pessoa' : 'pessoas'}
                        </p>
                        <p className="text-sm text-sand-300">
                          {toBR(s.check_in)} a {toBR(s.check_out)}
                          {s.arriving ? ' · chega neste dia' : ''}
                          {s.leaving ? ' · sai neste dia' : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

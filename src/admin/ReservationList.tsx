import { useEffect, useRef, useState } from 'react'
import { nightsBetween, toBR } from '../lib/dates'
import {
  STATUSES,
  STATUS_LABEL,
  formatCreatedAt,
  loadCapacity,
  loadCounts,
  loadReservations,
  type Reservation,
  type Status,
} from './reservations'
import ReservationDetail from './ReservationDetail'
import StatusBadge from './StatusBadge'
import { STALE_MESSAGE, friendlyError } from './errors'

type Filter = Status | 'todos'

type ListResult = { key: string; filter: Filter; items: Reservation[]; error: string | null }

const nightsText = (r: Reservation) => {
  const n = nightsBetween(r.check_in, r.check_out)
  return `${n} ${n === 1 ? 'noite' : 'noites'}`
}
const guestsText = (n: number) => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`
const depositText = (paid: boolean) => (paid ? 'Sinal pago' : 'Sinal pendente')

const matches = (r: Reservation, query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const digits = q.replace(/\D/g, '')
  return r.guest_name.toLowerCase().includes(q) || (digits.length > 0 && r.whatsapp.replace(/\D/g, '').includes(digits))
}

const controlClass =
  'min-h-11 rounded-full px-4 font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400'

export default function ReservationList() {
  const [filter, setFilter] = useState<Filter>('interesse')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)
  const [counts, setCounts] = useState<Record<Status, number> | null>(null)
  const [capacity, setCapacity] = useState(18)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listNotice, setListNotice] = useState<string | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const key = `${filter}:${reloadKey}`

  useEffect(() => {
    let cancelled = false
    loadReservations(filter)
      .then((items) => !cancelled && setResult({ key, filter, items, error: null }))
      .catch(
        (err) =>
          !cancelled && setResult({ key, filter, items: [], error: friendlyError(err, 'Não foi possível carregar os pedidos.') }),
      )
    return () => {
      cancelled = true
    }
  }, [filter, key])

  useEffect(() => {
    loadCounts()
      .then(setCounts)
      .catch((err) => friendlyError(err))
  }, [reloadKey])

  useEffect(() => {
    loadCapacity().then(setCapacity)
  }, [])

  const loading = result?.key !== key
  // While reloading the same filter, keep showing the previous items instead of an empty list
  const items = result && (!loading || result.filter === filter) ? result.items : []
  const visible = items.filter((r) => matches(r, query))
  const selected = items.find((r) => r.id === selectedId) ?? null

  function open(id: string, el: HTMLElement) {
    opener.current = el
    setListNotice(null)
    setSelectedId(id)
  }

  function reload() {
    setListNotice(null)
    setReloadKey((k) => k + 1)
  }

  // The request changed on the server: close the detail, warn and reload (it may have left this filter)
  function handleStale() {
    setSelectedId(null)
    setListNotice(STALE_MESSAGE)
    setReloadKey((k) => k + 1)
    requestAnimationFrame(() => document.getElementById('reservation-list-status')?.focus())
  }

  function close() {
    setSelectedId(null)
    requestAnimationFrame(() => opener.current?.focus())
  }

  // Keep the item in place (even if it no longer matches the filter) and refresh the counts
  function handleUpdated(updated: Reservation) {
    setResult((r) => r && { ...r, items: r.items.map((i) => (i.id === updated.id ? updated : i)) })
    loadCounts()
      .then(setCounts)
      .catch((err) => friendlyError(err))
  }

  const total = counts ? STATUSES.reduce((s, k) => s + counts[k], 0) : null

  return (
    <div>
      <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
        {(['todos', ...STATUSES] as Filter[]).map((f) => {
          const count = f === 'todos' ? total : counts?.[f]
          return (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`${controlClass} ${filter === f ? 'bg-gold-400 text-forest-900' : 'bg-sand-100/10'}`}
            >
              {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
              {count !== null && count !== undefined && <span className="ml-1 font-normal">({count})</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="reservation-search" className="block font-bold">
            Buscar por nome ou WhatsApp
          </label>
          <input
            id="reservation-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 block min-h-12 w-full rounded-xl border border-sand-100/25 bg-forest-950 px-4 text-base text-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          />
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className={`${controlClass} min-h-12 border border-sand-100/40 px-6 disabled:opacity-50`}
        >
          {loading ? 'Carregando…' : 'Atualizar'}
        </button>
      </div>

      <div id="reservation-list-status" tabIndex={-1} aria-live="polite" className="mt-6 space-y-3 focus:outline-none">
        {listNotice && <p className="rounded-2xl border border-gold-400/60 p-4 font-bold">{listNotice}</p>}
        {loading && <p className="text-sand-300">Carregando pedidos…</p>}
        {!loading && result.error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{result.error}</p>}
        {!loading && !result.error && (
          <p className="text-sm text-sand-300">
            {visible.length === 0
              ? 'Nenhum pedido encontrado.'
              : `${visible.length} ${visible.length === 1 ? 'pedido' : 'pedidos'}${items.length === 200 ? ' (mostrando os 200 mais recentes)' : ''}`}
          </p>
        )}
      </div>

      {/* Mobile: cards */}
      <ul className="mt-4 grid gap-3 md:hidden">
        {visible.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={(e) => open(r.id, e.currentTarget)}
              className="block w-full rounded-2xl bg-forest-800 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-display text-2xl">{r.guest_name}</span>
                <StatusBadge status={r.status} />
              </span>
              <span className="mt-2 block">
                {toBR(r.check_in)} a {toBR(r.check_out)} · {nightsText(r)} · {guestsText(r.guests)}
              </span>
              <span className="mt-1 block text-sm text-sand-300">
                {depositText(r.deposit_paid)} · {r.experiences.length ? r.experiences.join(', ') : 'Só hospedagem'}
              </span>
              <span className="mt-1 block text-sm text-sand-300">Chegou em {formatCreatedAt(r.created_at)}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* md and up: table */}
      {visible.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto rounded-2xl bg-forest-800 md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-xs tracking-[0.1em] text-sand-300">
              <tr>
                <th scope="col" className="p-4">NOME</th>
                <th scope="col" className="p-4">DATAS</th>
                <th scope="col" className="p-4">PESSOAS</th>
                <th scope="col" className="p-4">STATUS</th>
                <th scope="col" className="p-4">SINAL</th>
                <th scope="col" className="p-4">EXPERIÊNCIAS</th>
                <th scope="col" className="p-4">CHEGOU EM</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr
                  key={r.id}
                  onClick={(e) => open(r.id, e.currentTarget.querySelector('button') ?? e.currentTarget)}
                  className="cursor-pointer border-t border-sand-100/10 hover:bg-sand-100/5"
                >
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        open(r.id, e.currentTarget)
                      }}
                      className="min-h-11 rounded-lg px-2 text-left text-base font-bold underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                    >
                      {r.guest_name}
                    </button>
                  </td>
                  <td className="p-4">
                    {toBR(r.check_in)} a {toBR(r.check_out)}
                    <span className="block text-sand-300">{nightsText(r)}</span>
                  </td>
                  <td className="p-4">{r.guests}</td>
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-4">{r.deposit_paid ? 'Pago' : 'Pendente'}</td>
                  <td className="p-4">{r.experiences.length ? r.experiences.join(', ') : 'Só hospedagem'}</td>
                  <td className="p-4 text-sand-300">{formatCreatedAt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ReservationDetail
          reservation={selected}
          capacity={capacity}
          onClose={close}
          onUpdated={handleUpdated}
          onStale={handleStale}
        />
      )}
    </div>
  )
}

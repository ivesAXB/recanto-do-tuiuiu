import { useEffect, useRef, useState, type ReactNode } from 'react'
import { nightsBetween, toBR } from '../lib/dates'
import {
  STATUS_LABEL,
  TRANSITIONS,
  formatCreatedAt,
  guestWhatsAppHref,
  loadOverlaps,
  loadReservation,
  nightsOverCapacity,
  updateReservation,
  type Overlap,
  type Reservation,
  type Status,
} from './reservations'
import StatusBadge from './StatusBadge'
import ReservationTours from './ReservationTours'
import { StaleError, friendlyError } from './errors'

type Props = {
  reservation: Reservation
  capacity: number
  onClose: () => void
  onUpdated: (r: Reservation) => void
  onStale: () => void
}

type OverlapResult = { key: string; items: Overlap[]; error: boolean }

const buttonClass =
  'min-h-12 rounded-full px-6 font-bold transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900'

// All guest-provided text is rendered as plain React text (escaped). Never use dangerouslySetInnerHTML here.
export default function ReservationDetail({ reservation: r, capacity, onClose, onUpdated, onStale }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const discardBox = useRef<HTMLDivElement>(null)

  const [saving, setSaving] = useState<null | 'status' | 'deposit' | 'notes'>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [notes, setNotes] = useState(r.admin_notes ?? '')
  const [overlaps, setOverlaps] = useState<OverlapResult | null>(null)

  const notesDirty = notes !== (r.admin_notes ?? '')

  // Native modal dialog: traps focus and makes the page behind it inert
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    el.showModal()
    heading.current?.focus()
    return () => el.close()
  }, [])

  useEffect(() => {
    if (confirmDiscard) discardBox.current?.focus()
  }, [confirmDiscard])

  // Overlap warning only matters before/after confirming
  const checkOverlaps = r.status === 'interesse' || r.status === 'confirmada'
  const overlapKey = `${r.id}:${r.check_in}:${r.check_out}:${r.status}`
  useEffect(() => {
    if (!checkOverlaps) return
    let cancelled = false
    loadOverlaps(r)
      .then((items) => !cancelled && setOverlaps({ key: overlapKey, items, error: false }))
      .catch((err) => {
        console.error(err)
        if (!cancelled) setOverlaps({ key: overlapKey, items: [], error: true })
      })
    return () => {
      cancelled = true
    }
    // r is captured through overlapKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlapKey, checkOverlaps])

  function requestClose() {
    if (notesDirty) setConfirmDiscard(true)
    else onClose()
  }

  async function save(kind: 'status' | 'deposit' | 'notes', patch: Parameters<typeof updateReservation>[1], done: string) {
    setSaving(kind)
    setError(null)
    setNotice(null)
    try {
      // Status changes only apply if the database still has the status shown on screen
      const updated = await updateReservation(r.id, patch, kind === 'status' ? r.status : undefined)
      onUpdated(updated)
      if (kind === 'notes') setNotes(updated.admin_notes ?? '')
      setNotice(done)
    } catch (err) {
      if (err instanceof StaleError && kind === 'status') {
        onStale()
        return
      }
      setError(
        err instanceof StaleError ? 'Não foi possível salvar: pedido não encontrado ou sem permissão.' : friendlyError(err),
      )
    } finally {
      setSaving(null)
    }
  }

  function changeStatus(to: Status) {
    if (to === 'cancelada' && !confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setConfirmCancel(false)
    void save('status', { status: to }, `Status alterado para "${STATUS_LABEL[to]}".`)
  }

  const nights = nightsBetween(r.check_in, r.check_out)
  const currentOverlaps = checkOverlaps && overlaps?.key === overlapKey ? overlaps : null
  const over = currentOverlaps ? nightsOverCapacity(r, currentOverlaps.items, capacity) : []

  return (
    <dialog
      ref={dialog}
      aria-labelledby="reservation-detail-title"
      onCancel={(e) => {
        e.preventDefault() // Esc: go through the unsaved-notes check
        requestClose()
      }}
      className="m-0 h-full max-h-none w-full max-w-none overflow-y-auto bg-forest-900 p-0 text-sand-100 backdrop:bg-black/70 md:m-auto md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-3xl"
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="reservation-detail-title" ref={heading} tabIndex={-1} className="font-display text-3xl focus:outline-none">
              {r.guest_name}
            </h2>
            <div className="mt-2">
              <StatusBadge status={r.status} />
            </div>
          </div>
          <button type="button" onClick={requestClose} className={`${buttonClass} shrink-0 border border-sand-100/40`}>
            Fechar
          </button>
        </div>

        {confirmDiscard && (
          <div ref={discardBox} tabIndex={-1} role="alertdialog" aria-label="Anotações não salvas" className="mt-6 rounded-2xl bg-tuiuiu-500/20 p-5 focus:outline-none">
            <p className="font-bold">Há anotações não salvas. Descartar as alterações?</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onClose} className={`${buttonClass} bg-tuiuiu-500 text-white`}>
                Descartar e fechar
              </button>
              <button type="button" onClick={() => setConfirmDiscard(false)} className={`${buttonClass} border border-sand-100/40`}>
                Continuar editando
              </button>
            </div>
          </div>
        )}

        <div aria-live="polite" className="mt-4">
          {error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{error}</p>}
          {notice && <p className="rounded-2xl bg-[#2F7A52]/40 p-4 font-bold">{notice}</p>}
        </div>

        <dl className="mt-4 grid gap-4 rounded-2xl bg-sand-100 p-5 text-forest-900 sm:grid-cols-2">
          <Item term="Datas">
            {toBR(r.check_in)} a {toBR(r.check_out)} ({nights} {nights === 1 ? 'noite' : 'noites'})
          </Item>
          <Item term="Pessoas">{r.guests}</Item>
          <Item term="WhatsApp">{r.whatsapp}</Item>
          <Item term="E-mail">{r.email ?? 'Não informado'}</Item>
          <Item term="Experiências">{r.experiences.length ? r.experiences.join(', ') : 'Só hospedagem'}</Item>
          <Item term="Chegou em">{formatCreatedAt(r.created_at)}</Item>
          <div className="sm:col-span-2">
            <Item term="Mensagem do hóspede">
              <span className="whitespace-pre-wrap">{r.message ?? 'Sem mensagem.'}</span>
            </Item>
          </div>
        </dl>

        <a
          href={guestWhatsAppHref(r)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} mt-4 inline-flex w-full items-center justify-center bg-tuiuiu-500 text-white sm:w-auto`}
        >
          Abrir WhatsApp
        </a>

        {currentOverlaps && (currentOverlaps.error || currentOverlaps.items.length > 0) && (
          <div role="status" className="mt-6 rounded-2xl border border-gold-400/60 p-5">
            {currentOverlaps.error ? (
              <p>Não foi possível verificar sobreposição com outros pedidos confirmados.</p>
            ) : (
              <>
                <p className="font-bold">
                  Atenção: {currentOverlaps.items.length}{' '}
                  {currentOverlaps.items.length === 1 ? 'pedido confirmado divide' : 'pedidos confirmados dividem'} datas com este.
                </p>
                <ul className="mt-2 list-disc pl-5 text-sand-300">
                  {currentOverlaps.items.map((o) => (
                    <li key={o.id}>
                      {o.guest_name}: {toBR(o.check_in)} a {toBR(o.check_out)}, {o.guests} {o.guests === 1 ? 'pessoa' : 'pessoas'}
                    </li>
                  ))}
                </ul>
                {over.length > 0 ? (
                  <p className="mt-3 font-bold text-[#ff8a80]">
                    Passa da capacidade de {capacity} pessoas em {over.length} {over.length === 1 ? 'noite' : 'noites'}:{' '}
                    {over.map((o) => `${toBR(o.night)} (${o.total})`).join(', ')}.
                  </p>
                ) : (
                  <p className="mt-3 text-sand-300">A soma de pessoas fica dentro da capacidade de {capacity}.</p>
                )}
              </>
            )}
          </div>
        )}

        <section className="mt-8">
          <h3 className="font-display text-2xl">Status</h3>
          {TRANSITIONS[r.status].length === 0 ? (
            <p className="mt-2 text-sand-300">Pedido concluído. Não há mais mudanças de status.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {TRANSITIONS[r.status].map((t) => (
                <button
                  key={t.to}
                  type="button"
                  disabled={saving !== null}
                  onClick={() => changeStatus(t.to)}
                  className={`${buttonClass} ${t.to === 'cancelada' ? 'border border-sand-100/40' : 'bg-gold-400 text-forest-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          {confirmCancel && (
            <div role="alert" className="mt-4 rounded-2xl bg-tuiuiu-500/20 p-5">
              <p className="font-bold">Tem certeza que quer cancelar este pedido?</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => changeStatus('cancelada')}
                  className={`${buttonClass} bg-tuiuiu-500 text-white`}
                >
                  Sim, cancelar
                </button>
                <button type="button" onClick={() => setConfirmCancel(false)} className={`${buttonClass} border border-sand-100/40`}>
                  Voltar
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h3 className="font-display text-2xl">Sinal</h3>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={r.deposit_paid}
              disabled={saving !== null}
              onChange={(e) =>
                void save(
                  'deposit',
                  { deposit_paid: e.target.checked },
                  e.target.checked ? 'Sinal marcado como pago.' : 'Sinal marcado como pendente.',
                )
              }
              className="size-6 shrink-0 accent-tuiuiu-500"
            />
            <span>Sinal pago</span>
          </label>
        </section>

        {(r.status === 'confirmada' || r.status === 'concluida') && (
          // Refresh the list item so its experience names follow the tours
          <ReservationTours reservation={r} onChanged={() => loadReservation(r.id).then(onUpdated).catch(console.error)} />
        )}

        <section className="mt-8">
          <h3 className="font-display text-2xl">
            <label htmlFor="reservation-notes">Anotações internas</label>
          </h3>
          <p id="reservation-notes-hint" className="mt-1 text-sm text-sand-300">
            Só a equipe vê. O hóspede não recebe estas anotações.
          </p>
          <textarea
            id="reservation-notes"
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setNotice(null)
            }}
            aria-describedby="reservation-notes-hint"
            className="mt-2 block w-full rounded-xl border border-sand-100/25 bg-forest-950 px-4 py-3 text-base text-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          />
          <button
            type="button"
            disabled={!notesDirty || saving !== null}
            onClick={() => void save('notes', { admin_notes: notes.trim() || null }, 'Salvo.')}
            className={`${buttonClass} mt-3 bg-gold-400 text-forest-900`}
          >
            {saving === 'notes' ? 'Salvando…' : 'Salvar anotações'}
          </button>
        </section>
      </div>
    </dialog>
  )
}

function Item({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-[0.1em]">{term.toUpperCase()}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}

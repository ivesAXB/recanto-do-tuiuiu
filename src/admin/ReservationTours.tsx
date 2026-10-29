import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toBR } from '../lib/dates'
import { friendlyError } from './errors'
import { deleteTour, loadTours, saveTour, type Tour, type TourInput } from './tours'
import { loadExperiences, type Experience } from './values'
import type { Reservation } from './reservations'
import { dangerButton, errorText, ghostButton, inputClass, primaryButton } from './ui'

type Loaded = { key: string; tours: Tour[]; experiences: Experience[]; error: string | null }
type FormErrors = Partial<Record<'experience' | 'date' | 'quantity', string>>

// Tours (passeios) per day for a confirmed or completed stay. Rows come from reservation_experiences.
export default function ReservationTours({ reservation: r, onChanged }: { reservation: Reservation; onChanged: () => void }) {
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [editing, setEditing] = useState<{ tour: Tour | null } | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const key = `${r.id}:${reloadKey}`
  useEffect(() => {
    let cancelled = false
    Promise.all([loadTours(r.id), loadExperiences()])
      .then(([tours, experiences]) => !cancelled && setLoaded({ key, tours, experiences, error: null }))
      .catch(
        (err) =>
          !cancelled &&
          setLoaded({ key, tours: [], experiences: [], error: friendlyError(err, 'Não foi possível carregar os passeios.') }),
      )
    return () => {
      cancelled = true
    }
  }, [r.id, key])

  const tours = loaded?.tours ?? []
  const experiences = loaded?.experiences ?? []

  function startEdit(tour: Tour | null, el: HTMLElement) {
    opener.current = el
    setNotice(null)
    setError(null)
    setConfirmDeleteId(null)
    setEditing({ tour })
  }

  function closeForm() {
    setEditing(null)
    requestAnimationFrame(() => opener.current?.focus())
  }

  function afterChange(message: string) {
    setNotice(message)
    setReloadKey((k) => k + 1)
    onChanged()
    requestAnimationFrame(() => document.getElementById('tours-status')?.focus())
  }

  async function handleSave(input: TourInput, id?: string) {
    await saveTour(r.id, input, id) // errors are shown by the form
    setEditing(null)
    afterChange(id ? 'Passeio atualizado.' : 'Passeio agendado.')
  }

  async function handleDelete(id: string) {
    setBusy(true)
    setError(null)
    try {
      await deleteTour(id)
      afterChange('Passeio removido.')
    } catch (err) {
      setError(friendlyError(err, 'Não foi possível remover. Tente de novo.'))
    } finally {
      setBusy(false)
      setConfirmDeleteId(null)
    }
  }

  return (
    <section className="mt-8" aria-labelledby="tours-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 id="tours-title" className="font-display text-2xl">
          Passeios
        </h3>
        {!editing && loaded && !loaded.error && (
          <button type="button" onClick={(e) => startEdit(null, e.currentTarget)} className={primaryButton}>
            Agendar passeio
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-sand-300">
        Datas entre {toBR(r.check_in)} e {toBR(r.check_out)}. Itens "sem data" vieram do pedido do hóspede.
      </p>

      {editing && (
        <TourForm
          key={editing.tour?.id ?? 'new'}
          tour={editing.tour}
          reservation={r}
          experiences={experiences}
          onCancel={closeForm}
          onSave={handleSave}
        />
      )}

      <div id="tours-status" tabIndex={-1} aria-live="polite" className="mt-4 space-y-3 focus:outline-none">
        {notice && <p className="rounded-2xl bg-[#2F7A52]/40 p-4 font-bold">{notice}</p>}
        {error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{error}</p>}
        {loaded?.key !== key && !loaded && <p className="text-sand-300">Carregando passeios…</p>}
        {loaded?.error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{loaded.error}</p>}
        {loaded && !loaded.error && tours.length === 0 && <p className="text-sand-300">Nenhum passeio agendado.</p>}
      </div>

      <ul className="mt-3 grid gap-3">
        {tours.map((t) => (
          <li key={t.id} className="rounded-2xl bg-forest-800 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold">
                  {t.scheduled_on ? toBR(t.scheduled_on) : 'Sem data'} · {t.experience_name}
                  {t.quantity > 1 ? ` × ${t.quantity}` : ''}
                </p>
                {t.notes && <p className="mt-1 whitespace-pre-wrap text-sand-300">{t.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={(e) => startEdit(t, e.currentTarget)} className={ghostButton}>
                  Editar
                </button>
                <button type="button" onClick={() => setConfirmDeleteId(t.id)} className={ghostButton}>
                  Remover
                </button>
              </div>
            </div>
            {confirmDeleteId === t.id && (
              <div role="alert" className="mt-3 rounded-2xl bg-tuiuiu-500/20 p-4">
                <p className="font-bold">Remover este passeio?</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <button type="button" disabled={busy} onClick={() => void handleDelete(t.id)} className={dangerButton}>
                    Sim, remover
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(null)} className={ghostButton}>
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function TourForm(props: {
  tour: Tour | null
  reservation: Reservation
  experiences: Experience[]
  onCancel: () => void
  onSave: (input: TourInput, id?: string) => Promise<void>
}) {
  const { tour, reservation: r } = props
  // Active experiences, plus the current one if it was deactivated later (so editing keeps it)
  const options = props.experiences.filter((e) => e.active || e.id === tour?.experience_id)
  const [experienceId, setExperienceId] = useState(tour?.experience_id ?? options[0]?.id ?? '')
  const [date, setDate] = useState(tour?.scheduled_on ?? r.check_in)
  const [quantity, setQuantity] = useState(String(tour?.quantity ?? 1))
  const [notes, setNotes] = useState(tour?.notes ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const first = useRef<HTMLSelectElement>(null)

  useEffect(() => first.current?.focus(), [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const e: FormErrors = {}
    if (!experienceId) e.experience = 'Escolha a experiência.'
    if (!date) e.date = 'Escolha a data do passeio.'
    else if (date < r.check_in || date > r.check_out)
      e.date = `A data do passeio precisa estar dentro da estadia: de ${toBR(r.check_in)} a ${toBR(r.check_out)}.`
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1) e.quantity = 'Use um número inteiro maior que zero.'
    setErrors(e)
    const firstError = Object.keys(e)[0]
    if (firstError) {
      document.getElementById(`tour-${firstError}`)?.focus()
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await props.onSave({ experience_id: experienceId, scheduled_on: date, quantity: qty, notes: notes.trim() || null }, tour?.id)
    } catch (err) {
      setSaveError(friendlyError(err))
      setSaving(false)
    }
  }

  const describe = (id: keyof FormErrors) => ({
    'aria-invalid': !!errors[id],
    'aria-describedby': errors[id] ? `tour-${id}-error` : undefined,
  })
  const fieldError = (id: keyof FormErrors) =>
    errors[id] && (
      <p id={`tour-${id}-error`} className={errorText}>
        {errors[id]}
      </p>
    )

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 rounded-2xl border border-sand-100/20 p-5" aria-label="Passeio">
      <div aria-live="assertive">
        {saveError && <p className="mb-4 rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{saveError}</p>}
      </div>
      {options.length === 0 ? (
        <p className="text-sand-300">Nenhuma experiência ativa. Ative uma na aba Valores.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tour-experience" className="block font-bold">
              Experiência
            </label>
            <select
              id="tour-experience"
              ref={first}
              value={experienceId}
              onChange={(e) => setExperienceId(e.target.value)}
              className={inputClass}
              {...describe('experience')}
            >
              {options.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                  {x.active ? '' : ' (inativa)'}
                </option>
              ))}
            </select>
            {fieldError('experience')}
          </div>
          <div>
            <label htmlFor="tour-date" className="block font-bold">
              Data
            </label>
            <input
              id="tour-date"
              type="date"
              min={r.check_in}
              max={r.check_out}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              {...describe('date')}
            />
            {fieldError('date')}
          </div>
          <div>
            <label htmlFor="tour-quantity" className="block font-bold">
              Quantidade (barcos ou saídas)
            </label>
            <input
              id="tour-quantity"
              type="number"
              inputMode="numeric"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={inputClass}
              {...describe('quantity')}
            />
            {fieldError('quantity')}
          </div>
          <div>
            <label htmlFor="tour-notes" className="block font-bold">
              Observações (opcional)
            </label>
            <input
              id="tour-notes"
              type="text"
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={props.onCancel} className={ghostButton}>
          Cancelar
        </button>
        {options.length > 0 && (
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? 'Salvando…' : 'Salvar passeio'}
          </button>
        )}
      </div>
    </form>
  )
}

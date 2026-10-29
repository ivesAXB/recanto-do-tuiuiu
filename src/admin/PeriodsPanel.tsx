import { useEffect, useRef, useState, type FormEvent } from 'react'
import { todayISO, toBR } from '../lib/dates'
import { friendlyError } from './errors'
import {
  KIND_HELP,
  KIND_LABEL,
  deletePeriod,
  loadConfirmedInPeriod,
  loadPeriods,
  savePeriod,
  type ClosedPeriod,
  type ConfirmedMatch,
  type PeriodInput,
  type PeriodKind,
} from './periods'
import { dangerButton, errorText, ghostButton, inputClass, primaryButton } from './ui'

type ListResult = { key: number; items: ClosedPeriod[]; error: string | null }
type Editing = { period: ClosedPeriod | null } // null = new period
type FormErrors = Partial<Record<'starts_on' | 'ends_on', string>>

export default function PeriodsPanel() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<{ period: PeriodInput; items: ConfirmedMatch[] } | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [today] = useState(todayISO)

  useEffect(() => {
    let cancelled = false
    loadPeriods()
      .then((items) => !cancelled && setResult({ key: reloadKey, items, error: null }))
      .catch(
        (err) =>
          !cancelled &&
          setResult({ key: reloadKey, items: [], error: friendlyError(err, 'Não foi possível carregar os períodos.') }),
      )
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const loading = result?.key !== reloadKey
  const items = result?.items ?? []
  const upcoming = items.filter((p) => p.ends_on >= today)
  const past = items.filter((p) => p.ends_on < today).reverse() // most recent first

  function startEdit(period: ClosedPeriod | null, el: HTMLElement) {
    opener.current = el
    setNotice(null)
    setError(null)
    setMatches(null)
    setConfirmDeleteId(null)
    setEditing({ period })
  }

  function closeForm() {
    setEditing(null)
    requestAnimationFrame(() => opener.current?.focus())
  }

  async function handleSaved(input: PeriodInput, id?: string) {
    const saved = await savePeriod(input, id) // errors are shown by the form
    setEditing(null)
    setNotice(id ? 'Período atualizado.' : 'Período adicionado.')
    setReloadKey((k) => k + 1)
    requestAnimationFrame(() => document.getElementById('periods-status')?.focus())
    // Warn (never block) about confirmed requests inside a block
    if (saved.kind === 'bloqueio') {
      try {
        setMatches({ period: saved, items: await loadConfirmedInPeriod(saved) })
      } catch (err) {
        setError(friendlyError(err, 'Período salvo, mas não foi possível conferir os pedidos confirmados.'))
      }
    }
  }

  async function handleDelete(id: string) {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await deletePeriod(id)
      setNotice('Período excluído.')
      setReloadKey((k) => k + 1)
    } catch (err) {
      setError(friendlyError(err, 'Não foi possível excluir. Tente de novo.'))
    } finally {
      setBusy(false)
      setConfirmDeleteId(null)
      requestAnimationFrame(() => document.getElementById('periods-status')?.focus())
    }
  }

  const renderItem = (p: ClosedPeriod) => (
    <li key={p.id} className="rounded-2xl bg-forest-800 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
              p.kind === 'bloqueio' ? 'bg-tuiuiu-500/30' : 'bg-gold-400 text-forest-900'
            }`}
          >
            {KIND_LABEL[p.kind]}
          </span>
          <p className="mt-2 text-lg font-bold">
            {toBR(p.starts_on)} a {toBR(p.ends_on)}
          </p>
          <p className="mt-1 text-sand-300">{p.label || 'Sem descrição'}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={(e) => startEdit(p, e.currentTarget)} className={ghostButton}>
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDeleteId(p.id)
              setNotice(null)
            }}
            className={ghostButton}
          >
            Excluir
          </button>
        </div>
      </div>
      {confirmDeleteId === p.id && (
        <div role="alert" className="mt-4 rounded-2xl bg-tuiuiu-500/20 p-4">
          <p className="font-bold">Excluir este período? Isso não pode ser desfeito.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <button type="button" disabled={busy} onClick={() => void handleDelete(p.id)} className={dangerButton}>
              Sim, excluir
            </button>
            <button type="button" onClick={() => setConfirmDeleteId(null)} className={ghostButton}>
              Voltar
            </button>
          </div>
        </div>
      )}
    </li>
  )

  return (
    <section aria-labelledby="periods-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="periods-title" className="font-display text-3xl">
            Defeso e bloqueios
          </h2>
          <p className="mt-2 max-w-2xl text-sand-300">
            {KIND_HELP.defeso} {KIND_HELP.bloqueio}
          </p>
        </div>
        {!editing && (
          <button type="button" onClick={(e) => startEdit(null, e.currentTarget)} className={primaryButton}>
            Adicionar período
          </button>
        )}
      </div>

      {editing && (
        <PeriodForm key={editing.period?.id ?? 'new'} period={editing.period} onCancel={closeForm} onSave={handleSaved} />
      )}

      <div id="periods-status" tabIndex={-1} aria-live="polite" className="mt-6 space-y-3 focus:outline-none">
        {notice && <p className="rounded-2xl bg-[#2F7A52]/40 p-4 font-bold">{notice}</p>}
        {error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{error}</p>}
        {matches && (
          <div className="rounded-2xl border border-gold-400/60 p-4">
            {matches.items.length === 0 ? (
              <p>Nenhum pedido confirmado nessas datas.</p>
            ) : (
              <>
                <p className="font-bold">
                  Atenção: {matches.items.length}{' '}
                  {matches.items.length === 1 ? 'pedido confirmado coincide' : 'pedidos confirmados coincidem'} com o bloqueio. O
                  bloqueio foi salvo; fale com os hóspedes se for preciso.
                </p>
                <ul className="mt-2 list-disc pl-5 text-sand-300">
                  {matches.items.map((m) => (
                    <li key={m.id}>
                      {m.guest_name}: {toBR(m.check_in)} a {toBR(m.check_out)}, {m.guests} {m.guests === 1 ? 'pessoa' : 'pessoas'}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {loading && !result && <p className="text-sand-300">Carregando períodos…</p>}
        {result?.error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{result.error}</p>}
      </div>

      {result && !result.error && (
        <>
          <h3 className="mt-8 font-display text-2xl">Atuais e futuros</h3>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sand-300">Nenhum período cadastrado daqui para frente.</p>
          ) : (
            <ul className="mt-4 grid gap-3">{upcoming.map(renderItem)}</ul>
          )}

          {past.length > 0 && (
            <details className="mt-8">
              <summary className="inline-flex min-h-11 cursor-pointer items-center font-display text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
                Períodos passados ({past.length})
              </summary>
              <ul className="mt-4 grid gap-3">{past.map(renderItem)}</ul>
            </details>
          )}
        </>
      )}
    </section>
  )
}

function PeriodForm(props: {
  period: ClosedPeriod | null
  onCancel: () => void
  onSave: (input: PeriodInput, id?: string) => Promise<void>
}) {
  const p = props.period
  const [kind, setKind] = useState<PeriodKind>(p?.kind ?? 'defeso')
  const [startsOn, setStartsOn] = useState(p?.starts_on ?? '')
  const [endsOn, setEndsOn] = useState(p?.ends_on ?? '')
  const [label, setLabel] = useState(p?.label ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => firstField.current?.focus(), [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const e: FormErrors = {}
    if (!startsOn) e.starts_on = 'Escolha a data de início.'
    if (!endsOn) e.ends_on = 'Escolha a data de fim.'
    else if (startsOn && endsOn < startsOn) e.ends_on = 'O fim não pode ser antes do início.'
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(e.starts_on ? 'period-starts' : 'period-ends')?.focus()
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await props.onSave({ kind, starts_on: startsOn, ends_on: endsOn, label: label.trim() || null }, p?.id)
    } catch (err) {
      setSaveError(friendlyError(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 rounded-3xl bg-forest-800 p-6 md:p-8" aria-labelledby="period-form-title">
      <h3 id="period-form-title" className="font-display text-2xl">
        {p ? 'Editar período' : 'Novo período'}
      </h3>

      <div aria-live="assertive">
        {saveError && <p className="mt-4 rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{saveError}</p>}
      </div>

      <fieldset className="mt-6">
        <legend className="font-bold">Tipo</legend>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
          {(['defeso', 'bloqueio'] as PeriodKind[]).map((k) => (
            <label key={k} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                ref={kind === k ? firstField : undefined}
                type="radio"
                name="period-kind"
                value={k}
                checked={kind === k}
                onChange={() => setKind(k)}
                className="size-6 accent-tuiuiu-500"
              />
              {KIND_LABEL[k]}
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-sand-300">{KIND_HELP[kind]}</p>
      </fieldset>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="period-starts" className="block font-bold">
            Início
          </label>
          <input
            id="period-starts"
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            aria-invalid={!!errors.starts_on}
            aria-describedby={errors.starts_on ? 'period-starts-error' : undefined}
            className={inputClass}
          />
          {errors.starts_on && (
            <p id="period-starts-error" className={errorText}>
              {errors.starts_on}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="period-ends" className="block font-bold">
            Fim (último dia do período)
          </label>
          <input
            id="period-ends"
            type="date"
            min={startsOn || undefined}
            value={endsOn}
            onChange={(e) => setEndsOn(e.target.value)}
            aria-invalid={!!errors.ends_on}
            aria-describedby={errors.ends_on ? 'period-ends-error' : undefined}
            className={inputClass}
          />
          {errors.ends_on && (
            <p id="period-ends-error" className={errorText}>
              {errors.ends_on}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="period-label" className="block font-bold">
          Descrição (opcional)
        </label>
        <p id="period-label-hint" className="mt-1 text-sm font-bold text-gold-400">
          Atenção: esta descrição aparece publicamente no site.
        </p>
        <input
          id="period-label"
          type="text"
          maxLength={200}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          aria-describedby="period-label-hint"
          className={inputClass}
        />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={props.onCancel} className={ghostButton}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? 'Salvando…' : 'Salvar período'}
        </button>
      </div>
    </form>
  )
}

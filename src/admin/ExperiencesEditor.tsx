import { useEffect, useRef, useState, type FormEvent } from 'react'
import { friendlyError } from './errors'
import {
  UNITS,
  UNIT_LABEL,
  centsToInput,
  formatBRL,
  loadExperiences,
  parseBRL,
  saveExperience,
  setExperienceActive,
  slugify,
  type Experience,
  type ExperienceInput,
  type Unit,
} from './values'
import { errorText, ghostButton, inputClass, primaryButton } from './ui'

type ListResult = { key: number; items: Experience[]; error: string | null }
type FormErrors = Partial<Record<'name' | 'price' | 'max_people' | 'sort_order', string>>

const saveErrorMessage = (err: unknown) =>
  (err as { code?: string })?.code === '23505'
    ? 'Já existe uma experiência com esse nome. Escolha outro nome.'
    : friendlyError(err)

const priceText = (e: Experience) =>
  e.unit === 'sob_cotacao' || e.price_cents === null ? 'Sob cotação' : `${formatBRL(e.price_cents)} ${UNIT_LABEL[e.unit]}`

export default function ExperiencesEditor() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)
  const [editing, setEditing] = useState<{ exp: Experience | null } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    loadExperiences()
      .then((items) => !cancelled && setResult({ key: reloadKey, items, error: null }))
      .catch(
        (err) =>
          !cancelled &&
          setResult({ key: reloadKey, items: [], error: friendlyError(err, 'Não foi possível carregar as experiências.') }),
      )
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const items = result?.items ?? []
  const nextOrder = items.reduce((max, e) => Math.max(max, e.sort_order), 0) + 1

  function startEdit(exp: Experience | null, el: HTMLElement) {
    opener.current = el
    setNotice(null)
    setError(null)
    setEditing({ exp })
  }

  function closeForm() {
    setEditing(null)
    requestAnimationFrame(() => opener.current?.focus())
  }

  async function handleSave(input: ExperienceInput, id?: string) {
    await saveExperience(input, id) // errors are shown by the form
    setEditing(null)
    setNotice(id ? 'Experiência atualizada.' : 'Experiência criada.')
    setReloadKey((k) => k + 1)
    requestAnimationFrame(() => document.getElementById('experiences-status')?.focus())
  }

  // No delete: reservations reference experiences, so they are deactivated instead
  async function toggleActive(exp: Experience) {
    setBusyId(exp.id)
    setNotice(null)
    setError(null)
    try {
      await setExperienceActive(exp.id, !exp.active)
      setNotice(exp.active ? `"${exp.name}" foi desativada e não aparece mais no site.` : `"${exp.name}" foi ativada.`)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section aria-labelledby="experiences-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="experiences-title" className="font-display text-3xl">
            Experiências
          </h2>
          <p className="mt-2 max-w-2xl text-sand-300">
            Aparecem nos pacotes e no formulário de reserva. Experiências não podem ser excluídas, porque os pedidos guardam
            quais foram escolhidas: desative a que não for mais oferecida.
          </p>
        </div>
        {!editing && (
          <button type="button" onClick={(e) => startEdit(null, e.currentTarget)} className={primaryButton}>
            Nova experiência
          </button>
        )}
      </div>

      {editing && (
        <ExperienceForm
          key={editing.exp?.id ?? 'new'}
          exp={editing.exp}
          nextOrder={nextOrder}
          onCancel={closeForm}
          onSave={handleSave}
        />
      )}

      <div id="experiences-status" tabIndex={-1} aria-live="polite" className="mt-6 space-y-3 focus:outline-none">
        {notice && <p className="rounded-2xl bg-[#2F7A52]/40 p-4 font-bold">{notice}</p>}
        {error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{error}</p>}
        {!result && <p className="text-sand-300">Carregando experiências…</p>}
        {result?.error && <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{result.error}</p>}
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((exp) => (
          <li key={exp.id} className={`rounded-2xl p-5 ${exp.active ? 'bg-sand-100 text-forest-900' : 'bg-forest-800 text-sand-300'}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold">{exp.name}</h3>
              <span className="shrink-0 text-xs font-bold tracking-[0.1em]">
                {exp.active ? `ORDEM ${exp.sort_order}` : 'INATIVA'}
              </span>
            </div>
            <p className="mt-1 font-bold">
              {priceText(exp)}
              {exp.max_people ? ` · até ${exp.max_people} pessoas` : ''}
            </p>
            {exp.description && <p className="mt-2">{exp.description}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(e) => startEdit(exp, e.currentTarget)}
                className={`${ghostButton} ${exp.active ? 'border-forest-900/40' : ''}`}
              >
                Editar
              </button>
              <button
                type="button"
                disabled={busyId === exp.id}
                onClick={() => void toggleActive(exp)}
                className={`${ghostButton} ${exp.active ? 'border-forest-900/40' : ''}`}
              >
                {exp.active ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ExperienceForm(props: {
  exp: Experience | null
  nextOrder: number
  onCancel: () => void
  onSave: (input: ExperienceInput, id?: string) => Promise<void>
}) {
  const x = props.exp
  const [name, setName] = useState(x?.name ?? '')
  const [description, setDescription] = useState(x?.description ?? '')
  const [unit, setUnit] = useState<Unit>(x?.unit ?? 'por_barco_dia')
  const [price, setPrice] = useState(x?.price_cents != null ? centsToInput(x.price_cents) : '')
  const [maxPeople, setMaxPeople] = useState(x?.max_people != null ? String(x.max_people) : '')
  const [sortOrder, setSortOrder] = useState(String(x?.sort_order ?? props.nextOrder))
  const [active, setActive] = useState(x?.active ?? true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)

  useEffect(() => nameInput.current?.focus(), [])

  const quote = unit === 'sob_cotacao'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const e: FormErrors = {}
    const trimmed = name.trim()
    if (trimmed.length < 2 || trimmed.length > 80) e.name = 'Informe um nome de 2 a 80 caracteres.'
    else if (!x && !slugify(trimmed)) e.name = 'Use letras ou números no nome.'

    const cents = quote ? null : parseBRL(price)
    if (!quote && cents === null) e.price = 'Informe o preço em reais. Ex.: 350 ou 350,00.'

    const max = maxPeople.trim() ? Number(maxPeople) : null
    if (max !== null && (!Number.isInteger(max) || max < 1)) e.max_people = 'Use um número inteiro maior que zero, ou deixe vazio.'

    const order = Number(sortOrder)
    if (!sortOrder.trim() || !Number.isInteger(order)) e.sort_order = 'Use um número inteiro.'

    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      document.getElementById(`exp-${first}`)?.focus()
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      await props.onSave(
        {
          name: trimmed,
          description: description.trim() || null,
          unit,
          price_cents: cents,
          max_people: max,
          sort_order: order,
          active,
        },
        x?.id,
      )
    } catch (err) {
      setSaveError(saveErrorMessage(err))
      setSaving(false)
    }
  }

  const field = (id: keyof FormErrors) => ({
    'aria-invalid': !!errors[id],
    'aria-describedby': errors[id] ? `exp-${id}-error` : undefined,
  })
  const fieldError = (id: keyof FormErrors) =>
    errors[id] && (
      <p id={`exp-${id}-error`} className={errorText}>
        {errors[id]}
      </p>
    )

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 rounded-3xl bg-forest-800 p-6 md:p-8" aria-labelledby="exp-form-title">
      <h3 id="exp-form-title" className="font-display text-2xl">
        {x ? `Editar "${x.name}"` : 'Nova experiência'}
      </h3>

      <div aria-live="assertive">
        {saveError && <p className="mt-4 rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">{saveError}</p>}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="exp-name" className="block font-bold">
            Nome
          </label>
          <input
            id="exp-name"
            ref={nameInput}
            type="text"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            {...field('name')}
          />
          {fieldError('name')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="exp-description" className="block font-bold">
            Descrição (opcional)
          </label>
          <textarea
            id="exp-description"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} py-3`}
          />
        </div>

        <div>
          <label htmlFor="exp-unit" className="block font-bold">
            Unidade de preço
          </label>
          <select id="exp-unit" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={inputClass}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABEL[u]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="exp-price" className="block font-bold">
            Preço (R$)
          </label>
          <input
            id="exp-price"
            type="text"
            inputMode="decimal"
            placeholder={quote ? 'Sob cotação' : '350,00'}
            disabled={quote}
            value={quote ? '' : price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            {...field('price')}
          />
          {fieldError('price')}
        </div>

        <div>
          <label htmlFor="exp-max_people" className="block font-bold">
            Máximo de pessoas (opcional)
          </label>
          <input
            id="exp-max_people"
            type="number"
            inputMode="numeric"
            min={1}
            value={maxPeople}
            onChange={(e) => setMaxPeople(e.target.value)}
            className={inputClass}
            {...field('max_people')}
          />
          {fieldError('max_people')}
        </div>

        <div>
          <label htmlFor="exp-sort_order" className="block font-bold">
            Ordem de exibição
          </label>
          <input
            id="exp-sort_order"
            type="number"
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputClass}
            {...field('sort_order')}
          />
          {fieldError('sort_order')}
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-6 shrink-0 accent-tuiuiu-500"
          />
          Ativa (aparece no site)
        </label>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={props.onCancel} className={ghostButton}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? 'Salvando…' : 'Salvar experiência'}
        </button>
      </div>
    </form>
  )
}

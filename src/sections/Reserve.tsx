import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

type Unit = 'por_pessoa_dia' | 'por_barco_dia' | 'por_barco' | 'sob_cotacao'

type Experience = {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  unit: Unit
  max_people: number | null
}

type ClosedPeriod = {
  kind: 'defeso' | 'bloqueio'
  starts_on: string
  ends_on: string
  label: string | null
}

type ReserveData = {
  experiences: Experience[]
  periods: ClosedPeriod[]
  lodgingCents: number | null
}

type Form = {
  checkIn: string
  checkOut: string
  guests: number
  experienceIds: string[]
  name: string
  whatsapp: string
  email: string
  message: string
  consent: boolean
  website: string // honeypot: hidden from people, bots tend to fill it
}

type Errors = Partial<Record<'checkIn' | 'checkOut' | 'guests' | 'name' | 'whatsapp' | 'email' | 'message' | 'consent', string>>

type Status = 'idle' | 'sending' | 'success' | 'error'

const STEPS = ['Datas e pessoas', 'Experiências', 'Seus dados', 'Resumo']
const MAX_GUESTS = 18
const MAX_MESSAGE = 1000

// Same rules as the database constraints in the initial migration
const WHATSAPP_RE = /^[0-9+() -]{8,20}$/
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
if (!WHATSAPP_NUMBER) console.warn('VITE_WHATSAPP_NUMBER não definido no .env: o botão do WhatsApp fica escondido.')

const UNIT_LABEL: Record<Unit, string> = {
  por_pessoa_dia: 'por pessoa/dia',
  por_barco_dia: 'por barco/dia',
  por_barco: 'por barco',
  sob_cotacao: 'sob cotação',
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})
const price = (cents: number) => brl.format(cents / 100)

// Dates are kept as local "YYYY-MM-DD" strings to avoid timezone off-by-one bugs
const todayISO = () => new Date().toLocaleDateString('en-CA')
const toUTC = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
const addDays = (iso: string, days: number) => new Date(toUTC(iso) + days * 86_400_000).toISOString().slice(0, 10)
const nightsBetween = (from: string, to: string) => Math.round((toUTC(to) - toUTC(from)) / 86_400_000)
const toBR = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')

// Defeso: any day of the stay counts, including check-out day (guests can still come, only fishing stops)
const touchesDefeso = (p: ClosedPeriod, checkIn: string, checkOut: string) =>
  p.kind === 'defeso' && p.starts_on <= checkOut && p.ends_on >= checkIn
// Bloqueio: only nights count, so arriving the day a block ends is fine
const touchesBlock = (p: ClosedPeriod, checkIn: string, checkOut: string) =>
  p.kind === 'bloqueio' && p.starts_on < checkOut && p.ends_on >= checkIn

async function loadReserveData(): Promise<ReserveData> {
  const [exp, periods, settings] = await Promise.all([
    supabase
      .from('experiences')
      .select('id, name, description, price_cents, unit, max_people')
      .eq('active', true)
      .order('sort_order'),
    supabase.from('closed_periods').select('kind, starts_on, ends_on, label').gte('ends_on', todayISO()),
    supabase.from('site_settings').select('value').eq('key', 'diaria_hospedagem_cents').maybeSingle(),
  ])

  if (exp.error) throw exp.error
  if (periods.error) throw periods.error
  if (settings.error) throw settings.error

  const lodging = Number(settings.data?.value)
  return {
    experiences: exp.data as Experience[],
    periods: periods.data as ClosedPeriod[],
    lodgingCents: Number.isFinite(lodging) && lodging > 0 ? lodging : null,
  }
}

function buildWhatsAppText(form: Form, experiences: Experience[], requestId: string | null) {
  const nights = nightsBetween(form.checkIn, form.checkOut)
  const chosen = experiences.filter((e) => form.experienceIds.includes(e.id)).map((e) => e.name)
  const lines = [
    'Olá! Gostaria de fazer uma reserva no Recanto do Tuiuiú.',
    '',
    `Nome: ${form.name.trim()}`,
    `Chegada: ${toBR(form.checkIn)}`,
    `Saída: ${toBR(form.checkOut)} (${nights} ${nights === 1 ? 'noite' : 'noites'})`,
    `Pessoas: ${form.guests}`,
    `Experiências: ${chosen.length ? chosen.join(', ') : 'só hospedagem'}`,
  ]
  if (form.message.trim()) lines.push(`Mensagem: ${form.message.trim()}`)
  if (requestId) lines.push('', `Pedido nº ${requestId.slice(0, 8)}`)
  return lines.join('\n')
}

const whatsAppHref = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

const inputClass =
  'mt-2 block min-h-12 w-full rounded-xl border border-sand-100/25 bg-forest-950 px-4 text-base text-sand-100 [color-scheme:dark] placeholder:text-sand-300/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 aria-[invalid=true]:border-tuiuiu-500'

function Field(props: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={props.id} className="block font-bold">
        {props.label}
      </label>
      {props.hint && (
        <p id={`${props.id}-hint`} className="mt-1 text-sm text-sand-300">
          {props.hint}
        </p>
      )}
      {props.children}
      {props.error && (
        <p id={`${props.id}-error`} className="mt-2 text-sm font-bold text-[#ff8a80]">
          {props.error}
        </p>
      )}
    </div>
  )
}

// Links a field to its hint and error text, for screen readers
const describedBy = (id: string, hasHint: boolean, error?: string) =>
  [hasHint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

function WhatsAppButton({ text }: { text: string }) {
  if (!WHATSAPP_NUMBER) return null
  return (
    <a
      href={whatsAppHref(text)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-tuiuiu-500 px-8 py-3 text-center font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900"
    >
      Enviar pelo WhatsApp
    </a>
  )
}

export default function Reserve() {
  const root = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const sendingLock = useRef(false)

  const [today] = useState(todayISO)
  const [data, setData] = useState<ReserveData | null>(null)
  const [failed, setFailed] = useState(false)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [requestId, setRequestId] = useState<string | null>(null)
  // Bumped only on step change or when sending ends (success/error), never on 'sending'
  const [reveal, setReveal] = useState(0)
  const [form, setForm] = useState<Form>({
    checkIn: '',
    checkOut: '',
    guests: 2,
    experienceIds: [],
    name: '',
    whatsapp: '',
    email: '',
    message: '',
    consent: false,
    website: '',
  })

  useEffect(() => {
    loadReserveData()
      .then(setData)
      .catch((err) => {
        console.error('Erro ao carregar dados da reserva:', err)
        setFailed(true)
      })
      .finally(() => ScrollTrigger.refresh())
  }, [])

  // On step change: move focus to the new heading and fade the panel in
  useEffect(() => {
    if (reveal === 0) return
    heading.current?.focus({ preventScroll: true })
    root.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(panel.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    return () => {
      tween.kill()
    }
  }, [reveal])

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const datesReady = form.checkIn >= today && form.checkOut > form.checkIn
  const nights = datesReady ? nightsBetween(form.checkIn, form.checkOut) : 0
  const periods = data?.periods ?? []
  const defeso = datesReady ? periods.find((p) => touchesDefeso(p, form.checkIn, form.checkOut)) : undefined
  const block = datesReady ? periods.find((p) => touchesBlock(p, form.checkIn, form.checkOut)) : undefined
  const guestsValid = Number.isInteger(form.guests) && form.guests >= 1 && form.guests <= MAX_GUESTS
  const estimate = data?.lodgingCents && nights && guestsValid ? nights * form.guests * data.lodgingCents : null
  const experiences = data?.experiences ?? []
  const waText = form.checkIn && form.checkOut ? buildWhatsAppText(form, experiences, requestId) : ''

  function validate(current: number): Errors {
    const e: Errors = {}
    if (current === 0) {
      if (!form.checkIn) e.checkIn = 'Escolha a data de chegada.'
      else if (form.checkIn < today) e.checkIn = 'A chegada não pode ser antes de hoje.'
      if (!form.checkOut) e.checkOut = 'Escolha a data de saída.'
      else if (form.checkIn && form.checkOut <= form.checkIn) e.checkOut = 'A saída precisa ser depois da chegada.'
      if (!Number.isInteger(form.guests) || form.guests < 1 || form.guests > MAX_GUESTS)
        e.guests = `Informe de 1 a ${MAX_GUESTS} pessoas.`
    }
    if (current === 2) {
      const name = form.name.trim()
      const phone = form.whatsapp.trim()
      if (name.length < 2 || name.length > 120) e.name = 'Informe seu nome (de 2 a 120 letras).'
      if (!WHATSAPP_RE.test(phone) || phone.replace(/\D/g, '').length < 8)
        e.whatsapp = 'Use só números, com DDD. Ex.: (65) 99999-9999.'
      if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'Confira o e-mail ou deixe em branco.'
      if (form.message.length > MAX_MESSAGE) e.message = `A mensagem pode ter até ${MAX_MESSAGE} caracteres.`
      if (!form.consent) e.consent = 'Marque a caixa para podermos responder ao seu pedido.'
    }
    return e
  }

  function focusFirstError(e: Errors) {
    const first = Object.keys(e)[0]
    if (first) document.getElementById(`reserve-${first}`)?.focus()
  }

  function goTo(next: number) {
    setReveal((r) => r + 1)
    setErrors({})
    setStep(next)
  }

  async function submit() {
    if (sendingLock.current || status === 'success') return
    // A bot filled the hidden field: pretend it worked and send nothing
    if (form.website) {
      setReveal((r) => r + 1)
      setStatus('success')
      return
    }
    sendingLock.current = true
    setStatus('sending')

    const { data: id, error } = await supabase.rpc('create_reservation_request', {
      p_guest_name: form.name.trim(),
      p_whatsapp: form.whatsapp.trim(),
      p_email: form.email.trim() || null,
      p_check_in: form.checkIn,
      p_check_out: form.checkOut,
      p_guests: form.guests,
      p_message: form.message.trim() || null,
      p_experience_ids: form.experienceIds,
    })

    setReveal((r) => r + 1)
    if (error) {
      console.error('Erro ao enviar pedido:', error)
      sendingLock.current = false
      setStatus('error')
      return
    }
    setRequestId(typeof id === 'string' ? id : null)
    setStatus('success')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const e = validate(step)
    if (Object.keys(e).length) {
      setErrors(e)
      focusFirstError(e)
      return
    }
    if (step === 0 && block) return
    if (step < STEPS.length - 1) goTo(step + 1)
    else void submit()
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <section ref={root} id="reservar" className="mx-auto max-w-6xl scroll-mt-6 px-6 py-24 md:px-16">
      <p className="text-sm font-bold tracking-[0.14em] text-gold-400">RESERVAR</p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl">Peça a sua reserva.</h2>
      <p className="mt-4 max-w-2xl text-lg text-sand-300">
        Sem cadastro. Você envia o pedido e a pousada responde pelo WhatsApp para confirmar datas e valores.
      </p>

      <div className="mt-10 rounded-3xl bg-forest-800 p-6 md:p-10">
        {status === 'success' ? (
          <div ref={panel}>
            <h3 ref={heading} tabIndex={-1} className="font-display text-3xl focus:outline-none">
              Pedido recebido!
            </h3>
            <p role="status" className="mt-4 max-w-2xl text-lg text-sand-300">
              Obrigado, {form.name.trim().split(' ')[0]}. A pousada vai responder pelo WhatsApp {form.whatsapp.trim()}.
              {WHATSAPP_NUMBER && ' Para agilizar, envie também o resumo pelo WhatsApp:'}
            </p>
            <div className="mt-6">
              <WhatsAppButton text={waText} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <ol className="flex flex-wrap gap-2 text-sm" aria-label="Etapas do pedido">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  aria-current={i === step ? 'step' : undefined}
                  className={`rounded-full px-4 py-2 ${
                    i === step ? 'bg-gold-400 font-bold text-forest-900' : i < step ? 'bg-sand-100/15' : 'bg-sand-100/5 text-sand-300'
                  }`}
                >
                  <span className="sr-only">{i < step ? 'Concluído: ' : ''}</span>
                  {i + 1}. {label}
                </li>
              ))}
            </ol>

            {/* Honeypot: off-screen, skipped by keyboard and screen readers */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="reserve-website">Não preencha este campo</label>
              <input
                id="reserve-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
              />
            </div>

            <div ref={panel} className="mt-8">
              <h3 ref={heading} tabIndex={-1} className="font-display text-3xl focus:outline-none">
                <span className="sr-only">Passo {step + 1} de {STEPS.length}: </span>
                {STEPS[step]}
              </h3>

              {/* Announces validation and send errors */}
              <div aria-live="assertive" className="mt-4">
                {errorCount > 0 && (
                  <p className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">
                    {errorCount === 1 ? 'Confira 1 campo destacado.' : `Confira ${errorCount} campos destacados.`}
                  </p>
                )}
                {status === 'error' && (
                  <div className="rounded-2xl bg-tuiuiu-500/20 p-5">
                    <p className="font-bold">Não conseguimos registrar seu pedido agora.</p>
                    <p className="mt-1 text-sand-300">
                      Tente de novo em instantes{WHATSAPP_NUMBER ? ' ou envie o mesmo pedido direto pelo WhatsApp.' : '.'}
                    </p>
                    <div className="mt-4">
                      <WhatsAppButton text={waText} />
                    </div>
                  </div>
                )}
              </div>

              {failed && step < 2 && (
                <p role="status" className="mt-4 rounded-2xl border border-gold-400/50 p-4 text-sand-300">
                  Não conseguimos carregar todas as informações agora. Você ainda pode enviar o pedido, e a pousada confirma tudo com
                  você.
                </p>
              )}

              {step === 0 && (
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <Field id="reserve-checkIn" label="Chegada" error={errors.checkIn}>
                    <input
                      id="reserve-checkIn"
                      type="date"
                      required
                      min={today}
                      value={form.checkIn}
                      onChange={(e) => set('checkIn', e.target.value)}
                      aria-invalid={!!errors.checkIn}
                      aria-describedby={describedBy('reserve-checkIn', false, errors.checkIn)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="reserve-checkOut" label="Saída" error={errors.checkOut}>
                    <input
                      id="reserve-checkOut"
                      type="date"
                      required
                      min={form.checkIn ? addDays(form.checkIn, 1) : addDays(today, 1)}
                      value={form.checkOut}
                      onChange={(e) => set('checkOut', e.target.value)}
                      aria-invalid={!!errors.checkOut}
                      aria-describedby={describedBy('reserve-checkOut', false, errors.checkOut)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="reserve-guests" label="Pessoas" hint={`De 1 a ${MAX_GUESTS}`} error={errors.guests}>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Menos uma pessoa"
                        disabled={form.guests <= 1}
                        onClick={() => set('guests', Math.max(1, form.guests - 1))}
                        className="size-12 shrink-0 rounded-full border border-sand-100/25 text-2xl disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                      >
                        −
                      </button>
                      <input
                        id="reserve-guests"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={MAX_GUESTS}
                        value={Number.isNaN(form.guests) ? '' : form.guests}
                        onChange={(e) => set('guests', e.target.valueAsNumber)}
                        aria-invalid={!!errors.guests}
                        aria-describedby={describedBy('reserve-guests', true, errors.guests)}
                        className={`${inputClass} !mt-0 text-center`}
                      />
                      <button
                        type="button"
                        aria-label="Mais uma pessoa"
                        disabled={form.guests >= MAX_GUESTS}
                        onClick={() => set('guests', Math.min(MAX_GUESTS, (form.guests || 0) + 1))}
                        className="size-12 shrink-0 rounded-full border border-sand-100/25 text-2xl disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                      >
                        +
                      </button>
                    </div>
                  </Field>

                  <div aria-live="polite" className="space-y-4 md:col-span-3">
                    {block && (
                      <p className="rounded-2xl bg-tuiuiu-500/20 p-5 font-bold">
                        Essas datas estão indisponíveis ({toBR(block.starts_on)} a {toBR(block.ends_on)}
                        {block.label ? `: ${block.label}` : ''}). Escolha outras datas.
                      </p>
                    )}
                    {defeso && (
                      <p className="rounded-2xl border border-gold-400/50 p-5">
                        Sua estadia cai no defeso (piracema), de {toBR(defeso.starts_on)} a {toBR(defeso.ends_on)}. Você pode vir
                        normalmente, mas a pesca fica suspensa nesse período.
                      </p>
                    )}
                    {estimate !== null && !block && (
                      <div className="rounded-2xl bg-forest-950/60 p-5">
                        <p className="text-sm text-sand-300">Estimativa da hospedagem</p>
                        <p className="mt-1 text-3xl font-bold">{price(estimate)}</p>
                        <p className="mt-1 text-sm text-sand-300">
                          {nights} {nights === 1 ? 'noite' : 'noites'} × {form.guests} {form.guests === 1 ? 'pessoa' : 'pessoas'} ×{' '}
                          {price(data!.lodgingCents!)}. Valor final confirmado pela pousada. Passeios à parte.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <fieldset className="mt-6">
                  <legend className="text-sand-300">
                    Opcional. Exclusivo para hóspedes. Marque o que tiver interesse; a pousada combina os dias com você.
                  </legend>
                  {experiences.length === 0 && (
                    <p className="mt-4 text-sand-300">Nenhuma experiência disponível no momento. Conte na mensagem o que procura.</p>
                  )}
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {experiences.map((exp) => {
                      const checked = form.experienceIds.includes(exp.id)
                      const quote = exp.unit === 'sob_cotacao' || exp.price_cents === null
                      return (
                        <label
                          key={exp.id}
                          className="flex min-h-11 cursor-pointer gap-4 rounded-2xl bg-sand-100 p-5 text-forest-900 has-[:checked]:ring-4 has-[:checked]:ring-gold-400 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sand-100"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              set(
                                'experienceIds',
                                checked ? form.experienceIds.filter((x) => x !== exp.id) : [...form.experienceIds, exp.id],
                              )
                            }
                            className="mt-1 size-6 shrink-0 accent-tuiuiu-500"
                          />
                          <span>
                            <span className="block font-display text-2xl font-semibold">{exp.name}</span>
                            <span className="mt-1 block font-bold">
                              {quote ? 'Sob cotação' : `${price(exp.price_cents!)} ${UNIT_LABEL[exp.unit]}`}
                              {exp.max_people ? ` (até ${exp.max_people} pessoas)` : ''}
                            </span>
                            {exp.description && <span className="mt-2 block">{exp.description}</span>}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <Field id="reserve-name" label="Nome" error={errors.name}>
                    <input
                      id="reserve-name"
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={describedBy('reserve-name', false, errors.name)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="reserve-whatsapp" label="WhatsApp" hint="Com DDD. Ex.: (65) 99999-9999" error={errors.whatsapp}>
                    <input
                      id="reserve-whatsapp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      value={form.whatsapp}
                      onChange={(e) => set('whatsapp', e.target.value)}
                      aria-invalid={!!errors.whatsapp}
                      aria-describedby={describedBy('reserve-whatsapp', true, errors.whatsapp)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="reserve-email" label="E-mail (opcional)" error={errors.email}>
                    <input
                      id="reserve-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      aria-invalid={!!errors.email}
                      aria-describedby={describedBy('reserve-email', false, errors.email)}
                      className={inputClass}
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field
                      id="reserve-message"
                      label="Mensagem (opcional)"
                      hint={`${form.message.length}/${MAX_MESSAGE} caracteres`}
                      error={errors.message}
                    >
                      <textarea
                        id="reserve-message"
                        rows={4}
                        maxLength={MAX_MESSAGE}
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        aria-invalid={!!errors.message}
                        aria-describedby={describedBy('reserve-message', true, errors.message)}
                        className={`${inputClass} py-3`}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex min-h-11 cursor-pointer items-start gap-3">
                      <input
                        id="reserve-consent"
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => set('consent', e.target.checked)}
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? 'reserve-consent-error' : undefined}
                        className="mt-0.5 size-6 shrink-0 accent-tuiuiu-500"
                      />
                      <span>Autorizo o uso dos meus dados apenas para a pousada responder a este pedido de reserva.</span>
                    </label>
                    {errors.consent && (
                      <p id="reserve-consent-error" className="mt-2 text-sm font-bold text-[#ff8a80]">
                        {errors.consent}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <dl className="mt-6 grid gap-4 rounded-2xl bg-sand-100 p-6 text-forest-900 md:grid-cols-2">
                  <Summary term="Datas">
                    {toBR(form.checkIn)} a {toBR(form.checkOut)} ({nights} {nights === 1 ? 'noite' : 'noites'})
                  </Summary>
                  <Summary term="Pessoas">{form.guests}</Summary>
                  <Summary term="Experiências">
                    {experiences
                      .filter((e) => form.experienceIds.includes(e.id))
                      .map((e) => e.name)
                      .join(', ') || 'Só hospedagem'}
                  </Summary>
                  <Summary term="Contato">
                    {form.name.trim()} · {form.whatsapp.trim()}
                    {form.email.trim() && ` · ${form.email.trim()}`}
                  </Summary>
                  {form.message.trim() && (
                    <div className="md:col-span-2">
                      <Summary term="Mensagem">{form.message.trim()}</Summary>
                    </div>
                  )}
                  {estimate !== null && (
                    <div className="md:col-span-2">
                      <Summary term="Estimativa da hospedagem">
                        {price(estimate)}. Valor final confirmado pela pousada.
                      </Summary>
                    </div>
                  )}
                  {defeso && (
                    <p className="md:col-span-2">Atenção: as datas caem no defeso, a pesca fica suspensa.</p>
                  )}
                </dl>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => goTo(step - 1)}
                    disabled={status === 'sending'}
                    className="min-h-12 rounded-full border border-sand-100/40 px-8 font-bold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  >
                    Voltar
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={status === 'sending' || (step === 0 && !!block)}
                  aria-disabled={status === 'sending' || (step === 0 && !!block)}
                  className="min-h-12 rounded-full bg-tuiuiu-500 px-8 font-bold text-white transition hover:brightness-110 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-800"
                >
                  {step < STEPS.length - 1 ? 'Continuar' : status === 'sending' ? 'Enviando…' : 'Enviar pedido'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function Summary({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-[0.1em]">{term.toUpperCase()}</dt>
      <dd className="mt-1 text-lg">{children}</dd>
    </div>
  )
}

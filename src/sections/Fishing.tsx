import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

// Os meses começam em outubro (início do defeso), como no site antigo
const MONTHS = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set']

// ATENÇÃO: períodos e meses vêm do site antigo. Os textos abaixo devem ser
// revisados pelo dono da pousada antes do lançamento.
const SEASONS = [
  {
    id: 'defeso',
    name: 'Defeso',
    months: 'Out–Jan',
    span: 4,
    monthIdx: [9, 10, 11, 0], // 0 = janeiro
    color: '#5B4A3A',
    textColor: '#ffffff',
    text: 'Período de reprodução dos peixes: a pesca fica suspensa. É a época de contemplar o Pantanal, fotografar e observar as aves.',
  },
  {
    id: 'cheia',
    name: 'Cheia',
    months: 'Fev–Mar',
    span: 2,
    monthIdx: [1, 2],
    color: '#2E6F8E',
    textColor: '#ffffff',
    text: 'O nível do rio sobe e a paisagem muda por completo. Consulte a pousada sobre as condições de pesca nessa época.',
  },
  {
    id: 'baias',
    name: 'Baías',
    months: 'Abr–Jun',
    span: 3,
    monthIdx: [3, 4, 5],
    color: '#2F7A52',
    textColor: '#ffffff',
    text: 'Época da pesca nas baías, com o rio baixando e os peixes mais concentrados.',
  },
  {
    id: 'rio',
    name: 'Rio',
    months: 'Jul–Set',
    span: 3,
    monthIdx: [6, 7, 8],
    color: '#C98A3B',
    textColor: '#14261F',
    text: 'Pesca no leito do rio, com as melhores épocas para Dourado e Pintado.',
  },
]

// Colunas de 1 (Out) a 12 (Set). Fonte: site antigo. Cada peixe novo ganha uma linha na tabela.
const FISH = [
  { name: 'Dourado', label: 'jun–set', from: 9, to: 12 },
  { name: 'Pintado', label: 'mai–set', from: 8, to: 12 },
]

type Defeso = { starts_on: string; ends_on: string }

const toBR = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
const todayISO = () => new Date().toLocaleDateString('en-CA') // AAAA-MM-DD no fuso local
const monthToColumn = (month: number) => ((month - 9 + 12) % 12) + 1 // out = coluna 1

export default function Fishing() {
  const root = useRef<HTMLElement>(null)
  const currentMonth = new Date().getMonth()
  const todayCol = monthToColumn(currentMonth)
  const currentSeason = SEASONS.find((s) => s.monthIdx.includes(currentMonth)) ?? SEASONS[0]
  const [active, setActive] = useState(currentSeason.id)
  const [defeso, setDefeso] = useState<Defeso | null>(null)

  // Aviso de defeso (opcional): se o banco não responder, a seção funciona sem ele
  useEffect(() => {
    supabase
      .from('closed_periods')
      .select('starts_on, ends_on')
      .eq('kind', 'defeso')
      .gte('ends_on', todayISO())
      .order('starts_on')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Erro ao carregar defeso:', error)
        setDefeso(data ?? null)
        ScrollTrigger.refresh() // o aviso muda a altura da página
      })
  }, [])

  // Entrada: as épocas aparecem e, em seguida, as barras dos peixes se desenham
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '[data-calendar]', start: 'top 80%', once: true },
      })
      // fromTo com valores explícitos (mais robusto que from)
      tl.fromTo(
        '[data-season]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
      )
      tl.fromTo(
        '[data-fish]',
        { clipPath: 'inset(0 100% 0 0 round 999px)' },
        { clipPath: 'inset(0 0% 0 0 round 999px)', duration: 0.9, ease: 'power3.out', stagger: 0.15 },
        '-=0.3',
      )
    }, root)
    return () => ctx.revert()
  }, [])

  const season = SEASONS.find((s) => s.id === active) ?? SEASONS[0]
  const inDefeso = defeso && defeso.starts_on <= todayISO()

  return (
    <section ref={root} id="pesca" className="mx-auto max-w-6xl px-6 py-24 md:px-16">
      <p className="text-sm font-bold tracking-[0.14em] text-gold-400">PESCA ESPORTIVA</p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl">Cada época tem o seu peixe.</h2>
      <p className="mt-4 max-w-2xl text-lg text-sand-300">
        Veja no calendário os meses de cada época e a melhor fase de pesca de cada peixe. Clique em uma época para saber mais.
      </p>

      {defeso && (
        <p role="status" className="mt-8 rounded-2xl border border-gold-400/50 bg-forest-800 p-5 text-sand-100">
          {inDefeso
            ? `Estamos no defeso (piracema) até ${toBR(defeso.ends_on)}. A pesca está suspensa, e a pousada oferece contemplação da natureza.`
            : `Próximo defeso: de ${toBR(defeso.starts_on)} a ${toBR(defeso.ends_on)}. Nesse período a pesca fica suspensa.`}
        </p>
      )}

      <div id="epocas" className="mt-10">
        <div data-calendar className="relative">
          {/* Colunas de fundo: uma por mês, com o mês atual destacado */}
          <div aria-hidden="true" className="absolute inset-0 grid grid-cols-12 gap-x-1">
            {MONTHS.map((m, i) => (
              <div key={m} className={`rounded-lg ${i + 1 === todayCol ? 'bg-gold-400/15' : 'bg-sand-100/5'}`} />
            ))}
          </div>

          {/* Tabela: linha 1 = meses, linha 2 = épocas, linhas seguintes = um peixe por linha */}
          <div className="relative grid grid-cols-12 gap-x-1 gap-y-2 py-3">
            {MONTHS.map((m, i) => (
              <span
                key={m}
                aria-hidden="true"
                style={{ gridColumn: i + 1, gridRow: 1 }}
                className={`text-center text-[11px] md:text-sm ${
                  i + 1 === todayCol ? 'font-bold text-gold-400' : 'text-sand-300'
                }`}
              >
                {m}
              </span>
            ))}

            {SEASONS.map((s) => (
              <button
                key={s.id}
                data-season
                type="button"
                aria-pressed={active === s.id}
                onClick={() => setActive(s.id)}
                style={{ gridColumn: `span ${s.span}`, gridRow: 2, backgroundColor: s.color, color: s.textColor }}
                className={`min-h-16 rounded-lg px-2 py-3 text-left text-xs md:px-4 md:text-base ${
                  active === s.id ? 'ring-2 ring-sand-100 ring-offset-2 ring-offset-forest-900' : ''
                }`}
              >
                <b className="block">{s.name}</b>
                <span>{s.months}</span>
              </button>
            ))}

            {FISH.map((f, i) => (
              <span
                key={f.name}
                data-fish
                style={{ gridColumn: `${f.from} / ${f.to + 1}`, gridRow: 3 + i }}
                className="rounded-full bg-gold-400 px-3 py-2 text-center text-xs font-bold leading-tight text-forest-900 md:px-4 md:text-base"
              >
                {f.name} <span className="font-normal">({f.label})</span>
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 flex items-center gap-3 text-sm text-sand-300">
          <span aria-hidden="true" className="inline-block h-3 w-10 rounded-full bg-gold-400" />
          Barra dourada: meses de melhor pesca de cada peixe
        </p>

        <div aria-live="polite" className="mt-8 rounded-3xl bg-forest-800 p-8">
          <h3 className="font-display text-3xl">
            {season.name} <span className="text-base text-gold-400">{season.months}</span>
          </h3>
          <p className="mt-3 max-w-2xl text-lg text-sand-300">{season.text}</p>
        </div>
      </div>
    </section>
  )
}

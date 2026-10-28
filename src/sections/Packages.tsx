import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

type Unit = 'por_pessoa_dia' | 'por_barco_dia' | 'por_barco' | 'sob_cotacao'

type Experience = {
  id: string
  slug: string
  name: string
  description: string | null
  price_cents: number | null
  unit: Unit
  max_people: number | null
}

type PackagesData = {
  experiences: Experience[]
  lodgingCents: number
  depositPercent: number
}

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

async function loadPackages(): Promise<PackagesData> {
  const [exp, settings] = await Promise.all([
    supabase
      .from('experiences')
      .select('id, slug, name, description, price_cents, unit, max_people')
      .order('sort_order'),
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['diaria_hospedagem_cents', 'sinal_percentual']),
  ])

  if (exp.error) throw exp.error
  if (settings.error) throw settings.error

  const get = (key: string) => settings.data.find((s) => s.key === key)?.value as number | undefined

  return {
    experiences: exp.data as Experience[],
    lodgingCents: get('diaria_hospedagem_cents') ?? 0,
    depositPercent: get('sinal_percentual') ?? 50,
  }
}

function Card(props: { tag: string; title: string; priceText: string; unitText: string; text: string }) {
  return (
    <article data-pack-card className="rounded-3xl bg-sand-100 p-8 text-forest-900">
      <p className="text-xs font-bold tracking-[0.1em]">{props.tag}</p>
      <h3 className="mt-3 font-display text-3xl font-semibold">{props.title}</h3>
      <p className="mt-4 text-3xl font-bold">
        {props.priceText} <span className="text-base font-normal">{props.unitText}</span>
      </p>
      <p className="mt-4">{props.text}</p>
    </article>
  )
}

export default function Packages() {
  const root = useRef<HTMLElement>(null)
  const [data, setData] = useState<PackagesData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    loadPackages().then(setData).catch((err) => {
      console.error('Erro ao carregar pacotes:', err)
      setFailed(true)
    })
  }, [])

  // Quando os dados chegam, a página fica mais alta: recalcula as posições da rolagem
  useEffect(() => {
    if (!data) return
    ScrollTrigger.refresh()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-pack-card]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [data])

  const addOns = data?.experiences.filter((e) => e.unit !== 'sob_cotacao') ?? []
  const quote = data?.experiences.find((e) => e.unit === 'sob_cotacao')

  return (
    <section ref={root} id="pacotes" className="mx-auto max-w-6xl px-6 py-24 md:px-16">
      <p className="text-sm font-bold tracking-[0.14em] text-gold-400">PACOTES</p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl">Monte a sua experiência.</h2>

      {failed && (
        <p role="alert" className="mt-10 rounded-2xl bg-forest-800 p-6 text-sand-300">
          Não conseguimos carregar os valores agora. Fale com a pousada pelo WhatsApp para saber os preços.
        </p>
      )}

      {!data && !failed && (
        <div className="mt-10 grid gap-5 md:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-sand-100/10" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card
              tag="BASE DA VIAGEM"
              title="Hospedagem completa"
              priceText={price(data.lodgingCents)}
              unitText="por pessoa/dia"
              text="Café, almoço e janta inclusos. Quartos climatizados e Wi-Fi."
            />
            {addOns.map((e) => (
              <Card
                key={e.id}
                tag="EXCLUSIVO HÓSPEDES"
                title={e.name}
                priceText={e.price_cents ? `+ ${price(e.price_cents)}` : 'Sob cotação'}
                unitText={e.max_people ? `${UNIT_LABEL[e.unit]} (até ${e.max_people} pessoas)` : UNIT_LABEL[e.unit]}
                text={e.description ?? ''}
              />
            ))}
          </div>

          {quote && (
            <div
              data-pack-card
              className="mt-5 flex flex-col gap-6 rounded-3xl bg-forest-800 p-8 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="font-display text-3xl font-semibold">{quote.name}</h3>
                <p className="mt-2 max-w-xl text-sand-300">{quote.description}</p>
              </div>
              <a
                href="#reservar"
                className="whitespace-nowrap rounded-full bg-tuiuiu-500 px-8 py-4 text-center font-bold text-white transition hover:brightness-110"
              >
                Cotar tudo junto
              </a>
            </div>
          )}

          <p className="mt-4 text-sm text-sand-300">
            Sinal de {data.depositPercent}% da hospedagem para confirmar a reserva.
          </p>
        </>
      )}
    </section>
  )
}

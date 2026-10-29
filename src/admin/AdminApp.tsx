import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import LoginForm from './LoginForm'
import ReservationList from './ReservationList'
import PeriodsPanel from './PeriodsPanel'
import ValuesPanel from './ValuesPanel'
import CalendarPanel from './CalendarPanel'

const TABS = [
  { to: '/admin', label: 'Pedidos', end: true },
  { to: '/admin/calendario', label: 'Calendário', end: false },
  { to: '/admin/periodos', label: 'Períodos', end: false },
  { to: '/admin/valores', label: 'Valores', end: false },
]

// IMPORTANT: this panel only hides screens. Real protection is RLS in the database
// (only profiles.role = 'admin' can read reservations), so never rely on this code for security.

type RoleCheck = { userId: string; result: 'admin' | 'denied' | 'offline' }

const DENIED_NOTICE = 'Sem permissão para acessar o painel.'

async function signOut() {
  const { error } = await supabase.auth.signOut()
  // Offline: at least end the session on this device
  if (error) await supabase.auth.signOut({ scope: 'local' })
}

const buttonClass =
  'min-h-12 rounded-full px-8 font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-900'

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined) // undefined = still loading
  const [check, setCheck] = useState<RoleCheck | null>(null)
  const [retry, setRetry] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)

  // Keeps the session across reloads and reacts to sign in / sign out
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  // Role check lives here, not inside onAuthStateChange: calling Supabase from that callback can deadlock the client
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Erro ao verificar permissão:', error)
          setCheck({ userId, result: 'offline' })
          return
        }
        if (data?.role === 'admin') {
          setNotice(null)
          setCheck({ userId, result: 'admin' })
          return
        }
        setNotice(DENIED_NOTICE)
        setCheck({ userId, result: 'denied' })
        void signOut()
      })
    return () => {
      cancelled = true
    }
  }, [userId, retry])

  const status =
    session === undefined
      ? 'loading'
      : !session
        ? 'signed-out'
        : check?.userId !== session.user.id
          ? 'checking'
          : check.result

  return (
    <div className="flex min-h-screen flex-col px-6 py-6 md:px-16">
      <title>Painel | Recanto do Tuiuiú</title>
      <meta name="robots" content="noindex" />

      <header className="flex items-center justify-between gap-4">
        <span className="font-display text-2xl font-semibold">Recanto do Tuiuiú</span>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center text-sand-300 underline-offset-4 hover:text-gold-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          Voltar ao site
        </Link>
      </header>

      <main className={`flex flex-1 justify-center py-12 ${status === 'admin' ? 'items-start' : 'items-center'}`}>
        {(status === 'loading' || status === 'checking') && (
          <p role="status" className="text-sand-300">
            {status === 'loading' ? 'Carregando…' : 'Verificando acesso…'}
          </p>
        )}

        {status === 'signed-out' && <LoginForm notice={notice} />}

        {status === 'denied' && (
          <p role="alert" className="rounded-2xl bg-tuiuiu-500/20 p-5 font-bold">
            {DENIED_NOTICE}
          </p>
        )}

        {status === 'offline' && (
          <div role="alert" className="w-full max-w-md rounded-3xl bg-forest-800 p-6 text-center md:p-10">
            <p className="font-bold">Não foi possível verificar o seu acesso.</p>
            <p className="mt-2 text-sand-300">Verifique a internet e tente de novo.</p>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={() => setRetry((r) => r + 1)} className={`${buttonClass} bg-tuiuiu-500 text-white`}>
                Tentar de novo
              </button>
              <button type="button" onClick={() => void signOut()} className={`${buttonClass} border border-sand-100/40`}>
                Sair
              </button>
            </div>
          </div>
        )}

        {status === 'admin' && session && <Dashboard email={session.user.email ?? ''} />}
      </main>
    </div>
  )
}

function Dashboard({ email }: { email: string }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])

  return (
    <section className="w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 ref={heading} tabIndex={-1} className="font-display text-4xl focus:outline-none md:text-5xl">
            Painel
          </h1>
          <p className="mt-2 text-sand-300">
            Conectado como <b className="text-sand-100">{email}</b>
          </p>
        </div>
        <button type="button" onClick={() => void signOut()} className={`${buttonClass} border border-sand-100/40`}>
          Sair
        </button>
      </div>
      <nav aria-label="Seções do painel" className="-mx-6 mt-8 overflow-x-auto px-6 md:mx-0 md:px-0">
        <ul className="flex min-w-max gap-2 border-b border-sand-100/15 pb-3">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center rounded-full px-5 font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    isActive ? 'bg-gold-400 text-forest-900' : 'bg-sand-100/10 hover:bg-sand-100/15'
                  }`
                }
              >
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8">
        {/* Nested under "/admin/*" in App.tsx */}
        <Routes>
          <Route index element={<ReservationList />} />
          <Route path="calendario" element={<CalendarPanel />} />
          <Route path="periodos" element={<PeriodsPanel />} />
          <Route path="valores" element={<ValuesPanel />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </section>
  )
}

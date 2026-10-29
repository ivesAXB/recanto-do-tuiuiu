import { useState, type FormEvent } from 'react'
import { isAuthRetryableFetchError, type AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Friendly pt-BR messages only; technical details go to the console
function loginErrorMessage(error: AuthError) {
  if (!navigator.onLine || isAuthRetryableFetchError(error)) return 'Sem conexão. Verifique a internet e tente de novo.'
  if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (error.status === 429 || error.code === 'over_request_rate_limit') return 'Muitas tentativas. Aguarde alguns minutos.'
  return 'Não foi possível entrar agora. Tente de novo em instantes.'
}

const inputClass =
  'mt-2 block min-h-12 w-full rounded-xl border border-sand-100/25 bg-forest-950 px-4 text-base text-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400'

export default function LoginForm({ notice }: { notice: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (sending) return
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.')
      return
    }
    setSending(true)
    setError(null)
    // On success, onAuthStateChange (in AdminApp) takes over
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSending(false)
    if (authError) {
      console.error('Erro no login:', authError)
      setError(loginErrorMessage(authError))
      setPassword('')
    }
  }

  const message = error ?? notice

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md rounded-3xl bg-forest-800 p-6 md:p-10">
      <h1 className="font-display text-4xl">Entrar no painel</h1>
      <p className="mt-2 text-sand-300">Acesso restrito à pousada.</p>

      <div aria-live="assertive" className="mt-6">
        {message && (
          <p id="login-error" className="rounded-2xl bg-tuiuiu-500/20 p-4 font-bold">
            {message}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="login-email" className="block font-bold">
          E-mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={message ? 'login-error' : undefined}
          className={inputClass}
        />
      </div>

      <div className="mt-6">
        <label htmlFor="login-password" className="block font-bold">
          Senha
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={message ? 'login-error' : undefined}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-8 min-h-12 w-full rounded-full bg-tuiuiu-500 px-8 font-bold text-white transition hover:brightness-110 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-100 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-800"
      >
        {sending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

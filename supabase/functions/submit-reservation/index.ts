// Supabase Edge Function (Deno): the only way a visitor's reservation reaches the database once
// migration 20261029180000 revokes direct RPC access from anon/authenticated.
//
// Flow: check origin -> verify the Cloudflare Turnstile token on the server -> call
// create_reservation_request with the server-side credentials Supabase injects into Edge Functions.
//
// Secrets (Supabase dashboard -> Edge Functions -> Secrets), never in the repository:
//   TURNSTILE_SECRET_KEY   Turnstile secret key (Cloudflare)
// Injected automatically by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Deploy with JWT verification OFF (the captcha + origin check protect it); see README.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://ivesaxb.github.io',
  'https://recantodotuiuiu.com.br',
  'https://www.recantodotuiuiu.com.br',
  'http://localhost:5173',
]
const ALLOWED_HOSTNAMES = ['ivesaxb.github.io', 'recantodotuiuiu.com.br', 'www.recantodotuiuiu.com.br', 'localhost']
const TURNSTILE_ACTION = 'reservation'
const RATE_LIMIT_PREFIX = 'Muitos pedidos em pouco tempo' // message raised by create_reservation_request

type ErrorCode = 'captcha' | 'limite' | 'dados' | 'origem' | 'erro'

function json(body: unknown, status: number, origin: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }
  return new Response(JSON.stringify(body), { status, headers })
}

const fail = (code: ErrorCode, status: number, origin: string | null) => json({ error: code }, status, origin)

const isString = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

async function verifyTurnstile(token: string, ip: string | null) {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY not set')
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  const outcome = await res.json()
  // Cloudflare's dummy test secrets do not report the real hostname/action
  const testSecret = /^[123]x0{20,}/.test(secret)
  return (
    outcome.success === true &&
    (testSecret || (ALLOWED_HOSTNAMES.includes(outcome.hostname) && outcome.action === TURNSTILE_ACTION))
  )
}

Deno.serve(async (req) => {
  const requestOrigin = req.headers.get('Origin')
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : null

  if (req.method === 'OPTIONS') {
    if (!origin) return new Response(null, { status: 403 })
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    })
  }
  if (!origin) return fail('origem', 403, null)
  if (req.method !== 'POST') return fail('erro', 405, origin)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return fail('dados', 400, origin)
  }

  const ids = body.experience_ids
  if (
    !isString(body.turnstile_token, 2048) ||
    !isString(body.guest_name, 120) ||
    !isString(body.whatsapp, 20) ||
    !(body.email === null || isString(body.email, 254)) ||
    !isDate(body.check_in) ||
    !isDate(body.check_out) ||
    !Number.isInteger(body.guests) ||
    !(body.message === null || isString(body.message, 1000)) ||
    !Array.isArray(ids) ||
    ids.length > 20 ||
    !ids.every((id) => isString(id, 36))
  ) {
    return fail('dados', 400, origin)
  }

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  try {
    if (!(await verifyTurnstile(body.turnstile_token, ip))) return fail('captcha', 400, origin)
  } catch (err) {
    console.error('Turnstile verification failed', err)
    return fail('erro', 502, origin)
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
  const { data, error } = await supabase.rpc('create_reservation_request', {
    p_guest_name: body.guest_name,
    p_whatsapp: body.whatsapp,
    p_email: body.email,
    p_check_in: body.check_in,
    p_check_out: body.check_out,
    p_guests: body.guests,
    p_message: body.message,
    p_experience_ids: ids,
  })

  if (error) {
    console.error('create_reservation_request failed', error.code, error.message)
    if ((error.message ?? '').startsWith(RATE_LIMIT_PREFIX)) return fail('limite', 429, origin)
    // P0001 = business rule (e.g. past date); 22xxx/23xxx = invalid data / constraint
    if (error.code === 'P0001' || /^2[23]/.test(error.code ?? '')) return fail('dados', 400, origin)
    return fail('erro', 500, origin)
  }
  return json({ id: data }, 200, origin)
})

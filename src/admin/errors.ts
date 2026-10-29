// Thrown when an update matched no row because the record changed on the server meanwhile
export class StaleError extends Error {
  constructor() {
    super('stale')
    this.name = 'StaleError'
  }
}

export const STALE_MESSAGE = 'Este pedido mudou enquanto você olhava. Atualizamos a lista.'

// Friendly pt-BR messages only; technical details go to the console
export function friendlyError(err: unknown, fallback = 'Não foi possível salvar. Tente de novo.') {
  console.error(err)
  if (err instanceof StaleError) return STALE_MESSAGE
  const e = (err ?? {}) as { code?: string; message?: string; status?: number }
  if (navigator.onLine === false || /failed to fetch|network/i.test(e.message ?? '')) return 'Sem conexão. Verifique a internet e tente de novo.'
  if (e.code === 'PGRST301' || e.status === 401 || /jwt/i.test(e.message ?? '')) return 'Sua sessão expirou. Saia e entre de novo.'
  if (e.code === 'P0001') return 'Essa mudança de status não é permitida. Atualize a lista e tente de novo.'
  if (e.code === 'PGRST116') return 'Não foi possível salvar: item não encontrado ou sem permissão.'
  if (e.code === '23505') return 'Já existe um item com esse nome.'
  if (e.code === '23514') return 'Algum valor não é aceito. Confira os campos.'
  return fallback
}

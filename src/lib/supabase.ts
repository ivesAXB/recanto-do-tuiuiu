import { createClient } from '@supabase/supabase-js'

// Só chaves PÚBLICAS ficam aqui (URL do projeto e a "publishable key").
// A segurança dos dados vem das regras RLS do banco, não do segredo desta chave.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env (reinicie o npm run dev depois de editar).')
}

export const supabase = createClient(url, key)

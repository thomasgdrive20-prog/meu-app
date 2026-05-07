import { createClient } from '@supabase/supabase-js'

// ─── CLIENT ───────────────────────────────────────────────────────────────────
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[Atlas] Variáveis de ambiente do Supabase não encontradas.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── USER ─────────────────────────────────────────────────────────────────────
// Fixo por enquanto. Para multiusuário futuro, trocar por auth.getUser()
export const USER_ID = 'thomas_01'

// ─── TABELAS VÁLIDAS ──────────────────────────────────────────────────────────
const VALID_TABLES = new Set([
  'workout_logs', 'body_metrics', 'meal_logs', 'exames',
  'aplicacoes', 'dieta_logs', 'photos', 'supl_logs',
])

function assertTable(table) {
  if (!VALID_TABLES.has(table)) {
    throw new Error(`[Atlas] Tabela inválida: "${table}"`)
  }
}

const isDev = import.meta.env.DEV
function logError(op, table, error) {
  if (isDev) console.error(`[Atlas] ${op}("${table}"):`, error?.message || error)
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export async function dbSelect(table) {
  assertTable(table)
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false })
  if (error) { logError('SELECT', table, error); return [] }
  return data ?? []
}

export async function dbInsert(table, row) {
  assertTable(table)
  const { data, error } = await supabase
    .from(table)
    .insert({ ...row, user_id: USER_ID })
    .select()
    .single()
  if (error) { logError('INSERT', table, error); return null }
  return data
}

export async function dbUpdate(table, id, row) {
  assertTable(table)
  const { id: _id, user_id: _uid, created_at: _ca, ...safeRow } = row
  const { data, error } = await supabase
    .from(table)
    .update({ ...safeRow, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', USER_ID)
    .select()
    .single()
  if (error) { logError('UPDATE', table, error); return null }
  return data
}

export async function dbDelete(table, id) {
  assertTable(table)
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', USER_ID)
  if (error) { logError('DELETE', table, error); return false }
  return true
}

// Carrega múltiplas tabelas em paralelo — falha individual não derruba as demais
export async function dbSelectMany(tables) {
  const results = await Promise.allSettled(tables.map(t => dbSelect(t)))
  return Object.fromEntries(
    tables.map((t, i) => [t, results[i].status === 'fulfilled' ? results[i].value : []])
  )
}

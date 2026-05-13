import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Helpers genéricos com user_id obrigatório ────────────────────────────────

export async function dbGet(table, userId, filters = {}) {
  let q = supabase.from(table).select('*').eq('user_id', userId)
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
  const { data, error } = await q
  if (error) { console.error(`[db] GET ${table}:`, error.message); return [] }
  return data
}

export async function dbGetOne(table, userId, filters = {}) {
  let q = supabase.from(table).select('*').eq('user_id', userId)
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
  const { data, error } = await q.maybeSingle()
  if (error) { console.error(`[db] GET_ONE ${table}:`, error.message); return null }
  return data
}

export async function dbInsert(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) { console.error(`[db] INSERT ${table}:`, error.message); return null }
  return data
}

export async function dbUpsert(table, row, conflictColumn = 'id') {
  const { data, error } = await supabase
    .from(table).upsert(row, { onConflict: conflictColumn }).select().single()
  if (error) { console.error(`[db] UPSERT ${table}:`, error.message); return null }
  return data
}

export async function dbUpdate(table, id, patch) {
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (error) console.error(`[db] UPDATE ${table}:`, error.message)
  return !error
}

export async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.error(`[db] DELETE ${table}:`, error.message)
  return !error
}

// ─── Helpers específicos de data ──────────────────────────────────────────────

export function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

/** Busca registros de hoje */
export async function dbGetToday(table, userId, extraFilters = {}) {
  return dbGet(table, userId, { date: todayDate(), ...extraFilters })
}

/** Upsert por user_id + date (índice único) */
export async function dbUpsertToday(table, userId, patch) {
  const row = { user_id: userId, date: todayDate(), ...patch }
  const { data, error } = await supabase
    .from(table).upsert(row, { onConflict: 'user_id,date' }).select().single()
  if (error) { console.error(`[db] UPSERT_TODAY ${table}:`, error.message); return null }
  return data
}

/** Toggle de um log de suplemento/refeição pelo dia */
export async function dbToggleDayLog(table, userId, itemKey, itemId) {
  const today = todayDate()
  const { data: existing } = await supabase
    .from(table).select('id').eq('user_id', userId)
    .eq(itemKey, itemId).eq('date', today).maybeSingle()

  if (existing) {
    await supabase.from(table).delete().eq('id', existing.id)
    return false // agora está OFF
  } else {
    await supabase.from(table).insert({ user_id: userId, [itemKey]: itemId, date: today })
    return true // agora está ON
  }
}

/** Carrega múltiplas tabelas em paralelo */
export async function dbLoadMany(tables, userId) {
  const results = await Promise.all(
    tables.map(t => dbGet(t, userId))
  )
  return Object.fromEntries(tables.map((t, i) => [t, results[i]]))
}

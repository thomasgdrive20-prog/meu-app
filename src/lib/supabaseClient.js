import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const USER_ID = 'thomas_01'

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export async function dbSelect(table, extra = '') {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false })
  if (error) { console.error('dbSelect', table, error); return [] }
  return data ?? []
}

export async function dbInsert(table, row) {
  const { data, error } = await supabase
    .from(table)
    .insert({ ...row, user_id: USER_ID })
    .select()
    .single()
  if (error) { console.error('dbInsert', table, error); return null }
  return data
}

export async function dbUpdate(table, id, row) {
  const { data, error } = await supabase
    .from(table)
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', USER_ID)
    .select()
    .single()
  if (error) { console.error('dbUpdate', table, error); return null }
  return data
}

export async function dbDelete(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', USER_ID)
  if (error) { console.error('dbDelete', table, error); return false }
  return true
}

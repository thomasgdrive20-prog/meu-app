import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, X, Check, Zap, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import useAppStore from '../stores/useAppStore'
import { DIET, SUPLS, NUTRITION_GOALS, T } from '../lib/constants'
import { DIET_GLP1, GLP1_TOTALS, GLP1_META } from '../lib/glp1Plan'

const todayStr = () => new Date().toISOString().slice(0, 10)

// ── Macro pill ────────────────────────────────────────────────────────────────
const MacroPill = ({ label, value, total, unit, color }) => {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9, color: T.muted }}>{unit}</div>
      <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{label}</div>
      <div style={{ height: 2, borderRadius: 999, background: T.border, overflow: 'hidden', marginTop: 6 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}

// ── Modal de edição de refeição ───────────────────────────────────────────────
function EditMealModal({ meal, session, onClose, onSaved }) {
  const uid = session.user.id
  const [mode, setMode] = useState('today') // 'today' | 'plan'
  const [form, setForm] = useState({
    label: meal.label, time: meal.time,
    kcal: meal.kcal, prot: meal.prot,
    carbs: meal.carbs || '', fat: meal.fat || '',
    notes: '',
    options: meal.options ? meal.options.join('\n') : '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    if (mode === 'today') {
      await supabase.from('meal_day_override').upsert({
        user_id: uid, date: todayStr(), meal_id: meal.id,
        kcal: parseInt(form.kcal), prot: parseInt(form.prot), notes: form.notes,
      }, { onConflict: 'user_id,date,meal_id' })
    } else {
      await supabase.from('meal_plan').upsert({
        user_id: uid, meal_id: meal.id, label: form.label,
        time: form.time, kcal: parseInt(form.kcal), prot: parseInt(form.prot),
        carbs: parseInt(form.carbs) || null, fat: parseInt(form.fat) || null,
        options: form.options.split('\n').filter(Boolean), is_glp1: false,
      }, { onConflict: 'user_id,meal_id,is_glp1' })
    }
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000000CC', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        style={{ background: T.card, borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 428, maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, color: T.gold, fontWeight: 700 }}>Editar {meal.label}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color={T.muted} />
          </button>
        </div>

        {/* Modo */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[{ id: 'today', label: 'Só hoje' }, { id: 'plan', label: 'Plano permanente' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${mode === m.id ? T.gold + '50' : T.border}`, background: mode === m.id ? `${T.gold}15` : T.surface, color: mode === m.id ? T.gold : T.muted }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: T.muted, marginBottom: 14, fontStyle: 'italic' }}>
          {mode === 'today' ? 'Esta edição vale apenas para hoje e some amanhã.' : 'Esta edição altera seu plano base permanentemente.'}
        </div>

        {/* Campos */}
        {[
          { label: 'Calorias (kcal)', key: 'kcal', type: 'number' },
          { label: 'Proteína (g)', key: 'prot', type: 'number' },
          { label: 'Carbs (g)', key: 'carbs', type: 'number' },
          { label: 'Gordura (g)', key: 'fat', type: 'number' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        ))}

        {mode === 'today' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Notas do dia</label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Ex: comi menos por causa do GLP-1"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        )}

        {mode === 'plan' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Opções (uma por linha)</label>
            <textarea value={form.options} onChange={e => setForm(p => ({ ...p, options: e.target.value }))}
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        )}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: `${T.gold}18`, border: `1px solid ${T.gold}40`, color: T.gold, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Salvando...' : '✓ Salvar'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── Modal de suplemento customizado ──────────────────────────────────────────
function AddSuplModal({ session, onClose, onSaved }) {
  const uid = session.user.id
  const [form, setForm] = useState({ name: '', dose: '', time: 'Manhã', schedule: 'Diário', obs: '' })
  const [saving, setSaving] = useState(false)

  const TIMES = ['Manhã', 'Almoço', 'Tarde', 'Pré-Treino', 'Pós-Treino', 'Noite', 'Qualquer']
  const SCHEDULES = ['Diário', 'Seg + Qui', 'Seg + Qui + Sáb', 'Semanal', '2x por semana']

  const handleSave = async () => {
    if (!form.name || !form.dose) return
    setSaving(true)
    await supabase.from('custom_supls').insert({ user_id: uid, ...form })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000000CC', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        style={{ background: T.card, borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 428, maxHeight: '85vh', overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, color: T.gold, fontWeight: 700 }}>Novo suplemento</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color={T.muted} /></button>
        </div>

        {[
          { label: 'Nome', key: 'name', placeholder: 'Ex: Vitamina C' },
          { label: 'Dose', key: 'dose', placeholder: 'Ex: 500mg' },
          { label: 'Observação', key: 'obs', placeholder: 'Opcional...' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{f.label}</label>
            <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Horário</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TIMES.map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, time: t }))}
                style={{ padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.time === t ? T.gold + '50' : T.border}`, background: form.time === t ? `${T.gold}15` : T.surface, color: form.time === t ? T.gold : T.muted }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Frequência</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SCHEDULES.map(s => (
              <button key={s} onClick={() => setForm(p => ({ ...p, schedule: s }))}
                style={{ padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.schedule === s ? T.horm + '50' : T.border}`, background: form.schedule === s ? `${T.horm}15` : T.surface, color: form.schedule === s ? T.horm : T.muted }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: `${T.ok}18`, border: `1px solid ${T.ok}40`, color: T.ok, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Salvando...' : '✓ Adicionar suplemento'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function NutriPage({ session }) {
  const uid = session.user.id
  const { mealDone, toggleMeal, suplDone, toggleSupl } = useAppStore()

  const [glp1, setGlp1]           = useState(false)
  const [glp1Loading, setGlp1Loading] = useState(true)
  const [customSupls, setCustomSupls] = useState([])
  const [overrides, setOverrides]  = useState({})
  const [editMeal, setEditMeal]    = useState(null)
  const [addingSupl, setAddingSupl] = useState(false)
  const [tab, setTab]              = useState('refeicoes')

  useEffect(() => {
    loadGlp1()
    loadCustomSupls()
    loadOverrides()
  }, [])

  const loadGlp1 = async () => {
    const { data } = await supabase.from('day_flags').select('glp1_active')
      .eq('user_id', uid).eq('date', todayStr()).maybeSingle()
    setGlp1(data?.glp1_active || false)
    setGlp1Loading(false)
  }

  const toggleGlp1 = async () => {
    const next = !glp1
    setGlp1(next)
    await supabase.from('day_flags').upsert(
      { user_id: uid, date: todayStr(), glp1_active: next, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    )
  }

  const loadCustomSupls = async () => {
    const { data } = await supabase.from('custom_supls').select('*')
      .eq('user_id', uid).eq('active', true).order('created_at')
    if (data) setCustomSupls(data)
  }

  const loadOverrides = async () => {
    const { data } = await supabase.from('meal_day_override').select('*')
      .eq('user_id', uid).eq('date', todayStr())
    if (data) {
      const map = {}
      data.forEach(o => { map[o.meal_id] = o })
      setOverrides(map)
    }
  }

  const deleteCustomSupl = async (id) => {
    await supabase.from('custom_supls').update({ active: false }).eq('id', id)
    setCustomSupls(prev => prev.filter(s => s.id !== id))
  }

  const activeDiet = glp1 ? DIET_GLP1 : DIET
  const goals = glp1
    ? { calories: GLP1_META.kcal.max, protein: GLP1_META.prot.max, carbs: GLP1_META.carbs.max, fat: GLP1_META.fat.max }
    : { calories: 2350, protein: 215, carbs: 220, fat: 65 }

  // Macros consumidos hoje (com overrides)
  const eatenKcal = activeDiet.filter(m => mealDone.includes(m.id))
    .reduce((s, m) => s + (overrides[m.id]?.kcal ?? m.kcal), 0)
  const eatenProt = activeDiet.filter(m => mealDone.includes(m.id))
    .reduce((s, m) => s + (overrides[m.id]?.prot ?? m.prot), 0)
  const totalKcal = activeDiet.reduce((s, m) => s + m.kcal, 0)
  const pct = Math.min(100, Math.round((eatenKcal / totalKcal) * 100))

  const allSupls = [...SUPLS, ...customSupls]

  return (
    <div style={{ padding: '20px 14px', paddingTop: 'calc(env(safe-area-inset-top) + 18px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: T.goldLow, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Nutrição</div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 3, letterSpacing: -0.5 }}>Plano do dia</div>
      </motion.div>

      {/* Toggle GLP-1 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: T.card, border: `1px solid ${glp1 ? T.nutri + '40' : T.border}`, borderRadius: 16, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, boxShadow: glp1 ? `0 0 20px ${T.nutri}12` : 'none' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💉</span>
            <span style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>Dia com Tirzepatida</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
            {glp1 ? 'Plano adaptado — porções menores, foco em proteína' : 'Plano normal ativo'}
          </div>
          {glp1 && (
            <div style={{ fontSize: 10, color: T.nutri, marginTop: 4 }}>
              Meta: {GLP1_META.kcal.min}–{GLP1_META.kcal.max} kcal · {GLP1_META.prot.min}–{GLP1_META.prot.max}g prot
            </div>
          )}
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleGlp1}
          style={{ width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative', background: glp1 ? T.nutri : T.surface, transition: 'background 0.3s', flexShrink: 0 }}>
          <motion.div animate={{ x: glp1 ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ position: 'absolute', top: 2, left: 0, width: 24, height: 24, borderRadius: '50%', background: T.text }} />
        </motion.button>
      </motion.div>

      {/* Resumo de macros */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          {[
            { label: 'Consumidas', value: eatenKcal, color: T.gold, unit: 'kcal' },
            { label: 'Meta',       value: totalKcal, color: T.muted, unit: 'kcal' },
            { label: 'Proteína',   value: `${eatenProt}g`, color: T.treino, unit: '' },
            { label: 'Refeições',  value: `${mealDone.length}/${activeDiet.length}`, color: T.text, unit: '' },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: T.muted }}>{m.unit}</div>
              <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
            style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${T.ok}80, ${T.ok})` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: T.muted }}>0 kcal</span>
          <span style={{ fontSize: 9, color: T.gold, fontWeight: 700 }}>{pct}%</span>
          <span style={{ fontSize: 9, color: T.muted }}>{totalKcal} kcal</span>
        </div>
      </motion.div>

      {/* Macros detalhados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
        <MacroPill label="Calorias" value={goals.calories} total={goals.calories} unit="kcal" color={T.gold} />
        <MacroPill label="Proteína" value={goals.protein}  total={goals.protein}  unit="g"    color={T.treino} />
        <MacroPill label="Carbs"    value={goals.carbs}    total={goals.carbs}    unit="g"    color={T.horm} />
        <MacroPill label="Gordura"  value={goals.fat}      total={goals.fat}      unit="g"    color={T.nutri} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[{ id: 'refeicoes', label: 'Refeições' }, { id: 'supls', label: 'Suplementos' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${tab === t.id ? T.gold + '50' : T.border}`, background: tab === t.id ? `${T.gold}15` : T.surface, color: tab === t.id ? T.gold : T.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* REFEIÇÕES */}
      {tab === 'refeicoes' && activeDiet.map((meal, idx) => {
        const done = mealDone.includes(meal.id)
        const ov   = overrides[meal.id]
        const kcal = ov?.kcal ?? meal.kcal
        const prot = ov?.prot ?? meal.prot
        return (
          <motion.div key={meal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
            style={{ background: done ? `${T.ok}06` : T.card, border: `1px solid ${done ? T.ok + '35' : T.border}`, borderRadius: 14, padding: '14px', marginBottom: 8, transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: T.gold, fontWeight: 700 }}>{meal.time}</span>
                  <span style={{ fontSize: 14, color: done ? T.ok : T.text, fontWeight: 700 }}>{meal.label}</span>
                  {done && <Check size={12} color={T.ok} />}
                  {ov && <span style={{ fontSize: 9, color: T.horm, background: `${T.horm}15`, padding: '1px 5px', borderRadius: 4 }}>editado hoje</span>}
                  {glp1 && meal.glp1_note && <span style={{ fontSize: 9, color: T.nutri, background: `${T.nutri}15`, padding: '1px 5px', borderRadius: 4 }}>GLP-1</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted }}>{kcal} kcal · {prot}g proteína</div>
                {!done && meal.options?.map((opt, i) => (
                  <div key={i} style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginTop: 4 }}>· {opt}</div>
                ))}
                {glp1 && meal.glp1_note && !done && (
                  <div style={{ fontSize: 10, color: T.nutri, marginTop: 6, fontStyle: 'italic' }}>💉 {meal.glp1_note}</div>
                )}
                {ov?.notes && <div style={{ fontSize: 10, color: T.horm, marginTop: 4, fontStyle: 'italic' }}>{ov.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setEditMeal(meal)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={11} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleMeal(meal.id)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${done ? T.ok + '45' : T.border}`, background: done ? `${T.ok}15` : T.surface, color: done ? T.ok : T.muted, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {done ? '✓' : '+'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* SUPLEMENTOS */}
      {tab === 'supls' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setAddingSupl(true)}
            style={{ width: '100%', padding: '12px', borderRadius: 12, marginBottom: 12, background: `${T.ok}12`, border: `1px solid ${T.ok}30`, color: T.ok, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={14} /> Adicionar suplemento
          </motion.button>

          {allSupls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: T.muted, fontSize: 13 }}>Nenhum suplemento ativo</div>
          ) : allSupls.map((s, i) => {
            const done = suplDone.includes(s.id)
            const isCustom = !!s.active // campo só existe nos custom
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: done ? `${T.ok}06` : T.card, border: `1px solid ${done ? T.ok + '35' : T.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: done ? T.ok : (s.color || T.gold), fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{s.dose} · {s.time || s.schedule}</div>
                  {s.obs && <div style={{ fontSize: 10, color: T.muted, marginTop: 2, fontStyle: 'italic' }}>{s.obs}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {isCustom && (
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => deleteCustomSupl(s.id)}
                      style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.subtle}`, background: 'transparent', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={11} />
                    </motion.button>
                  )}
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSupl(s.id)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${done ? T.ok + '45' : T.border}`, background: done ? `${T.ok}15` : T.surface, color: done ? T.ok : T.muted, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? '✓' : '+'}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modais */}
      <AnimatePresence>
        {editMeal && (
          <EditMealModal meal={editMeal} session={session}
            onClose={() => setEditMeal(null)}
            onSaved={() => loadOverrides()} />
        )}
        {addingSupl && (
          <AddSuplModal session={session}
            onClose={() => setAddingSupl(false)}
            onSaved={() => loadCustomSupls()} />
        )}
      </AnimatePresence>

    </div>
  )
}
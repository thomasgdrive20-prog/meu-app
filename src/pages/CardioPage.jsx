import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, TrendingUp, Clock, Target, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { CARDIO_TYPES, CARDIO_ZONES, CARDIO_META_SEMANAL, T } from '../lib/constants'

const todayStr = () => new Date().toISOString().slice(0, 10)

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

function StatusBar({ label, current, meta, color, unit = 'min' }) {
  const pct = Math.min(100, Math.round((current / meta) * 100))
  const ok = current >= meta
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: ok ? T.ok : color }}>
          {current}/{meta}{unit} {ok ? '✓' : `(${pct}%)`}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: T.border, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 999, background: ok ? T.ok : color, boxShadow: ok ? `0 0 8px ${T.ok}60` : 'none' }}
        />
      </div>
    </div>
  )
}

export default function CardioPage({ session }) {
  const uid = session?.user?.id
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type_id: 'escada', duration_min: '', zone: 2, notes: '', date: todayStr() })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('hoje')

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const weekStart = getWeekStart()
    const { data } = await supabase
      .from('cardio_logs').select('*').eq('user_id', uid)
      .gte('date', weekStart).order('date', { ascending: false })
    if (data) setLogs(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.duration_min || parseInt(form.duration_min) < 1) return
    setSaving(true)
    const { data, error } = await supabase.from('cardio_logs').insert({
      user_id: uid,
      date: form.date,
      type_id: form.type_id,
      duration_min: parseInt(form.duration_min),
      zone: form.zone,
      notes: form.notes,
    }).select().single()
    if (!error && data) {
      setLogs(prev => [data, ...prev])
      setForm({ type_id: 'escada', duration_min: '', zone: 2, notes: '', date: todayStr() })
      setAdding(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('cardio_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // Analytics semanais
  const weekLogs = logs
  const todayLogs = logs.filter(l => l.date === todayStr())

  const zona2Min  = weekLogs.filter(l => l.zone === 2).reduce((s, l) => s + l.duration_min, 0)
  const zona3Min  = weekLogs.filter(l => l.zone === 3).reduce((s, l) => s + l.duration_min, 0)
  const totalMin  = weekLogs.reduce((s, l) => s + l.duration_min, 0)
  const diasAtivos = new Set(weekLogs.map(l => l.date)).size
  const meta2ok   = zona2Min >= CARDIO_META_SEMANAL.zona2_min
  const meta3ok   = zona3Min >= CARDIO_META_SEMANAL.zona3_min

  // Score de cardio semanal
  const cardioScore = Math.min(100, Math.round(
    (zona2Min / CARDIO_META_SEMANAL.zona2_min) * 70 +
    Math.min(1, zona3Min / CARDIO_META_SEMANAL.zona3_min) * 30
  ))

  const scoreLabel = cardioScore >= 90 ? { label: 'No alvo', color: T.ok } :
                     cardioScore >= 60 ? { label: 'Em progresso', color: T.gold } :
                                         { label: 'Abaixo da meta', color: T.warn }

  const getType = (id) => CARDIO_TYPES.find(t => t.id === id) || CARDIO_TYPES[0]
  const getZone = (z) => CARDIO_ZONES.find(zn => zn.id === z) || CARDIO_ZONES[1]

  return (
    <div style={{ padding: '20px 14px', paddingTop: 'calc(env(safe-area-inset-top) + 18px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: T.goldLow, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Cardio</div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 3, letterSpacing: -0.5 }}>Zona aeróbica</div>
      </motion.div>

      {/* Score semanal */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: T.card, border: `1px solid ${scoreLabel.color}25`, borderRadius: 18, padding: '16px', marginBottom: 10, boxShadow: `0 0 24px ${scoreLabel.color}10` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Esta semana</div>
            <div style={{ fontSize: 20, color: scoreLabel.color, fontWeight: 800 }}>{scoreLabel.label}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{diasAtivos} dias ativos · {totalMin}min total</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: scoreLabel.color, letterSpacing: -1 }}>{cardioScore}</div>
            <div style={{ fontSize: 9, color: T.muted }}>score</div>
          </div>
        </div>

        <StatusBar label="Zona 2 — Fat burning" current={zona2Min} meta={CARDIO_META_SEMANAL.zona2_min} color={T.horm} />
        <StatusBar label="Zona 3 — Intenso (opcional)" current={zona3Min} meta={CARDIO_META_SEMANAL.zona3_min} color={T.gold} />

        {meta2ok && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, background: `${T.ok}10`, border: `1px solid ${T.ok}25`, fontSize: 11, color: T.ok, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={13} />
            Meta de Zona 2 atingida — gordura sendo oxidada eficientemente.
          </div>
        )}

        <div style={{ fontSize: 10, color: T.muted, marginTop: 10, lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
          {CARDIO_META_SEMANAL.obs}
        </div>
      </motion.div>

      {/* Botão adicionar */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setAdding(a => !a)}
        style={{ width: '100%', padding: '13px', borderRadius: 14, marginBottom: 10, background: adding ? `${T.border}` : `${T.gold}15`, border: `1px solid ${adding ? T.border : T.gold + '35'}`, color: adding ? T.muted : T.gold, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Plus size={15} />
        {adding ? 'Cancelar' : 'Registrar cardio'}
      </motion.button>

      {/* Formulário */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px' }}>
              <div style={{ fontSize: 12, color: T.gold, fontWeight: 700, marginBottom: 14 }}>Nova sessão</div>

              {/* Data */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Data</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Tipo */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Tipo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {CARDIO_TYPES.map(t => {
                    const sel = form.type_id === t.id
                    return (
                      <motion.button key={t.id} whileTap={{ scale: 0.94 }} onClick={() => setForm(f => ({ ...f, type_id: t.id }))}
                        style={{ padding: '10px', borderRadius: 10, border: `1px solid ${sel ? T.gold + '50' : T.border}`, background: sel ? `${T.gold}15` : T.surface, cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ fontSize: 16, marginBottom: 2 }}>{t.emoji}</div>
                        <div style={{ fontSize: 12, color: sel ? T.gold : T.text, fontWeight: 600 }}>{t.label}</div>
                        <div style={{ fontSize: 10, color: T.muted }}>{t.desc}</div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Zona */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Zona</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {CARDIO_ZONES.map(z => {
                    const sel = form.zone === z.id
                    return (
                      <motion.button key={z.id} whileTap={{ scale: 0.92 }} onClick={() => setForm(f => ({ ...f, zone: z.id }))}
                        style={{ flex: 1, padding: '10px 6px', borderRadius: 10, border: `1px solid ${sel ? z.color + '50' : T.border}`, background: sel ? `${z.color}18` : T.surface, cursor: 'pointer' }}>
                        <div style={{ fontSize: 12, color: sel ? z.color : T.text, fontWeight: 700 }}>{z.label}</div>
                        <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{z.fc}</div>
                      </motion.button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6, fontStyle: 'italic' }}>
                  {getZone(form.zone).desc}
                </div>
              </div>

              {/* Duração */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Duração (minutos)</label>
                <input type="number" inputMode="numeric" placeholder="Ex: 25" value={form.duration_min}
                  onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 16, outline: 'none', boxSizing: 'border-box', textAlign: 'center', fontWeight: 700, fontFamily: 'inherit' }} />
              </div>

              {/* Notas */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Notas (opcional)</label>
                <input type="text" placeholder="Ex: Jejum, manhã, FC média 132bpm..." value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: `${T.ok}18`, border: `1px solid ${T.ok}40`, color: T.ok, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Salvando...' : '✓ Salvar sessão'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico da semana */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px' }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
          Sessões desta semana
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: T.muted, fontSize: 13 }}>Carregando...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏃</div>
            <div style={{ fontSize: 13, color: T.muted }}>Nenhuma sessão registrada</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Meta: 150min/semana em Zona 2</div>
          </div>
        ) : logs.map((log, i) => {
          const type = getType(log.type_id)
          const zone = getZone(log.zone)
          const isToday = log.date === todayStr()
          return (
            <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < logs.length - 1 ? `1px solid ${T.subtle}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{type.emoji}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{type.label}</span>
                    {isToday && <span style={{ fontSize: 9, color: T.gold, fontWeight: 700, padding: '2px 6px', background: `${T.gold}15`, borderRadius: 4 }}>hoje</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={9} /> {log.duration_min}min
                    </span>
                    <span style={{ fontSize: 10, color: zone.color, fontWeight: 600 }}>{zone.label}</span>
                    <span style={{ fontSize: 10, color: T.muted }}>{zone.fc}</span>
                  </div>
                  {log.notes && <div style={{ fontSize: 10, color: T.muted, marginTop: 2, fontStyle: 'italic' }}>{log.notes}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: T.muted }}>{new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}</div>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDelete(log.id)}
                  style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: `1px solid ${T.subtle}`, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={11} />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

    </div>
  )
}

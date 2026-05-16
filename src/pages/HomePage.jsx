import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, ChevronRight, Scale, Pill, Utensils } from 'lucide-react'
import useAppStore from '../stores/useAppStore'
import { SPLIT, DIET, SUPLS, PROTOCOL_COMPOUNDS, T } from '../lib/constants'

function getTodayWorkout() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return SPLIT.find(d => d.day === days[new Date().getDay()]) || SPLIT[0]
}

const Card = ({ children, style = {}, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    style={{
      background: T.card,
      border: `1px solid ${accent ? accent + '28' : T.border}`,
      borderRadius: 16, padding: '16px', marginBottom: 10,
      boxShadow: accent ? `0 2px 20px ${accent}0A` : 'none',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </motion.div>
)

const Label = ({ children }) => (
  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
    {children}
  </div>
)

function WaterRing({ value, max }) {
  const pct = Math.min(1, value / max)
  const R = 26, C = 2 * Math.PI * R
  const done = value >= max
  return (
    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={R} fill="none" stroke={T.border} strokeWidth="4" />
        <motion.circle cx="32" cy="32" r={R} fill="none"
          stroke={done ? T.ok : T.horm} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Droplets size={12} color={done ? T.ok : T.horm} />
        <span style={{ fontSize: 10, fontWeight: 800, color: done ? T.ok : T.text, marginTop: 1 }}>{value}L</span>
      </div>
    </div>
  )
}

function WeightSparkline({ weights }) {
  if (weights.length < 2) return null
  const vals = weights.map(w => parseFloat(w.weight))
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1
  const W = 280, H = 44
  const pts = [...weights].reverse()
  const points = pts.map((w, i) => `${(i / (pts.length - 1)) * W},${H - ((parseFloat(w.weight) - min) / range) * (H - 8) - 4}`).join(' ')
  const lastY = H - ((parseFloat(weights[0].weight) - min) / range) * (H - 8) - 4
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', marginTop: 8 }}>
      <polyline fill="none" stroke={`${T.gold}50`} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
      <circle cx={W} cy={lastY} r="3.5" fill={T.gold} />
      <circle cx={W} cy={lastY} r="7" fill={`${T.gold}25`} />
    </svg>
  )
}

// Suplementos diários vs semanais
const DAILY_SUPLS = SUPLS // todos diários
const DAILY_PROTO = PROTOCOL_COMPOUNDS.filter(c => c.schedule === 'Diário')
const WEEKLY_PROTO = PROTOCOL_COMPOUNDS.filter(c => c.schedule !== 'Diário')

export default function HomePage({ session, setPage }) {
  const workout = getTodayWorkout()
  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 'Thomas'
  const { water, setWater, weights, addWeight, deleteWeight, suplDone, toggleSupl, mealDone, toggleMeal, activeWorkout } = useAppStore()
  const [weightInput, setWeightInput] = useState('')
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const todayWeight = weights.find(w => w.date === today)
  const last7 = weights.slice(0, 7)
  const avgWeight = last7.length ? (last7.reduce((s, w) => s + parseFloat(w.weight), 0) / last7.length).toFixed(1) : null
  const prevWeight = weights.find(w => { const d = new Date(); d.setDate(d.getDate() - 1); return w.date === d.toISOString().slice(0, 10) })
  const diff = todayWeight && prevWeight ? (parseFloat(todayWeight.weight) - parseFloat(prevWeight.weight)).toFixed(1) : null

  const handleSave = async () => {
    const v = parseFloat(weightInput.replace(',', '.'))
    if (!v || v < 30 || v > 250) return
    setSaving(true)
    await addWeight(v)
    setWeightInput('')
    setSaving(false)
  }

  const allDailySupls = [...DAILY_SUPLS, ...DAILY_PROTO]
  const suplCount = allDailySupls.filter(s => suplDone.includes(s.id)).length
  const mealCount = mealDone.length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const waterGoal = 4
  const waterSteps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]

  return (
    <div style={{ padding: '0 14px 8px', paddingTop: 'calc(env(safe-area-inset-top) + 18px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div style={{ fontSize: 24, color: T.text, fontWeight: 800, marginTop: 3, letterSpacing: -0.5 }}>
          {greeting}, {firstName}
        </div>

        {/* Pills de resumo */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { label: `${suplCount}/${allDailySupls.length} supl`, color: T.gold },
            { label: `${mealCount}/${DIET.length} refeições`, color: T.treino },
            { label: `${water}/${waterGoal}L`, color: T.horm },
            ...(activeWorkout ? [{ label: 'Treino ativo', color: T.alert }] : []),
          ].map(p => (
            <div key={p.label} style={{
              padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 600,
              background: `${p.color}12`, border: `1px solid ${p.color}25`, color: p.color,
            }}>{p.label}</div>
          ))}
        </div>
      </motion.div>

      {/* Peso Matinal */}
      <Card accent={T.gold}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Label>Peso Matinal</Label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: -1 }}>
                {todayWeight ? parseFloat(todayWeight.weight).toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: 13, color: T.muted }}>kg</span>
              {diff !== null && (
                <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(diff) <= 0 ? T.ok : T.warn }}>
                  {parseFloat(diff) > 0 ? '+' : ''}{diff}
                </span>
              )}
            </div>
            {avgWeight && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Média 7d: <span style={{ color: T.gold }}>{avgWeight}kg</span></div>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
            <Scale size={16} color={`${T.gold}80`} />
            {todayWeight ? (
              <button onClick={async () => { await deleteWeight(todayWeight.id) }}
                style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer' }}>
                Editar
              </button>
            ) : null}
          </div>
        </div>

        {!todayWeight && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input type="number" step="0.1" placeholder="kg de hoje" value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 15, outline: 'none' }}
            />
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleSave} disabled={saving}
              style={{ padding: '10px 18px', borderRadius: 10, background: `${T.gold}20`, border: `1px solid ${T.gold}50`, color: T.gold, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              {saving ? '...' : '✓'}
            </motion.button>
          </div>
        )}

        {last7.length > 1 && (
          <>
            <WeightSparkline weights={last7} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 9, color: T.muted }}>{[...last7].reverse()[0]?.date?.slice(5)}</span>
              <span style={{ fontSize: 9, color: T.muted }}>Hoje</span>
            </div>
          </>
        )}
      </Card>

      {/* Hidratação */}
      <Card accent={T.horm}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <WaterRing value={water} max={waterGoal} />
          <div style={{ flex: 1 }}>
            <Label>Hidratação</Label>
            <div style={{ fontSize: 13, color: water >= waterGoal ? T.ok : T.text, fontWeight: 700, marginBottom: 8 }}>
              {water >= waterGoal ? 'Meta atingida!' : `Faltam ${(waterGoal - water).toFixed(1)}L`}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {waterSteps.map(v => (
                <motion.button key={v} whileTap={{ scale: 0.88 }} onClick={() => setWater(v)}
                  style={{
                    padding: '5px 0', borderRadius: 7, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: 'none',
                    background: water >= v ? `${T.horm}35` : T.faint,
                    color: water >= v ? T.horm : T.muted,
                  }}>
                  {v}L
                </motion.button>
              ))}
            </div>
            <button onClick={() => setWater(0)}
              style={{ marginTop: 6, padding: '3px 8px', borderRadius: 6, fontSize: 10, background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer' }}>
              Zerar
            </button>
          </div>
        </div>
      </Card>

      {/* Treino de hoje */}
      <Card accent={T.gold}>
        <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 70, opacity: 0.05, pointerEvents: 'none' }}>
          {workout.emoji}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, position: 'relative' }}>
          <div>
            <Label>{workout.day} · Treino de hoje</Label>
            <div style={{ fontSize: 20, color: T.text, fontWeight: 800, letterSpacing: -0.5 }}>{workout.label}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{workout.tag}</div>
          </div>
          <span style={{ fontSize: 30 }}>{workout.emoji}</span>
        </div>
        {workout.focus && (
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 12, borderLeft: `2px solid ${T.gold}35`, paddingLeft: 10 }}>
            {workout.focus.slice(0, 100)}{workout.focus.length > 100 ? '…' : ''}
          </div>
        )}
        {activeWorkout?.dayId === workout.id ? (
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            onClick={() => setPage('treino')}
            style={{ padding: '11px', borderRadius: 12, textAlign: 'center', background: `${T.treino}12`, border: `1px solid ${T.treino}35`, color: T.treino, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Treino em andamento — Continuar
          </motion.div>
        ) : (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPage('treino')}
            style={{ width: '100%', padding: '13px', borderRadius: 12, background: `${T.gold}18`, border: `1px solid ${T.gold}45`, color: T.gold, fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            INICIAR TREINO <ChevronRight size={14} />
          </motion.button>
        )}
      </Card>

      {/* Suplementos diários */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Pill size={13} color={T.gold} />
            <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>Suplementos diários</span>
          </div>
          <span style={{ fontSize: 10, color: T.muted }}>{suplCount}/{allDailySupls.length}</span>
        </div>
        <div style={{ height: 2, borderRadius: 999, background: T.border, marginBottom: 10, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${(suplCount / allDailySupls.length) * 100}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${T.gold}, ${T.treino})`, borderRadius: 999 }} />
        </div>
        {allDailySupls.map((s, i) => {
          const done = suplDone.includes(s.id)
          return (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < allDailySupls.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, color: done ? T.ok : T.text, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{s.dose} · {s.time || s.schedule}</div>
              </div>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSupl(s.id)}
                style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, border: `1px solid ${done ? T.ok + '45' : T.border}`, background: done ? `${T.ok}18` : T.faint, color: done ? T.ok : T.muted, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {done ? '✓' : '+'}
              </motion.button>
            </div>
          )
        })}

        {/* Protocolo semanal separado */}
        {WEEKLY_PROTO.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 14, marginBottom: 8, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
              Protocolo semanal
            </div>
            {WEEKLY_PROTO.map((c, i) => {
              const done = suplDone.includes(c.id)
              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < WEEKLY_PROTO.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, color: done ? T.ok : c.color, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{c.dose} {c.unit} · {c.schedule}</div>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSupl(c.id)}
                    style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, border: `1px solid ${done ? T.ok + '45' : T.border}`, background: done ? `${T.ok}18` : T.faint, color: done ? T.ok : T.muted, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? '✓' : '+'}
                  </motion.button>
                </div>
              )
            })}
          </>
        )}
      </Card>

      {/* Refeições */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Utensils size={13} color={T.treino} />
            <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>Refeições</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: T.muted }}>{mealCount}/{DIET.length}</span>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setPage('nutri')}
              style={{ padding: '4px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700, background: `${T.treino}18`, border: `1px solid ${T.treino}28`, color: T.treino, cursor: 'pointer' }}>
              Ver plano
            </motion.button>
          </div>
        </div>
        <div style={{ height: 2, borderRadius: 999, background: T.border, overflow: 'hidden', marginBottom: 10 }}>
          <motion.div animate={{ width: `${(mealCount / DIET.length) * 100}%` }} transition={{ duration: 0.4 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${T.treino}80, ${T.treino})`, borderRadius: 999 }} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {DIET.map(meal => {
            const done = mealDone.includes(meal.id)
            return (
              <motion.button key={meal.id} whileTap={{ scale: 0.88 }} onClick={() => toggleMeal(meal.id)}
                style={{ padding: '5px 9px', borderRadius: 7, border: 'none', cursor: 'pointer', background: done ? `${T.treino}20` : T.faint, color: done ? T.treino : T.muted, fontSize: 10, fontWeight: 600 }}>
                {done ? '✓ ' : ''}{meal.label}
              </motion.button>
            )
          })}
        </div>
      </Card>

    </div>
  )
}

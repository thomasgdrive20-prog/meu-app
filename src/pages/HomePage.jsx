import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, ChevronRight, Plus, Minus, Scale, Pill } from 'lucide-react'
import useAppStore from '../stores/useAppStore'
import { SPLIT, DIET, SUPLS, PROTOCOL_COMPOUNDS, T } from '../lib/constants'

function getTodayWorkout() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = days[new Date().getDay()]
  return SPLIT.find(d => d.day === today) || SPLIT[0]
}

// ── Card glassmorphism base ───────────────────────────────────────────────────
const GlassCard = ({ children, style = {}, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      background: accent
        ? `linear-gradient(135deg, ${T.card}, ${T.faint})`
        : T.card,
      border: `1px solid ${accent ? accent + '33' : T.border}`,
      borderRadius: 18, padding: '16px',
      marginBottom: 12, backdropFilter: 'blur(8px)',
      boxShadow: accent ? `0 4px 24px ${accent}12` : 'none',
      ...style,
    }}
  >
    {children}
  </motion.div>
)

// ── Mini sparkline de peso ────────────────────────────────────────────────────
function WeightSparkline({ weights }) {
  if (weights.length < 2) return null
  const vals = weights.map(w => parseFloat(w.weight))
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const W = 260, H = 48, pts = [...weights].reverse()

  const points = pts.map((w, i) => {
    const x = (i / (pts.length - 1)) * W
    const y = H - ((parseFloat(w.weight) - min) / range) * (H - 8) - 4
    return `${x},${y}`
  }).join(' ')

  const lastX = W
  const lastY = H - ((parseFloat(weights[0].weight) - min) / range) * (H - 8) - 4

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.gold} stopOpacity="0.3" />
          <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none" stroke={`${T.gold}60`} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r="4" fill={T.gold} />
      <circle cx={lastX} cy={lastY} r="8" fill={`${T.gold}30`} />
    </svg>
  )
}

// ── Barra de progresso de água circular ──────────────────────────────────────
function WaterRing({ value, max }) {
  const pct = Math.min(1, value / max)
  const R = 28, C = 2 * Math.PI * R
  const offset = C * (1 - pct)
  const done = value >= max

  return (
    <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
      <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="34" cy="34" r={R} fill="none" stroke={T.border} strokeWidth="5" />
        <motion.circle
          cx="34" cy="34" r={R} fill="none"
          stroke={done ? T.ok : T.horm} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Droplets size={14} color={done ? T.ok : T.horm} />
        <span style={{ fontSize: 11, fontWeight: 800, color: done ? T.ok : T.text, marginTop: 1 }}>
          {value}L
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage({ session, setPage }) {
  const workout = getTodayWorkout()
  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 'Thomas'

  const {
    water, setWater,
    weights, addWeight, deleteWeight,
    suplDone, toggleSupl,
    mealDone, toggleMeal,
    activeWorkout,
  } = useAppStore()

  const [weightInput, setWeightInput] = useState('')
  const [savingWeight, setSavingWeight] = useState(false)
  const [showWeightInput, setShowWeightInput] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const todayWeight = weights.find(w => w.date === today)
  const last7 = weights.slice(0, 7)
  const avgWeight = last7.length
    ? (last7.reduce((s, w) => s + parseFloat(w.weight), 0) / last7.length).toFixed(1)
    : null
  const yesterdayWeight = weights.find(w => {
    const d = new Date(); d.setDate(d.getDate() - 1)
    return w.date === d.toISOString().slice(0, 10)
  })
  const diff = todayWeight && yesterdayWeight
    ? (parseFloat(todayWeight.weight) - parseFloat(yesterdayWeight.weight)).toFixed(1)
    : null

  const handleSaveWeight = async () => {
    const v = parseFloat(weightInput.replace(',', '.'))
    if (!v || v < 30 || v > 250) return
    setSavingWeight(true)
    await addWeight(v)
    setWeightInput('')
    setShowWeightInput(false)
    setSavingWeight(false)
  }

  const handleEditWeight = async () => {
    await deleteWeight(todayWeight.id)
    setShowWeightInput(true)
  }

  const waterSteps = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]
  const waterGoal = 4

  const allSupls = [...SUPLS, ...PROTOCOL_COMPOUNDS]
  const suplCount = allSupls.filter(s => suplDone.includes(s.id)).length
  const mealCount = mealDone.length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{ padding: '0 16px 8px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div style={{ fontSize: 26, color: T.text, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>
          {greeting}, {firstName} 👋
        </div>

        {/* Resumo do dia em pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { label: `${suplCount}/${allSupls.length} suplementos`, color: T.gold },
            { label: `${mealCount}/${DIET.length} refeições`, color: T.treino },
            { label: `${water}L / ${waterGoal}L água`, color: T.horm },
            ...(activeWorkout ? [{ label: '⚡ Treino ativo', color: T.alert }] : []),
          ].map(p => (
            <div key={p.label} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: `${p.color}15`, border: `1px solid ${p.color}33`, color: p.color,
            }}>
              {p.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Peso Matinal ──────────────────────────────────────────────────────── */}
      <GlassCard accent={T.gold}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Peso Matinal
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>
                {todayWeight ? `${parseFloat(todayWeight.weight).toFixed(1)}` : '—'}
              </span>
              <span style={{ fontSize: 14, color: T.muted }}>kg</span>
              {diff !== null && (
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: parseFloat(diff) <= 0 ? T.ok : T.warn,
                  marginLeft: 4,
                }}>
                  {parseFloat(diff) > 0 ? '+' : ''}{diff}kg
                </span>
              )}
            </div>
            {avgWeight && (
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                Média 7d: <span style={{ color: T.gold }}>{avgWeight}kg</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Scale size={18} color={T.gold} />
            {!todayWeight && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowWeightInput(v => !v)}
                style={{
                  padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                  background: `${T.gold}22`, border: `1px solid ${T.gold}44`,
                  color: T.gold, cursor: 'pointer',
                }}
              >
                + Registrar
              </motion.button>
            )}
            {todayWeight && (
              <button
                onClick={handleEditWeight}
                style={{
                  padding: '6px 10px', borderRadius: 8, fontSize: 11,
                  background: 'transparent', border: `1px solid ${T.border}`,
                  color: T.muted, cursor: 'pointer',
                }}
              >
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Input de peso */}
        <AnimatePresence>
          {(showWeightInput || !todayWeight) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                <input
                  type="number" step="0.1" placeholder="Ex: 91.5"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveWeight()}
                  autoFocus
                  style={{
                    flex: 1, padding: '12px 14px', borderRadius: 12,
                    background: T.faint, border: `1px solid ${T.border}`,
                    color: T.text, fontSize: 16, outline: 'none',
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSaveWeight}
                  disabled={savingWeight}
                  style={{
                    padding: '12px 20px', borderRadius: 12,
                    background: `linear-gradient(135deg, ${T.gold}44, ${T.gold}22)`,
                    border: `1px solid ${T.gold}66`, color: T.gold,
                    fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  {savingWeight ? '...' : '✓'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkline */}
        {last7.length > 1 && (
          <div style={{ marginTop: 10 }}>
            <WeightSparkline weights={last7} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 9, color: T.muted }}>
                {[...last7].reverse()[0]?.date?.slice(5)}
              </span>
              <span style={{ fontSize: 9, color: T.muted }}>Hoje</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── Hidratação ────────────────────────────────────────────────────────── */}
      <GlassCard accent={T.horm}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <WaterRing value={water} max={waterGoal} />

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Hidratação
            </div>
            <div style={{ fontSize: 13, color: water >= waterGoal ? T.ok : T.text, fontWeight: 700, marginTop: 2 }}>
              {water >= waterGoal ? '🎉 Meta atingida!' : `Faltam ${(waterGoal - water).toFixed(1)}L`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
              {waterSteps.map(v => {
                const filled = water >= v
                return (
                  <motion.button
                    key={v}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setWater(v)}
                    style={{
                      padding: '5px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', border: 'none',
                      background: filled
                        ? `linear-gradient(135deg, ${T.horm}55, ${T.horm}33)`
                        : T.faint,
                      color: filled ? T.horm : T.muted,
                      transition: 'all 0.2s',
                    }}
                  >
                    {v}L
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {water >= waterGoal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 10,
                background: `${T.ok}15`, border: `1px solid ${T.ok}33`,
                fontSize: 12, color: T.ok, fontWeight: 600, textAlign: 'center',
              }}
            >
              💧 Hidratação completa! Ótimo trabalho.
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* ── Treino de hoje ────────────────────────────────────────────────────── */}
      <GlassCard accent={T.gold} style={{ overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06,
          pointerEvents: 'none', userSelect: 'none',
        }}>
          {workout.emoji}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, position: 'relative' }}>
          <div>
            <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {workout.day} · Treino de hoje
            </div>
            <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>
              {workout.label}
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{workout.tag}</div>
          </div>
          <span style={{ fontSize: 36, marginTop: 4 }}>{workout.emoji}</span>
        </div>

        {workout.focus && (
          <div style={{
            fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 14,
            borderLeft: `2px solid ${T.gold}44`, paddingLeft: 10,
          }}>
            {workout.focus.slice(0, 120)}{workout.focus.length > 120 ? '...' : ''}
          </div>
        )}

        {activeWorkout && activeWorkout.dayId === workout.id ? (
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              padding: '12px', borderRadius: 12, textAlign: 'center',
              background: `${T.treino}15`, border: `1px solid ${T.treino}44`,
              color: T.treino, fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => setPage('treino')}
          >
            ⚡ Treino em andamento → Ver
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setPage('treino')}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: `linear-gradient(135deg, ${T.gold}33, ${T.gold}18)`,
              border: `1px solid ${T.gold}55`, color: T.gold,
              fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            INICIAR TREINO <ChevronRight size={16} />
          </motion.button>
        )}
      </GlassCard>

      {/* ── Suplementos ───────────────────────────────────────────────────────── */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={15} color={T.gold} />
            <span style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>Suplementos & Protocolo</span>
          </div>
          <span style={{ fontSize: 11, color: T.muted }}>
            {suplCount}/{allSupls.length}
          </span>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 3, borderRadius: 999, background: T.border, marginBottom: 12, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(suplCount / allSupls.length) * 100}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${T.gold}, ${T.treino})`, borderRadius: 999 }}
          />
        </div>

        {allSupls.map((s, i) => {
          const done = suplDone.includes(s.id)
          return (
            <motion.div
              key={s.id}
              initial={false}
              animate={{ backgroundColor: done ? `${T.ok}08` : 'transparent' }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < allSupls.length - 1 ? `1px solid ${T.border}` : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: done ? T.ok : T.text, fontWeight: 600 }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
                  {s.dose || `${s.dose} ${s.unit}`} · {s.time || s.schedule}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleSupl(s.id)}
                style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  border: `1px solid ${done ? T.ok + '55' : T.border}`,
                  background: done ? `${T.ok}22` : T.faint,
                  color: done ? T.ok : T.muted,
                  fontSize: 15, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {done ? '✓' : '+'}
              </motion.button>
            </motion.div>
          )
        })}
      </GlassCard>

      {/* ── Refeições resumidas ───────────────────────────────────────────────── */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>🥗 Refeições</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: T.muted }}>{mealCount}/{DIET.length}</span>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setPage('nutri')}
              style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: `${T.treino}22`, border: `1px solid ${T.treino}33`,
                color: T.treino, cursor: 'pointer',
              }}
            >
              Ver plano →
            </motion.button>
          </div>
        </div>

        <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden', marginBottom: 10 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(mealCount / DIET.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${T.treino}88, ${T.treino})`, borderRadius: 999 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DIET.map(meal => {
            const done = mealDone.includes(meal.id)
            return (
              <motion.button
                key={meal.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => toggleMeal(meal.id)}
                style={{
                  padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: done ? `${T.treino}22` : T.faint,
                  color: done ? T.treino : T.muted,
                  fontSize: 11, fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {done ? '✓' : ''} {meal.label}
              </motion.button>
            )
          })}
        </div>
      </GlassCard>

    </div>
  )
}

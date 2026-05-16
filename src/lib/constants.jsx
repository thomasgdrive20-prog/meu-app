import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, ChevronRight, Scale, Pill, Utensils, TrendingDown, TrendingUp, Minus, Zap } from 'lucide-react'
import useAppStore from '../stores/useAppStore'
import { SPLIT, DIET, SUPLS, PROTOCOL_COMPOUNDS, T } from './constants'

function getTodayWorkout() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return SPLIT.find(d => d.day === days[new Date().getDay()]) || SPLIT[0]
}

// ── Calcular score do dia ──────────────────────────────────────────────────────
function useDayScore({ water, waterGoal, suplDone, allSupls, mealDone, meals, weights }) {
  const today = new Date().toISOString().slice(0, 10)
  const hasWeight = weights.some(w => w.date === today)
  const waterPct  = Math.min(1, water / waterGoal)
  const suplPct   = allSupls.length ? suplDone.filter(id => allSupls.find(s => s.id === id)).length / allSupls.length : 0
  const mealPct   = meals.length ? mealDone.length / meals.length : 0
  const weightBonus = hasWeight ? 0.1 : 0
  const score = Math.round((waterPct * 0.3 + suplPct * 0.3 + mealPct * 0.3 + weightBonus) * 100)
  return score
}

const SCORE_LABELS = [
  { min: 90, label: 'Elite', color: '#C9A96E', sub: 'Consistência máxima' },
  { min: 70, label: 'Alta performance', color: '#5A9E6A', sub: 'No caminho certo' },
  { min: 40, label: 'Em progresso', color: '#6088A8', sub: 'Continue avançando' },
  { min: 0,  label: 'Iniciando', color: '#5A554E', sub: 'O dia começa agora' },
]

function getScoreInfo(score) {
  return SCORE_LABELS.find(s => score >= s.min) || SCORE_LABELS[SCORE_LABELS.length - 1]
}

// ── Componentes ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, glow }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
    style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      padding: '16px',
      marginBottom: 10,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: glow ? `0 0 32px ${glow}12, inset 0 1px 0 ${glow}15` : 'none',
      ...style,
    }}
  >
    {glow && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${glow}40, transparent)`,
        pointerEvents: 'none',
      }} />
    )}
    {children}
  </motion.div>
)

const Kicker = ({ children }) => (
  <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
    {children}
  </div>
)

function ScoreRing({ score }) {
  const info = getScoreInfo(score)
  const R = 34, C = 2 * Math.PI * R
  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={R} fill="none" stroke={T.surface} strokeWidth="5" />
        <motion.circle cx="40" cy="40" r={R} fill="none"
          stroke={info.color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${info.color}60)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 20, fontWeight: 800, color: info.color, letterSpacing: -1, lineHeight: 1 }}
        >
          {score}
        </motion.span>
        <span style={{ fontSize: 8, color: T.muted, marginTop: 1 }}>SCORE</span>
      </div>
    </div>
  )
}

function WaterRing({ value, max }) {
  const pct = Math.min(1, value / max)
  const R = 28, C = 2 * Math.PI * R
  const done = value >= max
  const color = done ? T.ok : T.horm
  return (
    <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
      <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="34" cy="34" r={R} fill="none" stroke={T.surface} strokeWidth="4.5" />
        <motion.circle cx="34" cy="34" r={R} fill="none"
          stroke={color} strokeWidth="4.5" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Droplets size={12} color={color} />
        <span style={{ fontSize: 10, fontWeight: 800, color, marginTop: 1 }}>{value}L</span>
      </div>
    </div>
  )
}

function WeightSparkline({ weights }) {
  if (weights.length < 2) return null
  const vals = weights.map(w => parseFloat(w.weight))
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 0.1
  const W = 280, H = 52
  const pts = [...weights].reverse()
  const toY = v => H - ((v - min) / range) * (H - 12) - 6
  const points = pts.map((w, i) => `${(i / (pts.length - 1)) * W},${toY(parseFloat(w.weight))}`).join(' ')
  const lastY = toY(parseFloat(weights[0].weight))
  const trend = parseFloat(weights[0].weight) - parseFloat(weights[Math.min(weights.length - 1, 6)].weight)

  return (
    <div style={{ marginTop: 12 }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={T.gold} stopOpacity="0.2" />
            <stop offset="100%" stopColor={T.gold} stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <polyline fill="none" stroke="url(#wg)" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round"
          points={points} filter="url(#glow)" />
        {pts.map((w, i) => (
          <circle key={i} cx={(i / (pts.length - 1)) * W} cy={toY(parseFloat(w.weight))}
            r={i === pts.length - 1 ? 4 : 2}
            fill={i === pts.length - 1 ? T.gold : `${T.gold}60`}
          />
        ))}
        <circle cx={W} cy={lastY} r="6" fill={`${T.gold}25`} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: T.muted }}>{[...weights].reverse()[0]?.date?.slice(5)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {trend < -0.1 ? <TrendingDown size={10} color={T.ok} /> : trend > 0.1 ? <TrendingUp size={10} color={T.warn} /> : <Minus size={10} color={T.muted} />}
          <span style={{ fontSize: 9, color: trend < -0.1 ? T.ok : trend > 0.1 ? T.warn : T.muted, fontWeight: 700 }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}kg / 7d
          </span>
        </div>
        <span style={{ fontSize: 9, color: T.muted }}>Hoje</span>
      </div>
    </div>
  )
}

// Suplementos diários vs semanais
const DAILY_SUPLS = SUPLS
const DAILY_PROTO = PROTOCOL_COMPOUNDS.filter(c => c.schedule === 'Diário')
const WEEKLY_PROTO = PROTOCOL_COMPOUNDS.filter(c => c.schedule !== 'Diário')
const ALL_DAILY = [...DAILY_SUPLS, ...DAILY_PROTO]

export default function HomePage({ session, setPage }) {
  const workout = getTodayWorkout()
  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 'Thomas'
  const { water, setWater, weights, addWeight, deleteWeight, suplDone, toggleSupl, mealDone, toggleMeal, activeWorkout } = useAppStore()

  const [weightInput, setWeightInput] = useState('')
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const todayWeight  = weights.find(w => w.date === today)
  const last7        = weights.slice(0, 7)
  const avgWeight    = last7.length ? (last7.reduce((s, w) => s + parseFloat(w.weight), 0) / last7.length).toFixed(1) : null
  const prevWeight   = weights.find(w => { const d = new Date(); d.setDate(d.getDate() - 1); return w.date === d.toISOString().slice(0, 10) })
  const diff         = todayWeight && prevWeight ? (parseFloat(todayWeight.weight) - parseFloat(prevWeight.weight)).toFixed(1) : null
  const waterGoal    = 4
  const waterSteps   = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]
  const suplCount    = ALL_DAILY.filter(s => suplDone.includes(s.id)).length
  const mealCount    = mealDone.length

  const score     = useDayScore({ water, waterGoal, suplDone, allSupls: ALL_DAILY, mealDone, meals: DIET, weights })
  const scoreInfo = getScoreInfo(score)

  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Boa madrugada' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const handleSave = async () => {
    const v = parseFloat(weightInput.replace(',', '.'))
    if (!v || v < 30 || v > 250) return
    setSaving(true)
    await addWeight(v)
    setWeightInput('')
    setSaving(false)
  }

  return (
    <div style={{ padding: '0 14px 8px', paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.goldLow, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 3, letterSpacing: -0.5 }}>
          {greeting}, {firstName}
        </div>
      </motion.div>

      {/* ── SCORE DO DIA — HERO METRIC ──────────────────────────────── */}
      <Card glow={scoreInfo.color} style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ScoreRing score={score} />
          <div style={{ flex: 1 }}>
            <Kicker>Performance hoje</Kicker>
            <div style={{ fontSize: 18, color: scoreInfo.color, fontWeight: 800, letterSpacing: -0.3 }}>
              {scoreInfo.label}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{scoreInfo.sub}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { v: `${suplCount}/${ALL_DAILY.length}`, label: 'supl', color: T.gold },
                { v: `${mealCount}/${DIET.length}`,      label: 'ref',  color: T.treino },
                { v: `${water}/${waterGoal}L`,            label: 'água', color: T.horm },
              ].map(p => (
                <div key={p.label} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, background: `${p.color}12`, border: `1px solid ${p.color}22`, color: p.color }}>
                  {p.v} {p.label}
                </div>
              ))}
              {activeWorkout && (
                <div style={{ padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, background: `${T.alert}12`, border: `1px solid ${T.alert}22`, color: T.alert }}>
                  Treino ativo
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── PESO MATINAL ────────────────────────────────────────────── */}
      <Card glow={T.gold}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Kicker>Peso Matinal</Kicker>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <motion.span
                key={todayWeight?.weight}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: -2, fontVariantNumeric: 'tabular-nums' }}
              >
                {todayWeight ? parseFloat(todayWeight.weight).toFixed(1) : '—'}
              </motion.span>
              <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>kg</span>
              {diff !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {parseFloat(diff) < 0 ? <TrendingDown size={12} color={T.ok} /> : parseFloat(diff) > 0 ? <TrendingUp size={12} color={T.warn} /> : <Minus size={12} color={T.muted} />}
                  <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(diff) <= 0 ? T.ok : T.warn }}>
                    {parseFloat(diff) > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              )}
            </div>
            {avgWeight && <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Média 7d: <span style={{ color: `${T.gold}CC` }}>{avgWeight}kg</span></div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Scale size={15} color={`${T.gold}60`} />
            {todayWeight && (
              <button onClick={async () => { await deleteWeight(todayWeight.id) }}
                style={{ padding: '4px 9px', borderRadius: 7, fontSize: 10, background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer' }}>
                Editar
              </button>
            )}
          </div>
        </div>

        {!todayWeight && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input type="number" step="0.1" placeholder="Seu peso de hoje..." value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              style={{ flex: 1, padding: '11px 14px', borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 16, outline: 'none', fontFamily: 'inherit' }}
            />
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleSave} disabled={saving}
              style={{ padding: '11px 20px', borderRadius: 12, background: `${T.gold}18`, border: `1px solid ${T.gold}40`, color: T.gold, fontWeight: 800, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {saving ? '...' : '✓'}
            </motion.button>
          </div>
        )}

        {last7.length > 1 && <WeightSparkline weights={last7} />}
      </Card>

      {/* ── HIDRATAÇÃO ─────────────────────────────────────────────── */}
      <Card glow={water >= waterGoal ? T.ok : T.horm}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <WaterRing value={water} max={waterGoal} />
          <div style={{ flex: 1 }}>
            <Kicker>Hidratação</Kicker>
            <div style={{ fontSize: 14, color: water >= waterGoal ? T.ok : T.text, fontWeight: 700, marginBottom: 10 }}>
              {water >= waterGoal ? 'Meta atingida!' : `Faltam ${(waterGoal - water).toFixed(1)}L`}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {waterSteps.map(v => {
                const filled = water >= v
                return (
                  <motion.button key={v} whileTap={{ scale: 0.86 }} onClick={() => setWater(v)}
                    style={{
                      padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: filled ? `${T.horm}30` : T.surface,
                      color: filled ? T.horm : T.muted,
                      boxShadow: filled ? `inset 0 1px 0 ${T.horm}30` : 'none',
                      transition: 'all 0.15s',
                    }}>
                    {v}L
                  </motion.button>
                )
              })}
            </div>
            <button onClick={() => setWater(0)}
              style={{ marginTop: 8, padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600, background: 'transparent', border: `1px solid ${T.subtle}`, color: T.muted, cursor: 'pointer', letterSpacing: 0.5 }}>
              ZERAR
            </button>
          </div>
        </div>
        <AnimatePresence>
          {water >= waterGoal && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: `${T.ok}10`, border: `1px solid ${T.ok}25`, fontSize: 11, color: T.ok, fontWeight: 600 }}>
              Hidratação completa — músculo hidratado performa melhor.
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* ── TREINO DE HOJE ─────────────────────────────────────────── */}
      <Card glow={T.gold} style={{ padding: '0', overflow: 'hidden' }}>
        {/* Top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.gold}00, ${T.gold}80, ${T.gold}00)` }} />
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <Kicker>{workout.day} · Treino de hoje</Kicker>
              <div style={{ fontSize: 22, color: T.text, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>{workout.label}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{workout.tag}</div>
            </div>
            <div style={{ fontSize: 34, opacity: 0.9 }}>{workout.emoji}</div>
          </div>

          {workout.focus && (
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 14, paddingLeft: 10, borderLeft: `2px solid ${T.gold}35` }}>
              {workout.focus.slice(0, 110)}{workout.focus.length > 110 ? '…' : ''}
            </div>
          )}

          {activeWorkout?.dayId === workout.id ? (
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              onClick={() => setPage('treino')} style={{ padding: '13px', borderRadius: 12, textAlign: 'center', background: `${T.treino}12`, border: `1px solid ${T.treino}30`, color: T.treino, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}>
              Treino em andamento — Continuar
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setPage('treino')}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: `linear-gradient(135deg, ${T.gold}20, ${T.gold}0A)`,
                border: `1px solid ${T.gold}40`,
                color: T.gold, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                letterSpacing: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 0 20px ${T.gold}12`,
              }}>
              <Zap size={14} strokeWidth={2.5} />
              INICIAR TREINO
              <ChevronRight size={14} />
            </motion.button>
          )}
        </div>
      </Card>

      {/* ── SUPLEMENTOS ────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Pill size={12} color={`${T.gold}80`} />
            <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>Suplementos diários</span>
          </div>
          <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 0.5 }}>{suplCount}/{ALL_DAILY.length}</span>
        </div>
        <div style={{ height: 1.5, borderRadius: 999, background: T.border, marginBottom: 10, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${ALL_DAILY.length ? (suplCount / ALL_DAILY.length) * 100 : 0}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${T.goldLow}, ${T.gold})`, borderRadius: 999 }} />
        </div>

        {ALL_DAILY.map((s, i) => {
          const done = suplDone.includes(s.id)
          return (
            <motion.div key={s.id} animate={{ backgroundColor: done ? `${T.ok}06` : 'transparent' }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < ALL_DAILY.length - 1 ? `1px solid ${T.subtle}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, color: done ? T.ok : T.text, fontWeight: 600, transition: 'color 0.2s' }}>{s.name}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{s.dose} · {s.time || s.schedule}</div>
              </div>
              <motion.button whileTap={{ scale: 0.82 }} onClick={() => toggleSupl(s.id)}
                style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, border: `1px solid ${done ? T.ok + '40' : T.border}`, background: done ? `${T.ok}15` : T.surface, color: done ? T.ok : T.muted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                {done ? '✓' : '+'}
              </motion.button>
            </motion.div>
          )
        })}

        {WEEKLY_PROTO.length > 0 && (
          <>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.subtle}`, marginBottom: 8 }}>
              Protocolo semanal
            </div>
            {WEEKLY_PROTO.map((c, i) => {
              const done = suplDone.includes(c.id)
              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < WEEKLY_PROTO.length - 1 ? `1px solid ${T.subtle}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, color: done ? T.ok : c.color, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{c.dose} {c.unit} · {c.schedule}</div>
                  </div>
                  <motion.button whileTap={{ scale: 0.82 }} onClick={() => toggleSupl(c.id)}
                    style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, border: `1px solid ${done ? T.ok + '40' : T.border}`, background: done ? `${T.ok}15` : T.surface, color: done ? T.ok : T.muted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? '✓' : '+'}
                  </motion.button>
                </div>
              )
            })}
          </>
        )}
      </Card>

      {/* ── REFEIÇÕES ──────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Utensils size={12} color={`${T.treino}80`} />
            <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>Refeições</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 0.5 }}>{mealCount}/{DIET.length}</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPage('nutri')}
              style={{ padding: '4px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700, background: `${T.treino}12`, border: `1px solid ${T.treino}22`, color: T.treino, cursor: 'pointer' }}>
              Ver plano
            </motion.button>
          </div>
        </div>
        <div style={{ height: 1.5, borderRadius: 999, background: T.border, overflow: 'hidden', marginBottom: 10 }}>
          <motion.div animate={{ width: `${(mealCount / DIET.length) * 100}%` }} transition={{ duration: 0.4 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${T.treino}60, ${T.treino})`, borderRadius: 999 }} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {DIET.map(meal => {
            const done = mealDone.includes(meal.id)
            return (
              <motion.button key={meal.id} whileTap={{ scale: 0.86 }} onClick={() => toggleMeal(meal.id)}
                style={{ padding: '5px 9px', borderRadius: 8, border: `1px solid ${done ? T.treino + '30' : T.subtle}`, cursor: 'pointer', background: done ? `${T.treino}15` : T.surface, color: done ? T.treino : T.muted, fontSize: 10, fontWeight: 600, transition: 'all 0.15s' }}>
                {done ? '✓ ' : ''}{meal.label}
              </motion.button>
            )
          })}
        </div>
      </Card>

    </div>
  )
}
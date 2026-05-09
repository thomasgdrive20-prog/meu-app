import { useState, useEffect, useCallback, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { LucideDumbbell, LucideUtensils, LucideActivity, LucideUser, LucidePlus, LucideCheckCircle2, LucideTimer, LucideTrendingUp, LucideCalendar, LucideChevronRight, LucideX, LucideDroplets, LucideScale, LucideCamera, LucideZap, LucideFlame } from 'lucide-react'
import { dbSelect, dbInsert, dbUpdate, dbDelete, USER_ID } from './lib/supabaseClient'

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ─── TEMA E CORES (VOLTANDO AO SEU PADRÃO ORIGINAL) ──────────────────────────
const T = {
  bg: '#0A0A0B', surface: '#111113', card: '#18181C', border: '#242428',
  border2: '#2E2E34', text: '#F0EDE8', muted: '#6B6872', faint: '#1C1C20', subtle: '#28282E',
  treino: '#C8F060', nutri: '#FF8C5A', horm: '#60B4FF', metrica: '#D87AE8',
  ok: '#5AE89A', warn: '#FFB84D', alert: '#FF5A5A', gold: '#FFD166', accent: '#C8F060',
}

// ─── DADOS ESTÁTICOS (EXERCÍCIOS COMPLETOS) ──────────────────────────────────
const SPLIT = [
  { id: 'legs', label: 'Legs', tag: 'Quad · Post · Glúteo', color: T.treino, emoji: '🦵', day: 'Seg' },
  { id: 'push_a', label: 'Push A', tag: 'Peito · Ombro · Tríceps', color: '#A8E870', emoji: '💪', day: 'Ter' },
  { id: 'pull_a', label: 'Pull A', tag: 'Costas · Bíceps', color: T.horm, emoji: '🔵', day: 'Qua' },
  { id: 'off', label: 'Futebol', tag: 'Descanso ativo', color: T.muted, emoji: '⚽', day: 'Qui' },
  { id: 'push_b', label: 'Push B', tag: 'Peito · Ombro · Tríceps', color: '#A8E870', emoji: '💪', day: 'Sex' },
  { id: 'arms', label: 'Braço+Peito', tag: 'Bíceps · Tríceps · Peito', color: T.nutri, emoji: '💪', day: 'Sáb' },
  { id: 'pull_b', label: 'Pull B', tag: 'Costas · Bíceps', color: T.horm, emoji: '🔵', day: 'Dom' },
]

const EXERCISES = {
  legs: [
    { name: 'Agachamento Livre', sets: 4, reps: '6–8', rest: 180, muscle: 'Quad', cue: 'Abaixo do paralelo.' },
    { name: 'Leg Press 45°', sets: 3, reps: '10–12', rest: 120, muscle: 'Quad', cue: 'Não trave o joelho.' },
    { name: 'Cadeira Extensora', sets: 3, reps: '12–15', rest: 60, muscle: 'Quad', cue: 'Pausa 1s.' },
    { name: 'Stiff Barra', sets: 4, reps: '8–10', rest: 120, muscle: 'Post.', cue: 'Quadril para trás.' },
    { name: 'Leg Curl Deitado', sets: 3, reps: '10–12', rest: 90, muscle: 'Post.', cue: 'Quadril no banco.' },
    { name: 'Hip Thrust Barra', sets: 4, reps: '10–12', rest: 90, muscle: 'Glúteo', cue: 'Pausa 1s no topo.' },
    { name: 'Panturrilha em Pé', sets: 4, reps: '15–20', rest: 60, muscle: 'Pantur.', cue: 'Amplitude total.' },
    { name: '🏃 Cardio — Escada', sets: 1, reps: '25min', rest: 0, muscle: 'Cardio', cue: '130–150bpm.' },
  ],
  push_a: [
    { name: 'Supino Reto Barra', sets: 4, reps: '6–8', rest: 150, muscle: 'Peito', cue: 'Escápulas retraídas.' },
    { name: 'Supino Inclinado Halteres', sets: 3, reps: '8–10', rest: 90, muscle: 'Peito', cue: '30–45°.' },
    { name: 'Desenvolvimento Militar', sets: 4, reps: '6–8', rest: 150, muscle: 'Ombro', cue: 'Core contraído.' },
    { name: 'Elevação Lateral', sets: 4, reps: '12–15', rest: 60, muscle: 'Ombro', cue: 'Cotovelo flexionado.' },
    { name: 'Tríceps Corda Polia', sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps', cue: 'Cotovelos fixos.' },
    { name: 'Tríceps Francês', sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps', cue: 'Não abra o cotovelo.' },
    { name: '🏃 Cardio — Escada', sets: 1, reps: '25min', rest: 0, muscle: 'Cardio', cue: '130–150bpm.' },
  ],
}
// ─── TIMER DE DESCANSO ───────────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds)
  const [active, setActive] = useState(true)
  useEffect(() => {
    if (!active || left <= 0) { if (left <= 0 && onDone) onDone(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, active, onDone])
  const pct = (left / seconds) * 100; const r = 52; const circ = 2 * Math.PI * r
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke={T.faint} strokeWidth={8} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={left <= 10 ? T.alert : T.treino} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset .9s linear' }} />
      </svg>
      <div style={{ marginTop: -95, marginBottom: 70, textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: left <= 10 ? T.alert : T.text }}>{left}s</div>
        <div style={{ fontSize: 9, color: T.muted, letterSpacing: 3 }}>DESCANSO</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ background: T.subtle, border: 'none', color: T.text, padding: '10px 20px', borderRadius: 12 }} onClick={() => setActive(!active)}>{active ? 'Pausar' : 'Retomar'}</button>
        <button style={{ background: T.treino, border: 'none', color: '#000', padding: '10px 20px', borderRadius: 12, fontWeight: 'bold' }} onClick={onDone}>Pular →</button>
      </div>
    </div>
  )
}

// ─── MODO DE TREINO (WORKOUT MODE) ───────────────────────────────────────────
function WorkoutMode({ session, exercises, onClose, onSave }) {
  const [idx, setIdx] = useState(0)
  const [setIdx2, setSetIdx] = useState(0)
  const [phase, setPhase] = useState('exercise')
  const ex = exercises[idx]
  const totalSets = ex?.sets || 1

  const nextStep = () => {
    if (setIdx2 + 1 < totalSets) {
      setSetIdx(s => s + 1)
      if (ex.rest > 0) setPhase('rest')
    } else {
      if (idx + 1 < exercises.length) {
        setIdx(i => i + 1); setSetIdx(0); setPhase('exercise')
      } else { setPhase('done') }
    }
  }

  if (phase === 'done') return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 64 }}>🔥</span>
      <h2 style={{ color: T.treino }}>TREINO CONCLUÍDO!</h2>
      <button style={{ background: T.treino, border: 'none', padding: '15px 30px', borderRadius: 16, fontWeight: 'bold' }} onClick={onClose}>FECHAR</button>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, padding: 25 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted }}>✕ SAIR</button>
        <span style={{ color: T.treino }}>{idx + 1}/{exercises.length}</span>
      </div>
      
      {phase === 'rest' ? (
        <RestTimer seconds={ex.rest} onDone={() => setPhase('exercise')} />
      ) : (
        <>
          <span style={{ color: T.treino, fontSize: 12, fontWeight: 'bold' }}>{ex.muscle.toUpperCase()}</span>
          <h1 style={{ fontSize: 32, margin: '10px 0' }}>{ex.name}</h1>
          <div style={{ background: T.surface, padding: 20, borderRadius: 20, marginBottom: 20 }}>
            <p style={{ color: T.muted, margin: 0 }}>Série {setIdx2 + 1} de {totalSets}</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', margin: '10px 0' }}>{ex.reps} reps</p>
            <p style={{ color: T.treino, fontSize: 13 }}>💡 {ex.cue}</p>
          </div>
          <button style={{ width: '100%', background: T.treino, border: 'none', padding: '20px', borderRadius: 20, fontWeight: '900', fontSize: 16 }} onClick={nextStep}>
            CONCLUIR SÉRIE
          </button>
        </>
      )}
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL (APP) ──────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dash')
  const [workoutMode, setWorkoutMode] = useState(null)
  const [metrics, setMetrics] = useState([{ weight: 91.5, bf: 20 }])
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    dbSelect('body_metrics').then(data => data.length && setMetrics(data))
  }, [])

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todaySession = SPLIT[todayIdx]

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, paddingBottom: 100 }}>
      {workoutMode && (
        <WorkoutMode 
          session={workoutMode.session} 
          exercises={workoutMode.exercises} 
          onClose={() => setWorkoutMode(null)} 
        />
      )}

      {/* HEADER DA FOTO */}
      <header style={{ padding: '40px 24px 20px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Thomas</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Fase 1 — Cutting • até Jul 2026</p>
      </header>

      <main style={{ padding: '0 20px' }}>
        {tab === 'dash' && (
          <>
            {/* CARD DE TREINO IGUAL À IMAGEM */}
            <div style={{ background: T.card, borderRadius: 28, padding: 24, border: `1px solid ${T.border}`, marginBottom: 15 }}>
              <span style={{ fontSize: 10, color: T.muted, letterSpacing: 2 }}>HOJE — SEX</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, margin: '15px 0' }}>
                <span style={{ fontSize: 40 }}>{todaySession.emoji}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 28, color: T.treino }}>{todaySession.label}</h2>
                  <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>{todaySession.tag}</p>
                </div>
              </div>
              <button 
                onClick={() => setWorkoutMode({ session: todaySession, exercises: EXERCISES[todaySession.id] || [] })}
                style={{ background: T.treino, color: '#000', border: 'none', borderRadius: 14, padding: '12px', fontWeight: '900', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <LucidePlus size={20} /> INICIAR TREINO
              </button>
            </div>

            {/* MINI CARDS DE MÉTRICAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 15 }}>
              <div style={{ gridRow: 'span 2', background: T.card, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: T.treino }}>0</span>
                <span style={{ fontSize: 10, color: T.muted }}>SCORE</span>
              </div>
              <div style={{ background: T.card, borderRadius: 20, padding: 15, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: T.treino }}>{metrics[0].weight}</span>
                  <span style={{ fontSize: 10, color: T.muted }}>kg</span>
                </div>
                <span style={{ fontSize: 10, color: T.muted }}>PESO</span>
              </div>
              <div style={{ background: T.card, borderRadius: 20, padding: 15, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: T.metrica }}>{metrics[0].bf}</span>
                  <span style={{ fontSize: 10, color: T.muted }}>%</span>
                </div>
                <span style={{ fontSize: 10, color: T.muted }}>BF%</span>
              </div>
              <div style={{ background: T.card, borderRadius: 20, padding: 15, border: `1px solid ${T.border}` }}>
                <span style={{ color: T.nutri }}>—</span>
                <div style={{ fontSize: 10, color: T.muted }}>KCAL</div>
              </div>
              <div style={{ background: T.card, borderRadius: 20, padding: 15, border: `1px solid ${T.border}` }}>
                <span style={{ color: T.treino }}>— g</span>
                <div style={{ fontSize: 10, color: T.muted }}>PROT</div>
              </div>
            </div>

            {/* PROGRESSO DO DIA */}
            <div style={{ background: T.card, borderRadius: 24, padding: 20, border: `1px solid ${T.border}` }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: 11, color: T.muted, letterSpacing: 1 }}>PROGRESSO DO DIA</h4>
              {['Dieta', 'Treino', 'Protocolo', 'Suplementos'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.muted, fontSize: 14 }}>{item}</span>
                  <span style={{ fontWeight: 'bold' }}>0</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* MENU INFERIOR COMPLETO (6 ABAS) */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0A0A0B', display: 'flex', justifyContent: 'space-around', padding: '15px 5px', borderTop: `1px solid ${T.border}`, zIndex: 100 }}>
        <NavBtn act={tab === 'dash'} icon={LucideActivity} label="INÍCIO" onClick={() => setTab('dash')} />
        <NavBtn act={tab === 'treino'} icon={LucideDumbbell} label="TREINO" onClick={() => setTab('treino')} />
        <NavBtn act={tab === 'nutri'} icon={LucideUtensils} label="DIETA" onClick={() => setTab('nutri')} />
        <NavBtn act={tab === 'horm'} icon={LucideZap} label="SAÚDE" onClick={() => setTab('horm')} />
        <NavBtn act={tab === 'body'} icon={LucideScale} label="CORPO" onClick={() => setTab('body')} />
        <NavBtn act={tab === 'fotos'} icon={LucideCamera} label="FOTOS" onClick={() => setTab('fotos')} />
      </nav>
    </div>
  )
}

function NavBtn({ act, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
      <Icon size={20} color={act ? T.treino : T.muted} />
      <span style={{ fontSize: 9, fontWeight: 'bold', color: act ? T.text : T.muted }}>{label}</span>
      {act && <div style={{ width: 12, height: 2, background: T.treino, borderRadius: 2 }} />}
    </button>
  )
}
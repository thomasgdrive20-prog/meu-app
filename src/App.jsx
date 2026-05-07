import { useState, useEffect, useCallback, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { dbSelect, dbInsert, dbUpdate, dbDelete, USER_ID } from './lib/supabaseClient'
import { SPLIT, EXERCISES } from './lib/constants.js'

// ─── ID generator ─────────────────────────────────────────────────────────────
const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: '#111010', surface: '#1A1917', card: '#201E1B', border: '#2E2A24',
  text: '#EDE8E0', muted: '#7A7268', faint: '#252220',
  treino: '#7DBF8E', nutri: '#D4916A', horm: '#85A8C8', metrica: '#C497B0',
  ok: '#7DBF8E', warn: '#D4916A', alert: '#C97070', gold: '#C9A96E',
}

// ─── STATIC DATA ──────────────────────────────────────────────────────────────


const LAB_REFS = {
  'Testosterona Total': { min: 175, max: 781,  unit: 'ng/dL', alert: 'high' },
  'Estradiol (E2)':     { min: 0,   max: 33,   unit: 'pg/mL', alert: 'high' },
  'HDL':                { min: 45,  max: 999,  unit: 'mg/dL', alert: 'low'  },
  'Hematócrito':        { min: 41,  max: 50,   unit: '%',     alert: 'high' },
  'SHBG':               { min: 13,  max: 90,   unit: 'nmol/L',alert: 'none' },
  'Vitamina D':         { min: 30,  max: 100,  unit: 'ng/mL', alert: 'low'  },
  'Vitamina B12':       { min: 300, max: 914,  unit: 'pg/mL', alert: 'low'  },
  'Colesterol Total':   { min: 0,   max: 180,  unit: 'mg/dL', alert: 'high' },
  'LDL':                { min: 0,   max: 100,  unit: 'mg/dL', alert: 'high' },
  'Triglicerídeos':     { min: 0,   max: 150,  unit: 'mg/dL', alert: 'high' },
  'TGO (AST)':          { min: 13,  max: 39,   unit: 'U/L',   alert: 'high' },
  'TGP (ALT)':          { min: 7,   max: 52,   unit: 'U/L',   alert: 'high' },
  'GGT':                { min: 9,   max: 64,   unit: 'U/L',   alert: 'high' },
  'PSA':                { min: 0,   max: 1.5,  unit: 'ng/mL', alert: 'high' },
}

const DIET = [
  { id: 'cafe',      time: '06:30', label: 'Café da Manhã',   kcal: 470, prot: 36, options: ['A: 1 ovo + 1 whey + 200ml leite desnatado + 30g aveia + ½ banana', 'B: 2 ovos mexidos + 1 pão francês + 1 whey + 200ml leite desnatado'] },
  { id: 'lanche1',   time: '10:00', label: 'Lanche da Manhã', kcal: 150, prot: 3,  options: ['A: 1 fruta (maçã ou pera)', 'B: 1 fruta + 3 castanhas-do-pará'] },
  { id: 'almoco',    time: '12:30', label: 'Almoço',          kcal: 450, prot: 45, options: ['FIXO: 150g frango + 40g arroz + 60g batata + 100g abóbora + vegetais + fio de azeite'] },
  { id: 'lanche2',   time: '16:00', label: 'Lanche da Tarde', kcal: 300, prot: 33, options: ['A: 1 whey + 10g aveia + 1 banana', 'B: 1 iogurte desnatado + 1 whey + 1 fruta pequena'] },
  { id: 'pretreino', time: '19:30', label: 'Pré-Treino',      kcal: 280, prot: 28, options: ['FIXO: 100g frango + 80g batata ou 60g arroz'] },
  { id: 'postreino', time: '22:15', label: 'Pós-Treino',      kcal: 115, prot: 15, options: ['A: ½ dose whey com água', 'B: ½ whey + 3g creatina'] },
  { id: 'jantar',    time: '23:00', label: 'Jantar',          kcal: 370, prot: 30, options: ['FIXO: 150g frango + 2 ovos cozidos + 100g abóbora + vegetais refogados + fio de azeite'] },
]

const PROTOCOL_COMPOUNDS = [
  { id: 'testo', name: 'Testosterona Enantato', dose: '0.7', unit: 'ml', schedule: 'Seg + Qui', color: T.horm,    weekly: '350mg' },
  { id: 'ana',   name: 'Anastrozol',            dose: '0.5', unit: 'mg', schedule: 'Seg + Qui', color: T.metrica, weekly: '1mg'   },
  { id: 'tirze', name: 'Tirzepatida',           dose: '1.5', unit: 'mg', schedule: 'Semanal',   color: T.nutri,   weekly: '1.5mg' },
]

const SUPLS = [
  { id: 'vitd',  name: 'Vitamina D3+K2', dose: '4.000 UI', time: 'Manhã',      color: T.warn   },
  { id: 'b12',   name: 'Vitamina B12',   dose: '1.000mcg', time: 'Manhã',      color: T.warn   },
  { id: 'creat', name: 'Creatina',       dose: '5g',        time: 'Pós-treino', color: T.treino },
  { id: 'omega', name: 'Ômega 3',        dose: '3g',        time: 'Almoço',     color: T.horm   },
]

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────────
const Card = ({ children, style = {}, color, onClick }) => (
  <div onClick={onClick} style={{ background: T.card, border: `1px solid ${color ? color + '40' : T.border}`, borderRadius: 16, padding: '16px 18px', marginBottom: 10, borderLeft: color ? `3px solid ${color}` : undefined, cursor: onClick ? 'pointer' : 'default', ...style }}>
    {children}
  </div>
)

const Pill = ({ children, color, small }) => (
  <span style={{ background: (color || T.horm) + '28', color: color || T.horm, fontSize: small ? 9 : 10, padding: small ? '2px 8px' : '3px 11px', borderRadius: 20, letterSpacing: .5, fontWeight: 700, textTransform: 'uppercase' }}>
    {children}
  </span>
)

const Lbl = ({ children, color }) => (
  <div style={{ fontSize: 10, letterSpacing: 2.5, color: color || T.muted, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
    {children}
  </div>
)

const Btn = ({ children, onClick, color, small, full, ghost, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: ghost ? 'transparent' : (color || T.treino), border: ghost ? `1px solid ${color || T.treino}` : 'none', color: ghost ? (color || T.treino) : T.bg, borderRadius: 12, padding: small ? '8px 14px' : '13px 20px', fontSize: small ? 12 : 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', width: full ? '100%' : 'auto', opacity: disabled ? .5 : 1, ...style }}>
    {children}
  </button>
)

const Inp = ({ placeholder, value, onChange, type = 'text', style = {} }) => (
  <input type={type} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)}
    style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 13px', fontSize: 12, color: T.text, outline: 'none', fontFamily: 'inherit', ...style }} />
)

const StatusDot = ({ status }) => (
  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: status === 'ok' ? T.ok : status === 'warn' ? T.warn : T.alert, marginRight: 8, flexShrink: 0, marginTop: 3 }} />
)

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: '28px 24px', maxWidth: 300, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 13, color: T.text, marginBottom: 22, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn full ghost color={T.muted} onClick={onCancel} small>Cancelar</Btn>
          <Btn full color={T.alert} onClick={onConfirm} small>Deletar</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds)
  const [active, setActive] = useState(true)
  useEffect(() => {
    if (!active || left <= 0) { if (left <= 0 && onDone) onDone(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, active, onDone])
  const pct = (left / seconds) * 100; const r = 44; const circ = 2 * Math.PI * r
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      <svg width={110} height={110} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke={T.faint} strokeWidth={6} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={left <= 10 ? T.alert : T.treino} strokeWidth={6} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .9s linear,stroke .3s' }} />
      </svg>
      <div style={{ marginTop: -80, marginBottom: 60, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: left <= 10 ? T.alert : T.text }}>{left}s</div>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2 }}>DESCANSO</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn small ghost color={T.muted} onClick={() => setActive(a => !a)}>{active ? 'Pausar' : 'Retomar'}</Btn>
        <Btn small color={T.treino} onClick={onDone}>Pular →</Btn>
      </div>
    </div>
  )
}

// ─── WORKOUT MODE ─────────────────────────────────────────────────────────────
function WorkoutMode({ session, exercises, onClose, onSave }) {
  const [idx, setIdx] = useState(0)
  const [setIdx2, setSetIdx] = useState(0)
  const [phase, setPhase] = useState('exercise')
  const [kg, setKg] = useState('')
  const [reps, setReps] = useState('')
  const [saved, setSaved] = useState([])
  const ex = exercises[idx]
  const isCardio = ex?.name?.includes('Cardio')
  const totalSets = typeof ex?.sets === 'number' ? ex.sets : parseInt(ex?.sets) || 1

  const nextSet = () => {
    if (kg && !isCardio) {
      const entry = { exercise: ex.name, kg, reps, date: new Date().toLocaleDateString('pt-BR'), day: session.id }
      onSave(entry)
      setSaved(s => [...s, entry])
    }
    if (setIdx2 + 1 < totalSets) {
      setSetIdx(s => s + 1)
      if (ex.rest > 0) setPhase('rest')
      else { setKg(''); setReps('') }
    } else {
      setSetIdx(0); setKg(''); setReps('')
      if (idx + 1 < exercises.length) { setIdx(i => i + 1); setPhase('exercise') }
      else setPhase('done')
    }
  }

  if (phase === 'done') return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔥</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: T.treino, marginBottom: 8 }}>Treino Completo</div>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 32 }}>{saved.length} séries registradas</div>
      {saved.slice(-5).map((s, i) => <div key={i} style={{ fontSize: 12, color: T.text, marginBottom: 6, opacity: .7 }}>{s.exercise} — {s.kg}kg × {s.reps}</div>)}
      <div style={{ marginTop: 32 }}><Btn color={T.treino} onClick={onClose}>Concluir</Btn></div>
    </div>
  )

  if (phase === 'rest') return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 4, letterSpacing: 2, textTransform: 'uppercase' }}>Próximo</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 24, textAlign: 'center' }}>{ex.name}</div>
      <RestTimer seconds={ex.rest} onDone={() => { setPhase('exercise'); setKg(''); setReps('') }} />
    </div>
  )

  const progress = ((idx + setIdx2 / totalSets) / exercises.length) * 100
  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, overflowY: 'auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: T.faint, zIndex: 101 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: T.treino, transition: 'width .5s' }} />
      </div>
      <div style={{ padding: '52px 24px 120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13 }}>✕ Sair</button>
          <div style={{ fontSize: 12, color: T.muted }}>{idx + 1}/{exercises.length}</div>
        </div>
        <Pill color={session.color} small>{ex.muscle}</Pill>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: T.text, marginTop: 10, marginBottom: 6, lineHeight: 1.2 }}>{ex.name}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>Série {setIdx2 + 1} de {totalSets}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          {Array.from({ length: totalSets }, (_, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${i < setIdx2 ? T.treino : i === setIdx2 ? session.color : T.border}`, background: i < setIdx2 ? T.treino + '30' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i < setIdx2 ? T.treino : i === setIdx2 ? session.color : T.muted }}>{i + 1}</div>
          ))}
        </div>
        <div style={{ background: T.faint, borderLeft: `3px solid ${session.color}`, borderRadius: '0 12px 12px 0', padding: '14px 16px', marginBottom: 28, fontSize: 12, color: T.muted, lineHeight: 1.7 }}>💡 {ex.cue}</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[{ l: 'Reps alvo', v: ex.reps }, { l: 'Pausa', v: ex.rest > 0 ? `${ex.rest}s` : '—' }].map(s => (
            <div key={s.l} style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: session.color }}>{s.v}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {!isCardio && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}><Lbl>Carga (kg)</Lbl><Inp placeholder="80" value={kg} onChange={setKg} type="number" style={{ width: '100%', fontSize: 20, padding: '16px', textAlign: 'center' }} /></div>
            <div style={{ flex: 1 }}><Lbl>Reps feitas</Lbl><Inp placeholder="8" value={reps} onChange={setReps} type="number" style={{ width: '100%', fontSize: 20, padding: '16px', textAlign: 'center' }} /></div>
          </div>
        )}
        <Btn full color={session.color} style={{ fontSize: 16, padding: '18px', borderRadius: 16 }} onClick={nextSet}>
          {setIdx2 + 1 < totalSets ? 'Próxima Série →' : idx + 1 < exercises.length ? 'Próximo Exercício →' : 'Finalizar Treino 🔥'}
        </Btn>
        <button onClick={() => { setIdx(i => Math.min(i + 1, exercises.length - 1)); setSetIdx(0); setPhase('exercise') }}
          style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer', width: '100%', marginTop: 16, textAlign: 'center' }}>
          Pular exercício
        </button>
      </div>
    </div>
  )
}

// ─── PHOTO SLIDER ─────────────────────────────────────────────────────────────
function PhotoSlider({ before, after }) {
  const [pos, setPos] = useState(50)
  const ref = useRef(null)
  const drag = useRef(false)
  const move = (clientX) => {
    if (!ref.current) return
    const { left, width } = ref.current.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((clientX - left) / width) * 100)))
  }
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden', userSelect: 'none', cursor: 'col-resize' }}
      onMouseDown={e => { drag.current = true; move(e.clientX) }}
      onMouseMove={e => { if (drag.current) move(e.clientX) }}
      onMouseUp={() => drag.current = false}
      onTouchStart={e => move(e.touches[0].clientX)}
      onTouchMove={e => move(e.touches[0].clientX)}>
      <img src={before} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={after} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2, background: 'white', transform: 'translateX(-50%)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.4)', fontSize: 14 }}>⇔</div>
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,.6)', color: 'white', fontSize: 10, padding: '4px 10px', borderRadius: 20, letterSpacing: 1, fontWeight: 700 }}>ANTES</div>
      <div style={{ position: 'absolute', bottom: 12, right: 12, background: T.treino + 'CC', color: T.bg, fontSize: 10, padding: '4px 10px', borderRadius: 20, letterSpacing: 1, fontWeight: 700 }}>DEPOIS</div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dash')
  const [confirm, setConfirm] = useState(null)
  const [syncMsg, setSyncMsg] = useState('Carregando...')
  const [workoutMode, setWorkoutMode] = useState(null)

  const [profile] = useState({ name: 'Thomas', age: 35, weight: '91.5', height: '1.75', phase: 'Fase 1 — Cutting', phaseEnd: 'Julho 2026', bfMeta: '12' })
  const [nutrition] = useState({ calories: 2100, protein: 190, carbs: 160, fat: 58 })
  const [compounds, setCompounds] = useState(PROTOCOL_COMPOUNDS)

  const [workout,    setWorkout]    = useState([])
  const [metrics,    setMetrics]    = useState([])
  const [mealLog,    setMealLog]    = useState([])
  const [labLog,     setLabLog]     = useState([])
  const [aplicacoes, setAplicacoes] = useState([])
  const [dietaLogs,  setDietaLogs]  = useState([])
  const [photos,     setPhotos]     = useState([])
  const [suplLogs,   setSuplLogs]   = useState([])

  const flash = (msg = '✓ Salvo') => { setSyncMsg(msg); setTimeout(() => setSyncMsg(''), 2500) }

  // ── Boot: load all tables ──────────────────────────────────────────────────
  useEffect(() => {
    setSyncMsg('Carregando dados...')
    Promise.all([
      dbSelect('workout_logs'),
      dbSelect('body_metrics'),
      dbSelect('meal_logs'),
      dbSelect('exames'),
      dbSelect('aplicacoes'),
      dbSelect('dieta_logs'),
      dbSelect('photos'),
      dbSelect('supl_logs'),
    ]).then(([wl, bm, ml, ex, ap, dl, ph, sl]) => {
      setWorkout(wl)
      setMetrics(bm.length > 0 ? bm : [{ id: 'seed_01', date: '02/05/2026', weight: '91.5', bf: '20', waist: '', armL: '', armR: '', chest: '', notes: 'Estimativa inicial.', created_at: '2026-05-02T00:00:00Z' }])
      setMealLog(ml)
      setLabLog(ex)
      setAplicacoes(ap)
      setDietaLogs(dl)
      setPhotos(ph)
      setSuplLogs(sl)
      setSyncMsg('✓ Conectado')
      setTimeout(() => setSyncMsg(''), 3000)
    }).catch(() => setSyncMsg('⚠ Erro ao carregar'))
  }, [])

  // ── Generic CRUD ──────────────────────────────────────────────────────────
  const add = useCallback(async (table, setter, data) => {
    const row = { ...data, id: data.id || genId() }
    // optimistic
    setter(prev => [row, ...prev])
    const saved = await dbInsert(table, row)
    if (saved) setter(prev => prev.map(x => x.id === row.id ? saved : x))
    flash()
  }, [])

  const edit = useCallback(async (table, setter, id, data) => {
    setter(prev => prev.map(x => x.id === id ? { ...x, ...data } : x))
    await dbUpdate(table, id, data)
    flash()
  }, [])

  const remove = useCallback((table, setter, id, label = 'este item') => {
    setConfirm({
      message: `Deletar "${label}"?\nEsta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirm(null)
        setter(prev => prev.filter(x => x.id !== id))
        await dbDelete(table, id)
        flash('🗑 Deletado')
      }
    })
  }, [])

  // ── Specific adders ───────────────────────────────────────────────────────
  const addWorkout    = d => add('workout_logs', setWorkout,    d)
  const editWorkout   = (id, d) => edit('workout_logs', setWorkout, id, d)
  const removeWorkout = (id, l) => remove('workout_logs', setWorkout, id, l)

  const addMetric     = d => add('body_metrics',  setMetrics,    d)
  const editMetric    = (id, d) => edit('body_metrics', setMetrics, id, d)
  const removeMetric  = (id, l) => remove('body_metrics', setMetrics, id, l)

  const addMeal       = d => add('meal_logs',     setMealLog,    d)
  const removeMeal    = (id, l) => remove('meal_logs', setMealLog, id, l)

  const addLab        = d => add('exames',        setLabLog,     d)
  const removeLab     = (id, l) => remove('exames', setLabLog, id, l)

  const addAplicacao  = d => add('aplicacoes',    setAplicacoes, d)
  const removeAplicacao = (id, l) => remove('aplicacoes', setAplicacoes, id, l)

  const addDietaLog   = d => add('dieta_logs',    setDietaLogs,  d)

  const addPhoto      = d => add('photos',        setPhotos,     d)
  const removePhoto   = (id) => remove('photos', setPhotos, id, 'foto')

  const toggleSupl = async (suplId) => {
    const today = new Date().toISOString().slice(0, 10)
    const existing = suplLogs.find(s => s.supl_id === suplId && s.date === today)
    if (existing) {
      setSuplLogs(prev => prev.filter(s => s.id !== existing.id))
      await dbDelete('supl_logs', existing.id)
    } else {
      const item = { id: genId(), supl_id: suplId, date: today }
      setSuplLogs(prev => [item, ...prev])
      await dbInsert('supl_logs', item)
    }
  }
  const isSuplDone = (id) => {
    const today = new Date().toISOString().slice(0, 10)
    return suplLogs.some(s => s.supl_id === id && s.date === today)
  }

  const saveCompounds = (d) => { setCompounds(d); flash() }

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todaySession = SPLIT[todayIdx]

  const TABS = [
    { id: 'dash',   icon: '◉', label: 'Início',  color: T.text    },
    { id: 'treino', icon: '↑', label: 'Treino',  color: T.treino  },
    { id: 'nutri',  icon: '◎', label: 'Dieta',   color: T.nutri   },
    { id: 'horm',   icon: '⊕', label: 'Saúde',   color: T.horm    },
    { id: 'body',   icon: '◈', label: 'Corpo',   color: T.metrica },
    { id: 'fotos',  icon: '⊟', label: 'Fotos',   color: T.gold    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Lato',sans-serif", color: T.text, maxWidth: 480, margin: '0 auto', paddingBottom: 90 }}>
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      {workoutMode && (
        <WorkoutMode
          session={workoutMode.session}
          exercises={workoutMode.exercises}
          onClose={() => setWorkoutMode(null)}
          onSave={addWorkout}
        />
      )}

      {/* HEADER */}
      <div style={{ padding: '44px 22px 12px', borderBottom: `1px solid ${T.border}`, background: T.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{profile.phase} · até {profile.phaseEnd}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${T.treino},${T.nutri})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.bg, fontWeight: 900, fontSize: 15 }}>T</div>
      </div>

      {/* STATUS BAR */}
      <div style={{ padding: '4px 22px', background: T.surface, borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end' }}>
        {syncMsg && <div style={{ fontSize: 9, color: T.ok, fontWeight: 700 }}>{syncMsg}</div>}
      </div>

      {/* CONTENT */}
      <div className="fade" key={tab} style={{ padding: '16px 22px' }}>
        {tab === 'dash'   && <DashTab profile={profile} nutrition={nutrition} metrics={metrics} todaySession={todaySession} dietaLogs={dietaLogs} aplicacoes={aplicacoes} workout={workout} isSuplDone={isSuplDone} toggleSupl={toggleSupl} addAplicacao={addAplicacao} onStartWorkout={() => { if (todaySession.id !== 'off') setWorkoutMode({ session: todaySession, exercises: EXERCISES[todaySession.id] || [] }) }} />}
        {tab === 'treino' && <TreinoTab workout={workout} addItem={addWorkout} editItem={editWorkout} removeItem={removeWorkout} onStartMode={(s, e) => setWorkoutMode({ session: s, exercises: e })} />}
        {tab === 'nutri'  && <NutriTab nutrition={nutrition} mealLog={mealLog} dietaLogs={dietaLogs} addMeal={addMeal} removeMeal={removeMeal} addDietaLog={addDietaLog} />}
        {tab === 'horm'   && <HormTab labLog={labLog} addLab={addLab} removeLab={removeLab} aplicacoes={aplicacoes} addAplicacao={addAplicacao} removeAplicacao={removeAplicacao} compounds={compounds} saveCompounds={saveCompounds} />}
        {tab === 'body'   && <BodyTab metrics={metrics} profile={profile} addMetric={addMetric} editMetric={editMetric} removeMetric={removeMetric} />}
        {tab === 'fotos'  && <FotosTab photos={photos} addPhoto={addPhoto} removePhoto={removePhoto} />}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: T.surface, borderTop: `1px solid ${T.border}`, padding: '8px 4px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? t.color + '20' : 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 8px', borderRadius: 10 }}>
              <span style={{ fontSize: 17, color: tab === t.id ? t.color : T.muted }}>{t.icon}</span>
              <span style={{ fontSize: 8, color: tab === t.id ? t.color : T.muted, textTransform: 'uppercase', letterSpacing: .8, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DASH ─────────────────────────────────────────────────────────────────────
function DashTab({ profile, nutrition, metrics, todaySession, dietaLogs, aplicacoes, workout, isSuplDone, toggleSupl, addAplicacao, onStartWorkout }) {
  const sorted = [...metrics].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
  const last = sorted[sorted.length - 1]
  const today = new Date().toISOString().slice(0, 10)
  const todayDieta = dietaLogs.filter(d => d.date === today || d.created_at?.slice(0, 10) === today)
  const todayKcal = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.kcal || 0), 0)
  const todayProt = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.prot || 0), 0)
  const todayWorkout = workout.filter(w => w.created_at?.slice(0, 10) === today)
  const todayApp = aplicacoes.filter(a => a.date === today || a.created_at?.slice(0, 10) === today)
  const suplDone = SUPLS.filter(s => isSuplDone(s.id)).length

  const dietaPct = Math.min(100, Math.round((todayKcal / nutrition.calories) * 100))
  const treinoPct = todaySession?.id === 'off' ? 100 : Math.min(100, todayWorkout.length > 0 ? 100 : 0)
  const protoPct = Math.min(100, todayApp.length > 0 ? 100 : 0)
  const suplPct = Math.round((suplDone / SUPLS.length) * 100)
  const scoreDia = Math.round((dietaPct + treinoPct + protoPct + suplPct) / 4)

  const bfAtual = parseFloat(last?.bf || 20)
  const bfMeta = parseFloat(profile.bfMeta || 12)
  const semanas = bfAtual > bfMeta ? Math.ceil(((bfAtual - bfMeta) * 0.453 * 7700) / (400 * 7)) : 0
  const chartData = sorted.slice(-8).map((m, i) => ({ n: (m.date || '').slice(0, 5) || `${i + 1}`, kg: parseFloat(m.weight) || null, bf: parseFloat(m.bf) || null }))

  const isInjDay = new Date().getDay() === 1 || new Date().getDay() === 4
  const alreadyInjected = todayApp.some(a => a.compound?.includes('Enantato'))

  return (
    <div>
      {/* Today hero */}
      <div onClick={todaySession?.id !== 'off' ? onStartWorkout : undefined}
        style={{ background: `linear-gradient(135deg,${T.card},${(todaySession?.color || T.treino) + '22'})`, border: `1px solid ${(todaySession?.color || T.treino) + '40'}`, borderRadius: 20, padding: '20px', marginBottom: 10, cursor: todaySession?.id !== 'off' ? 'pointer' : 'default', borderLeft: `3px solid ${todaySession?.color || T.treino}` }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Hoje — {todaySession?.day}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: todaySession?.color || T.text }}>{todaySession?.emoji} {todaySession?.label}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 3, marginBottom: todaySession?.id !== 'off' ? 14 : 0 }}>{todaySession?.tag}</div>
        {todaySession?.id !== 'off' && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: (todaySession?.color || T.treino) + '22', border: `1px solid ${(todaySession?.color || T.treino) + '44'}`, borderRadius: 10, padding: '8px 14px' }}><span style={{ fontSize: 12, fontWeight: 700, color: todaySession?.color || T.treino }}>▶ Iniciar Modo Treino</span></div>}
      </div>

      {/* Score */}
      <Card>
        <Lbl>Score do Dia</Lbl>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg width={64} height={64} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx={32} cy={32} r={27} fill="none" stroke={T.faint} strokeWidth={5} />
              <circle cx={32} cy={32} r={27} fill="none" stroke={scoreDia > 70 ? T.ok : scoreDia > 40 ? T.warn : T.alert} strokeWidth={5} strokeDasharray={2 * Math.PI * 27} strokeDashoffset={2 * Math.PI * 27 * (1 - scoreDia / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: scoreDia > 70 ? T.ok : scoreDia > 40 ? T.warn : T.alert }}>{scoreDia}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {[{ l: 'Dieta', v: dietaPct, c: T.nutri }, { l: 'Treino', v: treinoPct, c: T.treino }, { l: 'Protocolo', v: protoPct, c: T.horm }, { l: 'Suplementos', v: suplPct, c: T.gold }].map(s => (
              <div key={s.l} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: T.muted }}>{s.l}</span>
                  <span style={{ color: s.c, fontWeight: 700 }}>{s.v}%</span>
                </div>
                <div style={{ background: T.faint, borderRadius: 3, height: 3 }}>
                  <div style={{ width: `${s.v}%`, height: '100%', background: s.c, borderRadius: 3, transition: 'width .8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
        {[{ l: 'Peso', v: last?.weight || '—', u: 'kg', c: T.treino }, { l: 'BF%', v: last?.bf || '—', u: '%', c: T.metrica }, { l: 'Kcal', v: todayKcal || '—', u: '', c: T.nutri }, { l: 'Prot', v: todayProt || '—', u: 'g', c: T.treino }].map(s => (
          <div key={s.l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.v}<span style={{ fontSize: 9 }}>{s.u}</span></div>
            <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Injection */}
      {isInjDay && !alreadyInjected && (
        <Card color={T.horm}>
          <Lbl color={T.horm}>💉 Dia de Aplicação</Lbl>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>Testosterona Enantato + Anastrozol</div>
          <Btn full color={T.horm} onClick={() => {
            addAplicacao({ compound: 'Testosterona Enantato', dose: '0.7', unit: 'ml', obs: '', date: today })
            addAplicacao({ compound: 'Anastrozol', dose: '0.5', unit: 'mg', obs: '', date: today })
          }}>Registrar Aplicação de Hoje</Btn>
        </Card>
      )}
      {isInjDay && alreadyInjected && (
        <Card color={T.ok}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: T.ok }}>Aplicação Registrada</div><div style={{ fontSize: 11, color: T.muted }}>Testo + Anastrozol — hoje</div></div>
          </div>
        </Card>
      )}

      {/* Supls */}
      <Card>
        <Lbl>Suplementos de Hoje — {suplDone}/{SUPLS.length}</Lbl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUPLS.map(s => {
            const done = isSuplDone(s.id)
            return (
              <button key={s.id} onClick={() => toggleSupl(s.id)} className="pop" style={{ background: done ? s.color + '30' : T.faint, border: `1px solid ${done ? s.color : T.border}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .2s' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: done ? s.color : T.muted, marginBottom: 2 }}>{done ? '✓ ' : ''}{s.name}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{s.dose} · {s.time}</div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* BF previsão */}
      {bfAtual > bfMeta && (
        <Card color={T.metrica}>
          <Lbl>Previsão BF%</Lbl>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: T.muted }}><span style={{ color: T.alert, fontWeight: 700 }}>{bfAtual}%</span> → <span style={{ color: T.ok, fontWeight: 700 }}>{bfMeta}%</span></div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "'Playfair Display',serif" }}>~{semanas} semanas</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: T.metrica }}>{(bfAtual - bfMeta).toFixed(1)}</div>
              <div style={{ fontSize: 10, color: T.muted }}>% a perder</div>
            </div>
          </div>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <Lbl>Evolução — Peso & BF%</Lbl>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gKg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.treino} stopOpacity={0.3} /><stop offset="95%" stopColor={T.treino} stopOpacity={0} /></linearGradient>
                <linearGradient id="gBf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.metrica} stopOpacity={0.3} /><stop offset="95%" stopColor={T.metrica} stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="n" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11, color: T.text }} />
              <Area type="monotone" dataKey="kg" stroke={T.treino} strokeWidth={2} fill="url(#gKg)" dot={false} connectNulls name="Peso" />
              <Area type="monotone" dataKey="bf" stroke={T.metrica} strokeWidth={2} fill="url(#gBf)" dot={false} connectNulls name="BF%" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Fases */}
      <Card>
        <Lbl>Plano de Fases</Lbl>
        {[{ fase: 'Fase 1 — Cutting', period: 'Abr → Jul 2026', active: true }, { fase: 'Fase 2 — Recomp', period: 'Ago → Out 2026', active: false }, { fase: 'Fase 3 — Bulk', period: 'Nov 2026 → Mar 2027', active: false }, { fase: 'Fase 4 — Cutting', period: 'Abr → Jun 2027', active: false }].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: f.active ? T.treino : T.border }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: f.active ? 700 : 400, color: f.active ? T.text : T.muted }}>{f.fase}</div><div style={{ fontSize: 11, color: T.muted }}>{f.period}</div></div>
            {f.active && <Pill color={T.treino}>Ativo</Pill>}
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── TREINO ───────────────────────────────────────────────────────────────────
function TreinoTab({ workout, addItem, editItem, removeItem, onStartMode }) {
  const [sel, setSel] = useState(null)
  const [loads, setLoads] = useState({})
  const [editing, setEditing] = useState(null)
  const [exFilter, setExFilter] = useState(null)
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const saveLoad = (name, kg, reps, dayId) => {
    if (!kg) return
    addItem({ exercise: name, kg, reps, date: new Date().toLocaleDateString('pt-BR'), day: dayId })
    setLoads(l => ({ ...l, [name + '-kg']: '', [name + '-reps']: '' }))
  }
  const getHist = (name) => [...workout].filter(l => l.exercise === name).sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1).slice(0, 5)

  if (sel && exFilter) {
    const session = SPLIT.find(s => s.id === sel)
    const ex = EXERCISES[sel]?.find(e => e.name === exFilter)
    if (!ex) return null
    const hist = getHist(ex.name)
    const chartData = hist.slice().reverse().map((h, i) => ({ n: `${i + 1}`, kg: parseFloat(h.kg) || null }))
    return (
      <div>
        <button onClick={() => setExFilter(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Voltar</button>
        <Pill color={session.color} small>{ex.muscle}</Pill>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: session.color, marginTop: 8, marginBottom: 4 }}>{ex.name}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[{ l: 'Séries', v: ex.sets }, { l: 'Reps', v: ex.reps }, { l: 'Pausa', v: ex.rest > 0 ? `${ex.rest}s` : '—' }].map(s => (
            <div key={s.l} style={{ flex: 1, background: T.faint, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: session.color }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.faint, borderLeft: `3px solid ${session.color}`, borderRadius: '0 12px 12px 0', padding: '12px 14px', fontSize: 12, color: T.muted, lineHeight: 1.7, marginBottom: 16 }}>💡 {ex.cue}</div>
        {chartData.length > 1 && (
          <Card>
            <Lbl>Evolução de Carga</Lbl>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={session.color} stopOpacity={0.3} /><stop offset="95%" stopColor={session.color} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="n" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11, color: T.text }} />
                <Area type="monotone" dataKey="kg" stroke={session.color} strokeWidth={2} fill="url(#gl)" dot={{ fill: session.color, r: 3 }} connectNulls name="kg" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}
        <Card>
          <Lbl>Registrar Carga</Lbl>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Inp placeholder="kg" value={loads[ex.name + '-kg'] || ''} onChange={v => setLoads({ ...loads, [ex.name + '-kg']: v })} type="number" style={{ flex: 1, fontSize: 18, padding: '14px', textAlign: 'center' }} />
            <Inp placeholder="reps" value={loads[ex.name + '-reps'] || ''} onChange={v => setLoads({ ...loads, [ex.name + '-reps']: v })} type="number" style={{ flex: 1, fontSize: 18, padding: '14px', textAlign: 'center' }} />
          </div>
          <Btn full color={session.color} onClick={() => saveLoad(ex.name, loads[ex.name + '-kg'], loads[ex.name + '-reps'], sel)}>+ Salvar</Btn>
        </Card>
        {hist.length > 0 && (
          <Card>
            <Lbl>Histórico</Lbl>
            {hist.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < hist.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                {editing?.id === h.id ? (
                  <>
                    <Inp value={editing.kg} onChange={v => setEditing({ ...editing, kg: v })} placeholder="kg" style={{ width: 70 }} />
                    <Inp value={editing.reps} onChange={v => setEditing({ ...editing, reps: v })} placeholder="reps" style={{ width: 70 }} />
                    <Btn small color={T.ok} onClick={() => { editItem(editing.id, { kg: editing.kg, reps: editing.reps }); setEditing(null) }}>✓</Btn>
                    <Btn small ghost color={T.muted} onClick={() => setEditing(null)}>✕</Btn>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, background: session.color + '20', color: session.color, fontSize: 11, padding: '6px 12px', borderRadius: 10, fontWeight: 600 }}>{h.date} · {h.kg}kg × {h.reps}</span>
                    <button onClick={() => setEditing({ id: h.id, kg: h.kg, reps: h.reps })} style={{ background: 'none', border: 'none', color: T.horm, cursor: 'pointer', fontSize: 14 }}>✏️</button>
                    <button onClick={() => removeItem(h.id, `${ex.name} ${h.date}`)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer', fontSize: 14 }}>🗑</button>
                  </>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    )
  }

  if (sel) {
    const session = SPLIT.find(s => s.id === sel)
    if (sel === 'off') return (
      <div>
        <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Voltar</button>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⚽</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: T.text }}>Dia de Futebol</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>Descanso ativo. Aproveita!</div>
        </div>
      </div>
    )
    return (
      <div>
        <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Voltar</button>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: session.color, marginBottom: 2 }}>{session.emoji} {session.label}</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>{session.tag}</div>
        <Btn full color={session.color} style={{ marginBottom: 16 }} onClick={() => onStartMode(session, EXERCISES[sel] || [])}>▶ Modo Treino — Tela Cheia</Btn>
        {(EXERCISES[sel] || []).map((ex, i) => {
          const isCardio = ex.name.includes('Cardio')
          const hist = getHist(ex.name)
          const lastLoad = hist[0]
          return (
            <Card key={i} color={isCardio ? T.nutri : session.color} onClick={() => setExFilter(ex.name)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Pill color={isCardio ? T.nutri : session.color} small>{ex.muscle}</Pill>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6, marginBottom: 4 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{ex.sets}×{ex.reps} · pausa {ex.rest > 0 ? `${ex.rest}s` : '—'}</div>
                  {lastLoad && <div style={{ fontSize: 11, color: session.color, marginTop: 4, fontWeight: 600 }}>Última: {lastLoad.kg}kg × {lastLoad.reps}</div>}
                </div>
                <div style={{ color: T.muted, fontSize: 18, marginLeft: 8 }}>›</div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>Treinos</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>PPL · 6×/semana</div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {SPLIT.map((s, i) => {
          const isToday = i === todayIdx
          return (
            <div key={s.id} onClick={() => setSel(s.id)} style={{ flexShrink: 0, width: 56, background: isToday ? s.color : T.surface, border: `1px solid ${isToday ? s.color : T.border}`, borderRadius: 14, padding: '10px 6px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 9, color: isToday ? T.bg : T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>{s.day}</div>
              <div style={{ fontSize: 18 }}>{s.emoji}</div>
              <div style={{ fontSize: 8, color: isToday ? T.bg : T.muted, marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          )
        })}
      </div>
      {SPLIT.map(s => (
        <Card key={s.id} color={s.color} onClick={() => setSel(s.id)} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.emoji} {s.label}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.tag}</div>
              {EXERCISES[s.id] && <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{EXERCISES[s.id].length} exercícios</div>}
            </div>
            <div style={{ color: T.muted, fontSize: 20 }}>›</div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── NUTRI ────────────────────────────────────────────────────────────────────
function NutriTab({ nutrition, mealLog, dietaLogs, addMeal, removeMeal, addDietaLog }) {
  const [log, setLog] = useState({ time: '', desc: '', kcal: '', prot: '' })
  const today = new Date().toISOString().slice(0, 10)
  const todayDate = new Date().toLocaleDateString('pt-BR')
  const todayDieta = dietaLogs.filter(d => d.date === today || d.created_at?.slice(0, 10) === today)
  const getMealStatus = (mealId) => todayDieta.find(d => d.meal_id === mealId)
  const toggleMeal = (meal, ate) => { if (getMealStatus(meal.id)) return; addDietaLog({ meal_id: meal.id, meal_label: meal.label, ate, kcal: ate ? meal.kcal : 0, prot: ate ? meal.prot : 0, date: today }) }
  const todayKcal = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.kcal || 0), 0)
  const todayProt = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.prot || 0), 0)
  const addMealLog = () => { if (!log.desc) return; addMeal({ ...log, date: todayDate }); setLog({ time: '', desc: '', kcal: '', prot: '' }) }
  const currentHour = new Date().getHours() + new Date().getMinutes() / 60
  const getUrg = (t) => { const [h, m] = t.split(':').map(Number); const d = (h + m / 60) - currentHour; if (d < 0 && d > -1) return 'now'; if (d >= 0 && d < 1) return 'soon'; return 'normal' }

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>Dieta</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>~2.100 kcal · 190g proteína</div>
      <Card color={T.nutri}>
        <Lbl color={T.nutri}>Progresso de Hoje</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ l: 'Calorias', cur: todayKcal, meta: nutrition.calories, u: 'kcal', c: T.nutri }, { l: 'Proteína', cur: todayProt, meta: nutrition.protein, u: 'g', c: T.treino }].map(m => (
            <div key={m.l} style={{ background: T.faint, borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{m.l}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: m.c }}>{m.cur}<span style={{ fontSize: 10 }}>{m.u}</span></div>
              <div style={{ fontSize: 10, color: T.muted }}>/ {m.meta}{m.u}</div>
              <div style={{ background: T.border, borderRadius: 4, height: 5, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((m.cur / m.meta) * 100, 100)}%`, height: '100%', background: m.c, borderRadius: 4, transition: 'width .8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <Lbl>Plano — Marcar Hoje</Lbl>
        {DIET.map((meal, i) => {
          const status = getMealStatus(meal.id)
          const urg = getUrg(meal.time)
          return (
            <div key={meal.id} style={{ padding: '12px 0', borderBottom: i < DIET.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    {urg === 'now' && !status && <span style={{ fontSize: 8, background: T.warn + '30', color: T.warn, padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>AGORA</span>}
                    {urg === 'soon' && !status && <span style={{ fontSize: 8, background: T.nutri + '30', color: T.nutri, padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>EM BREVE</span>}
                    <span style={{ fontSize: 11, color: T.nutri, fontWeight: 700 }}>{meal.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{meal.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.muted }}>{meal.kcal} kcal · {meal.prot}g prot</div>
                </div>
                {status ? <Pill color={status.ate ? T.ok : T.alert} small>{status.ate ? '✓ Comi' : '✗ Não'}</Pill> : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleMeal(meal, true)} style={{ background: T.ok + '22', color: T.ok, border: `1px solid ${T.ok}44`, borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                    <button onClick={() => toggleMeal(meal, false)} style={{ background: T.alert + '22', color: T.alert, border: `1px solid ${T.alert}44`, borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✗</button>
                  </div>
                )}
              </div>
              {meal.options.map((op, j) => <div key={j} style={{ fontSize: 10, color: T.muted, lineHeight: 1.6, paddingLeft: 10, borderLeft: `2px solid ${T.nutri}30`, marginTop: 2 }}>{op}</div>)}
            </div>
          )
        })}
      </Card>
      <Card color={T.treino}>
        <Lbl color={T.treino}>Registro Livre</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <Inp placeholder="Horário" value={log.time} onChange={v => setLog({ ...log, time: v })} style={{ width: '100%' }} />
          <Inp placeholder="Kcal" type="number" value={log.kcal} onChange={v => setLog({ ...log, kcal: v })} style={{ width: '100%' }} />
        </div>
        <Inp placeholder="O que você comeu?" value={log.desc} onChange={v => setLog({ ...log, desc: v })} style={{ width: '100%', marginBottom: 8 }} />
        <Inp placeholder="Proteína (g)" type="number" value={log.prot} onChange={v => setLog({ ...log, prot: v })} style={{ width: '100%', marginBottom: 10 }} />
        <Btn full color={T.nutri} onClick={addMealLog}>+ Adicionar</Btn>
      </Card>
      {mealLog.filter(m => m.date === todayDate).length > 0 && (
        <Card>
          <Lbl>Livres de Hoje</Lbl>
          {mealLog.filter(m => m.date === todayDate).map((m, i, arr) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{m.desc}</div><div style={{ fontSize: 10, color: T.muted }}>{m.time}</div></div>
              <div style={{ textAlign: 'right', marginRight: 8 }}><div style={{ fontSize: 12, color: T.nutri, fontWeight: 700 }}>{m.kcal} kcal</div><div style={{ fontSize: 10, color: T.treino, fontWeight: 600 }}>{m.prot}g P</div></div>
              <button onClick={() => removeMeal(m.id, m.desc)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer', fontSize: 14 }}>🗑</button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─── SAÚDE ────────────────────────────────────────────────────────────────────
function HormTab({ labLog, addLab, removeLab, aplicacoes, addAplicacao, removeAplicacao, compounds, saveCompounds }) {
  const [labForm, setLabForm] = useState({ marker: '', value: '', unit: '', date: '' })
  const [appForm, setAppForm] = useState({ compound: '', dose: '', unit: 'ml', obs: '', date: '' })
  const [editDose, setEditDose] = useState(null)
  const [showApp, setShowApp] = useState(false)
  const [showLab, setShowLab] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const getStatus = (marker, val) => { const ref = LAB_REFS[marker]; if (!ref) return 'ok'; const v = parseFloat(val); if (isNaN(v)) return 'ok'; if (ref.alert === 'high' && v > ref.max) return 'alert'; if (ref.alert === 'low' && v < ref.min) return 'alert'; if (v < ref.min || v > ref.max) return 'warn'; return 'ok' }
  const getTrend = (marker) => { const h = labLog.filter(l => l.marker === marker).sort((a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date)); if (h.length < 2) return null; const l = parseFloat(h[h.length - 1].value), p = parseFloat(h[h.length - 2].value); if (isNaN(l) || isNaN(p)) return null; if (l > p) return '↑'; if (l < p) return '↓'; return '→' }
  const getAlerts = () => { const latest = {}; labLog.forEach(l => { if (!latest[l.marker] || new Date(l.created_at || l.date) > new Date(latest[l.marker].created_at || latest[l.marker].date)) latest[l.marker] = l }); return Object.values(latest).filter(l => getStatus(l.marker, l.value) !== 'ok') }
  const alerts = getAlerts()
  const appsGrouped = {}; aplicacoes.forEach(a => { if (!appsGrouped[a.compound]) appsGrouped[a.compound] = []; appsGrouped[a.compound].push(a) })

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>Saúde</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Protocolo · Aplicações · Exames</div>
      {alerts.length > 0 && (
        <Card color={T.alert}>
          <Lbl color={T.alert}>⚠ Alertas</Lbl>
          {alerts.map((a, i) => { const ref = LAB_REFS[a.marker]; const st = getStatus(a.marker, a.value); return (<div key={i} style={{ display: 'flex', alignItems: 'flex-start', padding: '7px 0', borderBottom: i < alerts.length - 1 ? `1px solid ${T.border}` : 'none' }}><StatusDot status={st} /><div><div style={{ fontSize: 12, fontWeight: 700 }}>{a.marker}: {a.value}</div><div style={{ fontSize: 10, color: T.muted }}>{st === 'alert' && ref?.alert === 'high' ? `Acima (>${ref.max}${ref.unit})` : st === 'alert' && ref?.alert === 'low' ? `Abaixo (<${ref.min}${ref.unit})` : 'Fora do intervalo'}</div></div></div>) })}
        </Card>
      )}
      <Card color={T.horm}>
        <Lbl color={T.horm}>Protocolo Ativo</Lbl>
        {compounds.map((c, idx) => (
          <div key={c.id} style={{ padding: '12px 0', borderBottom: idx < compounds.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>📅 {c.schedule} · {c.weekly}/sem</div></div>
              {editDose?.idx === idx ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Inp value={editDose.dose} onChange={v => setEditDose({ ...editDose, dose: v })} style={{ width: 60 }} />
                  <span style={{ fontSize: 11, color: T.muted }}>{c.unit}</span>
                  <Btn small color={T.ok} onClick={() => { saveCompounds(compounds.map((x, i) => i === idx ? { ...x, dose: editDose.dose } : x)); setEditDose(null) }}>✓</Btn>
                  <Btn small ghost color={T.muted} onClick={() => setEditDose(null)}>✕</Btn>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill color={c.color}>{c.dose}{c.unit}</Pill>
                  <button onClick={() => setEditDose({ idx, dose: c.dose })} style={{ background: 'none', border: 'none', color: T.horm, cursor: 'pointer', fontSize: 13 }}>✏️</button>
                </div>
              )}
            </div>
            {appsGrouped[c.name]?.slice(0, 2).map((ap, j) => <div key={j} style={{ fontSize: 10, color: T.muted, marginTop: 4, paddingLeft: 8 }}>→ {ap.date}: {ap.dose}{ap.unit}{ap.obs ? ` · ${ap.obs}` : ''}</div>)}
          </div>
        ))}
      </Card>
      <div style={{ marginBottom: 10 }}><Btn full color={T.horm} onClick={() => setShowApp(!showApp)}>{showApp ? 'Cancelar' : '💉 Registrar Aplicação'}</Btn></div>
      {showApp && (
        <Card color={T.horm}>
          <Lbl>Nova Aplicação</Lbl>
          <select value={appForm.compound} onChange={e => setAppForm({ ...appForm, compound: e.target.value })} style={{ width: '100%', background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 13px', fontSize: 12, color: T.text, outline: 'none', marginBottom: 8 }}>
            <option value="">Selecionar…</option>
            {compounds.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <Inp placeholder="Dose" value={appForm.dose} onChange={v => setAppForm({ ...appForm, dose: v })} style={{ width: '100%' }} />
            <select value={appForm.unit} onChange={e => setAppForm({ ...appForm, unit: e.target.value })} style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 8px', fontSize: 12, color: T.text, outline: 'none' }}>
              <option value="ml">ml</option><option value="mg">mg</option><option value="UI">UI</option>
            </select>
            <Inp type="date" value={appForm.date} onChange={v => setAppForm({ ...appForm, date: v })} style={{ width: '100%' }} />
          </div>
          <Inp placeholder="Obs" value={appForm.obs} onChange={v => setAppForm({ ...appForm, obs: v })} style={{ width: '100%', marginBottom: 10 }} />
          <Btn full color={T.horm} onClick={() => { if (!appForm.compound || !appForm.dose) return; addAplicacao({ ...appForm, date: appForm.date || today }); setAppForm({ compound: '', dose: '', unit: 'ml', obs: '', date: '' }); setShowApp(false) }}>Salvar</Btn>
        </Card>
      )}
      {aplicacoes.length > 0 && (
        <Card>
          <Lbl>Histórico de Aplicações</Lbl>
          {[...aplicacoes].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 12).map((a, i) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <div><div style={{ fontSize: 12, fontWeight: 700 }}>{a.compound}</div><div style={{ fontSize: 10, color: T.muted }}>{a.date}{a.obs ? ` · ${a.obs}` : ''}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill color={T.horm}>{a.dose}{a.unit}</Pill>
                <button onClick={() => removeAplicacao(a.id, `${a.compound} ${a.date}`)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer', fontSize: 13 }}>🗑</button>
              </div>
            </div>
          ))}
        </Card>
      )}
      <div style={{ marginBottom: 10, marginTop: 6 }}><Btn full color={T.nutri} onClick={() => setShowLab(!showLab)}>{showLab ? 'Cancelar' : '🩸 Registrar Exame'}</Btn></div>
      {showLab && (
        <Card color={T.nutri}>
          <Lbl>Novo Exame</Lbl>
          <select value={labForm.marker} onChange={e => { const ref = LAB_REFS[e.target.value]; setLabForm({ ...labForm, marker: e.target.value, unit: ref?.unit || '' }) }} style={{ width: '100%', background: T.faint, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 13px', fontSize: 12, color: T.text, outline: 'none', marginBottom: 8 }}>
            <option value="">Selecionar marcador…</option>
            {Object.keys(LAB_REFS).map(k => <option key={k}>{k}</option>)}
            <option>Outro</option>
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            <Inp placeholder="Valor" value={labForm.value} onChange={v => setLabForm({ ...labForm, value: v })} style={{ width: '100%' }} />
            <Inp placeholder="Unidade" value={labForm.unit} onChange={v => setLabForm({ ...labForm, unit: v })} style={{ width: '100%' }} />
            <Inp type="date" value={labForm.date} onChange={v => setLabForm({ ...labForm, date: v })} style={{ width: '100%' }} />
          </div>
          <Btn full color={T.horm} onClick={() => { if (!labForm.marker || !labForm.value) return; addLab({ ...labForm, date: labForm.date || today }); setLabForm({ marker: '', value: '', unit: '', date: '' }); setShowLab(false) }}>Salvar Exame</Btn>
        </Card>
      )}
      {labLog.length > 0 && (
        <Card>
          <Lbl>Histórico de Exames</Lbl>
          {[...labLog].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 20).map((l, i) => {
            const st = getStatus(l.marker, l.value); const trend = getTrend(l.marker); const ref = LAB_REFS[l.marker]
            return (
              <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
                <StatusDot status={st} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: 12, fontWeight: 700 }}>{l.marker}</div><div style={{ fontSize: 10, color: T.muted }}>{l.date || l.created_at?.slice(0, 10)}{ref ? ` · ${ref.min}–${ref.max}${ref.unit}` : ''}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {trend && <span style={{ fontSize: 13, color: trend === '↑' ? T.alert : trend === '↓' ? T.ok : T.muted }}>{trend}</span>}
                      <span style={{ fontSize: 13, fontWeight: 700, color: st === 'ok' ? T.ok : st === 'warn' ? T.warn : T.alert }}>{l.value}{l.unit ? ` ${l.unit}` : ''}</span>
                      <button onClick={() => removeLab(l.id, l.marker)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer', fontSize: 13 }}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      )}
      <Card color={T.treino}>
        <Lbl color={T.treino}>Suplementação</Lbl>
        {[{ s: 'Vitamina D3+K2', d: '2.000–4.000 UI/dia', status: 'alert', note: 'Deficiente no exame fev/26' }, { s: 'Vitamina B12', d: '1.000 mcg/dia', status: 'warn', note: 'Baixo-moderado. Monitorar.' }, { s: 'Creatina', d: '3–5g pós-treino', status: 'ok', note: 'Manutenção de força no cutting.' }, { s: 'Ômega 3', d: '2–4g/dia', status: 'warn', note: 'Auxilia no HDL baixo.' }].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
            <StatusDot status={s.status} />
            <div><div style={{ fontSize: 13, fontWeight: 700 }}>{s.s}</div><div style={{ fontSize: 11, color: T.horm, fontWeight: 600 }}>{s.d}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{s.note}</div></div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── CORPO ────────────────────────────────────────────────────────────────────
function BodyTab({ metrics, profile, addMetric, editMetric, removeMetric }) {
  const [entry, setEntry] = useState({ date: '', weight: '', bf: '', waist: '', armL: '', armR: '', chest: '', notes: '' })
  const [editing, setEditing] = useState(null)
  const sorted = [...metrics].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
  const last = sorted[sorted.length - 1]
  const chartData = sorted.slice(-12).map((m, i) => ({ n: (m.date || '').slice(0, 5) || `${i + 1}`, kg: parseFloat(m.weight) || null, bf: parseFloat(m.bf) || null }))
  const add = () => { if (!entry.weight && !entry.bf) return; addMetric({ ...entry, date: entry.date || new Date().toLocaleDateString('pt-BR') }); setEntry({ date: '', weight: '', bf: '', waist: '', armL: '', armR: '', chest: '', notes: '' }) }

  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>Corpo</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Medições e evolução física</div>
      <Card color={T.metrica}>
        <Lbl color={T.metrica}>BF% — Atual → Meta</Lbl>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, textAlign: 'center', background: T.faint, borderRadius: 14, padding: '16px 10px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: T.alert }}>{last?.bf || '—'}%</div>
            <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Atual</div>
          </div>
          <div style={{ fontSize: 22, color: T.muted }}>→</div>
          <div style={{ flex: 1, textAlign: 'center', background: T.faint, borderRadius: 14, padding: '16px 10px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: T.ok }}>{profile.bfMeta || 12}%</div>
            <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Meta</div>
          </div>
        </div>
      </Card>
      {last && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
          {[{ l: 'Peso', v: `${last.weight}kg`, c: T.treino }, { l: 'BF%', v: `${last.bf}%`, c: T.metrica }, { l: 'Cintura', v: last.waist ? `${last.waist}cm` : '—', c: T.nutri }].map(s => (
            <div key={s.l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}
      <Card color={T.metrica}>
        <Lbl color={T.metrica}>Nova Medição</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ l: 'Peso (kg)', k: 'weight', p: '91.5' }, { l: 'BF%', k: 'bf', p: '20' }, { l: 'Cintura (cm)', k: 'waist', p: '88' }, { l: 'Peito (cm)', k: 'chest', p: '104' }, { l: 'Braço Esq', k: 'armL', p: '38' }, { l: 'Braço Dir', k: 'armR', p: '38.5' }].map(f => (
            <div key={f.k}><Lbl>{f.l}</Lbl><Inp placeholder={f.p} value={entry[f.k]} onChange={v => setEntry({ ...entry, [f.k]: v })} style={{ width: '100%' }} /></div>
          ))}
        </div>
        <div style={{ marginTop: 10, marginBottom: 12 }}><Lbl>Obs</Lbl><Inp placeholder="Em jejum, horário…" value={entry.notes} onChange={v => setEntry({ ...entry, notes: v })} style={{ width: '100%' }} /></div>
        <Btn full color={T.metrica} onClick={add}>+ Salvar Medição</Btn>
      </Card>
      {chartData.length > 1 && (
        <Card>
          <Lbl>Evolução</Lbl>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gk2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.treino} stopOpacity={.25} /><stop offset="95%" stopColor={T.treino} stopOpacity={0} /></linearGradient>
                <linearGradient id="gm2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.metrica} stopOpacity={.25} /><stop offset="95%" stopColor={T.metrica} stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="n" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11, color: T.text }} />
              <Area type="monotone" dataKey="kg" stroke={T.treino} strokeWidth={2} fill="url(#gk2)" dot={{ fill: T.treino, r: 3 }} connectNulls name="Peso" />
              <Area type="monotone" dataKey="bf" stroke={T.metrica} strokeWidth={2} fill="url(#gm2)" dot={{ fill: T.metrica, r: 3 }} connectNulls name="BF%" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
      {sorted.length > 0 && (
        <Card>
          <Lbl>Histórico</Lbl>
          {[...sorted].reverse().map(m => (
            <div key={m.id}>
              {editing?.id === m.id ? (
                <div style={{ padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                    {[{ l: 'Peso', k: 'weight' }, { l: 'BF%', k: 'bf' }, { l: 'Cintura', k: 'waist' }, { l: 'Peito', k: 'chest' }, { l: 'B.Esq', k: 'armL' }, { l: 'B.Dir', k: 'armR' }].map(f => (
                      <div key={f.k}><div style={{ fontSize: 9, color: T.muted, marginBottom: 3 }}>{f.l}</div><Inp value={editing[f.k] || ''} onChange={v => setEditing({ ...editing, [f.k]: v })} style={{ width: '100%' }} /></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn small color={T.ok} onClick={() => { editMetric(editing.id, { weight: editing.weight, bf: editing.bf, waist: editing.waist, armL: editing.armL, armR: editing.armR, chest: editing.chest }); setEditing(null) }}>✓ Salvar</Btn>
                    <Btn small ghost color={T.muted} onClick={() => setEditing(null)}>Cancelar</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ flex: 1, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: T.muted, minWidth: 58 }}>{m.date}</span>
                    <span style={{ fontWeight: 700, color: T.treino, fontSize: 12 }}>{m.weight}kg</span>
                    <span style={{ color: T.metrica, fontSize: 12, fontWeight: 700 }}>{m.bf}%</span>
                    {m.waist && <span style={{ fontSize: 11, color: T.muted }}>C:{m.waist}</span>}
                    {m.armL && <span style={{ fontSize: 11, color: T.muted }}>BE:{m.armL}</span>}
                  </div>
                  <button onClick={() => setEditing({ ...m })} style={{ background: 'none', border: 'none', color: T.horm, cursor: 'pointer', fontSize: 14 }}>✏️</button>
                  <button onClick={() => removeMetric(m.id, `Medição ${m.date}`)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─── FOTOS ────────────────────────────────────────────────────────────────────
function FotosTab({ photos, addPhoto, removePhoto }) {
  const [view, setView] = useState('grid')
  const [selectedA, setSelectedA] = useState(null)
  const [selectedB, setSelectedB] = useState(null)
  const [tag, setTag] = useState('frente')
  const fileRef = useRef(null)
  const TAGS = ['frente', 'costas', 'lateral', 'geral']

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { addPhoto({ id: genId(), src: ev.target.result, date: new Date().toLocaleDateString('pt-BR'), isoDate: new Date().toISOString().slice(0, 10), tag, notes: '' }) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const sorted = [...photos].sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0))
  const byTag = (t) => sorted.filter(p => p.tag === t)

  if (view === 'compare') return (
    <div>
      <button onClick={() => { setView('grid'); setSelectedA(null); setSelectedB(null) }} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Voltar</button>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 4, color: T.gold }}>Comparar Fotos</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Selecione duas fotos</div>
      {selectedA && selectedB ? (
        <div>
          <PhotoSlider before={selectedA.src} after={selectedB.src} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1, background: T.faint, borderRadius: 10, padding: '10px', textAlign: 'center' }}><div style={{ fontSize: 10, color: T.muted, letterSpacing: 1 }}>ANTES</div><div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginTop: 2 }}>{selectedA.date}</div></div>
            <div style={{ flex: 1, background: T.faint, borderRadius: 10, padding: '10px', textAlign: 'center' }}><div style={{ fontSize: 10, color: T.muted, letterSpacing: 1 }}>DEPOIS</div><div style={{ fontSize: 12, fontWeight: 700, color: T.ok, marginTop: 2 }}>{selectedB.date}</div></div>
          </div>
          <div style={{ marginTop: 12 }}><Btn ghost color={T.muted} small onClick={() => { setSelectedA(null); setSelectedB(null) }}>Resetar</Btn></div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: T.gold, marginBottom: 12 }}>{!selectedA ? '1. Selecione a foto ANTES:' : '2. Selecione a foto DEPOIS:'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {sorted.map(p => {
              const isA = selectedA?.id === p.id; const isB = selectedB?.id === p.id
              return (
                <div key={p.id} onClick={() => { if (!selectedA) setSelectedA(p); else if (!selectedB && p.id !== selectedA.id) setSelectedB(p) }}
                  style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${isA ? T.warn : isB ? T.ok : T.border}` }}>
                  <img src={p.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isA && <div style={{ position: 'absolute', top: 8, left: 8, background: T.warn, color: T.bg, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>ANTES</div>}
                  {isB && <div style={{ position: 'absolute', top: 8, left: 8, background: T.ok, color: T.bg, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>DEPOIS</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.7))', padding: '8px' }}><div style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{p.date}</div></div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: T.gold }}>Fotos</div><div style={{ fontSize: 12, color: T.muted }}>{photos.length} foto{photos.length !== 1 ? 's' : ''}</div></div>
        {photos.length >= 2 && <Btn small color={T.gold} onClick={() => setView('compare')}>⇔ Comparar</Btn>}
      </div>
      <Card color={T.gold}>
        <Lbl color={T.gold}>Nova Foto</Lbl>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {TAGS.map(t => <button key={t} onClick={() => setTag(t)} style={{ background: tag === t ? T.gold + '30' : T.faint, border: `1px solid ${tag === t ? T.gold : T.border}`, color: tag === t ? T.gold : T.muted, borderRadius: 10, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all .2s' }}>{t}</button>)}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn full color={T.gold} style={{ color: T.bg }} onClick={() => fileRef.current?.click()}>📸 Tirar Foto</Btn>
          <Btn full ghost color={T.gold} onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current?.click(); setTimeout(() => fileRef.current?.setAttribute('capture', 'environment'), 500) }}>🖼 Galeria</Btn>
        </div>
      </Card>
      {TAGS.filter(t => byTag(t).length > 0).map(t => (
        <div key={t} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2 }}>{t} · {byTag(t).length}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {byTag(t).map(p => (
              <div key={p.id} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                <img src={p.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 60%,rgba(0,0,0,.75))' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}><div style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>{p.date}</div></div>
                <button onClick={() => removePhoto(p.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {photos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>Sem fotos ainda</div>
          <div style={{ fontSize: 12 }}>A primeira foto é o ponto de partida.</div>
        </div>
      )}
    </div>
  )
}

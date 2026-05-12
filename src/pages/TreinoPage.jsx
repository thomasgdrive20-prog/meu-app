import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SPLIT, EXERCISES, WARMUPS, T } from '../lib/constants'
import { Timer, ChevronDown, ChevronUp, Check, Play, Square } from 'lucide-react'

const todayStr = () => new Date().toISOString().slice(0, 10)

function getTodayWorkout() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = days[new Date().getDay()]
  return SPLIT.find(d => d.day === today) || SPLIT[0]
}

// ─── Timer Component ──────────────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (running && left > 0) {
      ref.current = setInterval(() => setLeft(l => l - 1), 1000)
    } else if (left === 0) {
      clearInterval(ref.current)
      setRunning(false)
      onDone?.()
    }
    return () => clearInterval(ref.current)
  }, [running, left])

  const pct = ((seconds - left) / seconds) * 100

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: T.faint, borderRadius: 10, marginTop: 6 }}>
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke={T.border} strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={T.gold} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: T.gold, fontWeight: 700 }}>
          {left}
        </span>
      </div>
      <div style={{ flex: 1, fontSize: 12, color: T.muted }}>
        {running ? `Descanso: ${left}s` : `Descanso: ${seconds}s`}
      </div>
      <button onClick={() => { if (!running) { setLeft(seconds); setRunning(true) } else { clearInterval(ref.current); setRunning(false); setLeft(seconds) } }}
        style={{ padding: '6px 12px', borderRadius: 8, background: running ? `${T.alert}22` : `${T.gold}22`, border: `1px solid ${running ? T.alert : T.gold}55`, color: running ? T.alert : T.gold, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
        {running ? 'Parar' : 'Iniciar'}
      </button>
    </div>
  )
}

// ─── Exercise Log Row ─────────────────────────────────────────────────────────
function SetRow({ setNum, lastLog, onSave }) {
  const [weight, setWeight] = useState(lastLog?.weight || '')
  const [reps, setReps]     = useState(lastLog?.reps || '')
  const [done, setDone]     = useState(false)

  const handleDone = () => {
    if (!weight || !reps) return
    setDone(true)
    onSave({ set_num: setNum, weight: parseFloat(weight), reps: parseInt(reps) })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 12, color: T.muted, width: 24, textAlign: 'center' }}>{setNum}</span>
      <div style={{ flex: 1, display: 'flex', gap: 6 }}>
        <input type="number" placeholder={lastLog?.weight || 'kg'} value={weight}
          onChange={e => setWeight(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', textAlign: 'center' }} />
        <input type="number" placeholder={lastLog?.reps || 'reps'} value={reps}
          onChange={e => setReps(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: 'none', textAlign: 'center' }} />
      </div>
      <button onClick={handleDone} style={{
        width: 36, height: 36, borderRadius: 8, border: `1px solid ${done ? T.ok + '55' : T.border}`,
        background: done ? `${T.ok}22` : T.faint, color: done ? T.ok : T.muted,
        fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done ? '✓' : '○'}
      </button>
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ ex, uid, workoutId }) {
  const [open, setOpen]       = useState(false)
  const [lastLogs, setLastLogs] = useState([])
  const [showTimer, setShowTimer] = useState(false)

  useEffect(() => {
    if (open) loadLastLogs()
  }, [open])

  const loadLastLogs = async () => {
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', uid)
      .eq('exercise_name', ex.name)
      .order('created_at', { ascending: false })
      .limit(ex.sets || 4)
    if (data) setLastLogs(data)
  }

  const saveSet = async (setData) => {
    await supabase.from('workout_logs').insert({
      user_id: uid,
      exercise_name: ex.name,
      muscle_group: ex.muscle,
      ...setData,
      workout_date: todayStr(),
    })
    setShowTimer(true)
  }

  const isCardio = ex.name.includes('Cardio')
  if (isCardio) return (
    <div style={{ ...exCard, borderColor: `${T.horm}33` }}>
      <div style={{ fontSize: 13, color: T.horm, fontWeight: 700 }}>🏃 {ex.name}</div>
      <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{ex.cue}</div>
    </div>
  )

  return (
    <div style={exCard}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>{ex.name}</span>
            <span style={{ fontSize: 10, color: T.treino, background: `${T.treino}22`, padding: '2px 7px', borderRadius: 4 }}>{ex.muscle}</span>
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
            {ex.sets} séries · {ex.reps} reps · {ex.rest}s descanso
          </div>
          {lastLogs[0] && (
            <div style={{ fontSize: 11, color: T.gold, marginTop: 3 }}>
              Último: {lastLogs[0].weight}kg × {lastLogs[0].reps} reps
            </div>
          )}
        </div>
        {open ? <ChevronUp size={18} color={T.muted} /> : <ChevronDown size={18} color={T.muted} />}
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          {ex.cue && (
            <div style={{ fontSize: 11, color: T.muted, fontStyle: 'italic', marginBottom: 10, lineHeight: 1.5, borderLeft: `2px solid ${T.gold}44`, paddingLeft: 8 }}>
              {ex.cue}
            </div>
          )}
          {ex.alt && (
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>
              Alt: <span style={{ color: T.gold }}>{ex.alt}</span>
            </div>
          )}

          {/* Header das séries */}
          <div style={{ display: 'flex', gap: 8, padding: '4px 0', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: T.muted, width: 24, textAlign: 'center' }}>Nº</span>
            <span style={{ flex: 1, fontSize: 10, color: T.muted, textAlign: 'center' }}>KG</span>
            <span style={{ flex: 1, fontSize: 10, color: T.muted, textAlign: 'center' }}>REPS</span>
            <span style={{ width: 36, fontSize: 10, color: T.muted, textAlign: 'center' }}>OK</span>
          </div>

          {Array.from({ length: ex.sets || 3 }).map((_, i) => (
            <SetRow key={i} setNum={i + 1} lastLog={lastLogs[i]} onSave={saveSet} />
          ))}

          {showTimer && ex.rest > 0 && (
            <RestTimer seconds={ex.rest} onDone={() => setShowTimer(false)} />
          )}

          {ex.tecnica && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: `${T.treino}11`, borderRadius: 8, fontSize: 11, color: T.treino }}>
              💡 {ex.tecnica}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const exCard = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  padding: '14px',
  marginBottom: 10,
}

// ─── TREINO PAGE ──────────────────────────────────────────────────────────────
export default function TreinoPage({ session }) {
  const uid = session.user.id
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const today = days[new Date().getDay()]
    const idx = SPLIT.findIndex(d => d.day === today)
    return idx >= 0 ? idx : 0
  })
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [showWarmup, setShowWarmup]         = useState(false)
  const [elapsed, setElapsed]               = useState(0)
  const timerRef = useRef()

  const day = SPLIT[selectedDay]
  const exercises = EXERCISES[day.id] || []
  const warmup    = WARMUPS[day.id] || []

  useEffect(() => {
    if (workoutStarted) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [workoutStarted])

  const elapsedFmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Treino</div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 2 }}>Workout Manager</div>
      </div>

      {/* Seletor de dia */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {SPLIT.map((d, i) => (
          <button key={d.id} onClick={() => { setSelectedDay(i); setWorkoutStarted(false); setElapsed(0) }} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 20,
            background: selectedDay === i ? `${d.color}22` : T.faint,
            border: `1px solid ${selectedDay === i ? d.color + '66' : T.border}`,
            color: selectedDay === i ? d.color : T.muted,
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>
            {d.day} · {d.label}
          </button>
        ))}
      </div>

      {/* Card do treino */}
      <div style={{ background: T.card, border: `1px solid ${T.gold}33`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, color: T.text, fontWeight: 800 }}>{day.label}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{day.tag}</div>
          </div>
          <span style={{ fontSize: 36 }}>{day.emoji}</span>
        </div>

        {day.focus && (
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 10, borderLeft: `2px solid ${T.gold}44`, paddingLeft: 10 }}>
            {day.focus}
          </div>
        )}

        {/* Timer */}
        {workoutStarted && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.gold, letterSpacing: 2 }}>{elapsedFmt}</div>
            <div style={{ fontSize: 11, color: T.muted }}>tempo de treino</div>
          </div>
        )}

        {!day.sport && (
          <button onClick={() => setWorkoutStarted(w => !w)} style={{
            width: '100%', marginTop: 12, padding: '14px',
            borderRadius: 12, border: `1px solid ${workoutStarted ? T.alert + '55' : T.gold + '66'}`,
            background: workoutStarted ? `${T.alert}22` : `${T.gold}22`,
            color: workoutStarted ? T.alert : T.gold,
            fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 1,
          }}>
            {workoutStarted ? '⏹ ENCERRAR TREINO' : '▶ INICIAR TREINO'}
          </button>
        )}
      </div>

      {/* Aquecimento */}
      {warmup.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowWarmup(w => !w)} style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: `${T.treino}15`, border: `1px solid ${T.treino}33`,
            color: T.treino, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            {showWarmup ? '▲' : '▼'} Aquecimento ({warmup.length} exercícios)
          </button>
          {showWarmup && (
            <div style={{ background: '#1C2A1C', borderRadius: 10, padding: '12px', marginTop: 6 }}>
              {warmup.map((w, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < warmup.length - 1 ? `1px solid ${T.treino}11` : 'none' }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{w.exercicio}</div>
                  <div style={{ fontSize: 11, color: T.treino }}>{w.series}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>{w.obs}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exercícios */}
      {!day.sport ? (
        exercises.map((ex, i) => (
          <ExerciseCard key={i} ex={ex} uid={uid} workoutId={`${day.id}_${todayStr()}`} />
        ))
      ) : (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{day.emoji}</div>
          <div style={{ fontSize: 16, color: T.text, fontWeight: 700 }}>{day.label}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>{day.focus}</div>
          {day.sportInfo && Object.entries(day.sportInfo).map(([k, v]) => (
            <div key={k} style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
              <span style={{ color: T.gold }}>{k}: </span>{v}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

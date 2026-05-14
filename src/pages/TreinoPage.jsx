import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Play, Square, Timer } from 'lucide-react'
import useAppStore from '../stores/useAppStore'
import { SPLIT, EXERCISES, WARMUPS, T } from '../lib/constants'
import { supabase } from '../lib/supabaseClient'

const todayStr = () => new Date().toISOString().slice(0, 10)

// ── Timer de descanso ─────────────────────────────────────────────────────────
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
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', background: T.faint, borderRadius: 10, marginTop: 8,
    }}>
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke={T.border} strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={T.gold} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: T.gold, fontWeight: 700,
        }}>
          {left}
        </span>
      </div>
      <div style={{ flex: 1, fontSize: 12, color: T.muted }}>
        {running ? `Descanso: ${left}s restantes` : `Descanso: ${seconds}s`}
      </div>
      <button
        onClick={() => {
          if (running) { clearInterval(ref.current); setRunning(false); setLeft(seconds) }
          else { setLeft(seconds); setRunning(true) }
        }}
        style={{
          padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          background: running ? `${T.alert}22` : `${T.gold}22`,
          border: `1px solid ${running ? T.alert + '55' : T.gold + '55'}`,
          color: running ? T.alert : T.gold,
        }}
      >
        {running ? 'Parar' : 'Iniciar'}
      </button>
    </div>
  )
}

// ── Linha de série ────────────────────────────────────────────────────────────
function SetRow({ setNum, lastLog, onSave }) {
  const [weight, setWeight] = useState(lastLog?.weight ? String(lastLog.weight) : '')
  const [reps, setReps]     = useState(lastLog?.reps   ? String(lastLog.reps)   : '')
  const [done, setDone]     = useState(false)

  const handleDone = () => {
    if (!weight || !reps) return
    setDone(true)
    onSave({ set_num: setNum, weight: parseFloat(weight), reps: parseInt(reps) })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '24px 1fr 1fr 36px',
      alignItems: 'center',
      gap: 6,
      padding: '8px 0',
      borderBottom: `1px solid ${T.border}`,
    }}>
      <span style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>{setNum}</span>
      <input
        type="number"
        inputMode="decimal"
        placeholder={lastLog?.weight ? String(lastLog.weight) : 'kg'}
        value={weight}
        onChange={e => setWeight(e.target.value)}
        style={{
          width: '100%', padding: '9px 4px', borderRadius: 8,
          background: T.faint, border: `1px solid ${done ? T.ok + '44' : T.border}`,
          color: T.text, fontSize: 15, outline: 'none', textAlign: 'center',
          boxSizing: 'border-box',
        }}
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder={lastLog?.reps ? String(lastLog.reps) : 'reps'}
        value={reps}
        onChange={e => setReps(e.target.value)}
        style={{
          width: '100%', padding: '9px 4px', borderRadius: 8,
          background: T.faint, border: `1px solid ${done ? T.ok + '44' : T.border}`,
          color: T.text, fontSize: 15, outline: 'none', textAlign: 'center',
          boxSizing: 'border-box',
        }}
      />
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleDone}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: `1px solid ${done ? T.ok + '55' : T.border}`,
          background: done ? `${T.ok}22` : T.faint,
          color: done ? T.ok : T.muted,
          fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {done ? '✓' : '○'}
      </motion.button>
    </div>
  )
}

// ── Card de exercício ─────────────────────────────────────────────────────────
function ExerciseCard({ ex, uid, dayId }) {
  const [open, setOpen] = useState(false)
  const [lastLogs, setLastLogs] = useState([])
  const [showTimer, setShowTimer] = useState(false)
  const { addWorkoutLog } = useAppStore()

  useEffect(() => {
    if (open && uid) loadLastLogs()
  }, [open])

  const loadLastLogs = async () => {
    const { data } = await supabase
      .from('workout_logs').select('*')
      .eq('user_id', uid).eq('exercise_name', ex.name)
      .order('created_at', { ascending: false }).limit(ex.sets || 4)
    if (data) setLastLogs(data)
  }

  const saveSet = async (setData) => {
    await addWorkoutLog({
      exercise_name: ex.name,
      muscle_group: ex.muscle,
      day_id: dayId,
      workout_date: todayStr(),
      ...setData,
    })
    setShowTimer(true)
  }

  const isCardio = ex.name.includes('Cardio')
  if (isCardio) return (
    <div style={{
      background: T.card, border: `1px solid ${T.horm}22`,
      borderRadius: 14, padding: '14px', marginBottom: 10,
    }}>
      <div style={{ fontSize: 13, color: T.horm, fontWeight: 700 }}>🏃 {ex.name}</div>
      <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{ex.cue}</div>
    </div>
  )

  return (
    <motion.div
      layout
      style={{
        background: T.card, border: `1px solid ${open ? T.gold + '33' : T.border}`,
        borderRadius: 14, padding: '14px', marginBottom: 10,
        transition: 'border-color 0.2s',
      }}
    >
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>{ex.name}</span>
            <span style={{
              fontSize: 10, color: T.treino, background: `${T.treino}22`,
              padding: '2px 7px', borderRadius: 4,
            }}>
              {ex.muscle}
            </span>
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
        {open
          ? <ChevronUp size={18} color={T.muted} />
          : <ChevronDown size={18} color={T.muted} />
        }
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: 12 }}>
              {ex.cue && (
                <div style={{
                  fontSize: 11, color: T.muted, fontStyle: 'italic',
                  marginBottom: 10, lineHeight: 1.5,
                  borderLeft: `2px solid ${T.gold}44`, paddingLeft: 8,
                }}>
                  {ex.cue}
                </div>
              )}
              {ex.alt && (
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>
                  Alt: <span style={{ color: T.gold }}>{ex.alt}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, padding: '4px 0', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: T.muted, width: 20, textAlign: 'center' }}>Nº</span>
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
                <div style={{
                  marginTop: 10, padding: '8px 10px',
                  background: `${T.treino}11`, borderRadius: 8,
                  fontSize: 11, color: T.treino,
                }}>
                  💡 {ex.tecnica}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TreinoPage({ session }) {
  const uid = session.user.id
  const { activeWorkout, startWorkout, finishWorkout, syncWorkoutElapsed } = useAppStore()

  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const today = days[new Date().getDay()]
    const idx = SPLIT.findIndex(d => d.day === today)
    return idx >= 0 ? idx : 0
  })
  const [showWarmup, setShowWarmup] = useState(false)
  const timerRef = useRef()

  const day = SPLIT[selectedDay]
  const exercises = EXERCISES[day.id] || []
  const warmup = WARMUPS[day.id] || []
  const isActive = activeWorkout?.dayId === day.id

  // Timer que roda localmente e sincroniza a cada 30s
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        const elapsed = activeWorkout.elapsedS + 1
        useAppStore.setState(s => ({
          activeWorkout: { ...s.activeWorkout, elapsedS: s.activeWorkout.elapsedS + 1 }
        }))
      }, 1000)

      const syncInterval = setInterval(() => {
        const current = useAppStore.getState().activeWorkout
        if (current) syncWorkoutElapsed(current.elapsedS)
      }, 30000)

      return () => {
        clearInterval(timerRef.current)
        clearInterval(syncInterval)
      }
    } else {
      clearInterval(timerRef.current)
    }
  }, [isActive])

  const elapsed = activeWorkout?.elapsedS || 0
  const elapsedFmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const handleStart = async () => {
    await startWorkout(day.id)
  }

  const handleFinish = async () => {
    await syncWorkoutElapsed(elapsed)
    await finishWorkout()
  }

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          Treino
        </div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 2, letterSpacing: -0.5 }}>
          Workout Manager
        </div>
      </motion.div>

      {/* Seletor de dia */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {SPLIT.map((d, i) => (
          <motion.button
            key={d.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSelectedDay(i)}
            style={{
              flexShrink: 0, padding: '6px 12px', borderRadius: 20,
              background: selectedDay === i ? `${d.color}22` : T.faint,
              border: `1px solid ${selectedDay === i ? d.color + '66' : T.border}`,
              color: selectedDay === i ? d.color : T.muted,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {d.day} · {d.label}
          </motion.button>
        ))}
      </div>

      {/* Card do treino */}
      <div style={{
        background: T.card, border: `1px solid ${T.gold}33`,
        borderRadius: 16, padding: '16px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, color: T.text, fontWeight: 800, letterSpacing: -0.5 }}>{day.label}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{day.tag}</div>
          </div>
          <span style={{ fontSize: 36 }}>{day.emoji}</span>
        </div>

        {day.focus && (
          <div style={{
            fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 10,
            borderLeft: `2px solid ${T.gold}44`, paddingLeft: 10,
          }}>
            {day.focus}
          </div>
        )}

        {/* Timer */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: 14, textAlign: 'center' }}
          >
            <div style={{ fontSize: 36, fontWeight: 800, color: T.gold, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}>
              {elapsedFmt}
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>em andamento</div>
          </motion.div>
        )}

        {!day.sport && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={isActive ? handleFinish : handleStart}
            style={{
              width: '100%', marginTop: 14, padding: '14px', borderRadius: 12,
              border: `1px solid ${isActive ? T.alert + '55' : T.gold + '66'}`,
              background: isActive ? `${T.alert}22` : `${T.gold}22`,
              color: isActive ? T.alert : T.gold,
              fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 1,
            }}
          >
            {isActive ? '⏹ ENCERRAR TREINO' : '▶ INICIAR TREINO'}
          </motion.button>
        )}
      </div>

      {/* Aquecimento */}
      {warmup.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowWarmup(w => !w)}
            style={{
              width: '100%', padding: '10px', borderRadius: 10,
              background: `${T.treino}15`, border: `1px solid ${T.treino}33`,
              color: T.treino, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {showWarmup ? '▲' : '▼'} Aquecimento ({warmup.length} exercícios)
          </button>
          <AnimatePresence>
            {showWarmup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  overflow: 'hidden', background: `${T.treino}08`,
                  borderRadius: 10, marginTop: 6,
                }}
              >
                <div style={{ padding: '12px' }}>
                  {warmup.map((w, i) => (
                    <div key={i} style={{
                      marginBottom: 10, paddingBottom: 10,
                      borderBottom: i < warmup.length - 1 ? `1px solid ${T.treino}11` : 'none',
                    }}>
                      <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{w.exercicio}</div>
                      <div style={{ fontSize: 11, color: T.treino, marginTop: 2 }}>{w.series}</div>
                      <div style={{ fontSize: 11, color: T.muted, fontStyle: 'italic', marginTop: 2 }}>{w.obs}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Exercícios ou card de esporte */}
      {!day.sport ? (
        exercises.map((ex, i) => (
          <ExerciseCard key={i} ex={ex} uid={uid} dayId={day.id} />
        ))
      ) : (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{day.emoji}</div>
          <div style={{ fontSize: 18, color: T.text, fontWeight: 700 }}>{day.label}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>{day.focus}</div>
          {day.sportInfo && (
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              {Object.entries(day.sportInfo).map(([k, v]) => (
                <div key={k} style={{
                  fontSize: 12, color: T.muted, marginTop: 8,
                  padding: '8px 12px', background: T.faint, borderRadius: 8,
                }}>
                  <span style={{ color: T.gold, fontWeight: 700 }}>{k}: </span>{v}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

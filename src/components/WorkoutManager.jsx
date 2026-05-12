// WorkoutManager.jsx
// Atlas Fitness — Gerenciador completo de treinos
// Uso: <WorkoutManager />
// Deps: @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities (instalar — ver guia)

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SPLIT, EXERCISES, WARMUPS, TECNICAS, T } from '../lib/constants'

// ─── helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function initState() {
  // Converte SPLIT + EXERCISES em estado mutável local
  return SPLIT.map(day => ({
    ...deepClone(day),
    exercises: deepClone(EXERCISES[day.id] || []).map(ex => ({ ...ex, _id: uid() })),
    warmup: deepClone(WARMUPS[day.id] || []),
  }))
}

// ─── modal de confirmação de troca ───────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirmOne, onConfirmAll, exerciseName }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 28, maxWidth: 420, width: '90%',
        }}
      >
        <div style={{ fontSize: 15, color: T.text, fontWeight: 700, marginBottom: 8 }}>
          Alterar exercício
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 22, lineHeight: 1.6 }}>
          Você alterou <strong style={{ color: T.gold }}>{exerciseName}</strong>.<br />
          Deseja aplicar a mudança:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onConfirmOne} style={btnStyle(T.gold)}>
            Apenas neste dia
          </button>
          <button onClick={onConfirmAll} style={btnStyle('#85A8C8')}>
            Em todos os treinos relacionados
          </button>
          <button onClick={onClose} style={btnStyle(T.muted, true)}>
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function btnStyle(color, ghost = false) {
  return {
    padding: '11px 20px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13,
    border: `1px solid ${color}55`,
    background: ghost ? 'transparent' : `${color}22`,
    color: ghost ? T.muted : color,
    textAlign: 'left',
    transition: 'background 0.2s',
  }
}

// ─── modal de edição de exercício ─────────────────────────────────────────────
function EditExerciseModal({ open, exercise, onSave, onClose }) {
  const [form, setForm] = useState(exercise ? deepClone(exercise) : {})

  if (!open || !exercise) return null

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflowY: 'auto',
    }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 28, width: '95%', maxWidth: 520,
          margin: '20px auto',
        }}
      >
        <div style={{ fontSize: 15, color: T.gold, fontWeight: 700, marginBottom: 20 }}>
          ✏️ Editar Exercício
        </div>

        {[
          { label: 'Nome', key: 'name', type: 'text' },
          { label: 'Alternativa', key: 'alt', type: 'text' },
          { label: 'Grupo Muscular', key: 'muscle', type: 'text' },
          { label: 'Séries', key: 'sets', type: 'number' },
          { label: 'Repetições', key: 'reps', type: 'text' },
          { label: 'Descanso (segundos)', key: 'rest', type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>
              {label}
            </label>
            <input
              type={type}
              value={form[key] ?? ''}
              onChange={e => f(key, type === 'number' ? Number(e.target.value) : e.target.value)}
              style={inputStyle}
            />
          </div>
        ))}

        {[
          { label: 'Dica Técnica (cue)', key: 'cue' },
          { label: 'Técnica / RIR', key: 'tecnica' },
        ].map(({ label, key }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>
              {label}
            </label>
            <textarea
              value={form[key] ?? ''}
              onChange={e => f(key, e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }}
            />
          </div>
        ))}

        {/* Tags rápidas de técnica */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Técnicas rápidas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.keys(TECNICAS).map(tec => (
              <button
                key={tec}
                onClick={() => f('tecnica', tec)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  background: form.tecnica === tec ? `${T.gold}33` : T.faint,
                  border: `1px solid ${form.tecnica === tec ? T.gold : T.border}`,
                  color: form.tecnica === tec ? T.gold : T.muted,
                }}
              >
                {tec}
              </button>
            ))}
          </div>
          {form.tecnica && TECNICAS[form.tecnica] && (
            <div style={{ fontSize: 11, color: T.muted, marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
              {TECNICAS[form.tecnica]}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onSave(form)} style={btnStyle(T.gold)}>
            Salvar alterações
          </button>
          <button onClick={onClose} style={btnStyle(T.muted, true)}>
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  background: T.faint, border: `1px solid ${T.border}`,
  color: T.text, fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
}

// ─── item de exercício arrastável ─────────────────────────────────────────────
function SortableExercise({ ex, onEdit, onDuplicate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex._id })

  const isCardio = ex.name.includes('Cardio')
  const restFmt  = ex.rest >= 60 ? `${Math.floor(ex.rest / 60)}min${ex.rest % 60 ? ` ${ex.rest % 60}s` : ''}` : ex.rest > 0 ? `${ex.rest}s` : '—'

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: isCardio ? `${T.horm}11` : T.faint,
        border: `1px solid ${isCardio ? T.horm + '33' : T.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', color: T.muted, fontSize: 14, userSelect: 'none', lineHeight: 1 }}
        title="Arrastar para reordenar"
      >
        ⠿
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{ex.name}</span>
          <span style={{
            fontSize: 10, color: isCardio ? T.horm : T.treino,
            background: isCardio ? `${T.horm}22` : `${T.treino}22`,
            padding: '2px 7px', borderRadius: 4, fontWeight: 600,
          }}>
            {ex.muscle}
          </span>
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
          {!isCardio && <>{ex.sets} séries · {ex.reps} reps · ⏱ {restFmt}</>}
          {ex.tecnica && <span style={{ color: T.treino + 'cc', marginLeft: 6 }}>· {ex.tecnica.split('.')[0]}</span>}
        </div>
        {ex.alt && (
          <div style={{ fontSize: 10, color: T.muted, marginTop: 2, fontStyle: 'italic' }}>
            Alt: {ex.alt}
          </div>
        )}
      </div>

      {/* Ações */}
      {!isCardio && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <IconBtn title="Editar" onClick={() => onEdit(ex)} color={T.gold}>✏️</IconBtn>
          <IconBtn title="Duplicar" onClick={() => onDuplicate(ex)} color={T.treino}>⧉</IconBtn>
          <IconBtn title="Remover" onClick={() => onDelete(ex._id)} color={T.alert}>✕</IconBtn>
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, onClick, title, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6, border: `1px solid ${color}44`,
        background: `${color}11`, color, fontSize: 12, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

// ─── painel de um dia ─────────────────────────────────────────────────────────
function DayPanel({ day, dayData, onUpdateExercises, onAddExercise, onDeleteDay, onDuplicateDay }) {
  const [open, setOpen]         = useState(false)
  const [editEx, setEditEx]     = useState(null)
  const [confirmEx, setConfirmEx] = useState(null)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [showWarmup, setShowWarmup] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = dayData.exercises.findIndex(e => e._id === active.id)
    const newIdx = dayData.exercises.findIndex(e => e._id === over.id)
    onUpdateExercises(day.id, arrayMove(dayData.exercises, oldIdx, newIdx))
  }

  const handleSaveEdit = (updated) => {
    setEditEx(null)
    setPendingEdit(updated)
    setConfirmEx(updated.name)
  }

  const applyEdit = (applyAll) => {
    if (!pendingEdit) return
    const updated = dayData.exercises.map(e => e._id === pendingEdit._id ? pendingEdit : e)
    onUpdateExercises(day.id, updated, applyAll ? pendingEdit : null)
    setConfirmEx(null)
    setPendingEdit(null)
  }

  const handleDuplicate = (ex) => {
    const copy = { ...deepClone(ex), _id: uid(), name: ex.name + ' (cópia)' }
    const idx  = dayData.exercises.findIndex(e => e._id === ex._id)
    const arr  = [...dayData.exercises]
    arr.splice(idx + 1, 0, copy)
    onUpdateExercises(day.id, arr)
  }

  const handleDelete = (exId) => {
    onUpdateExercises(day.id, dayData.exercises.filter(e => e._id !== exId))
  }

  const isSport = !!day.sport
  const headerColor = isSport ? T.muted : day.color

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header do dia */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', cursor: 'pointer',
          borderBottom: open ? `1px solid ${T.border}` : 'none',
        }}
      >
        <span style={{ fontSize: 22 }}>{day.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              textTransform: 'uppercase', color: headerColor,
            }}>
              {day.day}
            </span>
            <span style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>{day.label}</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{day.tag}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {!isSport && (
            <>
              <IconBtn title="Duplicar dia" onClick={e => { e.stopPropagation(); onDuplicateDay(day.id) }} color={T.treino}>⧉</IconBtn>
              <IconBtn title="Excluir dia" onClick={e => { e.stopPropagation(); onDeleteDay(day.id) }} color={T.alert}>✕</IconBtn>
            </>
          )}
          <span style={{ color: T.muted, fontSize: 12, marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Conteúdo expandido */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 18px' }}>

              {/* Foco do dia */}
              {day.focus && (
                <div style={{
                  background: T.faint, borderRadius: 8, padding: '8px 12px',
                  borderLeft: `3px solid ${headerColor}66`, marginBottom: 14,
                }}>
                  <div style={{ fontSize: 10, color: headerColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Foco</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{day.focus}</div>
                </div>
              )}

              {/* Sport info */}
              {isSport && day.sportInfo && (
                <div style={{ marginBottom: 14 }}>
                  {Object.entries(day.sportInfo).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>
                      <span style={{ color: T.gold, textTransform: 'capitalize' }}>{k}: </span>{v}
                    </div>
                  ))}
                </div>
              )}

              {/* Aquecimento toggle */}
              {dayData.warmup?.length > 0 && (
                <button
                  onClick={() => setShowWarmup(w => !w)}
                  style={{
                    marginBottom: 12, padding: '6px 14px', borderRadius: 7,
                    background: `${T.treino}15`, border: `1px solid ${T.treino}33`,
                    color: T.treino, fontSize: 11, cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {showWarmup ? '▲ Ocultar' : '▼ Ver'} Aquecimento ({dayData.warmup.length} exercícios)
                </button>
              )}

              <AnimatePresence>
                {showWarmup && dayData.warmup?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ marginBottom: 14, overflow: 'hidden' }}
                  >
                    <div style={{
                      background: '#1C2A1C', border: `1px solid ${T.treino}22`,
                      borderRadius: 10, padding: '10px 14px',
                    }}>
                      <div style={{ fontSize: 10, color: T.treino, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                        Aquecimento específico — não conta séries
                      </div>
                      {dayData.warmup.map((w, i) => (
                        <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < dayData.warmup.length - 1 ? `1px solid ${T.treino}11` : 'none' }}>
                          <div style={{ fontSize: 12, color: T.text }}>{w.exercicio}</div>
                          <div style={{ fontSize: 11, color: T.treino }}>{w.series}</div>
                          <div style={{ fontSize: 11, color: T.muted, fontStyle: 'italic' }}>{w.obs}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exercícios */}
              {!isSport && (
                <>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={dayData.exercises.map(e => e._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {dayData.exercises.map(ex => (
                        <SortableExercise
                          key={ex._id}
                          ex={ex}
                          onEdit={e => setEditEx(e)}
                          onDuplicate={handleDuplicate}
                          onDelete={handleDelete}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* Cardio info */}
                  {day.cardio && (
                    <div style={{
                      marginTop: 6, padding: '8px 12px', borderRadius: 8,
                      background: `${T.horm}11`, border: `1px solid ${T.horm}22`,
                      fontSize: 11, color: T.horm,
                    }}>
                      🏃 {day.cardio}
                    </div>
                  )}

                  {/* Adicionar exercício */}
                  <button
                    onClick={() => onAddExercise(day.id)}
                    style={{
                      marginTop: 12, width: '100%', padding: '10px',
                      borderRadius: 9, border: `1px dashed ${T.border}`,
                      background: 'transparent', color: T.muted,
                      fontSize: 12, cursor: 'pointer',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                  >
                    + Adicionar exercício
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modais */}
      <EditExerciseModal
        open={!!editEx}
        exercise={editEx}
        onSave={handleSaveEdit}
        onClose={() => setEditEx(null)}
      />
      <ConfirmModal
        open={!!confirmEx}
        exerciseName={confirmEx}
        onClose={() => { setConfirmEx(null); setPendingEdit(null) }}
        onConfirmOne={() => applyEdit(false)}
        onConfirmAll={() => applyEdit(true)}
      />
    </div>
  )
}

// ─── componente principal ────────────────────────────────────────────────────
export default function WorkoutManager() {
  const [days, setDays]         = useState(initState)
  const [hasChanges, setHasChanges] = useState(false)

  const handleUpdateExercises = useCallback((dayId, newExercises, globalEdit = null) => {
    setDays(prev => prev.map(d => {
      if (globalEdit) {
        // Aplica em todos os dias que contêm exercício com mesmo nome
        return {
          ...d,
          exercises: d.exercises.map(e =>
            e.name === globalEdit.name ? { ...globalEdit, _id: e._id } : e
          ),
        }
      }
      return d.id === dayId ? { ...d, exercises: newExercises } : d
    }))
    setHasChanges(true)
  }, [])

  const handleAddExercise = useCallback((dayId) => {
    const newEx = {
      _id: uid(),
      name: 'Novo Exercício',
      alt: '',
      sets: 3, reps: '10–12', rest: 90,
      muscle: '',
      cue: '',
      tecnica: 'RIR 1–2',
      warmup: false,
    }
    setDays(prev => prev.map(d =>
      d.id === dayId
        ? { ...d, exercises: [...d.exercises.filter(e => !e.name.includes('Cardio')), newEx, ...d.exercises.filter(e => e.name.includes('Cardio'))] }
        : d
    ))
    setHasChanges(true)
  }, [])

  const handleDeleteDay = useCallback((dayId) => {
    if (!window.confirm('Excluir este dia de treino?')) return
    setDays(prev => prev.filter(d => d.id !== dayId))
    setHasChanges(true)
  }, [])

  const handleDuplicateDay = useCallback((dayId) => {
    const original = days.find(d => d.id === dayId)
    if (!original) return
    const copy = {
      ...deepClone(original),
      id: uid(),
      label: original.label + ' (cópia)',
      day: '—',
      exercises: original.exercises.map(e => ({ ...e, _id: uid() })),
    }
    setDays(prev => {
      const idx = prev.findIndex(d => d.id === dayId)
      const arr = [...prev]
      arr.splice(idx + 1, 0, copy)
      return arr
    })
    setHasChanges(true)
  }, [days])

  const handleSave = () => {
    // Aqui: substituir pelo save no Supabase quando migrar
    // Por ora salva em localStorage como backup local
    localStorage.setItem('atlas_workout_v2', JSON.stringify(days))
    setHasChanges(false)
    alert('Treino salvo localmente. Para persistir no Supabase, integre com a tabela "workouts".')
  }

  const handleReset = () => {
    if (!window.confirm('Restaurar treino original? Todas as alterações serão perdidas.')) return
    setDays(initState())
    setHasChanges(false)
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 4px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, color: T.text, fontWeight: 700 }}>Workout Manager</div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {days.length} dias · Arraste para reordenar exercícios
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasChanges && (
            <>
              <button onClick={handleReset} style={btnStyle(T.muted, true)}>
                Restaurar
              </button>
              <button onClick={handleSave} style={btnStyle(T.gold)}>
                💾 Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Legenda de técnicas */}
      <div style={{
        background: T.faint, borderRadius: 10, padding: '12px 16px',
        marginBottom: 16, border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
          Técnicas de intensidade
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(TECNICAS).map(([k, v]) => (
            <div key={k} style={{ position: 'relative' }}>
              <div
                title={v}
                style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'help',
                  background: `${T.treino}15`, border: `1px solid ${T.treino}33`, color: T.treino,
                }}
              >
                {k}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dias */}
      {days.map(d => (
        <DayPanel
          key={d.id}
          day={d}
          dayData={d}
          onUpdateExercises={handleUpdateExercises}
          onAddExercise={handleAddExercise}
          onDeleteDay={handleDeleteDay}
          onDuplicateDay={handleDuplicateDay}
        />
      ))}

      {/* Adicionar novo dia */}
      <button
        onClick={() => {
          const label = window.prompt('Nome do novo dia de treino:')
          if (!label) return
          setDays(prev => [...prev, {
            id: uid(), label, tag: '', color: T.gold, emoji: '🏋️', day: '—',
            focus: '', cardio: null, sport: null,
            exercises: [], warmup: [],
          }])
          setHasChanges(true)
        }}
        style={{
          width: '100%', padding: '12px',
          borderRadius: 10, border: `1px dashed ${T.gold}44`,
          background: `${T.gold}08`, color: T.gold,
          fontSize: 13, cursor: 'pointer', marginTop: 4,
        }}
      >
        + Criar novo dia de treino
      </button>
    </div>
  )
}

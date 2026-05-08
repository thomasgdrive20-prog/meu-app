import { useState, useEffect, useCallback, useRef } from 'react'
import { dbSelect, dbInsert, dbUpdate, dbDelete, dbSelectMany } from './supabaseClient'
import { PROTOCOL_COMPOUNDS, USER_PROFILE, NUTRITION_GOALS } from './constants'

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const SEED_METRIC = {
  id: 'seed_01',
  date: '02/05/2026',
  weight: '91.5',
  bf: '20',
  waist: '',
  armL: '',
  armR: '',
  chest: '',
  notes: 'Estimativa inicial.',
  created_at: '2026-05-02T00:00:00Z',
}

/**
 * Hook central de dados do Atlas.
 * Encapsula: boot, estado, CRUD genérico, e todos os helpers específicos.
 *
 * Uso no App.jsx:
 *   const { data, actions, ui } = useAppData()
 */
export function useAppData() {
  // ── Status da UI ───────────────────────────────────────────────────────────
  const [syncMsg,  setSyncMsg]  = useState('Carregando...')
  const [loading,  setLoading]  = useState(true)
  const [confirm,  setConfirm]  = useState(null)

  // ── Dados dinâmicos ────────────────────────────────────────────────────────
  const [workout,    setWorkout]    = useState([])
  const [metrics,    setMetrics]    = useState([])
  const [mealLog,    setMealLog]    = useState([])
  const [labLog,     setLabLog]     = useState([])
  const [aplicacoes, setAplicacoes] = useState([])
  const [dietaLogs,  setDietaLogs]  = useState([])
  const [photos,     setPhotos]     = useState([])
  const [suplLogs,   setSuplLogs]   = useState([])

  // ── Dados de configuração ─────────────────────────────────────────────────
  const [compounds, setCompounds] = useState(PROTOCOL_COMPOUNDS)

  // ── Flash message ─────────────────────────────────────────────────────────
  const flashTimer = useRef(null)
  const flash = useCallback((msg = '✓ Salvo') => {
    setSyncMsg(msg)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setSyncMsg(''), 2500)
  }, [])

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const TABLES = [
      'workout_logs', 'body_metrics', 'meal_logs', 'exames',
      'aplicacoes', 'dieta_logs', 'photos', 'supl_logs',
    ]

    dbSelectMany(TABLES).then(result => {
      setWorkout(result.workout_logs)
      setMetrics(
        result.body_metrics.length > 0
          ? result.body_metrics
          : [SEED_METRIC]
      )
      setMealLog(result.meal_logs)
      setLabLog(result.exames)
      setAplicacoes(result.aplicacoes)
      setDietaLogs(result.dieta_logs)
      setPhotos(result.photos)
      setSuplLogs(result.supl_logs)
      flash('✓ Conectado')
      setLoading(false)
    }).catch(() => {
      setSyncMsg('⚠ Erro ao carregar')
      setLoading(false)
    })
  }, [])

  // ── CRUD genérico ─────────────────────────────────────────────────────────
  const add = useCallback(async (table, setter, data) => {
    const row = { ...data, id: data.id || genId() }
    setter(prev => [row, ...prev]) // optimistic
    const saved = await dbInsert(table, row)
    if (saved) setter(prev => prev.map(x => x.id === row.id ? saved : x))
    else flash('⚠ Erro ao salvar') // rollback não necessário — dado já existe localmente
    flash()
  }, [flash])

  const edit = useCallback(async (table, setter, id, data) => {
    setter(prev => prev.map(x => x.id === id ? { ...x, ...data } : x))
    await dbUpdate(table, id, data)
    flash()
  }, [flash])

  const remove = useCallback((table, setter, id, label = 'este item') => {
    setConfirm({
      message: `Deletar "${label}"?\nEsta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirm(null)
        setter(prev => prev.filter(x => x.id !== id))
        await dbDelete(table, id)
        flash('🗑 Deletado')
      },
    })
  }, [flash])

  // ── Actions específicas ───────────────────────────────────────────────────
  const today = () => new Date().toISOString().slice(0, 10)

  const actions = {
    // Treino
    addWorkout:    d      => add('workout_logs', setWorkout,    d),
    editWorkout:   (id,d) => edit('workout_logs', setWorkout,   id, d),
    removeWorkout: (id,l) => remove('workout_logs', setWorkout, id, l),

    // Métricas corporais
    addMetric:    d      => add('body_metrics', setMetrics,    d),
    editMetric:   (id,d) => edit('body_metrics', setMetrics,   id, d),
    removeMetric: (id,l) => remove('body_metrics', setMetrics, id, l),

    // Refeições livres
    addMeal:    d      => add('meal_logs', setMealLog,    d),
    removeMeal: (id,l) => remove('meal_logs', setMealLog, id, l),

    // Exames
    addLab:    d      => add('exames', setLabLog,    d),
    removeLab: (id,l) => remove('exames', setLabLog, id, l),

    // Aplicações hormonais
    addAplicacao:    d      => add('aplicacoes', setAplicacoes,    d),
    removeAplicacao: (id,l) => remove('aplicacoes', setAplicacoes, id, l),

    // Log de dieta (refeições planejadas)
    addDietaLog: d => add('dieta_logs', setDietaLogs, d),

    // Fotos
    addPhoto:    d  => add('photos', setPhotos,    d),
    removePhoto: id => remove('photos', setPhotos, id, 'foto'),

    // Suplementos (toggle — sem confirm)
    toggleSupl: async (suplId) => {
      const t = today()
      const existing = suplLogs.find(s => s.supl_id === suplId && s.date === t)
      if (existing) {
        setSuplLogs(prev => prev.filter(s => s.id !== existing.id))
        await dbDelete('supl_logs', existing.id)
      } else {
        const item = { id: genId(), supl_id: suplId, date: t }
        setSuplLogs(prev => [item, ...prev])
        await dbInsert('supl_logs', item)
      }
    },

    // Compostos do protocolo (local — não vai para banco ainda)
    saveCompounds: (d) => { setCompounds(d); flash() },
  }

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isSuplDone = useCallback((id) => {
    const t = today()
    return suplLogs.some(s => s.supl_id === id && s.date === t)
  }, [suplLogs])

  // ── Estado agrupado para passar ao App ────────────────────────────────────
  const data = {
    workout, metrics, mealLog, labLog,
    aplicacoes, dietaLogs, photos, suplLogs,
    compounds,
    profile:   USER_PROFILE,
    nutrition: NUTRITION_GOALS,
  }

  const ui = {
    syncMsg, loading, confirm,
    setConfirm,
    isSuplDone,
  }

  return { data, actions, ui }
}

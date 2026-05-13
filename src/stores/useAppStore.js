import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  supabase, dbGet, dbGetToday, dbUpsertToday,
  dbToggleDayLog, dbInsert, dbUpdate, dbDelete,
  dbGetOne, dbLoadMany, todayDate,
} from '../lib/supabaseClient'

const useAppStore = create(
  persist(
    (set, get) => ({

      userId: null,
      setUserId: (id) => set({ userId: id }),

      syncMsg: '',
      setSyncMsg: (msg) => {
        set({ syncMsg: msg })
        if (msg) setTimeout(() => set({ syncMsg: '' }), 2500)
      },

      loading: true,
      setLoading: (v) => set({ loading: v }),

      confirm: null,
      setConfirm: (v) => set({ confirm: v }),

      // ÁGUA
      water: 0,
      waterDate: '',

      setWater: async (amount) => {
        const uid = get().userId
        const today = todayDate()
        if (get().waterDate !== today) set({ water: 0, waterDate: today })
        set({ water: amount })
        if (uid) await dbUpsertToday('water_logs', uid, { amount_l: amount })
      },

      loadWater: async () => {
        const uid = get().userId
        const today = todayDate()
        if (!uid) return
        const row = await dbGetOne('water_logs', uid, { date: today })
        if (row) set({ water: parseFloat(row.amount_l) || 0, waterDate: today })
        else if (get().waterDate !== today) set({ water: 0, waterDate: today })
      },

      // TREINO ATIVO
      activeWorkout: null,

      startWorkout: async (dayId) => {
        const uid = get().userId
        const workout = {
          dayId,
          startedAt: new Date().toISOString(),
          elapsedS: 0,
          setsDone: [],
        }
        set({ activeWorkout: workout })
        if (uid) {
          await supabase.from('active_workout').upsert({
            user_id: uid,
            day_id: dayId,
            started_at: workout.startedAt,
            elapsed_s: 0,
            sets_done: [],
          }, { onConflict: 'user_id' })
        }
      },

      finishWorkout: async () => {
        const uid = get().userId
        set({ activeWorkout: null })
        if (uid) await supabase.from('active_workout').delete().eq('user_id', uid)
      },

      syncWorkoutElapsed: async (elapsedS) => {
        const uid = get().userId
        const aw = get().activeWorkout
        if (!aw) return
        set({ activeWorkout: { ...aw, elapsedS } })
        if (uid) {
          await supabase.from('active_workout')
            .update({ elapsed_s: elapsedS, updated_at: new Date().toISOString() })
            .eq('user_id', uid)
        }
      },

      loadActiveWorkout: async () => {
        const uid = get().userId
        if (!uid) return
        const { data } = await supabase
          .from('active_workout').select('*').eq('user_id', uid).maybeSingle()
        if (data) {
          const startedAt = new Date(data.started_at)
          const diffH = (Date.now() - startedAt.getTime()) / 1000 / 3600
          if (diffH > 2) {
            await supabase.from('active_workout').delete().eq('user_id', uid)
            set({ activeWorkout: null })
          } else {
            const elapsed = data.elapsed_s + Math.floor((Date.now() - startedAt.getTime()) / 1000)
            set({
              activeWorkout: {
                dayId: data.day_id,
                startedAt: data.started_at,
                elapsedS: elapsed,
                setsDone: data.sets_done || [],
              },
            })
          }
        }
      },

      // SUPLEMENTOS
      suplDone: [],
      suplDate: '',

      loadSupls: async () => {
        const uid = get().userId
        const today = todayDate()
        if (!uid) return
        const rows = await dbGetToday('supl_logs', uid)
        set({ suplDone: rows.map(r => r.supl_id), suplDate: today })
      },

      toggleSupl: async (suplId) => {
        const uid = get().userId
        const today = todayDate()
        const current = get().suplDone
        const isOn = current.includes(suplId)
        set({ suplDone: isOn ? current.filter(x => x !== suplId) : [...current, suplId] })
        if (uid) {
          if (isOn) {
            await supabase.from('supl_logs')
              .delete().eq('user_id', uid).eq('supl_id', suplId).eq('date', today)
          } else {
            await supabase.from('supl_logs')
              .insert({ user_id: uid, supl_id: suplId, date: today })
          }
        }
        get().setSyncMsg(isOn ? '○ Desmarcado' : '✓ Registrado')
      },

      // REFEIÇÕES
      mealDone: [],
      mealDate: '',

      loadMeals: async () => {
        const uid = get().userId
        const today = todayDate()
        if (!uid) return
        const rows = await dbGetToday('meal_logs_v2', uid)
        set({ mealDone: rows.map(r => r.meal_id), mealDate: today })
      },

      toggleMeal: async (mealId) => {
        const uid = get().userId
        const today = todayDate()
        const current = get().mealDone
        const isOn = current.includes(mealId)
        set({ mealDone: isOn ? current.filter(x => x !== mealId) : [...current, mealId] })
        if (uid) {
          if (isOn) {
            await supabase.from('meal_logs_v2')
              .delete().eq('user_id', uid).eq('meal_id', mealId).eq('date', today)
          } else {
            await supabase.from('meal_logs_v2')
              .insert({ user_id: uid, meal_id: mealId, date: today })
          }
        }
        get().setSyncMsg('✓ Salvo')
      },

      // PESO MATINAL
      weights: [],

      loadWeights: async () => {
        const uid = get().userId
        if (!uid) return
        const { data } = await supabase
          .from('morning_weights').select('*').eq('user_id', uid)
          .order('date', { ascending: false }).limit(30)
        if (data) set({ weights: data })
      },

      addWeight: async (weightKg, notes = '') => {
        const uid = get().userId
        if (!uid) return
        const today = todayDate()
        const { data, error } = await supabase
          .from('morning_weights')
          .upsert({ user_id: uid, weight: weightKg, date: today, notes }, { onConflict: 'user_id,date' })
          .select().single()
        if (!error && data) {
          set(state => ({ weights: [data, ...state.weights.filter(w => w.date !== today)] }))
          get().setSyncMsg('✓ Peso salvo')
        }
      },

      deleteWeight: async (id) => {
        const uid = get().userId
        if (!uid) return
        await supabase.from('morning_weights').delete().eq('id', id)
        set(state => ({ weights: state.weights.filter(w => w.id !== id) }))
        get().setSyncMsg('🗑 Removido')
      },

      // MEDIDAS CORPORAIS
      metrics: [],

      loadMetrics: async () => {
        const uid = get().userId
        if (!uid) return
        const { data } = await supabase
          .from('body_metrics').select('*').eq('user_id', uid)
          .order('date', { ascending: false })
        if (data) set({ metrics: data })
      },

      addMetric: async (row) => {
        const uid = get().userId
        if (!uid) return
        const { data, error } = await supabase
          .from('body_metrics').insert({ user_id: uid, ...row }).select().single()
        if (!error && data) {
          set(state => ({ metrics: [data, ...state.metrics] }))
          get().setSyncMsg('✓ Medidas salvas')
        }
      },

      updateMetric: async (id, patch) => {
        await dbUpdate('body_metrics', id, patch)
        set(state => ({ metrics: state.metrics.map(m => m.id === id ? { ...m, ...patch } : m) }))
        get().setSyncMsg('✓ Atualizado')
      },

      deleteMetric: async (id) => {
        await dbDelete('body_metrics', id)
        set(state => ({ metrics: state.metrics.filter(m => m.id !== id) }))
        get().setSyncMsg('🗑 Removido')
      },

      // SAÚDE
      healthLogs: [],
      exams: [],

      loadHealth: async () => {
        const uid = get().userId
        if (!uid) return
        const [hlogs, exams] = await Promise.all([
          supabase.from('health_logs').select('*').eq('user_id', uid)
            .order('date', { ascending: false }).limit(30),
          supabase.from('exames_v2').select('*').eq('user_id', uid)
            .order('created_at', { ascending: false }),
        ])
        if (hlogs.data) set({ healthLogs: hlogs.data })
        if (exams.data) set({ exams: exams.data })
      },

      saveHealthLog: async (form) => {
        const uid = get().userId
        const today = todayDate()
        const { data } = await supabase
          .from('health_logs')
          .upsert({ user_id: uid, date: today, ...form }, { onConflict: 'user_id,date' })
          .select().single()
        if (data) {
          set(state => ({ healthLogs: [data, ...state.healthLogs.filter(h => h.date !== today)] }))
          get().setSyncMsg('✓ Biofeedback salvo')
        }
      },

      addExam: async (exam) => {
        const uid = get().userId
        const { data } = await supabase
          .from('exames_v2').insert({ user_id: uid, ...exam }).select().single()
        if (data) set(state => ({ exams: [data, ...state.exams] }))
        get().setSyncMsg('✓ Exame salvo')
      },

      deleteExam: async (id) => {
        await dbDelete('exames_v2', id)
        set(state => ({ exams: state.exams.filter(e => e.id !== id) }))
      },

      // WORKOUT LOGS
      workoutLogs: [],

      loadWorkoutLogs: async () => {
        const uid = get().userId
        if (!uid) return
        const { data } = await supabase
          .from('workout_logs').select('*').eq('user_id', uid)
          .order('created_at', { ascending: false }).limit(200)
        if (data) set({ workoutLogs: data })
      },

      addWorkoutLog: async (row) => {
        const uid = get().userId
        const { data } = await supabase
          .from('workout_logs').insert({ user_id: uid, ...row }).select().single()
        if (data) set(state => ({ workoutLogs: [data, ...state.workoutLogs] }))
        return data
      },

      // BOOT
      boot: async (userId) => {
        set({ userId, loading: true })
        await Promise.all([
          get().loadWater(),
          get().loadSupls(),
          get().loadMeals(),
          get().loadWeights(),
          get().loadMetrics(),
          get().loadHealth(),
          get().loadWorkoutLogs(),
          get().loadActiveWorkout(),
        ])
        set({ loading: false })
        get().setSyncMsg('✓ Sincronizado')
      },

      reset: () => set({
        userId: null, water: 0, waterDate: '',
        activeWorkout: null, suplDone: [], mealDone: [],
        weights: [], metrics: [], healthLogs: [], exams: [], workoutLogs: [],
        loading: true,
      }),
    }),

    {
      name: 'atlas-store-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        water: state.water,
        waterDate: state.waterDate,
        activeWorkout: state.activeWorkout,
        suplDone: state.suplDone,
        suplDate: state.suplDate,
        mealDone: state.mealDone,
        mealDate: state.mealDate,
      }),
    }
  )
)

export default useAppStore
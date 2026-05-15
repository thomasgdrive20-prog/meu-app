import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase, todayDate, dbUpdate, dbDelete } from '../lib/supabaseClient'

const useAppStore = create(
  persist(
    (set, get) => ({

      userId: null,

      syncMsg: '',
      setSyncMsg: (msg) => {
        set({ syncMsg: msg })
        if (msg) setTimeout(() => set({ syncMsg: '' }), 2500)
      },

      loading: true,

      // ÁGUA
      water: 0,
      waterDate: '',

      setWater: async (amount) => {
        const uid = get().userId
        const today = todayDate()
        set({ water: amount, waterDate: today })
        if (!uid) return
        await supabase.from('water_logs').upsert(
          { user_id: uid, date: today, amount_l: amount, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,date' }
        )
        get().setSyncMsg(amount === 0 ? '○ Água zerada' : `✓ ${amount}L registrado`)
      },

      loadWater: async () => {
        const uid = get().userId
        if (!uid) return
        const today = todayDate()
        const { data } = await supabase
          .from('water_logs').select('amount_l')
          .eq('user_id', uid).eq('date', today).maybeSingle()
        set({ water: data ? parseFloat(data.amount_l) || 0 : 0, waterDate: today })
      },

      // TREINO ATIVO
      activeWorkout: null,

      startWorkout: async (dayId) => {
        const uid = get().userId
        const workout = { dayId, startedAt: new Date().toISOString(), elapsedS: 0 }
        set({ activeWorkout: workout })
        if (!uid) return
        await supabase.from('active_workout').upsert(
          { user_id: uid, day_id: dayId, started_at: workout.startedAt, elapsed_s: 0, sets_done: [] },
          { onConflict: 'user_id' }
        )
      },

      finishWorkout: async () => {
        const uid = get().userId
        set({ activeWorkout: null })
        if (uid) await supabase.from('active_workout').delete().eq('user_id', uid)
        get().setSyncMsg('✓ Treino finalizado')
      },

      syncWorkoutElapsed: async (elapsedS) => {
        const uid = get().userId
        const aw = get().activeWorkout
        if (!aw || !uid) return
        set({ activeWorkout: { ...aw, elapsedS } })
        await supabase.from('active_workout')
          .update({ elapsed_s: elapsedS, updated_at: new Date().toISOString() })
          .eq('user_id', uid)
      },

      loadActiveWorkout: async () => {
        const uid = get().userId
        if (!uid) return
        const { data } = await supabase
          .from('active_workout').select('*').eq('user_id', uid).maybeSingle()
        if (!data) { set({ activeWorkout: null }); return }
        const diffH = (Date.now() - new Date(data.started_at).getTime()) / 3600000
        if (diffH > 2) {
          await supabase.from('active_workout').delete().eq('user_id', uid)
          set({ activeWorkout: null })
        } else {
          const elapsed = data.elapsed_s + Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000)
          set({ activeWorkout: { dayId: data.day_id, startedAt: data.started_at, elapsedS: elapsed } })
        }
      },

      // SUPLEMENTOS
      suplDone: [],
      suplDate: '',

      loadSupls: async () => {
        const uid = get().userId
        if (!uid) return
        const today = todayDate()
        const { data } = await supabase
          .from('supl_logs').select('supl_id')
          .eq('user_id', uid).eq('date', today)
        set({ suplDone: data ? data.map(r => r.supl_id) : [], suplDate: today })
      },

      toggleSupl: async (suplId) => {
        const uid = get().userId
        const today = todayDate()
        const current = get().suplDone
        const isOn = current.includes(suplId)
        set({ suplDone: isOn ? current.filter(x => x !== suplId) : [...current, suplId] })
        if (!uid) return
        if (isOn) {
          await supabase.from('supl_logs')
            .delete().eq('user_id', uid).eq('supl_id', suplId).eq('date', today)
        } else {
          await supabase.from('supl_logs')
            .insert({ user_id: uid, supl_id: suplId, date: today })
        }
        get().setSyncMsg(isOn ? '○ Desmarcado' : '✓ Registrado')
      },

      // REFEIÇÕES
      mealDone: [],
      mealDate: '',

      loadMeals: async () => {
        const uid = get().userId
        if (!uid) return
        const today = todayDate()
        const { data } = await supabase
          .from('meal_logs_v2').select('meal_id')
          .eq('user_id', uid).eq('date', today)
        set({ mealDone: data ? data.map(r => r.meal_id) : [], mealDate: today })
      },

      toggleMeal: async (mealId) => {
        const uid = get().userId
        const today = todayDate()
        const current = get().mealDone
        const isOn = current.includes(mealId)
        set({ mealDone: isOn ? current.filter(x => x !== mealId) : [...current, mealId] })
        if (!uid) return
        if (isOn) {
          await supabase.from('meal_logs_v2')
            .delete().eq('user_id', uid).eq('meal_id', mealId).eq('date', today)
        } else {
          await supabase.from('meal_logs_v2')
            .insert({ user_id: uid, meal_id: mealId, date: today })
        }
        get().setSyncMsg('✓ Salvo')
      },

      // PESO
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
        const { data, error } = await supabase.from('morning_weights')
          .upsert({ user_id: uid, weight: weightKg, date: today, notes }, { onConflict: 'user_id,date' })
          .select().single()
        if (!error && data) {
          set(s => ({ weights: [data, ...s.weights.filter(w => w.date !== today)] }))
          get().setSyncMsg('✓ Peso salvo')
        }
      },

      deleteWeight: async (id) => {
        await supabase.from('morning_weights').delete().eq('id', id)
        set(s => ({ weights: s.weights.filter(w => w.id !== id) }))
        get().setSyncMsg('🗑 Removido')
      },

      // MEDIDAS
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
          set(s => ({ metrics: [data, ...s.metrics] }))
          get().setSyncMsg('✓ Medidas salvas')
        }
      },

      updateMetric: async (id, patch) => {
        await dbUpdate('body_metrics', id, patch)
        set(s => ({ metrics: s.metrics.map(m => m.id === id ? { ...m, ...patch } : m) }))
        get().setSyncMsg('✓ Atualizado')
      },

      deleteMetric: async (id) => {
        await dbDelete('body_metrics', id)
        set(s => ({ metrics: s.metrics.filter(m => m.id !== id) }))
        get().setSyncMsg('🗑 Removido')
      },

      // SAÚDE
      healthLogs: [],
      exams: [],

      loadHealth: async () => {
        const uid = get().userId
        if (!uid) return
        const [hlogs, examsRes] = await Promise.all([
          supabase.from('health_logs').select('*').eq('user_id', uid)
            .order('date', { ascending: false }).limit(30),
          supabase.from('exames_v2').select('*').eq('user_id', uid)
            .order('created_at', { ascending: false }),
        ])
        if (hlogs.data) set({ healthLogs: hlogs.data })
        if (examsRes.data) set({ exams: examsRes.data })
      },

      saveHealthLog: async (form) => {
        const uid = get().userId
        if (!uid) return
        const today = todayDate()
        const { data, error } = await supabase.from('health_logs')
          .upsert(
            { user_id: uid, date: today, ...form },
            { onConflict: 'user_id,date' }
          ).select().single()
        if (!error && data) {
          set(s => ({ healthLogs: [data, ...s.healthLogs.filter(h => h.date !== today)] }))
          get().setSyncMsg('✓ Biofeedback salvo')
        } else {
          console.error('health_logs error:', error)
          get().setSyncMsg('⚠ Erro ao salvar')
        }
      },

      addExam: async (exam) => {
        const uid = get().userId
        if (!uid) return
        const { data, error } = await supabase
          .from('exames_v2').insert({ user_id: uid, ...exam }).select().single()
        if (!error && data) {
          set(s => ({ exams: [data, ...s.exams] }))
          get().setSyncMsg('✓ Exame salvo')
        } else {
          console.error('exames_v2 error:', error)
          get().setSyncMsg('⚠ Erro ao salvar')
        }
      },

      deleteExam: async (id) => {
        await dbDelete('exames_v2', id)
        set(s => ({ exams: s.exams.filter(e => e.id !== id) }))
        get().setSyncMsg('🗑 Removido')
      },

      // PERFIL
      userProfile: null,

      loadProfile: async () => {
        const uid = get().userId
        if (!uid) return
        const { data } = await supabase
          .from('user_profile').select('*').eq('user_id', uid).maybeSingle()
        if (data) set({ userProfile: data })
      },

      saveProfile: async (form) => {
        const uid = get().userId
        if (!uid) return
        const { data, error } = await supabase.from('user_profile').upsert(
          {
            user_id:   uid,
            name:      form.name,
            age:       form.age,
            weight:    form.weight,
            height:    form.height,
            phase:     form.phase,
            phase_end: form.phaseEnd,
            bf_meta:   form.bfMeta,
            objetivo:  form.objetivo,
          },
          { onConflict: 'user_id' }
        ).select().single()
        if (!error && data) {
          set({ userProfile: data })
          get().setSyncMsg('✓ Perfil salvo')
        }
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
        if (!uid) return null
        const { data, error } = await supabase
          .from('workout_logs').insert({ user_id: uid, ...row }).select().single()
        if (!error && data) set(s => ({ workoutLogs: [data, ...s.workoutLogs] }))
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
          get().loadProfile(),
        ])
        set({ loading: false })
        get().setSyncMsg('✓ Sincronizado')
      },

      reset: () => set({
        userId: null, water: 0, waterDate: '', activeWorkout: null,
        suplDone: [], mealDone: [], weights: [], metrics: [],
        healthLogs: [], exams: [], workoutLogs: [], userProfile: null,
        loading: true,
      }),
    }),

    {
      name: 'atlas-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        water: s.water,
        waterDate: s.waterDate,
        activeWorkout: s.activeWorkout,
      }),
    }
  )
)

export default useAppStore

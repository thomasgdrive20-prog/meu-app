import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { DIET, SUPLS, T } from '../lib/constants'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function NutriPage({ session }) {
  const uid = session.user.id
  const [mealDone, setMealDone] = useState([])
  const [suplDone, setSuplDone] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const today = todayStr()
    const { data: meals } = await supabase
      .from('meal_logs_v2')
      .select('meal_id')
      .eq('user_id', uid)
      .gte('created_at', today)
    if (meals) setMealDone(meals.map(m => m.meal_id))

    const { data: supls } = await supabase
      .from('supl_logs')
      .select('supl_id')
      .eq('user_id', uid)
      .gte('created_at', today)
    if (supls) setSuplDone(supls.map(s => s.supl_id))
    setLoading(false)
  }

  const toggleMeal = async (id) => {
    if (mealDone.includes(id)) {
      await supabase.from('meal_logs_v2').delete()
        .eq('user_id', uid).eq('meal_id', id).gte('created_at', todayStr())
      setMealDone(prev => prev.filter(x => x !== id))
    } else {
      await supabase.from('meal_logs_v2').insert({ user_id: uid, meal_id: id, eaten: true })
      setMealDone(prev => [...prev, id])
    }
  }

  const toggleSupl = async (id) => {
    if (suplDone.includes(id)) {
      await supabase.from('supl_logs').delete()
        .eq('user_id', uid).eq('supl_id', id).gte('created_at', todayStr())
      setSuplDone(prev => prev.filter(x => x !== id))
    } else {
      await supabase.from('supl_logs').insert({ user_id: uid, supl_id: id })
      setSuplDone(prev => [...prev, id])
    }
  }

  const totalKcal  = DIET.reduce((s, m) => s + m.kcal, 0)
  const eatenKcal  = DIET.filter(m => mealDone.includes(m.id)).reduce((s, m) => s + m.kcal, 0)
  const eatenProt  = DIET.filter(m => mealDone.includes(m.id)).reduce((s, m) => s + m.prot, 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Nutrição</div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 2 }}>Plano do dia</div>
      </div>

      {/* Resumo de macros */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.gold }}>{eatenKcal}</div>
            <div style={{ fontSize: 10, color: T.muted }}>kcal consumidas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{totalKcal}</div>
            <div style={{ fontSize: 10, color: T.muted }}>kcal meta</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.treino }}>{eatenProt}g</div>
            <div style={{ fontSize: 10, color: T.muted }}>proteína</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.muted }}>{mealDone.length}/{DIET.length}</div>
            <div style={{ fontSize: 10, color: T.muted }}>refeições</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            background: `linear-gradient(90deg, ${T.ok}88, ${T.ok})`,
            width: `${Math.min(100, (eatenKcal / totalKcal) * 100)}%`,
            transition: 'width 0.4s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: T.muted }}>0 kcal</span>
          <span style={{ fontSize: 10, color: T.gold }}>{Math.round((eatenKcal / totalKcal) * 100)}%</span>
          <span style={{ fontSize: 10, color: T.muted }}>{totalKcal} kcal</span>
        </div>
      </div>

      {/* Macros detalhados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Calorias', value: '2.350', unit: 'kcal', color: T.gold },
          { label: 'Proteína', value: '215',   unit: 'g',    color: T.treino },
          { label: 'Carbs',    value: '220',   unit: 'g',    color: T.horm },
          { label: 'Gordura',  value: '65',    unit: 'g',    color: T.nutri },
        ].map((m, i) => (
          <div key={i} style={{ background: T.faint, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 9, color: T.muted }}>{m.unit}</div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Refeições */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 12 }}>Refeições</div>
      {DIET.map(meal => {
        const done = mealDone.includes(meal.id)
        return (
          <div key={meal.id} style={{
            background: done ? `${T.ok}08` : T.card,
            border: `1px solid ${done ? T.ok + '44' : T.border}`,
            borderRadius: 14, padding: '14px', marginBottom: 10,
            transition: 'all 0.3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: done ? 0 : 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>{meal.time}</span>
                  <span style={{ fontSize: 14, color: done ? T.ok : T.text, fontWeight: 700 }}>{meal.label}</span>
                  {done && <span style={{ fontSize: 10, color: T.ok, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                  {meal.kcal} kcal · {meal.prot}g proteína
                </div>
              </div>
              <button onClick={() => toggleMeal(meal.id)} style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${done ? T.ok + '55' : T.border}`,
                background: done ? `${T.ok}22` : T.faint,
                color: done ? T.ok : T.muted,
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {done ? '✓' : '+'}
              </button>
            </div>

            {!done && meal.options.map((opt, i) => (
              <div key={i} style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>· {opt}</div>
            ))}
          </div>
        )
      })}

      {/* Suplementos */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, margin: '20px 0 12px' }}>
        Suplementos
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 400, marginLeft: 8 }}>
          {suplDone.length}/{SUPLS.length} tomados
        </span>
      </div>
      {SUPLS.map(s => {
        const done = suplDone.includes(s.id)
        return (
          <div key={s.id} style={{
            background: done ? `${T.ok}08` : T.faint,
            border: `1px solid ${done ? T.ok + '44' : T.border}`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: 'all 0.3s',
          }}>
            <div>
              <div style={{ fontSize: 13, color: done ? T.ok : s.color, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{s.dose} · {s.time}</div>
              {s.obs && <div style={{ fontSize: 10, color: T.muted, fontStyle: 'italic', marginTop: 2 }}>{s.obs}</div>}
            </div>
            <button onClick={() => toggleSupl(s.id)} style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${done ? T.ok + '55' : T.border}`,
              background: done ? `${T.ok}22` : T.card,
              color: done ? T.ok : T.muted,
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {done ? '✓' : '+'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

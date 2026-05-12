import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SPLIT, DIET, SUPLS, PROTOCOL_COMPOUNDS, T } from '../lib/constants'
import { Droplets, Moon, Zap, ChevronRight, Plus } from 'lucide-react'

const todayStr = () => new Date().toISOString().slice(0, 10)

function getTodayWorkout() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = days[new Date().getDay()]
  return SPLIT.find(d => d.day === today) || SPLIT[0]
}

export default function HomePage({ session, setPage }) {
  const uid = session.user.id
  const workout = getTodayWorkout()

  const [weight, setWeight]       = useState('')
  const [weights, setWeights]     = useState([])
  const [mealDone, setMealDone]   = useState([])
  const [suplDone, setSuplDone]   = useState([])
  const [protoDone, setProtoDone] = useState([])
  const [water, setWater]         = useState(0)
  const [saving, setSaving]       = useState(false)

  // Carrega dados do dia
  useEffect(() => {
    loadWeights()
    loadTodayLogs()
  }, [])

  const loadWeights = async () => {
    const { data } = await supabase
      .from('morning_weights')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(7)
    if (data) setWeights(data)
  }

  const loadTodayLogs = async () => {
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
  }

  const saveWeight = async () => {
    if (!weight || isNaN(weight)) return
    setSaving(true)
    await supabase.from('morning_weights').insert({ user_id: uid, weight: parseFloat(weight) })
    setWeight('')
    await loadWeights()
    setSaving(false)
  }

  const toggleMeal = async (id) => {
    if (mealDone.includes(id)) {
      await supabase.from('meal_logs_v2').delete().eq('user_id', uid).eq('meal_id', id).gte('created_at', todayStr())
      setMealDone(prev => prev.filter(x => x !== id))
    } else {
      await supabase.from('meal_logs_v2').insert({ user_id: uid, meal_id: id, eaten: true })
      setMealDone(prev => [...prev, id])
    }
  }

  const toggleSupl = async (id) => {
    if (suplDone.includes(id)) {
      await supabase.from('supl_logs').delete().eq('user_id', uid).eq('supl_id', id).gte('created_at', todayStr())
      setSuplDone(prev => prev.filter(x => x !== id))
    } else {
      await supabase.from('supl_logs').insert({ user_id: uid, supl_id: id })
      setSuplDone(prev => [...prev, id])
    }
  }

  const todayWeight = weights[0]
  const yesterWeight = weights[1]
  const diff = todayWeight && yesterWeight ? (parseFloat(todayWeight.weight) - parseFloat(yesterWeight.weight)).toFixed(1) : null
  const avgWeight = weights.length ? (weights.reduce((s, w) => s + parseFloat(w.weight), 0) / weights.length).toFixed(1) : null

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div style={{ fontSize: 24, color: T.text, fontWeight: 800, marginTop: 4 }}>
          Bom dia, {session.user.user_metadata?.full_name?.split(' ')[0] || 'Thomas'} 👋
        </div>
      </div>

      {/* Card Peso Matinal */}
      <div style={cardStyle}>
        <div style={cardHeader}>
          <span style={cardTitle}>⚖️ Peso Matinal</span>
          {todayWeight && (
            <span style={{ fontSize: 20, fontWeight: 800, color: T.gold }}>{todayWeight.weight}kg</span>
          )}
        </div>

        {diff !== null && (
          <div style={{ fontSize: 12, color: parseFloat(diff) < 0 ? T.ok : T.warn, marginBottom: 12 }}>
            {parseFloat(diff) < 0 ? '↓' : '↑'} {Math.abs(diff)}kg vs ontem
            {avgWeight && <span style={{ color: T.muted, marginLeft: 12 }}>Média 7d: {avgWeight}kg</span>}
          </div>
        )}

        {/* Mini gráfico */}
        {weights.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40, marginBottom: 14 }}>
            {[...weights].reverse().map((w, i) => {
              const vals = weights.map(x => parseFloat(x.weight))
              const min = Math.min(...vals), max = Math.max(...vals)
              const h = max === min ? 20 : ((parseFloat(w.weight) - min) / (max - min)) * 32 + 8
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: '100%', height: h, borderRadius: 3, background: i === weights.length - 1 ? T.gold : `${T.gold}44` }} />
                  <span style={{ fontSize: 8, color: T.muted }}>{parseFloat(w.weight).toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        )}

        {!todayWeight && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number" step="0.1" placeholder="Ex: 91.5"
              value={weight} onChange={e => setWeight(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 15, outline: 'none' }}
            />
            <button onClick={saveWeight} disabled={saving} style={{
              padding: '10px 18px', borderRadius: 10, background: `${T.gold}22`,
              border: `1px solid ${T.gold}55`, color: T.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              {saving ? '...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      {/* Card Hidratação */}
      <div style={cardStyle}>
        <div style={cardHeader}>
          <span style={cardTitle}><Droplets size={16} color={T.horm} style={{ display: 'inline', marginRight: 6 }} />Hidratação</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: water >= 4 ? T.ok : T.horm }}>{water}L / 4L</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(v => (
            <button key={v} onClick={() => setWater(v)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: water >= v ? `${T.horm}33` : T.faint,
              color: water >= v ? T.horm : T.muted,
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Card Suplementos */}
      <div style={cardStyle}>
        <div style={{ ...cardHeader, marginBottom: 12 }}>
          <span style={cardTitle}>💊 Suplementos & Protocolo</span>
          <span style={{ fontSize: 11, color: T.muted }}>{suplDone.length}/{SUPLS.length}</span>
        </div>
        {[...SUPLS, ...PROTOCOL_COMPOUNDS].map(s => {
          const done = suplDone.includes(s.id)
          return (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: `1px solid ${T.border}`,
            }}>
              <div>
                <div style={{ fontSize: 13, color: done ? T.ok : T.text, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{s.dose || `${s.dose} ${s.unit}`} · {s.time || s.schedule}</div>
              </div>
              <button onClick={() => toggleSupl(s.id)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${done ? T.ok + '55' : T.border}`,
                background: done ? `${T.ok}22` : T.faint, color: done ? T.ok : T.muted,
                fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done ? '✓' : '+'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Card Treino do dia */}
      <div style={{ ...cardStyle, border: `1px solid ${T.gold}44`, background: `linear-gradient(135deg, ${T.card}, ${T.faint})` }}>
        <div style={cardHeader}>
          <div>
            <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Treino de hoje</div>
            <div style={{ fontSize: 20, color: T.text, fontWeight: 800, marginTop: 2 }}>{workout.label}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{workout.tag}</div>
          </div>
          <span style={{ fontSize: 32 }}>{workout.emoji}</span>
        </div>
        {workout.focus && (
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 14, borderLeft: `2px solid ${T.gold}44`, paddingLeft: 10 }}>
            {workout.focus}
          </div>
        )}
        <button onClick={() => setPage('treino')} style={{
          width: '100%', padding: '14px', borderRadius: 12,
          background: `linear-gradient(135deg, ${T.gold}33, ${T.gold}22)`,
          border: `1px solid ${T.gold}66`, color: T.gold,
          fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 1,
        }}>
          INICIAR TREINO →
        </button>
      </div>

      {/* Card Refeições */}
      <div style={cardStyle}>
        <div style={{ ...cardHeader, marginBottom: 8 }}>
          <span style={cardTitle}>🥗 Refeições</span>
          <span style={{ fontSize: 11, color: T.muted }}>{mealDone.length}/{DIET.length}</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', background: T.ok, width: `${(mealDone.length / DIET.length) * 100}%`, borderRadius: 999, transition: 'width 0.4s' }} />
        </div>
        {DIET.map(meal => {
          const done = mealDone.includes(meal.id)
          return (
            <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
              <div>
                <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>{meal.time}</span>
                <span style={{ fontSize: 13, color: done ? T.ok : T.text, fontWeight: 600, marginLeft: 8 }}>{meal.label}</span>
              </div>
              <button onClick={() => toggleMeal(meal.id)} style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1px solid ${done ? T.ok + '55' : T.border}`,
                background: done ? `${T.ok}22` : T.faint,
                color: done ? T.ok : T.muted, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done ? '✓' : '+'}
              </button>
            </div>
          )
        })}
      </div>

    </div>
  )
}

const cardStyle = {
  background: '#201E1B',
  border: '1px solid #2E2A24',
  borderRadius: 16,
  padding: '16px',
  marginBottom: 14,
}

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
}

const cardTitle = {
  fontSize: 13,
  color: '#EDE8E0',
  fontWeight: 700,
}

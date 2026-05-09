import { useState, useEffect } from 'react'
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts'
import { LucideDumbbell, LucideUtensils, LucideActivity, LucideUser, LucidePlus, LucideTrendingUp, LucideChevronRight, LucideDroplets, LucideScale } from 'lucide-react'
import { dbSelect, USER_ID } from './lib/supabaseClient'

// ─── TEMA E CORES ───────────────────────────────────────────────────────────
const T = {
  bg: '#000000',
  surface: '#0A0A0A',
  card: 'rgba(20, 20, 20, 0.7)',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#18FF5B', // Verde Neon
  text: '#FFFFFF',
  muted: '#888888',
  treino: '#18FF5B',
  nutri: '#FF8C5A',
  horm: '#60B4FF',
  metrica: '#D87AE8',
}

// ─── DADOS DO SEU PLANEJAMENTO ──────────────────────────────────────────────
const SPLIT = [
  { id: 'legs', label: 'Legs', tag: 'Quad · Post · Glúteo', color: T.treino, emoji: '🦵', day: 'Seg' },
  { id: 'push_a', label: 'Push A', tag: 'Peito · Ombro · Tríceps', color: '#A8E870', emoji: '💪', day: 'Ter' },
  { id: 'pull_a', label: 'Pull A', tag: 'Costas · Bíceps', color: T.horm, emoji: '🔵', day: 'Qua' },
  { id: 'off', label: 'Futebol', tag: 'Descanso ativo', color: T.muted, emoji: '⚽', day: 'Qui' },
  { id: 'push_b', label: 'Push B', tag: 'Peito · Ombro · Tríceps', color: '#A8E870', emoji: '💪', day: 'Sex' },
  { id: 'arms', label: 'Braço+Peito', tag: 'Bíceps · Tríceps · Peito', color: T.nutri, emoji: '💪', day: 'Sáb' },
  { id: 'pull_b', label: 'Pull B', tag: 'Costas · Bíceps', color: T.horm, emoji: '🔵', day: 'Dom' },
]

const DIET = [
  { id: 'cafe', time: '06:30', label: 'Café da Manhã', kcal: 470, prot: 36, options: ['1 whey + 30g aveia + ½ banana'] },
  { id: 'almoco', time: '12:30', label: 'Almoço', kcal: 450, prot: 45, options: ['150g frango + 40g arroz + 60g batata'] },
  { id: 'lanche', time: '16:00', label: 'Lanche', kcal: 300, prot: 20, options: ['Iogurte + Fruta + Oleaginosas'] },
  { id: 'jantar', time: '20:30', label: 'Jantar', kcal: 400, prot: 40, options: ['Peixe/Frango + Salada + Azeite'] },
]

// ─── COMPONENTES REUTILIZÁVEIS ──────────────────────────────────────────────
const Card = ({ children, color, onClick }) => (
  <div onClick={onClick} style={{
    background: T.card, backdropFilter: 'blur(12px)',
    border: `1px solid ${T.border}`, borderRadius: 24, padding: '20px',
    marginBottom: 12, borderLeft: color ? `4px solid ${color}` : `1px solid ${T.border}`,
    cursor: onClick ? 'pointer' : 'default'
  }}>{children}</div>
)

const Btn = ({ children, onClick, color, full, icon: Icon }) => (
  <button onClick={onClick} style={{
    background: color || T.accent, color: '#000', border: 'none', borderRadius: 16,
    padding: '16px 24px', fontSize: 14, fontWeight: 800, width: full ? '100%' : 'auto',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
  }}>
    {Icon && <Icon size={18} />} {children}
  </button>
)

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dash')
  const [syncMsg, setSyncMsg] = useState('Conectando...')
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    dbSelect('body_metrics').then(bm => {
      setMetrics(bm.length > 0 ? bm : [{ weight: 91.5, date: '01/05' }, { weight: 90.8, date: '08/05' }])
      setSyncMsg('● Online')
    }).catch(() => setSyncMsg('⚠ Offline'))
  }, [])

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todaySession = SPLIT[todayIdx]

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, paddingBottom: 110 }}>
      
      {/* HEADER */}
      <header style={{ padding: '40px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -1 }}>SHAPE 2026</h1>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>{syncMsg}</p>
        </div>
        <div style={{ width: 45, height: 45, borderRadius: '50%', background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LucideUser size={20} color={T.accent} />
        </div>
      </header>

      <main style={{ padding: '0 20px' }}>
        {tab === 'dash' && (
          <>
            <Card color={T.treino}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: T.treino, letterSpacing: 1.5 }}>HOJE: {todaySession.label.toUpperCase()}</span>
                  <h3 style={{ margin: '5px 0', fontSize: 20 }}>{todaySession.tag}</h3>
                </div>
                <span style={{ fontSize: 24 }}>{todaySession.emoji}</span>
              </div>
              <Btn full icon={LucidePlus}>INICIAR TREINO</Btn>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <Card><LucideDroplets size={18} color={T.horm} /><div style={{ marginTop: 10 }}><div style={{ fontSize: 18, fontWeight: 800 }}>3.5L</div><div style={{ fontSize: 10, color: T.muted }}>ÁGUA HOJE</div></div></Card>
              <Card><LucideScale size={18} color={T.metrica} /><div style={{ marginTop: 10 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{metrics[metrics.length-1]?.weight}kg</div><div style={{ fontSize: 10, color: T.muted }}>PESO ATUAL</div></div></Card>
            </div>

            <h4 style={{ margin: '25px 0 15px', fontSize: 12, color: T.muted, letterSpacing: 1 }}>EVOLUÇÃO DE PESO</h4>
            <div style={{ height: 180, width: '110%', marginLeft: -25 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.accent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: 10 }} />
                  <Area type="monotone" dataKey="weight" stroke={T.accent} fillOpacity={1} fill="url(#colorW)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === 'nutri' && (
          <>
            <h2 style={{ marginBottom: 20 }}>Plano Alimentar</h2>
            {DIET.map(item => (
              <Card key={item.id} color={T.nutri}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: T.nutri }}>{item.time}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>{item.kcal} kcal</span>
                </div>
                <h4 style={{ margin: '10px 0' }}>{item.label}</h4>
                <div style={{ fontSize: 13, color: T.muted }}>{item.options[0]}</div>
              </Card>
            ))}
          </>
        )}
      </main>

      <nav style={{ 
        position: 'fixed', bottom: 25, left: '50%', transform: 'translateX(-50%)', 
        width: '90%', maxWidth: 400, background: 'rgba(15,15,15,0.85)', 
        backdropFilter: 'blur(25px)', borderRadius: 32, border: `1px solid ${T.border}`, 
        padding: '10px 15px', display: 'flex', justifyContent: 'space-around', zIndex: 1000 
      }}>
        <TabBtn active={tab === 'dash'} onClick={() => setTab('dash')} icon={LucideActivity} label="Início" />
        <TabBtn active={tab === 'nutri'} onClick={() => setTab('nutri')} icon={LucideUtensils} label="Dieta" />
        <TabBtn active={tab === 'body'} onClick={() => setTab('body')} icon={LucideTrendingUp} label="Corpo" />
      </nav>
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
      <Icon size={22} color={active ? T.accent : T.muted} strokeWidth={active ? 2.5 : 2} />
      <span style={{ fontSize: 9, fontWeight: active ? 800 : 500, color: active ? '#fff' : T.muted }}>{label}</span>
    </button>
  )
}
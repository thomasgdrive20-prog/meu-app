import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { LucideDumbbell, LucideUtensils, LucideActivity, LucideUser, LucidePlus, LucideTrendingUp, LucideCheckCircle2, LucideFlame, LucideZap } from 'lucide-react'
import { dbSelect } from './lib/supabaseClient'

// ─── TEMA E CORES (CONFORME SUA FOTO) ───────────────────────────────────────
const T = {
  bg: '#111111',
  surface: '#1A1A1A',
  card: '#1E1E1E',
  border: 'rgba(255, 255, 255, 0.05)',
  accent: '#18FF5B', // Verde do botão e peso
  text: '#FFFFFF',
  muted: '#888888',
  treino: '#18FF5B',
  nutri: '#FF8C5A',
  horm: '#60B4FF',
  metrica: '#D87AE8',
}

export default function App() {
  const [tab, setTab] = useState('dash')
  const [metrics, setMetrics] = useState([{ weight: 91.5, bf: 20, kcal: 0, prot: 0 }])

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '20px', paddingBottom: '100px' }}>
      
      {/* HEADER */}
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>Thomas</h1>
        <p style={{ color: T.muted, fontSize: '14px', margin: 0 }}>Fase 1 — Cutting • até Jul 2026</p>
      </header>

      {/* CARD PRINCIPAL (PUSH B) */}
      <div style={{ background: 'linear-gradient(145deg, #1e1e1e, #141414)', borderRadius: '28px', padding: '24px', border: `1px solid ${T.border}`, marginBottom: '15px' }}>
        <span style={{ fontSize: '10px', color: T.muted, letterSpacing: '2px' }}>HOJE — {days[todayIdx]}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '15px 0' }}>
          <span style={{ fontSize: '40px' }}>💪</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '28px', color: T.accent }}>Push B</h2>
            <p style={{ margin: 0, color: T.muted, fontSize: '14px' }}>Peito • Ombro • Tríceps</p>
          </div>
        </div>
        <button style={{ background: T.accent, color: '#000', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
          <LucidePlus size={20} /> INICIAR TREINO
        </button>
      </div>

      {/* GRID DE MÉTRICAS (IGUAL A FOTO) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div style={{ gridRow: 'span 2', background: T.card, borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: '32px', fontWeight: '900', color: T.accent }}>0</span>
          <span style={{ fontSize: '10px', color: T.muted }}>SCORE</span>
        </div>
        <div style={{ background: T.card, borderRadius: '20px', padding: '15px', border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: T.accent }}>91.5</span>
            <span style={{ fontSize: '10px', color: T.muted }}>kg</span>
          </div>
          <span style={{ fontSize: '10px', color: T.muted }}>PESO</span>
        </div>
        <div style={{ background: T.card, borderRadius: '20px', padding: '15px', border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: T.metrica }}>20</span>
            <span style={{ fontSize: '10px', color: T.muted }}>%</span>
          </div>
          <span style={{ fontSize: '10px', color: T.muted }}>BF%</span>
        </div>
        <div style={{ background: T.card, borderRadius: '20px', padding: '15px', border: `1px solid ${T.border}` }}>
          <span style={{ color: T.nutri }}>—</span>
          <div style={{ fontSize: '10px', color: T.muted }}>KCAL</div>
        </div>
        <div style={{ background: T.card, borderRadius: '20px', padding: '15px', border: `1px solid ${T.border}` }}>
          <span style={{ color: T.accent }}>— <small>g</small></span>
          <div style={{ fontSize: '10px', color: T.muted }}>PROT</div>
        </div>
      </div>

      {/* PROGRESSO DO DIA */}
      <div style={{ background: T.card, borderRadius: '24px', padding: '20px', border: `1px solid ${T.border}`, marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '12px', color: T.muted, letterSpacing: '1px' }}>PROGRESSO DO DIA</h4>
        {['Dieta', 'Treino', 'Protocolo', 'Suplementos'].map(item => (
          <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}`, fontSize: '14px' }}>
            <span style={{ color: T.muted }}>{item}</span>
            <span style={{ fontWeight: 'bold' }}>0</span>
          </div>
        ))}
      </div>

      {/* SUPLEMENTOS */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '12px', color: T.muted, marginBottom: '10px' }}>SUPLEMENTOS — 0/4</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
           <div style={{ background: T.card, padding: '15px', borderRadius: '18px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Vit. D3+K2</div>
              <div style={{ fontSize: '11px', color: T.muted }}>4.000 UI • Manhã</div>
           </div>
           <div style={{ background: T.card, padding: '15px', borderRadius: '18px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Vit. B12</div>
              <div style={{ fontSize: '11px', color: T.muted }}>1.000mcg • Manhã</div>
           </div>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: `1px solid ${T.border}` }}>
        <div onClick={() => setTab('dash')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: tab === 'dash' ? T.accent : T.muted }}>
          <LucideActivity size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>INÍCIO</span>
          {tab === 'dash' && <div style={{ width: '15px', height: '2px', background: T.accent, marginTop: '4px' }} />}
        </div>
        <div onClick={() => setTab('treino')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: T.muted }}>
          <LucideDumbbell size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>TREINO</span>
        </div>
        <div onClick={() => setTab('dieta')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: T.muted }}>
          <LucideUtensils size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>DIETA</span>
        </div>
      </nav>
    </div>
  )
}
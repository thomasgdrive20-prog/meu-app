import { useState } from 'react'
import { T, USER_PROFILE, DIET, PROTOCOL_COMPOUNDS, SUPLS } from '../lib/constants'
import PhaseProgressCard from '../components/PhaseProgressCard'
import WorkoutManager from '../components/WorkoutManager'
import HealthDashboard from '../components/HealthDashboard'

export default function Dashboard({ setPage, activePage }) {
  const [section, setSection] = useState('treino')

  const sections = [
    { id: 'treino', label: '🏋️ Treino'  },
    { id: 'nutri',  label: '🥗 Nutrição' },
    { id: 'saude',  label: '🩸 Saúde'    },
    { id: 'perfil', label: '👤 Perfil'   },
  ]

  return (
    <div style={{ padding: '24px 20px', maxWidth: 720, margin: '0 auto' }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          Atlas Fitness
        </div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 700 }}>
          Olá, {USER_PROFILE.name} 👋
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
          {USER_PROFILE.phase} · Meta: {USER_PROFILE.objetivo}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <PhaseProgressCard />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Peso',    value: USER_PROFILE.weight + 'kg', color: T.text },
          { label: 'Altura',  value: USER_PROFILE.height + 'm',  color: T.text },
          { label: 'Meta BF', value: USER_PROFILE.bfMeta + '%',  color: T.gold },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: '8px 18px', borderRadius: 20, whiteSpace: 'nowrap',
            background: section === s.id ? `${T.gold}22` : T.faint,
            border: `1px solid ${section === s.id ? T.gold + '66' : T.border}`,
            color: section === s.id ? T.gold : T.muted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'treino' && <WorkoutManager />}
      {section === 'saude'  && <HealthDashboard />}
      {section === 'nutri'  && <NutriSection />}
      {section === 'perfil' && <PerfilSection />}
    </div>
  )
}

function NutriSection() {
  return (
    <div>
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>Plano Alimentar</div>
      {DIET.map(meal => (
        <div key={meal.id} style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>{meal.time}</span>
              <span style={{ fontSize: 13, color: T.text, fontWeight: 700, marginLeft: 10 }}>{meal.label}</span>
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>{meal.kcal} kcal · {meal.prot}g prot</div>
          </div>
          {meal.options.map((opt, i) => (
            <div key={i} style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>· {opt}</div>
          ))}
        </div>
      ))}
      <div style={{
        background: T.faint, border: `1px solid ${T.gold}33`,
        borderRadius: 12, padding: '14px 16px', marginTop: 6,
        display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { label: 'Calorias', value: '2.350 kcal' },
          { label: 'Proteína', value: '215g' },
          { label: 'Carbs',    value: '220g' },
          { label: 'Gordura',  value: '65g'  },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: T.gold, fontWeight: 800 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerfilSection() {
  return (
    <div>
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>Perfil & Protocolo</div>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '20px', marginBottom: 16,
      }}>
        {[
          { label: 'Nome',        value: USER_PROFILE.name },
          { label: 'Idade',       value: USER_PROFILE.age + ' anos' },
          { label: 'Peso',        value: USER_PROFILE.weight + ' kg' },
          { label: 'Altura',      value: USER_PROFILE.height + ' m' },
          { label: 'Fase',        value: USER_PROFILE.phase },
          { label: 'Fim da fase', value: USER_PROFILE.phaseEnd },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '8px 0', borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 12, color: T.muted }}>{r.label}</span>
            <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 12 }}>Protocolo ativo</div>
      {PROTOCOL_COMPOUNDS.map(c => (
        <div key={c.id} style={{
          background: T.faint, border: `1px solid ${c.color}33`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 13, color: c.color, fontWeight: 700 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.dose} {c.unit} · {c.schedule}</div>
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>{c.weekly}/sem</div>
        </div>
      ))}

      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, margin: '16px 0 12px' }}>Suplementação</div>
      {SUPLS.map(s => (
        <div key={s.id} style={{
          background: T.faint, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontSize: 12, color: T.muted }}>{s.dose} · {s.time}</span>
        </div>
      ))}
    </div>
  )
}
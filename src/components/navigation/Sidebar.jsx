import { T } from '../../lib/constants'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', emoji: '⚡' },
  { id: 'treino',    label: 'Treinos',   emoji: '🏋️' },
  { id: 'nutri',     label: 'Nutrição',  emoji: '🥗' },
  { id: 'saude',     label: 'Saúde',     emoji: '🩸' },
  { id: 'perfil',    label: 'Perfil',    emoji: '👤' },
]

export default function Sidebar({ page, setPage }) {
  return (
    <div style={{
      width: 220,
      minHeight: '100vh',
      flexShrink: 0,
      background: T.surface,
      borderRight: '1px solid #2E2A24',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 16px',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: '#C9A96E', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
          Atlas
        </div>
        <div style={{ fontSize: 18, color: '#EDE8E0', fontWeight: 800 }}>
          Fitness
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: active ? '#C9A96E18' : 'transparent',
                border: active ? '1px solid #C9A96E44' : '1px solid transparent',
                color: active ? '#C9A96E' : '#7A7268',
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #2E2A24' }}>
        <div style={{ fontSize: 10, color: '#7A7268', lineHeight: 1.6 }}>
          Thomas Altenhofen<br />
          Fase 1 · Cutting 2026
        </div>
      </div>

    </div>
  )
}
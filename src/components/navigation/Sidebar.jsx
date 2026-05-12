import { T } from '../../lib/constants'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  emoji: '⚡' },
  { id: 'treino',    label: 'Treinos',    emoji: '🏋️' },
  { id: 'nutri',     label: 'Nutrição',   emoji: '🥗' },
  { id: 'saude',     label: 'Saúde',      emoji: '🩸' },
  { id: 'perfil',    label: 'Perfil',     emoji: '👤' },
]

export default function Sidebar({ page, setPage }) {
  return (
    <div style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '28px 16px',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontSize: 11, color: T.gold, fontWeight: 700,
          letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4,
        }}>
          Atlas
        </div>
        <div style={{ fontSize: 18, color: T.text, fontWeight: 800 }}>
          Fitness
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: active ? `${T.gold}18` : 'transparent',
                border: `1px solid ${active ? T.gold + '44' : 'transparent'}`,
                color: active ? T.gold : T.muted,
                fontSize: 13, fontWeight: active ? 700 : 400,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div style={{ marginTop: 'auto'
import { Home, Dumbbell, Utensils, Heart, User } from 'lucide-react'

const TABS = [
  { id: 'home',   label: 'Home',     Icon: Home     },
  { id: 'treino', label: 'Treino',   Icon: Dumbbell },
  { id: 'nutri',  label: 'Nutrição', Icon: Utensils },
  { id: 'saude',  label: 'Saúde',    Icon: Heart    },
  { id: 'perfil', label: 'Perfil',   Icon: User     },
]

export default function BottomNav({ page, setPage }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 428,
      background: 'rgba(17,16,16,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #2E2A24',
      display: 'flex',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = page === id
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              gap: 4,
            }}
          >
            <Icon
              size={22}
              color={active ? '#C9A96E' : '#7A7268'}
              strokeWidth={active ? 2.5 : 1.5}
            />
            <span style={{
              fontSize: 10,
              color: active ? '#C9A96E' : '#7A7268',
              fontWeight: active ? 700 : 400,
              fontFamily: "'Lato', sans-serif",
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
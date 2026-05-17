import { motion, AnimatePresence } from 'framer-motion'
import { Home, Dumbbell, Utensils, Heart, User, BarChart2, Activity } from 'lucide-react'
import useAppStore from '../../stores/useAppStore'
import { T } from '../../lib/constants'

const TABS = [
  { id: 'home',      label: 'Home',      Icon: Home      },
  { id: 'treino',    label: 'Treino',    Icon: Dumbbell  },
  { id: 'nutri',     label: 'Nutrição',  Icon: Utensils  },
  { id: 'saude',     label: 'Saúde',     Icon: Heart     },
  { id: 'cardio',    label: 'Cardio',    Icon: Activity  },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'perfil',    label: 'Perfil',    Icon: User      },
]

export default function BottomNav({ page, setPage }) {
  const activeWorkout = useAppStore(s => s.activeWorkout)

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%',
      transform: 'translateX(-50%)', width: '100%', maxWidth: 428,
      background: 'rgba(8,8,7,0.94)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: `1px solid ${T.border}`,
      display: 'flex', zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* Linha dourada sutil no topo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}18, transparent)`, pointerEvents: 'none' }} />

      {TABS.map(({ id, label, Icon }) => {
        const active = page === id
        const isWorkout = id === 'treino'
        const hasActive = isWorkout && activeWorkout

        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '9px 0 7px', background: 'transparent',
              border: 'none', cursor: 'pointer', gap: 3,
              position: 'relative', minWidth: 0,
            }}
          >
            {/* Indicador ativo */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    position: 'absolute', top: 0,
                    width: 18, height: 1.5, borderRadius: 999,
                    background: T.gold,
                    boxShadow: `0 0 8px ${T.gold}80`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Dot pulsante de treino ativo */}
            {hasActive && !active && (
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  position: 'absolute', top: 8, right: '50%',
                  transform: 'translateX(10px)',
                  width: 6, height: 6, borderRadius: '50%',
                  background: T.treino,
                  boxShadow: `0 0 6px ${T.treino}`,
                }}
              />
            )}

            {/* Ícone */}
            <motion.div
              whileTap={{ scale: 0.78 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Icon
                size={18}
                color={active ? T.gold : hasActive ? T.treino : T.muted}
                strokeWidth={active ? 2.5 : 1.5}
                style={{
                  filter: active ? `drop-shadow(0 0 5px ${T.gold}50)` : 'none',
                  transition: 'all 0.2s',
                }}
              />
            </motion.div>

            {/* Label */}
            <span style={{
              fontSize: 8, letterSpacing: 0.2,
              fontWeight: active ? 700 : 400,
              color: active ? T.gold : hasActive ? T.treino : T.muted,
              whiteSpace: 'nowrap', overflow: 'hidden',
              maxWidth: '100%', textOverflow: 'ellipsis',
              paddingInline: 1, transition: 'all 0.2s',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

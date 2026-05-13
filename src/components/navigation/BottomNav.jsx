import { motion, AnimatePresence } from 'framer-motion'
import { Home, Dumbbell, Utensils, Heart, User, BarChart2 } from 'lucide-react'
import useAppStore from '../../stores/useAppStore'
import { T } from '../../lib/constants'

const TABS = [
  { id: 'home',      label: 'Home',      Icon: Home      },
  { id: 'treino',    label: 'Treino',    Icon: Dumbbell  },
  { id: 'nutri',     label: 'Nutrição',  Icon: Utensils  },
  { id: 'saude',     label: 'Saúde',     Icon: Heart     },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'perfil',    label: 'Perfil',    Icon: User      },
]

export default function BottomNav({ page, setPage }) {
  const activeWorkout = useAppStore(s => s.activeWorkout)

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%',
      transform: 'translateX(-50%)', width: '100%', maxWidth: 428,
      background: 'rgba(17,16,16,0.94)', backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)', borderTop: `1px solid ${T.border}`,
      display: 'flex', zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = page === id
        const isWorkout = id === 'treino'
        const hasActiveWorkout = isWorkout && activeWorkout

        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0', background: 'transparent',
              border: 'none', cursor: 'pointer', gap: 3,
              position: 'relative', minWidth: 0,
            }}
          >
            {/* Indicador ativo (pill acima do ícone) */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  style={{
                    position: 'absolute', top: 0,
                    width: 24, height: 2, borderRadius: 999,
                    background: T.gold,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Pulsação quando treino ativo */}
            {hasActiveWorkout && !active && (
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: 'absolute', top: 6, right: '50%',
                  transform: 'translateX(10px)',
                  width: 7, height: 7, borderRadius: '50%',
                  background: T.treino,
                }}
              />
            )}

            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Icon
                size={20}
                color={active ? T.gold : hasActiveWorkout ? T.treino : T.muted}
                strokeWidth={active ? 2.5 : 1.5}
              />
            </motion.div>

            <span style={{
              fontSize: 9, letterSpacing: 0.3, fontWeight: active ? 700 : 400,
              color: active ? T.gold : hasActiveWorkout ? T.treino : T.muted,
              whiteSpace: 'nowrap', overflow: 'hidden',
              maxWidth: '100%', textOverflow: 'ellipsis',
              paddingInline: 2,
            }}>
              {label}
            </span>

            {/* Dot de treino ativo na tab Treino */}
            {hasActiveWorkout && active && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  position: 'absolute', bottom: 4,
                  width: 4, height: 4, borderRadius: '50%',
                  background: T.treino,
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

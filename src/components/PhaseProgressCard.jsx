// PhaseProgressCard.jsx
// Atlas Fitness — Card premium de progressão de fase
// Uso: <PhaseProgressCard />
// Deps: framer-motion (já instalado no projeto)

import { motion } from 'framer-motion'
import { PROGRAM_SCHEDULE, USER_PROFILE, T } from '../lib/constants'

function calcProgress() {
  const today = new Date()
  const start = new Date(PROGRAM_SCHEDULE.inicio)
  const end   = new Date(PROGRAM_SCHEDULE.fim)
  const totalDays   = Math.ceil((end - start)   / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)))
  const remaining   = Math.max(0, totalDays - elapsedDays)
  const pct         = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
  const currentWeek = Math.min(PROGRAM_SCHEDULE.semanas, Math.ceil(elapsedDays / 7) || 1)
  return { totalDays, elapsedDays, remaining, pct, currentWeek }
}

function currentPhase(week) {
  for (const f of PROGRAM_SCHEDULE.fases) {
    const [a, b] = f.semanas.split('–').map(Number)
    if (week >= a && week <= b) return f
  }
  return PROGRAM_SCHEDULE.fases[PROGRAM_SCHEDULE.fases.length - 1]
}

export default function PhaseProgressCard() {
  const { pct, remaining, currentWeek } = calcProgress()
  const fase = currentPhase(currentWeek)

  const startFmt = new Date(PROGRAM_SCHEDULE.inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const endFmt   = new Date(PROGRAM_SCHEDULE.fim).toLocaleDateString('pt-BR',   { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, #1A1917 0%, #201E1B 100%)',
        border: `1px solid ${T.gold}33`,
        borderRadius: 16,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: `${T.gold}18`,
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Programa Ativo
          </div>
          <div style={{ fontSize: 17, color: T.text, fontWeight: 700, lineHeight: 1.2 }}>
            {PROGRAM_SCHEDULE.nome}
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {startFmt} → {endFmt} · {PROGRAM_SCHEDULE.semanas} semanas
          </div>
        </div>

        {/* Badge semana atual */}
        <div style={{
          background: `${T.gold}22`,
          border: `1px solid ${T.gold}55`,
          borderRadius: 10,
          padding: '6px 14px',
          textAlign: 'center',
          minWidth: 64,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.gold, lineHeight: 1 }}>
            {currentWeek}
          </div>
          <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
            semana
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: T.muted }}>Progresso</span>
          <span style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{
          height: 6, borderRadius: 999,
          background: '#2E2A24',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${T.gold}88, ${T.gold})`,
              boxShadow: `0 0 8px ${T.gold}66`,
            }}
          />
        </div>
      </div>

      {/* Linha de stats */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
        {[
          { label: 'Dias restantes', value: remaining },
          { label: 'Fase atual',     value: fase.nome },
          { label: 'Carga',          value: fase.carga },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1,
            borderLeft: i > 0 ? `1px solid ${T.border}` : 'none',
            paddingLeft: i > 0 ? 16 : 0,
            paddingRight: 16,
          }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Foco da fase */}
      <div style={{
        background: '#252220',
        borderRadius: 8,
        padding: '10px 14px',
        borderLeft: `3px solid ${T.gold}66`,
      }}>
        <div style={{ fontSize: 10, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
          Foco — Semanas {fase.semanas}
        </div>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          {fase.foco}
        </div>
      </div>

      {/* Revisão */}
      {fase.revisao && (
        <div style={{ fontSize: 11, color: T.muted, marginTop: 10, paddingLeft: 2 }}>
          🔍 Revisão: {fase.revisao}
        </div>
      )}
    </motion.div>
  )
}

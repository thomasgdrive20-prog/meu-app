import { motion } from 'framer-motion'
import useAppStore from '../stores/useAppStore'
import { DIET, SUPLS, T } from '../lib/constants'

export default function NutriPage() {
  const { mealDone, toggleMeal, suplDone, toggleSupl } = useAppStore()

  const totalKcal = DIET.reduce((s, m) => s + m.kcal, 0)
  const totalProt = DIET.reduce((s, m) => s + m.prot, 0)
  const eatenKcal = DIET.filter(m => mealDone.includes(m.id)).reduce((s, m) => s + m.kcal, 0)
  const eatenProt = DIET.filter(m => mealDone.includes(m.id)).reduce((s, m) => s + m.prot, 0)
  const pct = Math.min(100, Math.round((eatenKcal / totalKcal) * 100))

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          Nutrição
        </div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 2, letterSpacing: -0.5 }}>
          Plano do dia
        </div>
      </motion.div>

      {/* Resumo de macros */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 18, padding: '16px', marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.gold }}>{eatenKcal}</div>
            <div style={{ fontSize: 10, color: T.muted }}>kcal consumidas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.muted }}>{totalKcal}</div>
            <div style={{ fontSize: 10, color: T.muted }}>kcal meta</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.treino }}>{eatenProt}g</div>
            <div style={{ fontSize: 10, color: T.muted }}>proteína</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.text }}>{mealDone.length}/{DIET.length}</div>
            <div style={{ fontSize: 10, color: T.muted }}>refeições</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
            style={{
              height: '100%', borderRadius: 999,
              background: `linear-gradient(90deg, ${T.ok}88, ${T.ok})`,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: T.muted }}>0 kcal</span>
          <span style={{ fontSize: 10, color: T.gold, fontWeight: 700 }}>{pct}%</span>
          <span style={{ fontSize: 10, color: T.muted }}>{totalKcal} kcal</span>
        </div>
      </motion.div>

      {/* Macros detalhados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Calorias', value: '2.350', unit: 'kcal', color: T.gold },
          { label: 'Proteína', value: '215',   unit: 'g',    color: T.treino },
          { label: 'Carbs',    value: '220',   unit: 'g',    color: T.horm },
          { label: 'Gordura',  value: '65',    unit: 'g',    color: T.nutri },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: T.faint, borderRadius: 12, padding: '10px 8px', textAlign: 'center',
              border: `1px solid ${T.border}`,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 9, color: T.muted }}>{m.unit}</div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Refeições */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 12 }}>Refeições</div>
      {DIET.map((meal, idx) => {
        const done = mealDone.includes(meal.id)
        return (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            style={{
              background: done ? `${T.ok}08` : T.card,
              border: `1px solid ${done ? T.ok + '44' : T.border}`,
              borderRadius: 14, padding: '14px', marginBottom: 10,
              transition: 'all 0.3s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>{meal.time}</span>
                  <span style={{ fontSize: 14, color: done ? T.ok : T.text, fontWeight: 700 }}>{meal.label}</span>
                  {done && <span style={{ fontSize: 10, color: T.ok }}>✓</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted }}>
                  {meal.kcal} kcal · {meal.prot}g proteína
                </div>
                {!done && meal.options.map((opt, i) => (
                  <div key={i} style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginTop: 4 }}>· {opt}</div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleMeal(meal.id)}
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginLeft: 12,
                  border: `1px solid ${done ? T.ok + '55' : T.border}`,
                  background: done ? `${T.ok}22` : T.faint,
                  color: done ? T.ok : T.muted,
                  fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {done ? '✓' : '+'}
              </motion.button>
            </div>
          </motion.div>
        )
      })}

      {/* Suplementos */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, margin: '20px 0 12px' }}>
        Suplementos
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 400, marginLeft: 8 }}>
          {SUPLS.filter(s => suplDone.includes(s.id)).length}/{SUPLS.length} tomados
        </span>
      </div>
      {SUPLS.map((s, idx) => {
        const done = suplDone.includes(s.id)
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            style={{
              background: done ? `${T.ok}08` : T.faint,
              border: `1px solid ${done ? T.ok + '44' : T.border}`,
              borderRadius: 12, padding: '12px 14px', marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.3s',
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: done ? T.ok : s.color, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.dose} · {s.time}</div>
              {s.obs && <div style={{ fontSize: 10, color: T.muted, fontStyle: 'italic', marginTop: 2 }}>{s.obs}</div>}
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleSupl(s.id)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${done ? T.ok + '55' : T.border}`,
                background: done ? `${T.ok}22` : T.card,
                color: done ? T.ok : T.muted,
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {done ? '✓' : '+'}
            </motion.button>
          </motion.div>
        )
      })}

    </div>
  )
}

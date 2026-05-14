import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from 'recharts'
import useAppStore from '../stores/useAppStore'
import { T } from '../lib/constants'

// ── Tooltip customizado ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.value}{unit || p.unit || ''}
        </div>
      ))}
    </div>
  )
}

// ── Card base ─────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 18, padding: '16px', marginBottom: 14,
    ...style,
  }}>
    {children}
  </div>
)

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
    {children}
  </div>
)

// ── Formulário de medidas ─────────────────────────────────────────────────────
const METRIC_FIELDS = [
  { key: 'weight', label: 'Peso', unit: 'kg', color: T.gold },
  { key: 'bf',     label: '% Gordura', unit: '%', color: T.nutri },
  { key: 'waist',  label: 'Cintura', unit: 'cm', color: T.warn },
  { key: 'chest',  label: 'Peito', unit: 'cm', color: T.horm },
  { key: 'arm_l',  label: 'Braço E', unit: 'cm', color: T.treino },
  { key: 'arm_r',  label: 'Braço D', unit: 'cm', color: T.treino },
  { key: 'thigh_l',label: 'Coxa E', unit: 'cm', color: T.metrica },
  { key: 'thigh_r',label: 'Coxa D', unit: 'cm', color: T.metrica },
  { key: 'hip',    label: 'Quadril', unit: 'cm', color: T.muted },
]

function MetricForm({ onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ date: today, notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const hasData = METRIC_FIELDS.some(f => form[f.key])
    if (!hasData) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onCancel()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: 'hidden', marginBottom: 14 }}
    >
      <Card>
        <div style={{ fontSize: 13, color: T.gold, fontWeight: 700, marginBottom: 14 }}>
          Nova Medição
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: T.muted, display: 'block', marginBottom: 4 }}>Data</label>
          <input type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={{ width: '100%', padding: '10px', borderRadius: 10, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {METRIC_FIELDS.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 10, color: T.muted, display: 'block', marginBottom: 4 }}>
                {f.label} ({f.unit})
              </label>
              <input
                type="number" step="0.1"
                placeholder="—"
                value={form[f.key] || ''}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{
                  width: '100%', padding: '9px', borderRadius: 8,
                  background: T.faint, border: `1px solid ${T.border}`,
                  color: T.text, fontSize: 14, outline: 'none',
                  textAlign: 'center', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: T.muted, display: 'block', marginBottom: 4 }}>Notas</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Observações opcionais..."
            rows={2}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: T.faint, border: `1px solid ${T.border}`,
              color: T.text, fontSize: 13, outline: 'none', resize: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, fontWeight: 700,
              background: `${T.gold}22`, border: `1px solid ${T.gold}55`,
              color: T.gold, cursor: 'pointer', fontSize: 13,
            }}>
            {saving ? 'Salvando...' : '✓ Salvar'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onCancel}
            style={{
              padding: '12px 16px', borderRadius: 10,
              background: T.faint, border: `1px solid ${T.border}`,
              color: T.muted, cursor: 'pointer', fontSize: 13,
            }}>
            Cancelar
          </motion.button>
        </div>
      </Card>
    </motion.div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { weights, metrics, addMetric, updateMetric, deleteMetric, healthLogs, workoutLogs } = useAppStore()
  const [tab, setTab] = useState('peso')
  const [addingMetric, setAddingMetric] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // ── Dados de peso para gráfico ─────────────────────────────────────────────
  const weightChartData = [...weights].reverse().slice(-30).map(w => ({
    date: w.date?.slice(5),
    peso: parseFloat(w.weight),
  }))

  // ── Dados de medidas para gráfico ─────────────────────────────────────────
  const metricsChartData = [...metrics].reverse().slice(-12).map(m => ({
    date: m.date?.slice(5),
    cintura: m.waist ? parseFloat(m.waist) : undefined,
    braço: m.arm_l ? parseFloat(m.arm_l) : undefined,
    peito: m.chest ? parseFloat(m.chest) : undefined,
    coxa: m.thigh_l ? parseFloat(m.thigh_l) : undefined,
    gordura: m.bf ? parseFloat(m.bf) : undefined,
  }))

  // ── Biofeedback médio para radar ───────────────────────────────────────────
  const last7health = healthLogs.slice(0, 7)
  const avg = (key) => last7health.length
    ? (last7health.reduce((s, h) => s + (h[key] || 0), 0) / last7health.length).toFixed(1)
    : 0
  const radarData = [
    { label: 'Sono',      value: parseFloat(avg('sleep_quality')), fullMark: 5 },
    { label: 'Libido',    value: parseFloat(avg('libido')),        fullMark: 5 },
    { label: 'Humor',     value: parseFloat(avg('mood')),          fullMark: 5 },
    { label: 'Energia',   value: parseFloat(avg('energy')),        fullMark: 5 },
  ]

  // ── Variação de peso ───────────────────────────────────────────────────────
  const first = weights.length > 0 ? parseFloat(weights[weights.length - 1]?.weight) : null
  const last  = weights.length > 0 ? parseFloat(weights[0]?.weight) : null
  const totalDiff = first && last ? (last - first).toFixed(1) : null

  const tabs = [
    { id: 'peso',    label: '⚖️ Peso'    },
    { id: 'medidas', label: '📏 Medidas' },
    { id: 'saude',   label: '💓 Saúde'   },
    { id: 'treino',  label: '🏋️ Treino'  },
  ]

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          Analytics
        </div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 2, letterSpacing: -0.5 }}>
          Evolução corporal
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.92 }} onClick={() => setTab(t.id)}
            style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 20,
              background: tab === t.id ? `${T.gold}22` : T.faint,
              border: `1px solid ${tab === t.id ? T.gold + '66' : T.border}`,
              color: tab === t.id ? T.gold : T.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* ── PESO ──────────────────────────────────────────────────────────── */}
      {tab === 'peso' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Cards de resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Atual', value: last ? `${last}kg` : '—', color: T.gold },
              { label: 'Variação', value: totalDiff ? `${parseFloat(totalDiff) > 0 ? '+' : ''}${totalDiff}kg` : '—', color: totalDiff && parseFloat(totalDiff) < 0 ? T.ok : T.warn },
              { label: 'Registros', value: weights.length, color: T.horm },
            ].map((s, i) => (
              <div key={i} style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Gráfico de peso */}
          <Card>
            <SectionTitle>Evolução do peso (30 dias)</SectionTitle>
            {weightChartData.length < 2 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted, fontSize: 13 }}>
                Registre pelo menos 2 pesos para ver o gráfico
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weightChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.gold} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} />
                  <YAxis tick={{ fill: T.muted, fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip unit="kg" />} />
                  <Area type="monotone" dataKey="peso" stroke={T.gold} strokeWidth={2}
                    fill="url(#pesoGrad)" dot={false} activeDot={{ r: 5, fill: T.gold }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Histórico de pesos */}
          <Card>
            <SectionTitle>Histórico</SectionTitle>
            {weights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: T.muted, fontSize: 13 }}>
                Nenhum peso registrado ainda
              </div>
            ) : weights.slice(0, 14).map((w, i) => {
              const prev = weights[i + 1]
              const diff = prev ? (parseFloat(w.weight) - parseFloat(prev.weight)).toFixed(1) : null
              return (
                <div key={w.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: i < weights.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
                      {new Date(w.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    {w.notes && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{w.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>{parseFloat(w.weight).toFixed(1)}kg</div>
                    {diff !== null && (
                      <div style={{ fontSize: 11, color: parseFloat(diff) <= 0 ? T.ok : T.warn, fontWeight: 700 }}>
                        {parseFloat(diff) > 0 ? '+' : ''}{diff}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </Card>
        </motion.div>
      )}

      {/* ── MEDIDAS ───────────────────────────────────────────────────────── */}
      {tab === 'medidas' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setAddingMetric(a => !a)}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, marginBottom: 14,
              background: `${T.gold}22`, border: `1px solid ${T.gold}55`,
              color: T.gold, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
            {addingMetric ? '✕ Cancelar' : '+ Nova medição'}
          </motion.button>

          <AnimatePresence>
            {addingMetric && <MetricForm onSave={addMetric} onCancel={() => setAddingMetric(false)} />}
          </AnimatePresence>

          {/* Gráficos de medidas */}
          {metricsChartData.length >= 2 && (
            <>
              <Card>
                <SectionTitle>Cintura & Quadril (cm)</SectionTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={metricsChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit="cm" />} />
                    <Line type="monotone" dataKey="cintura" stroke={T.warn} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle>Braço & Peito (cm)</SectionTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={metricsChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit="cm" />} />
                    <Line type="monotone" dataKey="braço" stroke={T.treino} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="peito" stroke={T.horm} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle>% Gordura</SectionTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={metricsChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.nutri} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.nutri} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Area type="monotone" dataKey="gordura" stroke={T.nutri} strokeWidth={2}
                      fill="url(#bfGrad)" dot={false} activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}

          {/* Histórico de medidas */}
          <Card>
            <SectionTitle>Registros</SectionTitle>
            {metrics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: T.muted, fontSize: 13 }}>
                Nenhuma medição registrada ainda
              </div>
            ) : metrics.map((m, i) => (
              <div key={m.id} style={{
                padding: '12px 0',
                borderBottom: i < metrics.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>
                    {new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <button onClick={() => deleteMetric(m.id)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: T.muted, fontSize: 13, padding: '2px 6px',
                  }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {METRIC_FIELDS.filter(f => m[f.key]).map(f => (
                    <div key={f.key} style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11,
                      background: `${f.color}15`, border: `1px solid ${f.color}33`,
                      color: f.color, fontWeight: 600,
                    }}>
                      {f.label}: {m[f.key]}{f.unit}
                    </div>
                  ))}
                </div>
                {m.notes && <div style={{ fontSize: 11, color: T.muted, marginTop: 6, fontStyle: 'italic' }}>{m.notes}</div>}
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {/* ── SAÚDE ─────────────────────────────────────────────────────────── */}
      {tab === 'saude' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Radar de biofeedback médio */}
          <Card>
            <SectionTitle>Média 7 dias</SectionTitle>
            {last7health.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted, fontSize: 13 }}>
                Registre biofeedback na aba Saúde para ver o radar
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <PolarGrid stroke={T.border} />
                    <PolarAngleAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} />
                    <Radar name="Média" dataKey="value" stroke={T.gold} fill={`${T.gold}33`} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                  {radarData.map(d => (
                    <div key={d.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: T.gold }}>{d.value}</div>
                      <div style={{ fontSize: 9, color: T.muted }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Gráfico de saúde ao longo do tempo */}
          {healthLogs.length >= 3 && (
            <Card>
              <SectionTitle>Tendência de energia & sono</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={[...healthLogs].reverse().slice(-14).map(h => ({
                    date: h.date?.slice(5),
                    energia: h.energy,
                    sono: h.sleep_quality,
                  }))}
                  margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                  <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: T.muted, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="energia" stroke={T.gold} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="sono" stroke={T.horm} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 2, background: T.gold, borderRadius: 999 }} />
                  <span style={{ fontSize: 10, color: T.muted }}>Energia</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 2, background: T.horm, borderRadius: 999 }} />
                  <span style={{ fontSize: 10, color: T.muted }}>Sono</span>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* ── TREINO ────────────────────────────────────────────────────────── */}
      {tab === 'treino' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Resumo de volume */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Séries total', value: workoutLogs.length, color: T.treino },
              { label: 'Treinos (7d)', value: new Set(workoutLogs.filter(l => {
                const d = new Date(l.created_at)
                return (Date.now() - d.getTime()) < 7 * 24 * 3600 * 1000
              }).map(l => l.workout_date)).size, color: T.gold },
              { label: 'Exercícios únicos', value: new Set(workoutLogs.map(l => l.exercise_name)).size, color: T.horm },
            ].map((s, i) => (
              <div key={i} style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Últimos exercícios */}
          <Card>
            <SectionTitle>Exercícios recentes</SectionTitle>
            {workoutLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: T.muted, fontSize: 13 }}>
                Nenhum treino registrado ainda
              </div>
            ) : (
              (() => {
                const grouped = {}
                workoutLogs.slice(0, 40).forEach(l => {
                  if (!grouped[l.exercise_name]) grouped[l.exercise_name] = []
                  grouped[l.exercise_name].push(l)
                })
                return Object.entries(grouped).slice(0, 8).map(([name, logs], i) => {
                  const best = logs.reduce((b, l) => l.weight > b.weight ? l : b, logs[0])
                  return (
                    <div key={name} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i < Object.keys(grouped).length - 1 ? `1px solid ${T.border}` : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{logs[0].muscle_group} · {logs.length} séries</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.treino }}>{best.weight}kg</div>
                        <div style={{ fontSize: 10, color: T.muted }}>× {best.reps} reps</div>
                      </div>
                    </div>
                  )
                })
              })()
            )}
          </Card>
        </motion.div>
      )}

    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LAB_REFS, PROTOCOL_COMPOUNDS, T } from '../lib/constants'

const todayStr = () => new Date().toISOString().slice(0, 10)

function StarRating({ value, onChange, color = T.gold }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          width: 36, height: 36, borderRadius: 8, border: 'none',
          background: value >= n ? `${color}33` : T.faint,
          fontSize: 18, cursor: 'pointer',
        }}>
          {value >= n ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

function ExamCard({ exam }) {
  const ref    = LAB_REFS[exam.name]
  const num    = parseFloat(exam.value)
  let status   = 'info'
  if (ref) {
    if (ref.alert === 'high' && num > ref.max) status = 'alert'
    else if (ref.alert === 'low' && num < ref.min) status = 'alert'
    else if (ref.alert === 'high' && num < ref.min) status = 'warn'
    else status = 'ok'
  }
  const color = { ok: T.ok, warn: T.warn, alert: T.alert, info: T.horm }[status]
  const label = { ok: 'Normal', warn: 'Atenção', alert: 'Alerta', info: 'Info' }[status]

  return (
    <div style={{
      background: T.faint, border: `1px solid ${color}33`,
      borderRadius: 12, padding: '14px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>{exam.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{exam.date}</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${color}22`, border: `1px solid ${color}44`, color }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color }}>{exam.value}</span>
        <span style={{ fontSize: 12, color: T.muted }}>{exam.unit}</span>
      </div>
      {ref && (
        <>
          <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%', borderRadius: 999, background: color,
              width: `${Math.min(100, (num / ref.max) * 100)}%`,
              transition: 'width 0.6s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: T.muted }}>Ref: {ref.min === 0 ? '<' : `${ref.min}–`}{ref.max} {ref.unit}</div>
        </>
      )}
    </div>
  )
}

export default function SaudePage({ session }) {
  const uid = session.user.id
  const [tab, setTab]         = useState('hoje')
  const [todayLog, setTodayLog] = useState(null)
  const [form, setForm]       = useState({ sleep_quality: 0, libido: 0, mood: 0, energy: 0, notes: '' })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [history, setHistory] = useState([])
  const [exams, setExams]     = useState([])
  const [newExam, setNewExam] = useState({ name: '', value: '', unit: '', date: todayStr() })
  const [addingExam, setAddingExam] = useState(false)

  useEffect(() => {
    loadTodayLog()
    loadHistory()
    loadExams()
  }, [])

  const loadTodayLog = async () => {
    const { data } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', uid)
      .gte('created_at', todayStr())
      .limit(1)
      .single()
    if (data) { setTodayLog(data); setForm(data) }
  }

  const loadHistory = async () => {
    const { data } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(14)
    if (data) setHistory(data)
  }

  const loadExams = async () => {
    const { data } = await supabase
      .from('exames_v2')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (data) setExams(data)
  }

  const saveLog = async () => {
    setSaving(true)
    if (todayLog) {
      await supabase.from('health_logs').update(form).eq('id', todayLog.id)
    } else {
      await supabase.from('health_logs').insert({ user_id: uid, ...form })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadTodayLog()
    loadHistory()
  }

  const saveExam = async () => {
    if (!newExam.name || !newExam.value) return
    const ref = LAB_REFS[newExam.name]
    await supabase.from('exames_v2').insert({
      user_id: uid,
      name: newExam.name,
      value: parseFloat(newExam.value),
      unit: newExam.unit || ref?.unit || '',
      date: newExam.date,
    })
    setNewExam({ name: '', value: '', unit: '', date: todayStr() })
    setAddingExam(false)
    loadExams()
  }

  const metrics = [
    { key: 'sleep_quality', label: 'Sono',       emoji: '😴', color: T.horm },
    { key: 'libido',        label: 'Libido',      emoji: '🔥', color: T.nutri },
    { key: 'mood',          label: 'Humor',       emoji: '😊', color: T.treino },
    { key: 'energy',        label: 'Disposição',  emoji: '⚡', color: T.gold },
  ]

  const tabs = [
    { id: 'hoje',     label: 'Hoje'      },
    { id: 'historico',label: 'Histórico' },
    { id: 'exames',   label: 'Exames'    },
    { id: 'protocolo',label: 'Protocolo' },
  ]

  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Saúde</div>
        <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 2 }}>Biofeedback</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flexShrink: 0, padding: '7px 16px', borderRadius: 20,
            background: tab === t.id ? `${T.horm}22` : T.faint,
            border: `1px solid ${tab === t.id ? T.horm + '66' : T.border}`,
            color: tab === t.id ? T.horm : T.muted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* HOJE */}
      {tab === 'hoje' && (
        <div>
          {metrics.map(m => (
            <div key={m.key} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>{m.emoji} {m.label}</span>
                <span style={{ fontSize: 13, color: m.color, fontWeight: 700 }}>
                  {form[m.key] > 0 ? `${form[m.key]}/5` : '—'}
                </span>
              </div>
              <StarRating value={form[m.key]} onChange={v => setForm(f => ({ ...f, [m.key]: v }))} color={m.color} />
            </div>
          ))}

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 8 }}>📝 Notas do dia</div>
            <textarea
              value={form.notes || ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Como você está se sentindo hoje?"
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: T.faint, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 13, outline: 'none', resize: 'none',
                boxSizing: 'border-box', fontFamily: "'Lato', sans-serif",
              }}
            />
          </div>

          <button onClick={saveLog} disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: saved ? `${T.ok}22` : `${T.gold}22`,
            border: `1px solid ${saved ? T.ok + '66' : T.gold + '66'}`,
            color: saved ? T.ok : T.gold,
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar registro'}
          </button>
        </div>
      )}

      {/* HISTÓRICO */}
      {tab === 'historico' && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.muted }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
              <div>Nenhum registro ainda</div>
            </div>
          ) : history.map((log, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginBottom: 10 }}>
                {new Date(log.created_at).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'Sono',      val: log.sleep_quality, color: T.horm },
                  { label: 'Libido',    val: log.libido,        color: T.nutri },
                  { label: 'Humor',     val: log.mood,          color: T.treino },
                  { label: 'Energia',   val: log.energy,        color: T.gold },
                ].map((s, j) => (
                  <div key={j} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val || '—'}</div>
                    <div style={{ fontSize: 9, color: T.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {log.notes && <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontStyle: 'italic' }}>{log.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* EXAMES */}
      {tab === 'exames' && (
        <div>
          <button onClick={() => setAddingExam(a => !a)} style={{
            width: '100%', padding: '12px', borderRadius: 12, marginBottom: 16,
            background: `${T.horm}22`, border: `1px solid ${T.horm}55`,
            color: T.horm, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            {addingExam ? '✕ Cancelar' : '+ Adicionar Exame'}
          </button>

          {addingExam && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: T.gold, fontWeight: 700, marginBottom: 14 }}>Novo Exame</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>Exame</label>
                <select value={newExam.name} onChange={e => setNewExam(n => ({ ...n, name: e.target.value, unit: LAB_REFS[e.target.value]?.unit || '' }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.faint, border: `1px solid ${T.border}`, color: newExam.name ? T.text : T.muted, fontSize: 13, outline: 'none' }}>
                  <option value="">Selecione...</option>
                  {Object.keys(LAB_REFS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>Resultado</label>
                  <input type="number" step="0.1" value={newExam.value} onChange={e => setNewExam(n => ({ ...n, value: e.target.value }))}
                    placeholder="Ex: 48"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>Data</label>
                  <input type="date" value={newExam.date} onChange={e => setNewExam(n => ({ ...n, date: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button onClick={saveExam} style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: `${T.ok}22`, border: `1px solid ${T.ok}55`,
                color: T.ok, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                ✓ Salvar exame
              </button>
            </div>
          )}

          {exams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.muted }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🧪</div>
              <div>Nenhum exame registrado</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>Adicione seus resultados acima</div>
            </div>
          ) : exams.map((e, i) => <ExamCard key={i} exam={e} />)}
        </div>
      )}

      {/* PROTOCOLO */}
      {tab === 'protocolo' && (
        <div>
          {PROTOCOL_COMPOUNDS.map(c => (
            <div key={c.id} style={{
              background: T.faint, border: `1px solid ${c.color}33`,
              borderRadius: 14, padding: '14px', marginBottom: 12,
            }}>
              <div style={{ fontSize: 15, color: c.color, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: T.muted }}>
                {c.dose} {c.unit} · {c.schedule} · {c.weekly}/semana
              </div>
              {c.obs && (
                <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 8, fontStyle: 'italic' }}>
                  ⚠ {c.obs}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

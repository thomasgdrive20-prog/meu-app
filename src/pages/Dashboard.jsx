import { useState, useRef } from 'react'
import { T, USER_PROFILE, DIET, PROTOCOL_COMPOUNDS, SUPLS } from '../lib/constants'
import PhaseProgressCard from '../components/PhaseProgressCard'
import WorkoutManager from '../components/WorkoutManager'
import HealthDashboard from '../components/HealthDashboard'

// ─── helpers de localStorage por data ────────────────────────────────────────
const todayKey = (prefix) => {
  const d = new Date()
  return `${prefix}_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`
}
const loadLocal = (key, def) => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(def)) } catch { return def } }
const saveLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function Dashboard({ section, setSection }) {
  const sections = [
    { id: 'treino', label: '🏋️ Treino'  },
    { id: 'nutri',  label: '🥗 Nutrição' },
    { id: 'saude',  label: '🩸 Saúde'    },
    { id: 'perfil', label: '👤 Perfil'   },
  ]

  return (
    <div style={{ padding: '24px 20px', maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
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

      {/* Card de progresso */}
      <div style={{ marginBottom: 24 }}>
        <PhaseProgressCard />
      </div>

      {/* Stats rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Peso',    value: USER_PROFILE.weight + 'kg', color: T.text },
          { label: 'Altura',  value: USER_PROFILE.height + 'm',  color: T.text },
          { label: 'Meta BF', value: USER_PROFILE.bfMeta + '%',  color: T.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Navegação */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: '8px 18px', borderRadius: 20, whiteSpace: 'nowrap',
            background: section === s.id ? `${T.gold}22` : T.faint,
            border: `1px solid ${section === s.id ? T.gold + '66' : T.border}`,
            color: section === s.id ? T.gold : T.muted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{s.label}</button>
        ))}
      </div>

      {section === 'treino' && <WorkoutManager />}
      {section === 'saude'  && <HealthDashboard />}
      {section === 'nutri'  && <NutriSection />}
      {section === 'perfil' && <PerfilSection />}
    </div>
  )
}

// ─── NUTRIÇÃO ─────────────────────────────────────────────────────────────────
function NutriSection() {
  const [eaten, setEaten] = useState(() => loadLocal(todayKey('atlas_eaten'), []))
  const [supDone, setSupDone] = useState(() => loadLocal(todayKey('atlas_sups'), []))

  const toggleEaten = (id) => {
    setEaten(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      saveLocal(todayKey('atlas_eaten'), next)
      return next
    })
  }

  const toggleSup = (id) => {
    setSupDone(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      saveLocal(todayKey('atlas_sups'), next)
      return next
    })
  }

  const totalRefeicoes = DIET.length
  const totalComidas   = eaten.length
  const totalSupls     = SUPLS.length
  const totalSupsDone  = supDone.length

  return (
    <div>
      {/* Resumo do dia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: totalComidas === totalRefeicoes ? T.ok : T.gold }}>
            {totalComidas}/{totalRefeicoes}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Refeições hoje</div>
          <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ height: '100%', borderRadius: 999, background: T.ok, width: `${(totalComidas / totalRefeicoes) * 100}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: totalSupsDone === totalSupls ? T.ok : T.horm }}>
            {totalSupsDone}/{totalSupls}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Suplementos hoje</div>
          <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ height: '100%', borderRadius: 999, background: T.horm, width: `${(totalSupsDone / totalSupls) * 100}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Macros */}
      <div style={{ background: T.faint, border: `1px solid ${T.gold}33`, borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-around' }}>
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

      {/* Refeições */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 12 }}>Refeições do dia</div>
      {DIET.map(meal => {
        const done = eaten.includes(meal.id)
        return (
          <div key={meal.id} style={{
            background: done ? `${T.ok}08` : T.card,
            border: `1px solid ${done ? T.ok + '44' : T.border}`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 10,
            transition: 'all 0.3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>{meal.time}</span>
                <span style={{ fontSize: 13, color: done ? T.ok : T.text, fontWeight: 700, marginLeft: 10 }}>{meal.label}</span>
                {done && <span style={{ fontSize: 10, color: T.ok, marginLeft: 8, fontWeight: 700 }}>✓ Concluída</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: T.muted }}>{meal.kcal} kcal · {meal.prot}g</span>
                <button
                  onClick={() => toggleEaten(meal.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', border: 'none',
                    background: done ? `${T.ok}33` : `${T.muted}22`,
                    color: done ? T.ok : T.muted,
                    transition: 'all 0.2s',
                  }}
                >
                  {done ? '✓ Comi' : 'Marcar'}
                </button>
              </div>
            </div>
            {meal.options.map((opt, i) => (
              <div key={i} style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>· {opt}</div>
            ))}
          </div>
        )
      })}

      {/* Suplementos */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, margin: '20px 0 12px' }}>Suplementos do dia</div>
      {SUPLS.map(s => {
        const done = supDone.includes(s.id)
        return (
          <div key={s.id} style={{
            background: done ? `${T.ok}08` : T.faint,
            border: `1px solid ${done ? T.ok + '44' : T.border}`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: 'all 0.3s',
          }}>
            <div>
              <span style={{ fontSize: 13, color: done ? T.ok : s.color, fontWeight: 600 }}>{s.name}</span>
              <span style={{ fontSize: 11, color: T.muted, marginLeft: 10 }}>{s.dose} · {s.time}</span>
            </div>
            <button
              onClick={() => toggleSup(s.id)}
              style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', border: 'none',
                background: done ? `${T.ok}33` : `${T.muted}22`,
                color: done ? T.ok : T.muted,
                transition: 'all 0.2s',
              }}
            >
              {done ? '✓ Tomei' : 'Marcar'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function PerfilSection() {
  const fileRef = useRef()
  const [photo, setPhoto]   = useState(() => localStorage.getItem('atlas_photo') || null)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(() => loadLocal('atlas_profile', {
    name:    USER_PROFILE.name,
    age:     USER_PROFILE.age,
    weight:  USER_PROFILE.weight,
    height:  USER_PROFILE.height,
    phase:   USER_PROFILE.phase,
    phaseEnd: USER_PROFILE.phaseEnd,
    bfMeta:  USER_PROFILE.bfMeta,
    objetivo: USER_PROFILE.objetivo,
  }))
  const [form, setForm] = useState(profile)

  // Check de protocolo por dia
  const [protoDone, setProtoDone] = useState(() => loadLocal(todayKey('atlas_proto'), []))
  const toggleProto = (id) => {
    setProtoDone(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      saveLocal(todayKey('atlas_proto'), next)
      return next
    })
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      localStorage.setItem('atlas_photo', ev.target.result)
      setPhoto(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    saveLocal('atlas_profile', form)
    setProfile(form)
    setEditing(false)
  }

  const fields = [
    { label: 'Nome',        key: 'name',     type: 'text'   },
    { label: 'Idade',       key: 'age',      type: 'number' },
    { label: 'Peso (kg)',   key: 'weight',   type: 'number' },
    { label: 'Altura (m)',  key: 'height',   type: 'text'   },
    { label: 'Fase',        key: 'phase',    type: 'text'   },
    { label: 'Fim da fase', key: 'phaseEnd', type: 'text'   },
    { label: 'Meta BF%',    key: 'bfMeta',   type: 'number' },
  ]

  return (
    <div>
      {/* Foto + nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: photo ? 'transparent' : T.faint,
            border: `2px solid ${T.gold}55`,
            overflow: 'hidden', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {photo
            ? <img src={photo} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 28 }}>👤</span>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        <div>
          <div style={{ fontSize: 18, color: T.text, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{profile.age} anos · {profile.weight}kg · {profile.height}m</div>
          <div style={{ fontSize: 11, color: T.gold, marginTop: 4 }}>{profile.phase}</div>
          <button
            onClick={() => { setForm(profile); setEditing(true) }}
            style={{ marginTop: 8, padding: '5px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: `${T.gold}22`, border: `1px solid ${T.gold}44`, color: T.gold }}
          >
            ✏️ Editar perfil
          </button>
        </div>
      </div>

      {/* Modal de edição */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000000cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, width: '95%', maxWidth: 460 }}>
            <div style={{ fontSize: 15, color: T.gold, fontWeight: 700, marginBottom: 20 }}>✏️ Editar Perfil</div>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: T.faint, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '11px', borderRadius: 9, background: `${T.gold}22`, border: `1px solid ${T.gold}55`, color: T.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                💾 Salvar
              </button>
              <button onClick={() => setEditing(false)} style={{ padding: '11px 16px', borderRadius: 9, background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dados do perfil */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        {fields.map((f, i) => (
          <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < fields.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 12, color: T.muted }}>{f.label}</span>
            <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{profile[f.key]}</span>
          </div>
        ))}
      </div>

      {/* Protocolo com check */}
      <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 12 }}>Protocolo hormonal</div>
      {PROTOCOL_COMPOUNDS.map(c => {
        const done = protoDone.includes(c.id)
        return (
          <div key={c.id} style={{
            background: done ? `${T.ok}08` : T.faint,
            border: `1px solid ${done ? T.ok + '44' : c.color + '33'}`,
            borderRadius: 12, padding: '12px 16px', marginBottom: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: 'all 0.3s',
          }}>
            <div>
              <div style={{ fontSize: 13, color: done ? T.ok : c.color, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.dose} {c.unit} · {c.schedule} · {c.weekly}/sem</div>
              {c.obs && <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontStyle: 'italic' }}>{c.obs}</div>}
            </div>
            <button
              onClick={() => toggleProto(c.id)}
              style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', border: 'none', flexShrink: 0, marginLeft: 12,
                background: done ? `${T.ok}33` : `${T.muted}22`,
                color: done ? T.ok : T.muted,
                transition: 'all 0.2s',
              }}
            >
              {done ? '✓ Tomei' : 'Marcar'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { USER_PROFILE, SUPLS, PROTOCOL_COMPOUNDS, T } from '../lib/constants'
import { LogOut, Camera, Edit2, Check, X } from 'lucide-react'

export default function PerfilPage({ session, handleLogout }) {
  const uid     = session.user.id
  const fileRef = useRef()
  const [photo, setPhoto]     = useState(session.user.user_metadata?.avatar_url || null)
  const [tab, setTab]         = useState('perfil')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [profile, setProfile] = useState({
    name:     USER_PROFILE.name,
    age:      USER_PROFILE.age,
    weight:   USER_PROFILE.weight,
    height:   USER_PROFILE.height,
    phase:    USER_PROFILE.phase,
    phaseEnd: USER_PROFILE.phaseEnd,
    bfMeta:   USER_PROFILE.bfMeta,
    objetivo: USER_PROFILE.objetivo,
  })
  const [form, setForm] = useState(profile)

  // Protocolo check por dia
  const todayStr = () => new Date().toISOString().slice(0, 10)
  const [protoDone, setProtoDone] = useState([])

  useEffect(() => {
    loadProfile()
    loadProtoChecks()
  }, [])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', uid)
      .single()
    if (data) {
      const p = {
        name:     data.name     || USER_PROFILE.name,
        age:      data.age      || USER_PROFILE.age,
        weight:   data.weight   || USER_PROFILE.weight,
        height:   data.height   || USER_PROFILE.height,
        phase:    data.phase    || USER_PROFILE.phase,
        phaseEnd: data.phase_end || USER_PROFILE.phaseEnd,
        bfMeta:   data.bf_meta  || USER_PROFILE.bfMeta,
        objetivo: data.objetivo || USER_PROFILE.objetivo,
      }
      setProfile(p)
      setForm(p)
    }
  }

  const loadProtoChecks = async () => {
    const { data } = await supabase
      .from('supl_logs')
      .select('supl_id')
      .eq('user_id', uid)
      .gte('created_at', todayStr())
    if (data) setProtoDone(data.map(d => d.supl_id))
  }

  const saveProfile = async () => {
    setSaving(true)
    const upsertData = {
      user_id:   uid,
      name:      form.name,
      age:       form.age,
      weight:    form.weight,
      height:    form.height,
      phase:     form.phase,
      phase_end: form.phaseEnd,
      bf_meta:   form.bfMeta,
      objetivo:  form.objetivo,
    }
    await supabase.from('user_profile').upsert(upsertData, { onConflict: 'user_id' })
    setProfile(form)
    setEditing(false)
    setSaving(false)
  }

  const toggleProto = async (id) => {
    if (protoDone.includes(id)) {
      await supabase.from('supl_logs').delete().eq('user_id', uid).eq('supl_id', id).gte('created_at', todayStr())
      setProtoDone(prev => prev.filter(x => x !== id))
    } else {
      await supabase.from('supl_logs').insert({ user_id: uid, supl_id: id })
      setProtoDone(prev => [...prev, id])
    }
  }

  const tabs = [
    { id: 'perfil',    label: 'Perfil'    },
    { id: 'protocolo', label: 'Protocolo' },
    { id: 'supls',     label: 'Suplementos' },
  ]

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
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>

      {/* Header com foto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: T.faint, border: `2px solid ${T.gold}55`,
              overflow: 'hidden', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {photo
              ? <img src={photo} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 28 }}>👤</span>
            }
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 22, height: 22, borderRadius: '50%',
            background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }} onClick={() => fileRef.current?.click()}>
            <Camera size={12} color="#111010" />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => setPhoto(ev.target.result)
            reader.readAsDataURL(file)
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, color: T.text, fontWeight: 800 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {profile.age} anos · {profile.weight}kg · {profile.height}m
          </div>
          <div style={{ fontSize: 11, color: T.gold, marginTop: 3 }}>{profile.phase}</div>
        </div>
        <button onClick={handleLogout} style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${T.alert}11`, border: `1px solid ${T.alert}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LogOut size={16} color={T.alert} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px', borderRadius: 10,
            background: tab === t.id ? `${T.gold}22` : T.faint,
            border: `1px solid ${tab === t.id ? T.gold + '66' : T.border}`,
            color: tab === t.id ? T.gold : T.muted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* PERFIL */}
      {tab === 'perfil' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>Dados pessoais</div>
            <button onClick={() => { setForm(profile); setEditing(true) }} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: `${T.gold}22`, border: `1px solid ${T.gold}44`, color: T.gold,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Edit2 size={12} /> Editar
            </button>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '4px 16px', marginBottom: 20 }}>
            {fields.map((f, i) => (
              <div key={f.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < fields.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: T.muted }}>{f.label}</span>
                <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{profile[f.key]}</span>
              </div>
            ))}
          </div>

          {/* Info da sessão */}
          <div style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: T.muted }}>Conta Google</div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginTop: 4 }}>
              {session.user.email}
            </div>
          </div>
        </div>
      )}

      {/* PROTOCOLO */}
      {tab === 'protocolo' && (
        <div>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>
            Protocolo hormonal
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 400, marginLeft: 8 }}>
              {protoDone.length} aplicados hoje
            </span>
          </div>
          {PROTOCOL_COMPOUNDS.map(c => {
            const done = protoDone.includes(c.id)
            return (
              <div key={c.id} style={{
                background: done ? `${T.ok}08` : T.faint,
                border: `1px solid ${done ? T.ok + '44' : c.color + '33'}`,
                borderRadius: 14, padding: '14px', marginBottom: 10,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: done ? T.ok : c.color, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                      {c.dose} {c.unit} · {c.schedule} · {c.weekly}/semana
                    </div>
                    {c.obs && (
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {c.obs}
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleProto(c.id)} style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginLeft: 12,
                    border: `1px solid ${done ? T.ok + '55' : T.border}`,
                    background: done ? `${T.ok}22` : T.card,
                    color: done ? T.ok : T.muted,
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done ? '✓' : '+'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SUPLEMENTOS */}
      {tab === 'supls' && (
        <div>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>
            Suplementação ativa
          </div>
          {SUPLS.map(s => {
            const done = protoDone.includes(s.id)
            return (
              <div key={s.id} style={{
                background: done ? `${T.ok}08` : T.faint,
                border: `1px solid ${done ? T.ok + '44' : T.border}`,
                borderRadius: 14, padding: '14px', marginBottom: 10,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: done ? T.ok : s.color, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{s.dose} · {s.time}</div>
                    {s.obs && <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontStyle: 'italic' }}>{s.obs}</div>}
                  </div>
                  <button onClick={() => toggleProto(s.id)} style={{
                    width: 40, height: 40, borderRadius: 10,
                    border: `1px solid ${done ? T.ok + '55' : T.border}`,
                    background: done ? `${T.ok}22` : T.card,
                    color: done ? T.ok : T.muted,
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done ? '✓' : '+'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de edição */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000000dd', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{
            background: T.card, borderRadius: '20px 20px 0 0',
            padding: '24px 20px', width: '100%', maxWidth: 428,
            maxHeight: '85vh', overflowY: 'auto',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, color: T.gold, fontWeight: 700 }}>Editar Perfil</div>
              <button onClick={() => setEditing(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color={T.muted} />
              </button>
            </div>

            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 5 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: T.faint, border: `1px solid ${T.border}`,
                    color: T.text, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            <button onClick={saveProfile} disabled={saving} style={{
              width: '100%', padding: '14px', borderRadius: 12, marginTop: 8,
              background: `${T.gold}22`, border: `1px solid ${T.gold}66`,
              color: T.gold, fontSize: 14, fontWeight: 800, cursor: 'pointer',
            }}>
              {saving ? 'Salvando...' : '💾 Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

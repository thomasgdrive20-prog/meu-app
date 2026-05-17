import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Camera, Edit2, X } from 'lucide-react'
import useAppStore from '../stores/useAppStore'
import { supabase } from '../lib/supabaseClient'
import { USER_PROFILE, SUPLS, PROTOCOL_COMPOUNDS, T } from '../lib/constants'

export default function PerfilPage({ session, handleLogout }) {
  const uid = session?.user?.id
  const fileRef = useRef()
  const { suplDone, toggleSupl, userProfile, saveProfile, loadProfile } = useAppStore()

  const [tab, setTab] = useState('perfil')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoSaving, setPhotoSaving] = useState(false)
  const [photo, setPhoto] = useState(session?.user?.user_metadata?.avatar_url || null)

  // Monta o perfil com dados do banco ou fallback dos constants
  const profile = userProfile ? {
    name:     userProfile.name     || USER_PROFILE.name,
    age:      userProfile.age      || USER_PROFILE.age,
    weight:   userProfile.weight   || USER_PROFILE.weight,
    height:   userProfile.height   || USER_PROFILE.height,
    phase:    userProfile.phase    || USER_PROFILE.phase,
    phaseEnd: userProfile.phase_end || USER_PROFILE.phaseEnd,
    bfMeta:   userProfile.bf_meta  || USER_PROFILE.bfMeta,
    objetivo: userProfile.objetivo || USER_PROFILE.objetivo,
  } : {
    name:     USER_PROFILE.name,
    age:      USER_PROFILE.age,
    weight:   USER_PROFILE.weight,
    height:   USER_PROFILE.height,
    phase:    USER_PROFILE.phase,
    phaseEnd: USER_PROFILE.phaseEnd,
    bfMeta:   USER_PROFILE.bfMeta,
    objetivo: USER_PROFILE.objetivo,
  }

  const [form, setForm] = useState(profile)

  // Atualiza form quando perfil carrega do banco
  useEffect(() => {
    if (userProfile) {
      setForm({
        name:     userProfile.name     || USER_PROFILE.name,
        age:      userProfile.age      || USER_PROFILE.age,
        weight:   userProfile.weight   || USER_PROFILE.weight,
        height:   userProfile.height   || USER_PROFILE.height,
        phase:    userProfile.phase    || USER_PROFILE.phase,
        phaseEnd: userProfile.phase_end || USER_PROFILE.phaseEnd,
        bfMeta:   userProfile.bf_meta  || USER_PROFILE.bfMeta,
        objetivo: userProfile.objetivo || USER_PROFILE.objetivo,
      })
    }
  }, [userProfile])

  const handleSaveProfile = async () => {
    setSaving(true)
    await saveProfile(form)
    setEditing(false)
    setSaving(false)
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoSaving(true)

    // Preview imediato
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)

    // Upload para Supabase Storage
    const ext = file.name.split('.').pop()
    const path = `${uid}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('photos').upload(path, file, { upsert: true })

    if (!error) {
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      if (urlData?.publicUrl) {
        await supabase.auth.updateUser({
          data: { avatar_url: urlData.publicUrl }
        })
        setPhoto(urlData.publicUrl)
      }
    }
    setPhotoSaving(false)
  }

  const daysLeft = (() => {
    if (!profile.phaseEnd) return null
    const end = new Date(profile.phaseEnd)
    const diff = Math.ceil((end - new Date()) / 86400000)
    return diff > 0 ? diff : 0
  })()

  const tabs = [
    { id: 'perfil',    label: 'Perfil'      },
    { id: 'protocolo', label: 'Protocolo'   },
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}
      >
        {/* Foto */}
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
            {photoSaving && (
              <div style={{
                position: 'absolute', inset: 0, background: '#00000080',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 20, height: 20, border: `2px solid ${T.gold}`,
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 22, height: 22, borderRadius: '50%',
              background: T.gold, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Camera size={12} color="#111010" />
          </div>
        </div>

        <input
          ref={fileRef} type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, color: T.text, fontWeight: 800 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {profile.age} anos · {profile.weight}kg · {profile.height}m
          </div>
          <div style={{ fontSize: 11, color: T.gold, marginTop: 3 }}>{profile.phase}</div>
          {daysLeft !== null && (
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
              {daysLeft} dias restantes na fase
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${T.alert}11`, border: `1px solid ${T.alert}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} color={T.alert} />
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.92 }} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px', borderRadius: 10,
              background: tab === t.id ? `${T.gold}22` : T.faint,
              border: `1px solid ${tab === t.id ? T.gold + '66' : T.border}`,
              color: tab === t.id ? T.gold : T.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* PERFIL */}
      {tab === 'perfil' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>Dados pessoais</div>
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => { setForm(profile); setEditing(true) }}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', background: `${T.gold}22`, border: `1px solid ${T.gold}44`,
                color: T.gold, display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <Edit2 size={12} /> Editar
            </motion.button>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '4px 16px', marginBottom: 16 }}>
            {fields.map((f, i) => (
              <div key={f.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < fields.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: T.muted }}>{f.label}</span>
                <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{profile[f.key] || '—'}</span>
              </div>
            ))}
          </div>

          {/* Barra da fase */}
          {daysLeft !== null && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>Progresso da fase</span>
                <span style={{ fontSize: 11, color: T.gold }}>{daysLeft}d restantes</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: T.border, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, 100 - (daysLeft / 91) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${T.gold}, ${T.treino})` }}
                />
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                Meta: {profile.bfMeta}% BF · Fim em {profile.phaseEnd}
              </div>
            </div>
          )}

          <div style={{ background: T.faint, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: T.muted }}>Conta Google</div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginTop: 4 }}>{session?.user?.email}</div>
          </div>
        </motion.div>
      )}

      {/* PROTOCOLO */}
      {tab === 'protocolo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>
            Protocolo hormonal
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 400, marginLeft: 8 }}>
              {PROTOCOL_COMPOUNDS.filter(c => suplDone.includes(c.id)).length} aplicados hoje
            </span>
          </div>
          {PROTOCOL_COMPOUNDS.map((c, i) => {
            const done = suplDone.includes(c.id)
            return (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: done ? `${T.ok}08` : T.faint,
                  border: `1px solid ${done ? T.ok + '44' : c.color + '33'}`,
                  borderRadius: 14, padding: '14px', marginBottom: 10,
                  transition: 'all 0.3s',
                }}
              >
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
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSupl(c.id)}
                    style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginLeft: 12,
                      border: `1px solid ${done ? T.ok + '55' : T.border}`,
                      background: done ? `${T.ok}22` : T.card,
                      color: done ? T.ok : T.muted, fontSize: 18, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {done ? '✓' : '+'}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* SUPLEMENTOS */}
      {tab === 'supls' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>
            Suplementação ativa
          </div>
          {SUPLS.map((s, i) => {
            const done = suplDone.includes(s.id)
            return (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: done ? `${T.ok}08` : T.faint,
                  border: `1px solid ${done ? T.ok + '44' : T.border}`,
                  borderRadius: 14, padding: '14px', marginBottom: 10,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: done ? T.ok : s.color, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{s.dose} · {s.time}</div>
                    {s.obs && <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontStyle: 'italic' }}>{s.obs}</div>}
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleSupl(s.id)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: `1px solid ${done ? T.ok + '55' : T.border}`,
                      background: done ? `${T.ok}22` : T.card,
                      color: done ? T.ok : T.muted, fontSize: 18, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {done ? '✓' : '+'}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal de edição */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: '#000000dd', display: 'flex',
              alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              style={{
                background: T.card, borderRadius: '20px 20px 0 0',
                padding: '24px 20px', width: '100%', maxWidth: 428,
                maxHeight: '85vh', overflowY: 'auto',
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 16, color: T.gold, fontWeight: 700 }}>Editar Perfil</div>
                <button onClick={() => setEditing(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color={T.muted} />
                </button>
              </div>

              {fields.map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{
                    fontSize: 11, color: T.muted, textTransform: 'uppercase',
                    letterSpacing: 0.8, display: 'block', marginBottom: 5,
                  }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key] ?? ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      background: T.faint, border: `1px solid ${T.border}`,
                      color: T.text, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, marginTop: 8,
                  background: `${T.gold}22`, border: `1px solid ${T.gold}66`,
                  color: T.gold, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                }}
              >
                {saving ? 'Salvando...' : '💾 Salvar alterações'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

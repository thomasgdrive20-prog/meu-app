// HealthDashboard.jsx
// Atlas Fitness — Dashboard biomédico premium reestruturado
// Uso: <HealthDashboard />
// Extração de PDF via pdf.js (sem custo de API — parsing por padrão de texto)
// Deps: pdfjs-dist (instalar — ver guia)

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LAB_REFS, PROTOCOL_COMPOUNDS, SUPLS, PILARES, T } from '../lib/constants'

// ─── helpers ─────────────────────────────────────────────────────────────────
function statusForResult(name, value) {
  const ref = LAB_REFS[name]
  if (!ref) return 'info'
  const num = parseFloat(value)
  if (isNaN(num)) return 'info'
  if (ref.alert === 'high' && num > ref.max) return 'alert'
  if (ref.alert === 'high' && num < ref.min) return 'warn'
  if (ref.alert === 'low'  && num < ref.min) return 'alert'
  return 'ok'
}

const STATUS_COLOR = {
  ok:    T.ok,
  warn:  T.warn,
  alert: T.alert,
  info:  T.horm,
}

const STATUS_LABEL = {
  ok:    'Normal',
  warn:  'Atenção',
  alert: 'Alerta',
  info:  'Acompanhar',
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
      textTransform: 'uppercase', padding: '2px 8px',
      borderRadius: 5, background: `${color}22`,
      border: `1px solid ${color}44`, color,
    }}>
      {STATUS_LABEL[status]}
    </span>
  )
}

// ─── parser de texto de PDF para exames ──────────────────────────────────────
// Tenta identificar pares "nome — valor — unidade" no texto extraído.
// Funciona bem em PDFs com estrutura tabular de texto (maioria dos labs brasileiros).
function parsePDFTextToExams(rawText) {
  const results = []
  const lines   = rawText.split('\n').map(l => l.trim()).filter(Boolean)

  // Tenta match por nome de exame conhecido
  for (const [examName, ref] of Object.entries(LAB_REFS)) {
    const pattern = new RegExp(examName.replace(/[()]/g, '\\$&'), 'i')
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        // Procura número nas próximas 3 linhas
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const numMatch = lines[j].match(/(\d+[\.,]?\d*)/)
          if (numMatch) {
            results.push({
              _id:      Math.random().toString(36).slice(2),
              name:     examName,
              value:    numMatch[1].replace(',', '.'),
              unit:     ref.unit,
              ref:      `${ref.min === 0 ? '<' : ref.min + '–'}${ref.max}`,
              date:     new Date().toISOString().slice(0, 10),
              confirmed: false,
              status:   statusForResult(examName, numMatch[1].replace(',', '.')),
            })
            break
          }
        }
        break
      }
    }
  }

  // Se não encontrou nada pelos nomes conhecidos, tenta padrão genérico
  if (results.length === 0) {
    for (let i = 0; i < lines.length - 1; i++) {
      const numMatch = lines[i + 1]?.match(/^(\d+[\.,]?\d*)\s*([a-zA-Z/%]+)?/)
      if (numMatch && lines[i].length < 60 && !/^\d/.test(lines[i])) {
        results.push({
          _id:       Math.random().toString(36).slice(2),
          name:      lines[i],
          value:     numMatch[1].replace(',', '.'),
          unit:      numMatch[2] || '',
          ref:       '',
          date:      new Date().toISOString().slice(0, 10),
          confirmed: false,
          status:    'info',
        })
      }
    }
  }

  return results
}

// ─── importador de PDF de exames ─────────────────────────────────────────────
function PDFExamImporter({ onImport }) {
  const [loading,  setLoading]  = useState(false)
  const [preview,  setPreview]  = useState(null)
  const [error,    setError]    = useState('')
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Selecione um arquivo PDF válido.')
      return
    }
    setLoading(true)
    setError('')
    setPreview(null)

    try {
      // Carrega pdf.js dinamicamente (deve estar instalado via npm)
      const pdfjsLib = await import('pdfjs-dist/build/pdf')
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const buffer   = await file.arrayBuffer()
      const pdf      = await pdfjsLib.getDocument({ data: buffer }).promise
      let   fullText = ''

      for (let p = 1; p <= pdf.numPages; p++) {
        const page    = await pdf.getPage(p)
        const content = await page.getTextContent()
        fullText += content.items.map(i => i.str).join('\n') + '\n'
      }

      const parsed = parsePDFTextToExams(fullText)
      if (parsed.length === 0) {
        setError('Não foi possível identificar exames no PDF. Adicione manualmente.')
      } else {
        setPreview(parsed)
      }
    } catch (e) {
      setError('Erro ao processar o PDF: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePreviewItem = (id, field, value) => {
    setPreview(prev => prev.map(r => r._id === id ? { ...r, [field]: value, status: field === 'value' ? statusForResult(r.name, value) : r.status } : r))
  }

  const removePreviewItem = (id) => setPreview(prev => prev.filter(r => r._id !== id))

  const confirmAll = () => {
    const confirmed = preview.filter(r => r.confirmed !== false || true).map(r => ({ ...r, confirmed: true }))
    onImport(confirmed)
    setPreview(null)
  }

  return (
    <div>
      {/* Drop zone */}
      {!preview && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          style={{
            border: `2px dashed ${T.horm}55`,
            borderRadius: 12, padding: '28px 20px',
            textAlign: 'center', cursor: 'pointer',
            background: `${T.horm}08`,
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>Importar PDF de exames</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
            Clique ou arraste o arquivo aqui
          </div>
          {loading && <div style={{ fontSize: 12, color: T.horm, marginTop: 10 }}>Processando PDF...</div>}
          {error   && <div style={{ fontSize: 12, color: T.alert, marginTop: 10 }}>⚠ {error}</div>}
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* Prévia de confirmação */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 12 }}>
              Prévia — confirme os resultados
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>
              Edite ou exclua antes de confirmar. O sistema NÃO salva automaticamente.
            </div>

            {preview.map(r => (
              <div key={r._id} style={{
                background: T.faint, borderRadius: 10, padding: '12px 14px',
                marginBottom: 8, border: `1px solid ${STATUS_COLOR[r.status]}33`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <input
                        value={r.name}
                        onChange={e => updatePreviewItem(r._id, 'name', e.target.value)}
                        style={{ ...miniInput, flex: 1, fontWeight: 600, color: T.text }}
                      />
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: T.muted }}>Resultado</span>
                        <input
                          value={r.value}
                          onChange={e => updatePreviewItem(r._id, 'value', e.target.value)}
                          style={{ ...miniInput, width: 70, color: STATUS_COLOR[r.status], fontWeight: 700 }}
                        />
                        <input
                          value={r.unit}
                          onChange={e => updatePreviewItem(r._id, 'unit', e.target.value)}
                          style={{ ...miniInput, width: 60 }}
                          placeholder="unidade"
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: T.muted }}>Ref</span>
                        <input
                          value={r.ref}
                          onChange={e => updatePreviewItem(r._id, 'ref', e.target.value)}
                          style={{ ...miniInput, width: 80 }}
                          placeholder="referência"
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: T.muted }}>Data</span>
                        <input
                          type="date"
                          value={r.date}
                          onChange={e => updatePreviewItem(r._id, 'date', e.target.value)}
                          style={{ ...miniInput, width: 110 }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removePreviewItem(r._id)}
                    style={{ color: T.alert, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={confirmAll} style={{
                flex: 1, padding: '11px', borderRadius: 9,
                background: `${T.ok}22`, border: `1px solid ${T.ok}55`,
                color: T.ok, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                ✔ Confirmar e salvar {preview.length} resultado{preview.length > 1 ? 's' : ''}
              </button>
              <button onClick={() => setPreview(null)} style={{
                padding: '11px 16px', borderRadius: 9,
                background: 'transparent', border: `1px solid ${T.border}`,
                color: T.muted, fontSize: 13, cursor: 'pointer',
              }}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const miniInput = {
  padding: '3px 7px', borderRadius: 5,
  background: '#2A2826', border: `1px solid ${T.border}`,
  color: T.muted, fontSize: 12, outline: 'none',
}

// ─── card de exame individual ─────────────────────────────────────────────────
function ExamCard({ exam }) {
  const ref    = LAB_REFS[exam.name]
  const status = exam.status || statusForResult(exam.name, exam.value)
  const color  = STATUS_COLOR[status]
  const pct    = ref ? Math.min(100, Math.max(0, (parseFloat(exam.value) / ref.max) * 100)) : 50

  return (
    <div style={{
      background: T.faint,
      border: `1px solid ${color}33`,
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>{exam.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{exam.date}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color }}>{exam.value}</span>
        <span style={{ fontSize: 12, color: T.muted }}>{exam.unit}</span>
      </div>

      {ref && (
        <>
          <div style={{ height: 4, borderRadius: 999, background: T.border, overflow: 'hidden', marginBottom: 4 }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 999, background: color }}
            />
          </div>
          <div style={{ fontSize: 10, color: T.muted }}>
            Ref: {ref.min === 0 ? '<' : `${ref.min}–`}{ref.max} {ref.unit}
          </div>
        </>
      )}
    </div>
  )
}

// ─── componente principal ─────────────────────────────────────────────────────
export default function HealthDashboard() {
  const [exams,      setExams]      = useState([])
  const [showImport, setShowImport] = useState(false)
  const [activeSection, setActive]  = useState('resumo')

  const handleImport = (newExams) => {
    setExams(prev => {
      // Substitui exames com mesmo nome, adiciona novos
      const merged = [...prev]
      for (const ne of newExams) {
        const idx = merged.findIndex(e => e.name === ne.name)
        if (idx >= 0) merged[idx] = ne
        else merged.push(ne)
      }
      return merged
    })
    setShowImport(false)
  }

  const alerts = exams.filter(e => e.status === 'alert')
  const warns  = exams.filter(e => e.status === 'warn')

  const sections = [
    { id: 'resumo',    label: 'Resumo' },
    { id: 'alertas',   label: `Alertas ${alerts.length + warns.length > 0 ? `(${alerts.length + warns.length})` : ''}` },
    { id: 'exames',    label: 'Exames' },
    { id: 'protocolo', label: 'Protocolo' },
    { id: 'supls',     label: 'Suplementos' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Tabs de navegação */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              padding: '7px 16px', borderRadius: 8, whiteSpace: 'nowrap',
              background: activeSection === s.id ? `${T.horm}22` : 'transparent',
              border: `1px solid ${activeSection === s.id ? T.horm + '66' : T.border}`,
              color: activeSection === s.id ? T.horm : T.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── RESUMO ── */}
      {activeSection === 'resumo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Exames registrados', value: exams.length, color: T.horm },
              { label: 'Alertas ativos',     value: alerts.length, color: alerts.length ? T.alert : T.ok },
              { label: 'Atenções',           value: warns.length,  color: warns.length  ? T.warn  : T.ok },
              { label: 'Normais',            value: exams.filter(e => e.status === 'ok').length, color: T.ok },
            ].map((s, i) => (
              <div key={i} style={{
                background: T.card, border: `1px solid ${s.color}22`,
                borderRadius: 12, padding: '16px',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pilares */}
          <div style={{ fontSize: 13, color: T.gold, fontWeight: 700, marginBottom: 10, marginTop: 4 }}>
            Pilares inegociáveis
          </div>
          {PILARES.map(p => (
            <div key={p.id} style={{
              background: T.faint, borderRadius: 10, padding: '10px 14px',
              marginBottom: 8, border: `1px solid ${T.border}`,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 18 }}>{p.emoji}</span>
              <div>
                <div style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{p.titulo} <span style={{ color: T.gold, fontWeight: 400 }}>· {p.meta}</span></div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2, lineHeight: 1.5 }}>{p.alerta}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── ALERTAS ── */}
      {activeSection === 'alertas' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {alerts.length + warns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.muted }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              <div>Nenhum alerta ativo</div>
            </div>
          ) : (
            <>
              {alerts.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: T.alert, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    🔴 Fora da referência
                  </div>
                  <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                    {alerts.map(e => <ExamCard key={e._id} exam={e} />)}
                  </div>
                </>
              )}
              {warns.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: T.warn, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    🟡 Atenção
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {warns.map(e => <ExamCard key={e._id} exam={e} />)}
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ── EXAMES ── */}
      {activeSection === 'exames' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>
              Resultados de exames
            </div>
            <button
              onClick={() => setShowImport(s => !s)}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                background: `${T.horm}22`, border: `1px solid ${T.horm}55`, color: T.horm, fontWeight: 600,
              }}
            >
              {showImport ? '✕ Fechar' : '📄 Importar PDF'}
            </button>
          </div>

          <AnimatePresence>
            {showImport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginBottom: 16 }}
              >
                <div style={{
                  background: T.card, border: `1px solid ${T.horm}33`,
                  borderRadius: 12, padding: 20,
                }}>
                  <PDFExamImporter onImport={handleImport} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {exams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.muted }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🧪</div>
              <div>Nenhum exame registrado</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>Importe um PDF ou adicione manualmente</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {exams.map(e => <ExamCard key={e._id} exam={e} />)}
            </div>
          )}
        </motion.div>
      )}

      {/* ── PROTOCOLO ── */}
      {activeSection === 'protocolo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>
            Protocolo hormonal ativo
          </div>
          {PROTOCOL_COMPOUNDS.map(c => (
            <div key={c.id} style={{
              background: T.faint, border: `1px solid ${c.color}33`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, color: c.color, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {c.dose} {c.unit} · {c.schedule} · {c.weekly}/semana
                  </div>
                </div>
              </div>
              {c.obs && (
                <div style={{
                  marginTop: 8, fontSize: 11, color: T.muted, lineHeight: 1.5,
                  borderTop: `1px solid ${T.border}`, paddingTop: 8,
                }}>
                  💬 {c.obs}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* ── SUPLEMENTOS ── */}
      {activeSection === 'supls' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 14 }}>
            Suplementação
          </div>
          {SUPLS.map(s => (
            <div key={s.id} style={{
              background: T.faint, border: `1px solid ${s.color}33`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, color: s.color, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.dose} · {s.time}</div>
              </div>
              {s.obs && <div style={{ fontSize: 11, color: T.muted, maxWidth: 200, textAlign: 'right', lineHeight: 1.4 }}>{s.obs}</div>}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

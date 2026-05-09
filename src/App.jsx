import { useState, useEffect, useCallback, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Dumbbell, Utensils, Heart, Activity, Image, Home,
  Flame, ChevronRight, CheckCircle, Syringe, FlaskConical,
  TrendingUp, TrendingDown, Minus, Play, SkipForward, X,
  ChevronLeft, Scale, Zap, Target, Clock, RotateCcw,
  Fish, Sun, Camera, FolderOpen, ArrowRight,
  AlertTriangle, CheckCheck, Trophy, Timer, Calendar, Pause, Pill,
  User, Upload, BarChart2, RefreshCw, Plus
} from 'lucide-react'
import { dbSelect, dbInsert, dbUpdate, dbDelete, USER_ID } from './lib/supabaseClient'

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ─── ACTIVE WORKOUT PERSISTENCE ───────────────────────────────────────────────
const AW_KEY = 'atlas_active_workout'
const getAW = () => { try { return JSON.parse(localStorage.getItem(AW_KEY)) } catch { return null } }
const saveAW = (d) => localStorage.setItem(AW_KEY, JSON.stringify(d))
const clearAW = () => localStorage.removeItem(AW_KEY)

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0A0A0B', surface: '#0F0F12', card: '#16161A', border: '#1E1E24',
  border2: '#2A2A32',
  text: '#F2EFE8', muted: '#64616A', faint: '#1A1A1F', subtle: '#242429',
  treino: '#C8F060', nutri: '#FF8C5A', horm: '#60B4FF', metrica: '#D87AE8',
  ok: '#5AE89A', warn: '#FFB84D', alert: '#FF5A5A', gold: '#FFD166',
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: ${T.bg}; }
    ::-webkit-scrollbar { display: none; }
    body { -webkit-font-smoothing: antialiased; }
    input, textarea, button, select { font-family: 'Barlow','Lato',sans-serif; }
    input::placeholder, textarea::placeholder { color: ${T.muted}; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    .fade-up { animation: fadeUp .25s ease forwards; }
    .btn-neon { transition: all .2s; }
    .btn-neon:hover { box-shadow: 0 0 20px rgba(200,240,96,.4); transform: translateY(-1px); }
    .btn-ghost { transition: all .2s; }
    .btn-ghost:hover { background: rgba(200,240,96,.07) !important; }
    .card-tap { transition: all .2s; }
    .card-tap:active { transform: scale(.98); }
    .glass { background: rgba(16,16,20,0.82); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); }
    .glass-nav { background: rgba(10,10,11,0.90); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.06); }
    .active-pulse { animation: pulse 2s infinite; }
    select option { background: ${T.card}; color: ${T.text}; }
  `}</style>
)

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SPLIT = [
  { id: 'legs',   label: 'Legs',        tag: 'Quad · Post · Glúteo',     color: T.treino,  icon: '🦵', day: 'Seg' },
  { id: 'push_a', label: 'Push A',      tag: 'Peito · Ombro · Tríceps',  color: '#A8E870', icon: '💪', day: 'Ter' },
  { id: 'pull_a', label: 'Pull A',      tag: 'Costas · Bíceps',          color: T.horm,    icon: '🔵', day: 'Qua' },
  { id: 'off',    label: 'Futebol',     tag: 'Descanso ativo',           color: T.muted,   icon: '⚽', day: 'Qui' },
  { id: 'push_b', label: 'Push B',      tag: 'Peito · Ombro · Tríceps',  color: '#A8E870', icon: '💪', day: 'Sex' },
  { id: 'arms',   label: 'Braço+Peito', tag: 'Bíceps · Tríceps · Peito', color: T.nutri,   icon: '💪', day: 'Sáb' },
  { id: 'pull_b', label: 'Pull B',      tag: 'Costas · Bíceps',          color: T.horm,    icon: '🔵', day: 'Dom' },
]

const EXERCISES = {
  legs: [
    { name: 'Agachamento Livre', sets: 4, reps: '6–8',   rest: 180, muscle: 'Quad',    cue: 'Abaixo do paralelo. Joelhos na linha dos pés.' },
    { name: 'Leg Press 45°',     sets: 3, reps: '10–12', rest: 120, muscle: 'Quad',    cue: 'Não trave o joelho no topo.' },
    { name: 'Cadeira Extensora', sets: 3, reps: '12–15', rest: 60,  muscle: 'Quad',    cue: 'Pausa 1s na contração.' },
    { name: 'Stiff Barra',       sets: 4, reps: '8–10',  rest: 120, muscle: 'Post.',   cue: 'Quadril para trás. Sente o alongamento.' },
    { name: 'Leg Curl Deitado',  sets: 3, reps: '10–12', rest: 90,  muscle: 'Post.',   cue: 'Quadril grudado no banco.' },
    { name: 'Hip Thrust Barra',  sets: 4, reps: '10–12', rest: 90,  muscle: 'Glúteo',  cue: 'Pausa 1s no topo. Extensão completa.' },
    { name: 'Panturrilha em Pé', sets: 4, reps: '15–20', rest: 60,  muscle: 'Pantur.', cue: 'Amplitude total. Pausa no topo e fundo.' },
    { name: 'Cardio — Escada',   sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  push_a: [
    { name: 'Supino Reto Barra',         sets: 4, reps: '6–8',   rest: 150, muscle: 'Peito',   cue: 'Escápulas retraídas. Desça 2s controlado.' },
    { name: 'Supino Inclinado Halteres', sets: 3, reps: '8–10',  rest: 90,  muscle: 'Peito',   cue: '30–45°. Porção clavicular.' },
    { name: 'Desenvolvimento Militar',   sets: 4, reps: '6–8',   rest: 150, muscle: 'Ombro',   cue: 'Core contraído. Sem hiperlordose.' },
    { name: 'Elevação Lateral',          sets: 4, reps: '12–15', rest: 60,  muscle: 'Ombro',   cue: 'Cotovelo levemente flexionado.' },
    { name: 'Tríceps Corda Polia',       sets: 3, reps: '10–12', rest: 60,  muscle: 'Tríceps', cue: 'Cotovelos fixos. Extensão total.' },
    { name: 'Tríceps Francês',           sets: 3, reps: '10–12', rest: 60,  muscle: 'Tríceps', cue: 'Não abra o cotovelo.' },
    { name: 'Cardio — Escada',           sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  pull_a: [
    { name: 'Barra Fixa Pronada',        sets: 4, reps: '6–8',   rest: 150, muscle: 'Costas', cue: 'Amplitude total. Peito até a barra.' },
    { name: 'Remada Curvada Barra',      sets: 4, reps: '6–8',   rest: 120, muscle: 'Costas', cue: '45°. Puxe para o umbigo.' },
    { name: 'Puxada Aberta Polia',       sets: 3, reps: '10–12', rest: 90,  muscle: 'Costas', cue: 'Cotovelos para baixo e para trás.' },
    { name: 'Remada Unilateral Haltere', sets: 3, reps: '10–12', rest: 60,  muscle: 'Costas', cue: 'Não rotacione o tronco.' },
    { name: 'Rosca Direta Barra',        sets: 3, reps: '8–10',  rest: 90,  muscle: 'Bíceps', cue: 'Supinação completa no topo.' },
    { name: 'Rosca Martelo',             sets: 3, reps: '10–12', rest: 60,  muscle: 'Bíceps', cue: 'Pegada neutra. Braquial.' },
    { name: 'Cardio — Escada',           sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio', cue: '130–150bpm.' },
  ],
  push_b: [
    { name: 'Supino Inclinado Barra',    sets: 4, reps: '8–10',  rest: 120, muscle: 'Peito',   cue: 'Mais volume no peitoral superior.' },
    { name: 'Crossover Polia Alta',      sets: 3, reps: '12–15', rest: 60,  muscle: 'Peito',   cue: 'Adução completa. Contração central.' },
    { name: 'Desenvolvimento Halteres',  sets: 4, reps: '8–10',  rest: 90,  muscle: 'Ombro',   cue: 'Maior amplitude. Rotação neutra no fundo.' },
    { name: 'Elevação Frontal',          sets: 3, reps: '12–15', rest: 60,  muscle: 'Ombro',   cue: 'Sem impulso. Alternado.' },
    { name: 'Mergulho Paralelas',        sets: 3, reps: '8–12',  rest: 90,  muscle: 'Tríceps', cue: 'Tronco levemente à frente.' },
    { name: 'Extensão Tríceps Overhead', sets: 3, reps: '12–15', rest: 60,  muscle: 'Tríceps', cue: 'Cotovelos junto à cabeça.' },
    { name: 'Cardio — Escada',           sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  arms: [
    { name: 'Rosca Scott Barra W',     sets: 4, reps: '8–10',  rest: 90, muscle: 'Bíceps',  cue: 'Elimina o impulso. Amplitude total.' },
    { name: 'Rosca Concentrada',       sets: 3, reps: '12–15', rest: 60, muscle: 'Bíceps',  cue: 'Cúbito no interior da coxa.' },
    { name: 'Rosca Alternada Haltere', sets: 3, reps: '10–12', rest: 60, muscle: 'Bíceps',  cue: 'Supinação no topo. Sem impulso.' },
    { name: 'Tríceps Corda Polia',     sets: 4, reps: '12–15', rest: 60, muscle: 'Tríceps', cue: 'Cotovelos fixos. Extensão total.' },
    { name: 'Tríceps Francês Haltere', sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps', cue: 'Não abra o cotovelo.' },
    { name: 'Mergulho Paralelas',      sets: 3, reps: '10–12', rest: 90, muscle: 'Tríceps', cue: 'Corpo mais vertical para tríceps.' },
    { name: 'Crossover / Fly Cabo',    sets: 3, reps: '15–20', rest: 60, muscle: 'Peito',   cue: 'Estímulo leve de peito. Contração central.' },
    { name: 'Cardio — Escada',         sets: 1, reps: '25min', rest: 0,  muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  pull_b: [
    { name: 'Remada T-bar',            sets: 4, reps: '8–10',  rest: 120, muscle: 'Costas',   cue: 'Puxe para o plexo. Escápulas no topo.' },
    { name: 'Puxada Triângulo Neutro', sets: 3, reps: '10–12', rest: 90,  muscle: 'Costas',   cue: 'Puxe para o esterno.' },
    { name: 'Pullover Haltere',        sets: 3, reps: '12–15', rest: 60,  muscle: 'Costas',   cue: 'Cotovelo levemente flexionado.' },
    { name: 'Face Pull',               sets: 3, reps: '15–20', rest: 60,  muscle: 'Ombro P.', cue: 'Essencial para manguito rotador.' },
    { name: 'Rosca Scott Barra W',     sets: 3, reps: '10–12', rest: 60,  muscle: 'Bíceps',   cue: 'Elimina o impulso.' },
    { name: 'Rosca Martelo',           sets: 3, reps: '10–12', rest: 60,  muscle: 'Bíceps',   cue: 'Pegada neutra. Braquial.' },
    { name: 'Cardio — Escada',         sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',   cue: '130–150bpm.' },
  ],
}

const LAB_REFS = {
  'Testosterona Total': { min: 175, max: 781,  unit: 'ng/dL', alert: 'high' },
  'Estradiol (E2)':     { min: 0,   max: 33,   unit: 'pg/mL', alert: 'high' },
  'HDL':                { min: 45,  max: 999,  unit: 'mg/dL', alert: 'low'  },
  'Hematócrito':        { min: 41,  max: 50,   unit: '%',     alert: 'high' },
  'SHBG':               { min: 13,  max: 90,   unit: 'nmol/L',alert: 'none' },
  'Vitamina D':         { min: 30,  max: 100,  unit: 'ng/mL', alert: 'low'  },
  'Vitamina B12':       { min: 300, max: 914,  unit: 'pg/mL', alert: 'low'  },
  'Colesterol Total':   { min: 0,   max: 180,  unit: 'mg/dL', alert: 'high' },
  'LDL':                { min: 0,   max: 100,  unit: 'mg/dL', alert: 'high' },
  'Triglicerídeos':     { min: 0,   max: 150,  unit: 'mg/dL', alert: 'high' },
  'TGO (AST)':          { min: 13,  max: 39,   unit: 'U/L',   alert: 'high' },
  'TGP (ALT)':          { min: 7,   max: 52,   unit: 'U/L',   alert: 'high' },
  'GGT':                { min: 9,   max: 64,   unit: 'U/L',   alert: 'high' },
  'PSA':                { min: 0,   max: 1.5,  unit: 'ng/mL', alert: 'high' },
}

const DIET = [
  { id: 'cafe',      time: '06:30', label: 'Café da Manhã',   kcal: 470, prot: 36, carb: 48, fat: 12, options: ['A: 1 ovo + 1 whey + 200ml leite desnatado + 30g aveia + ½ banana', 'B: 2 ovos mexidos + 1 pão francês + 1 whey + 200ml leite desnatado'] },
  { id: 'lanche1',   time: '10:00', label: 'Lanche da Manhã', kcal: 150, prot: 3,  carb: 30, fat: 3,  options: ['A: 1 fruta (maçã ou pera)', 'B: 1 fruta + 3 castanhas-do-pará'] },
  { id: 'almoco',    time: '12:30', label: 'Almoço',          kcal: 450, prot: 45, carb: 40, fat: 8,  options: ['FIXO: 150g frango + 40g arroz + 60g batata + 100g abóbora + vegetais + fio de azeite'] },
  { id: 'lanche2',   time: '16:00', label: 'Lanche da Tarde', kcal: 300, prot: 33, carb: 25, fat: 5,  options: ['A: 1 whey + 10g aveia + 1 banana', 'B: 1 iogurte desnatado + 1 whey + 1 fruta pequena'] },
  { id: 'pretreino', time: '19:30', label: 'Pré-Treino',      kcal: 280, prot: 28, carb: 30, fat: 4,  options: ['FIXO: 100g frango + 80g batata ou 60g arroz'] },
  { id: 'postreino', time: '22:15', label: 'Pós-Treino',      kcal: 115, prot: 15, carb: 8,  fat: 2,  options: ['A: ½ dose whey com água', 'B: ½ whey + 3g creatina'] },
  { id: 'jantar',    time: '23:00', label: 'Jantar',          kcal: 370, prot: 30, carb: 20, fat: 10, options: ['FIXO: 150g frango + 2 ovos cozidos + 100g abóbora + vegetais refogados + fio de azeite'] },
]

const PROTOCOL_COMPOUNDS = [
  { id: 'testo', name: 'Testosterona Enantato', dose: '0.7', unit: 'ml', schedule: 'Seg + Qui', color: T.horm,    weekly: '350mg' },
  { id: 'ana',   name: 'Anastrozol',            dose: '0.5', unit: 'mg', schedule: 'Seg + Qui', color: T.metrica, weekly: '1mg'   },
  { id: 'tirze', name: 'Tirzepatida',           dose: '1.5', unit: 'mg', schedule: 'Semanal',   color: T.nutri,   weekly: '1.5mg' },
]

const SUPLS = [
  { id: 'vitd',  name: 'Vit. D3+K2', dose: '4.000 UI', time: 'Manhã',      color: T.warn,   Icon: Sun   },
  { id: 'b12',   name: 'Vit. B12',   dose: '1.000mcg', time: 'Manhã',      color: T.warn,   Icon: Zap   },
  { id: 'creat', name: 'Creatina',   dose: '5g',        time: 'Pós-treino', color: T.treino, Icon: Flame },
  { id: 'omega', name: 'Ômega 3',    dose: '3g',        time: 'Almoço',     color: T.horm,   Icon: Fish  },
]

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────────
const Card = ({ children, style = {}, color, onClick }) => (
  <div onClick={onClick} className={onClick ? 'card-tap' : ''} style={{ background: T.card, border: `1px solid ${color ? color + '28' : T.border}`, borderRadius: 22, padding: '20px', marginBottom: 12, borderLeft: color ? `3px solid ${color}` : undefined, cursor: onClick ? 'pointer' : 'default', overflow: 'hidden', ...style }}>{children}</div>
)
const Tag = ({ children, color, small }) => (
  <span style={{ background: (color || T.treino) + '18', color: color || T.treino, fontSize: small ? 9 : 10, padding: small ? '3px 10px' : '4px 13px', borderRadius: 100, letterSpacing: .8, fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${(color || T.treino)}28`, display: 'inline-block' }}>{children}</span>
)
const Lbl = ({ children, color }) => (
  <div style={{ fontSize: 10, letterSpacing: 2.5, color: color || T.muted, textTransform: 'uppercase', marginBottom: 12, fontWeight: 800 }}>{children}</div>
)
const Btn = ({ children, onClick, color, small, full, ghost, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} className={ghost ? 'btn-ghost' : 'btn-neon'} style={{ background: ghost ? 'transparent' : (color || T.treino), border: ghost ? `1px solid ${(color || T.treino)}50` : 'none', color: ghost ? (color || T.treino) : '#0A0A0B', borderRadius: 14, padding: small ? '9px 18px' : '14px 24px', fontSize: small ? 12 : 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', width: full ? '100%' : 'auto', opacity: disabled ? .4 : 1, letterSpacing: .5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, ...style }}>{children}</button>
)
const Inp = ({ placeholder, value, onChange, type = 'text', style = {} }) => (
  <input type={type} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} style={{ background: T.faint, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: T.text, outline: 'none', fontFamily: 'inherit', ...style }} onFocus={e => e.target.style.borderColor = T.treino + '80'} onBlur={e => e.target.style.borderColor = T.border2} />
)
const StatusDot = ({ status }) => (
  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: status === 'ok' ? T.ok : status === 'warn' ? T.warn : T.alert, marginRight: 8, flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${status === 'ok' ? T.ok : status === 'warn' ? T.warn : T.alert}80` }} />
)

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 28, padding: '36px 28px', maxWidth: 300, width: '100%', textAlign: 'center' }}>
        <AlertTriangle size={36} color={T.warn} style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 14, color: T.text, marginBottom: 28, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn full ghost color={T.muted} onClick={onCancel} small>Cancelar</Btn>
          <Btn full color={T.alert} onClick={onConfirm} small style={{ color: '#fff' }}>Deletar</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── CARDIO MODAL ─────────────────────────────────────────────────────────────
function CardioModal({ onSave, onSkip }) {
  const [tipo, setTipo] = useState('escada')
  const [duracao, setDuracao] = useState('25')
  const [zona, setZona] = useState('2')
  const TIPOS = [{ id: 'escada', label: '🪜 Escada' }, { id: 'esteira', label: '🏃 Esteira' }, { id: 'bicicleta', label: '🚴 Bicicleta' }]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 28, padding: '28px 24px', width: '100%', maxWidth: 440 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, marginBottom: 4, color: T.treino }}>Cardio Pós-Treino</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>Fez cardio hoje?</div>
        <Lbl>Tipo</Lbl>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {TIPOS.map(t => <button key={t.id} onClick={() => setTipo(t.id)} style={{ flex: 1, background: tipo === t.id ? T.treino + '22' : T.faint, border: `1px solid ${tipo === t.id ? T.treino : T.border2}`, color: tipo === t.id ? T.treino : T.muted, borderRadius: 12, padding: '10px 6px', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>{t.label}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div><Lbl>Duração (min)</Lbl><Inp type="number" placeholder="25" value={duracao} onChange={setDuracao} style={{ width: '100%' }} /></div>
          <div>
            <Lbl>Zona</Lbl>
            <select value={zona} onChange={e => setZona(e.target.value)} style={{ width: '100%', background: T.faint, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: T.text, outline: 'none', fontFamily: 'inherit' }}>
              <option value="1">Zona 1 — Leve</option>
              <option value="2">Zona 2 — Moderado</option>
              <option value="3">Zona 3 — Intenso</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn full ghost color={T.muted} onClick={onSkip} small>Não fiz</Btn>
          <Btn full color={T.treino} onClick={() => onSave({ tipo, duracao: parseInt(duracao), zona: parseInt(zona) })} small>Salvar Cardio</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds)
  const [active, setActive] = useState(true)
  useEffect(() => {
    if (!active || left <= 0) { if (left <= 0 && onDone) onDone(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, active, onDone])
  const pct = (left / seconds) * 100; const r = 52; const circ = 2 * Math.PI * r
  const col = left <= 10 ? T.alert : T.treino
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke={T.faint} strokeWidth={8} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={col} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .9s linear,stroke .3s', filter: `drop-shadow(0 0 6px ${col}80)` }} />
      </svg>
      <div style={{ marginTop: -95, marginBottom: 70, textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: col, letterSpacing: -2 }}>{left}s</div>
        <div style={{ fontSize: 9, color: T.muted, letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 }}>descanso</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn small ghost color={T.muted} onClick={() => setActive(a => !a)}>{active ? <Pause size={14} /> : <Play size={14} />}</Btn>
        <Btn small color={T.treino} onClick={onDone}><SkipForward size={14} /> Pular</Btn>
      </div>
    </div>
  )
}

// ─── WORKOUT MODE (com persistência + troca de exercício + cardio modal) ──────
function WorkoutMode({ session, exercises: initialExercises, onClose, onSave, onCardioSave }) {
  const saved_aw = getAW()
  const [idx, setIdx] = useState(saved_aw?.idx || 0)
  const [setIdx2, setSetIdx] = useState(saved_aw?.setIdx2 || 0)
  const [phase, setPhase] = useState(saved_aw?.phase || 'exercise')
  const [kg, setKg] = useState(saved_aw?.kg || '')
  const [reps, setReps] = useState(saved_aw?.reps || '')
  const [saved, setSaved] = useState(saved_aw?.saved || [])
  const [showCardio, setShowCardio] = useState(false)
  const [showSwap, setShowSwap] = useState(false)
  const [swapName, setSwapName] = useState('')
  const [swapReason, setSwapReason] = useState('')
  const [exercises, setExercises] = useState(saved_aw?.exercises || initialExercises)
  const [obs, setObs] = useState('')

  const ex = exercises[idx]
  const isCardio = ex?.name?.includes('Cardio')
  const totalSets = typeof ex?.sets === 'number' ? ex.sets : parseInt(ex?.sets) || 1

  // Persistir estado
  useEffect(() => {
    if (phase !== 'done') saveAW({ idx, setIdx2, phase, kg, reps, saved, exercises, sessionId: session.id, sessionLabel: session.label })
  }, [idx, setIdx2, phase, kg, reps, saved, exercises])

  const nextSet = () => {
    if (kg && !isCardio) { const entry = { exercise: ex.name, kg, reps, obs, date: new Date().toLocaleDateString('pt-BR'), day: session.id }; onSave(entry); setSaved(s => [...s, entry]) }
    setObs('')
    if (setIdx2 + 1 < totalSets) { setSetIdx(s => s + 1); if (ex.rest > 0) setPhase('rest'); else { setKg(''); setReps('') } }
    else { setSetIdx(0); setKg(''); setReps(''); if (idx + 1 < exercises.length) { setIdx(i => i + 1); setPhase('exercise') } else { clearAW(); setPhase('done') } }
  }

  const doSwap = () => {
    if (!swapName) return
    const newEx = [...exercises]
    newEx[idx] = { ...newEx[idx], originalName: newEx[idx].name, name: swapName }
    setExercises(newEx)
    onSave({ exercise: `[TROCA] ${ex.name} → ${swapName}`, kg: '0', reps: swapReason || 'troca', date: new Date().toLocaleDateString('pt-BR'), day: session.id })
    setShowSwap(false); setSwapName(''); setSwapReason('')
  }

  if (showCardio) return <CardioModal onSave={d => { onCardioSave(d); clearAW(); onClose() }} onSkip={() => { clearAW(); onClose() }} />

  if (phase === 'done') return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Trophy size={72} color={T.treino} strokeWidth={1} style={{ marginBottom: 20, filter: `drop-shadow(0 0 20px ${T.treino}80)` }} />
      <div style={{ fontSize: 44, fontWeight: 900, color: T.treino, marginBottom: 8, letterSpacing: -2 }}>DONE!</div>
      <div style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>{saved.length} séries registradas</div>
      {saved.slice(-4).map((s, i) => <div key={i} style={{ fontSize: 12, color: T.text, marginBottom: 5, opacity: .6 }}>{s.exercise} — {s.kg}kg × {s.reps}</div>)}
      <div style={{ marginTop: 28 }}><Btn color={T.treino} onClick={() => setShowCardio(true)}>Registrar Cardio →</Btn></div>
      <button onClick={() => { clearAW(); onClose() }} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit' }}>Pular cardio</button>
    </div>
  )

  if (phase === 'rest') return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, letterSpacing: 3, textTransform: 'uppercase' }}>Próximo</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 28, textAlign: 'center' }}>{ex.name}</div>
      <RestTimer seconds={ex.rest} onDone={() => { setPhase('exercise'); setKg(''); setReps('') }} />
    </div>
  )

  const progress = ((idx + setIdx2 / totalSets) / exercises.length) * 100
  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, overflowY: 'auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: T.faint, zIndex: 101 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${session.color},${T.treino})`, transition: 'width .5s', boxShadow: `0 0 8px ${T.treino}80` }} />
      </div>
      <div style={{ padding: '52px 24px 120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <button onClick={onClose} style={{ background: T.subtle, border: 'none', color: T.muted, cursor: 'pointer', fontSize: 12, padding: '8px 14px', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><X size={14} /> SAIR</button>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>{idx + 1}/{exercises.length}</div>
        </div>

        {/* Swap modal */}
        {showSwap && (
          <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 18, padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: T.warn }}>Trocar exercício</div>
            <Inp placeholder="Nome do substituto" value={swapName} onChange={setSwapName} style={{ width: '100%', marginBottom: 8 }} />
            <Inp placeholder="Motivo (opcional)" value={swapReason} onChange={setSwapReason} style={{ width: '100%', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn small ghost color={T.muted} onClick={() => setShowSwap(false)}>Cancelar</Btn>
              <Btn small color={T.warn} style={{ color: T.bg }} onClick={doSwap}>Trocar</Btn>
            </div>
          </div>
        )}

        <Tag color={session.color} small>{ex.muscle}</Tag>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.text, marginTop: 10, marginBottom: 2, lineHeight: 1.1, letterSpacing: -1 }}>
          {ex.originalName && <div style={{ fontSize: 10, color: T.warn, marginBottom: 4 }}>Substituiu: {ex.originalName}</div>}
          {ex.name}
        </div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Timer size={13} /> Série {setIdx2 + 1} de {totalSets}</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {Array.from({ length: totalSets }, (_, i) => (
            <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', border: `2px solid ${i < setIdx2 ? session.color : i === setIdx2 ? session.color : T.border2}`, background: i < setIdx2 ? session.color : i === setIdx2 ? session.color + '20' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i < setIdx2 ? T.bg : i === setIdx2 ? session.color : T.muted, boxShadow: i === setIdx2 ? `0 0 10px ${session.color}60` : 'none' }}>{i + 1}</div>
          ))}
        </div>

        <div style={{ background: T.faint, borderLeft: `3px solid ${session.color}`, borderRadius: '0 14px 14px 0', padding: '12px 16px', marginBottom: 20, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>💡 {ex.cue}</div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {[{ l: 'Reps alvo', v: ex.reps, Icon: Target }, { l: 'Pausa', v: ex.rest > 0 ? `${ex.rest}s` : '—', Icon: Clock }].map(s => (
            <div key={s.l} style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px', textAlign: 'center' }}>
              <s.Icon size={15} color={session.color} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 24, fontWeight: 900, color: session.color, letterSpacing: -1 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {!isCardio && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}><Lbl>Carga (kg)</Lbl><Inp placeholder="80" value={kg} onChange={setKg} type="number" style={{ width: '100%', fontSize: 20, padding: '14px', textAlign: 'center', fontWeight: 800 }} /></div>
              <div style={{ flex: 1 }}><Lbl>Reps feitas</Lbl><Inp placeholder="8" value={reps} onChange={setReps} type="number" style={{ width: '100%', fontSize: 20, padding: '14px', textAlign: 'center', fontWeight: 800 }} /></div>
            </div>
            <Inp placeholder="Observação (opcional)" value={obs} onChange={setObs} style={{ width: '100%', marginBottom: 16, fontSize: 12 }} />
          </>
        )}

        <Btn full color={session.color} style={{ fontSize: 15, padding: '16px', borderRadius: 16, letterSpacing: 1 }} onClick={nextSet}>
          {setIdx2 + 1 < totalSets ? 'PRÓXIMA SÉRIE →' : idx + 1 < exercises.length ? 'PRÓXIMO EXERCÍCIO →' : 'FINALIZAR 🔥'}
        </Btn>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
          <button onClick={() => setShowSwap(true)} style={{ background: 'none', border: 'none', color: T.warn, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12} /> Trocar exercício
          </button>
          <button onClick={() => { setIdx(i => Math.min(i + 1, exercises.length - 1)); setSetIdx(0); setPhase('exercise') }} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
            <SkipForward size={12} /> Pular
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PHOTO SLIDER ─────────────────────────────────────────────────────────────
function PhotoSlider({ before, after }) {
  const [pos, setPos] = useState(50); const ref = useRef(null); const drag = useRef(false)
  const move = (clientX) => { if (!ref.current) return; const { left, width } = ref.current.getBoundingClientRect(); setPos(Math.max(0, Math.min(100, ((clientX - left) / width) * 100))) }
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 20, overflow: 'hidden', userSelect: 'none', cursor: 'col-resize' }}
      onMouseDown={e => { drag.current = true; move(e.clientX) }} onMouseMove={e => { if (drag.current) move(e.clientX) }} onMouseUp={() => drag.current = false}
      onTouchStart={e => move(e.touches[0].clientX)} onTouchMove={e => move(e.touches[0].clientX)}>
      <img src={before} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}><img src={after} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2, background: 'white', transform: 'translateX(-50%)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 20px rgba(0,0,0,.5)', fontSize: 14 }}>⇔</div>
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,.7)', color: 'white', fontSize: 9, padding: '5px 12px', borderRadius: 20, letterSpacing: 2, fontWeight: 800 }}>ANTES</div>
      <div style={{ position: 'absolute', bottom: 14, right: 14, background: T.treino + 'DD', color: T.bg, fontSize: 9, padding: '5px 12px', borderRadius: 20, letterSpacing: 2, fontWeight: 800 }}>DEPOIS</div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dash')
  const [confirm, setConfirm] = useState(null)
  const [syncMsg, setSyncMsg] = useState('Carregando...')
  const [workoutMode, setWorkoutMode] = useState(null)

  // Perfil
  const [profile, setProfile] = useState({ name: 'Thomas', age: 35, weight: '91.5', height: '1.75', phase: 'Fase 1 — Cutting', phaseEnd: 'Jul 2026', bfMeta: '12', photo: null, goal: 'Cutting', gender: 'M', birthDate: '' })
  const [nutrition] = useState({ calories: 2100, protein: 190, carbs: 160, fat: 58 })
  const [compounds, setCompounds] = useState(PROTOCOL_COMPOUNDS)

  const [workout,    setWorkout]    = useState([])
  const [metrics,    setMetrics]    = useState([])
  const [mealLog,    setMealLog]    = useState([])
  const [labLog,     setLabLog]     = useState([])
  const [aplicacoes, setAplicacoes] = useState([])
  const [dietaLogs,  setDietaLogs]  = useState([])
  const [photos,     setPhotos]     = useState([])
  const [suplLogs,   setSuplLogs]   = useState([])
  const [cardioLogs, setCardioLogs] = useState([])

  // Treino ativo persistente
  const [activeWO, setActiveWO] = useState(getAW())

  const flash = (msg = '✓ Salvo') => { setSyncMsg(msg); setTimeout(() => setSyncMsg(''), 2500) }

  useEffect(() => {
    setSyncMsg('Conectando...')
    Promise.all([
      dbSelect('workout_logs'), dbSelect('body_metrics'), dbSelect('meal_logs'),
      dbSelect('exames'), dbSelect('aplicacoes'), dbSelect('dieta_logs'),
      dbSelect('photos'), dbSelect('supl_logs'), dbSelect('cardio_logs'),
    ]).then(([wl, bm, ml, ex, ap, dl, ph, sl, cl]) => {
      setWorkout(wl)
      setMetrics(bm.length > 0 ? bm : [{ id: 'seed_01', date: '02/05/2026', weight: '91.5', bf: '20', waist: '', armL: '', armR: '', chest: '', notes: 'Estimativa inicial.', created_at: '2026-05-02T00:00:00Z' }])
      setMealLog(ml); setLabLog(ex); setAplicacoes(ap); setDietaLogs(dl); setPhotos(ph); setSuplLogs(sl); setCardioLogs(cl)
      setSyncMsg('● Online'); setTimeout(() => setSyncMsg(''), 3000)
    }).catch(() => setSyncMsg('⚠ Offline'))
  }, [])

  const add = useCallback(async (table, setter, data) => {
    const row = { ...data, id: data.id || genId() }; setter(prev => [row, ...prev])
    const saved = await dbInsert(table, row); if (saved) setter(prev => prev.map(x => x.id === row.id ? saved : x)); flash()
  }, [])
  const edit = useCallback(async (table, setter, id, data) => { setter(prev => prev.map(x => x.id === id ? { ...x, ...data } : x)); await dbUpdate(table, id, data); flash() }, [])
  const remove = useCallback((table, setter, id, label = 'este item') => {
    setConfirm({ message: `Deletar "${label}"?\nEsta ação não pode ser desfeita.`, onConfirm: async () => { setConfirm(null); setter(prev => prev.filter(x => x.id !== id)); await dbDelete(table, id); flash('🗑 Deletado') } })
  }, [])

  const addWorkout    = d      => add('workout_logs', setWorkout, d)
  const editWorkout   = (id,d) => edit('workout_logs', setWorkout, id, d)
  const removeWorkout = (id,l) => remove('workout_logs', setWorkout, id, l)
  const addMetric     = d      => add('body_metrics', setMetrics, d)
  const editMetric    = (id,d) => edit('body_metrics', setMetrics, id, d)
  const removeMetric  = (id,l) => remove('body_metrics', setMetrics, id, l)
  const addMeal       = d      => add('meal_logs', setMealLog, d)
  const removeMeal    = (id,l) => remove('meal_logs', setMealLog, id, l)
  const addLab        = d      => add('exames', setLabLog, d)
  const removeLab     = (id,l) => remove('exames', setLabLog, id, l)
  const addAplicacao  = d      => add('aplicacoes', setAplicacoes, d)
  const removeAplicacao = (id,l) => remove('aplicacoes', setAplicacoes, id, l)
  const addDietaLog   = d      => add('dieta_logs', setDietaLogs, d)
  const addPhoto      = d      => add('photos', setPhotos, d)
  const removePhoto   = id     => remove('photos', setPhotos, id, 'foto')
  const addCardio     = d      => add('cardio_logs', setCardioLogs, d)

  const toggleSupl = async (suplId) => {
    const today = new Date().toISOString().slice(0, 10)
    const existing = suplLogs.find(s => s.supl_id === suplId && s.date === today)
    if (existing) { setSuplLogs(prev => prev.filter(s => s.id !== existing.id)); await dbDelete('supl_logs', existing.id) }
    else { const item = { id: genId(), supl_id: suplId, date: today }; setSuplLogs(prev => [item, ...prev]); await dbInsert('supl_logs', item) }
  }
  const isSuplDone = (id) => { const today = new Date().toISOString().slice(0, 10); return suplLogs.some(s => s.supl_id === id && s.date === today) }
  const saveCompounds = (d) => { setCompounds(d); flash() }

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todaySession = SPLIT[todayIdx]

  const startWorkout = (session, exercises) => {
    setWorkoutMode({ session, exercises })
    saveAW({ idx: 0, setIdx2: 0, phase: 'exercise', kg: '', reps: '', saved: [], exercises, sessionId: session.id, sessionLabel: session.label })
    setActiveWO({ sessionLabel: session.label, sessionColor: session.color })
  }

  const handleCardioSave = (cardioData) => {
    addCardio({ tipo: cardioData.tipo, duracao_min: cardioData.duracao, zona: cardioData.zona, date: new Date().toISOString().slice(0, 10) })
  }

  const TABS = [
    { id: 'dash',    Icon: Home,     label: 'Início',  color: T.treino  },
    { id: 'treino',  Icon: Dumbbell, label: 'Treino',  color: T.treino  },
    { id: 'nutri',   Icon: Utensils, label: 'Dieta',   color: T.nutri   },
    { id: 'horm',    Icon: Heart,    label: 'Saúde',   color: T.horm    },
    { id: 'body',    Icon: Activity, label: 'Corpo',   color: T.metrica },
    { id: 'analise', Icon: BarChart2,label: 'Análise', color: T.gold    },
    { id: 'perfil',  Icon: User,     label: 'Perfil',  color: T.horm    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Barlow','Lato',sans-serif", color: T.text, maxWidth: 480, margin: '0 auto', paddingBottom: 90 }}>
      <GlobalStyles />
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      {workoutMode && (
        <WorkoutMode
          session={workoutMode.session}
          exercises={workoutMode.exercises}
          onClose={() => { setWorkoutMode(null); setActiveWO(null); clearAW() }}
          onSave={addWorkout}
          onCardioSave={handleCardioSave}
        />
      )}

      {/* HEADER */}
      <div className="glass" style={{ padding: '48px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 13, color: T.treino, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Atlas Fitness</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={11} color={T.treino} /> {profile.phase} · até {profile.phaseEnd}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {syncMsg && <div style={{ fontSize: 9, color: syncMsg.includes('Online') ? T.ok : T.muted, fontWeight: 700, letterSpacing: 1 }}>{syncMsg}</div>}
          {/* Avatar com foto */}
          <div onClick={() => setTab('perfil')} style={{ width: 46, height: 46, borderRadius: '50%', background: profile.photo ? 'transparent' : `linear-gradient(135deg,${T.treino},#8BC34A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.bg, fontWeight: 900, fontSize: 16, boxShadow: `0 0 16px ${T.treino}40`, cursor: 'pointer', overflow: 'hidden', border: `2px solid ${T.treino}40` }}>
            {profile.photo ? <img src={profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.name[0]}
          </div>
        </div>
      </div>

      {/* TREINO ATIVO BANNER */}
      {activeWO && !workoutMode && (
        <div onClick={() => { const aw = getAW(); if (aw) { const s = SPLIT.find(s => s.id === aw.sessionId); setWorkoutMode({ session: s || { id: aw.sessionId, label: aw.sessionLabel, color: T.treino, icon: '💪' }, exercises: aw.exercises }) } }}
          className="active-pulse card-tap"
          style={{ margin: '12px 20px 0', background: T.treino + '18', border: `1px solid ${T.treino}50`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.treino, boxShadow: `0 0 8px ${T.treino}` }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.treino }}>Treino em andamento</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{activeWO.sessionLabel} — toque para continuar</div>
          </div>
          <ChevronRight size={18} color={T.treino} />
        </div>
      )}

      {/* CONTENT */}
      <div key={tab} className="fade-up" style={{ padding: '16px 20px' }}>
        {tab === 'dash'    && <DashTab profile={profile} nutrition={nutrition} metrics={metrics} todaySession={todaySession} dietaLogs={dietaLogs} aplicacoes={aplicacoes} workout={workout} isSuplDone={isSuplDone} toggleSupl={toggleSupl} addAplicacao={addAplicacao} cardioLogs={cardioLogs} onStartWorkout={() => { if (todaySession.id !== 'off') startWorkout(todaySession, EXERCISES[todaySession.id] || []) }} />}
        {tab === 'treino'  && <TreinoTab workout={workout} addItem={addWorkout} editItem={editWorkout} removeItem={removeWorkout} onStartMode={startWorkout} cardioLogs={cardioLogs} />}
        {tab === 'nutri'   && <NutriTab nutrition={nutrition} mealLog={mealLog} dietaLogs={dietaLogs} addMeal={addMeal} removeMeal={removeMeal} addDietaLog={addDietaLog} />}
        {tab === 'horm'    && <HormTab labLog={labLog} addLab={addLab} removeLab={removeLab} aplicacoes={aplicacoes} addAplicacao={addAplicacao} removeAplicacao={removeAplicacao} compounds={compounds} saveCompounds={saveCompounds} />}
        {tab === 'body'    && <BodyTab metrics={metrics} profile={profile} addMetric={addMetric} editMetric={editMetric} removeMetric={removeMetric} photos={photos} addPhoto={addPhoto} removePhoto={removePhoto} />}
        {tab === 'analise' && <AnaliseTab metrics={metrics} workout={workout} cardioLogs={cardioLogs} dietaLogs={dietaLogs} nutrition={nutrition} />}
        {tab === 'perfil'  && <PerfilTab profile={profile} setProfile={setProfile} />}
      </div>

      {/* BOTTOM NAV */}
      <div className="glass-nav" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '8px 4px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: active ? t.color + '15' : 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 14, transition: 'all .2s', position: 'relative' }}>
                {active && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, background: t.color, borderRadius: 2, boxShadow: `0 0 8px ${t.color}` }} />}
                <t.Icon size={18} color={active ? t.color : T.muted} strokeWidth={active ? 2 : 1.5} style={{ transition: 'all .2s' }} />
                <span style={{ fontSize: 7, color: active ? t.color : T.muted, textTransform: 'uppercase', letterSpacing: .8, fontWeight: 800 }}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── DASH ─────────────────────────────────────────────────────────────────────
function DashTab({ profile, nutrition, metrics, todaySession, dietaLogs, aplicacoes, workout, isSuplDone, toggleSupl, addAplicacao, cardioLogs, onStartWorkout }) {
  const sorted = [...metrics].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
  const last = sorted[sorted.length - 1]
  const today = new Date().toISOString().slice(0, 10)
  const todayDieta = dietaLogs.filter(d => d.date === today || d.created_at?.slice(0, 10) === today)
  const todayKcal = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.kcal || 0), 0)
  const todayProt = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.prot || 0), 0)
  const todayWorkout = workout.filter(w => w.created_at?.slice(0, 10) === today)
  const todayApp = aplicacoes.filter(a => a.date === today || a.created_at?.slice(0, 10) === today)
  const todayCardio = cardioLogs.filter(c => c.date === today || c.created_at?.slice(0, 10) === today)
  const suplDone = SUPLS.filter(s => isSuplDone(s.id)).length
  const dietaPct  = Math.min(100, Math.round((todayKcal / nutrition.calories) * 100))
  const treinoPct = todaySession?.id === 'off' ? 100 : Math.min(100, todayWorkout.length > 0 ? 100 : 0)
  const protoPct  = Math.min(100, todayApp.length > 0 ? 100 : 0)
  const suplPct   = Math.round((suplDone / SUPLS.length) * 100)
  const cardioPct = Math.min(100, todayCardio.length > 0 ? 100 : 0)
  const scoreDia  = Math.round((dietaPct + treinoPct + protoPct + suplPct + cardioPct) / 5)
  const scoreColor = scoreDia > 70 ? T.treino : scoreDia > 40 ? T.warn : T.alert
  const bfAtual = parseFloat(last?.bf || 20); const bfMeta = parseFloat(profile.bfMeta || 12)
  const semanas = bfAtual > bfMeta ? Math.ceil(((bfAtual - bfMeta) * 0.453 * 7700) / (400 * 7)) : 0
  const chartData = sorted.slice(-8).map((m, i) => ({ n: (m.date || '').slice(0, 5) || `${i + 1}`, kg: parseFloat(m.weight) || null, bf: parseFloat(m.bf) || null }))
  const isInjDay = new Date().getDay() === 1 || new Date().getDay() === 4
  const alreadyInjected = todayApp.some(a => a.compound?.includes('Enantato'))

  return (
    <div>
      {/* TODAY HERO */}
      <div onClick={todaySession?.id !== 'off' ? onStartWorkout : undefined} className={todaySession?.id !== 'off' ? 'card-tap' : ''}
        style={{ background: `linear-gradient(135deg,${T.card} 0%,${(todaySession?.color || T.treino) + '12'} 100%)`, border: `1px solid ${(todaySession?.color || T.treino) + '30'}`, borderRadius: 24, padding: '24px', marginBottom: 12, cursor: todaySession?.id !== 'off' ? 'pointer' : 'default' }}>
        <div style={{ fontSize: 9, color: T.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={10} /> Hoje — {todaySession?.day}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: todaySession?.id !== 'off' ? 16 : 0 }}>
          <div style={{ fontSize: 46 }}>{todaySession?.icon}</div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: todaySession?.color || T.text, letterSpacing: -1.5, lineHeight: 1 }}>{todaySession?.label}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 5, fontWeight: 600 }}>{todaySession?.tag}</div>
          </div>
        </div>
        {todaySession?.id !== 'off' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: todaySession?.color || T.treino, borderRadius: 14, padding: '12px 22px', boxShadow: `0 4px 20px ${(todaySession?.color || T.treino)}50` }}>
            <Play size={14} color={T.bg} fill={T.bg} />
            <span style={{ fontSize: 13, fontWeight: 900, color: T.bg, letterSpacing: .8 }}>INICIAR TREINO</span>
          </div>
        )}
      </div>

      {/* SCORE + STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, marginBottom: 12 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 88, marginBottom: 0, padding: '18px 14px' }}>
          <div style={{ position: 'relative', width: 68, height: 68 }}>
            <svg width={68} height={68} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx={34} cy={34} r={28} fill="none" stroke={T.faint} strokeWidth={6} />
              <circle cx={34} cy={34} r={28} fill="none" stroke={scoreColor} strokeWidth={6} strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - scoreDia / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 4px ${scoreColor}80)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>{scoreDia}</div>
            </div>
          </div>
          <div style={{ fontSize: 8, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginTop: 8, fontWeight: 700 }}>Score</div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ l: 'Peso', v: last?.weight || '—', u: 'kg', c: T.treino, Icon: Scale }, { l: 'BF%', v: last?.bf || '—', u: '%', c: T.metrica, Icon: Target }, { l: 'Kcal', v: todayKcal || '—', u: '', c: T.nutri, Icon: Flame }, { l: 'Prot', v: todayProt || '—', u: 'g', c: T.treino, Icon: Zap }].map(s => (
            <div key={s.l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '12px' }}>
              <s.Icon size={14} color={s.c} strokeWidth={1.5} style={{ marginBottom: 6, opacity: .8 }} />
              <div style={{ fontSize: 20, fontWeight: 900, color: s.c, lineHeight: 1, letterSpacing: -1 }}>{s.v}<span style={{ fontSize: 10, fontWeight: 700 }}>{s.u}</span></div>
              <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESS BARS */}
      <Card>
        <Lbl>Progresso do Dia</Lbl>
        {[{ l: 'Dieta', v: dietaPct, c: T.nutri, Icon: Utensils }, { l: 'Treino', v: treinoPct, c: T.treino, Icon: Dumbbell }, { l: 'Cardio', v: cardioPct, c: T.ok, Icon: Activity }, { l: 'Protocolo', v: protoPct, c: T.horm, Icon: Syringe }, { l: 'Suplementos', v: suplPct, c: T.gold, Icon: Pill }].map(s => (
          <div key={s.l} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, fontWeight: 700, alignItems: 'center' }}>
              <span style={{ color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}><s.Icon size={12} strokeWidth={1.5} /> {s.l}</span>
              <span style={{ color: s.c, fontWeight: 900 }}>{s.v}%</span>
            </div>
            <div style={{ background: T.faint, borderRadius: 4, height: 4, overflow: 'hidden' }}>
              <div style={{ width: `${s.v}%`, height: '100%', background: `linear-gradient(90deg,${s.c}CC,${s.c})`, borderRadius: 4, transition: 'width 1s ease', boxShadow: s.v > 0 ? `0 0 6px ${s.c}60` : 'none' }} />
            </div>
          </div>
        ))}
      </Card>

      {/* CARDIO DE HOJE */}
      {todayCardio.length > 0 && (
        <Card color={T.ok}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Activity size={24} color={T.ok} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.ok }}>Cardio Registrado</div>
              {todayCardio.map((c, i) => <div key={i} style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.tipo} · {c.duracao_min}min · Zona {c.zona}</div>)}
            </div>
          </div>
        </Card>
      )}

      {/* INJECTION */}
      {isInjDay && !alreadyInjected && (
        <Card color={T.horm}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: T.horm + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Syringe size={22} color={T.horm} strokeWidth={1.5} /></div>
            <div><div style={{ fontSize: 13, fontWeight: 800 }}>Dia de Aplicação</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Testo Enantato + Anastrozol</div></div>
          </div>
          <Btn full color={T.horm} style={{ color: T.bg }} onClick={() => { const today = new Date().toISOString().slice(0, 10); addAplicacao({ compound: 'Testosterona Enantato', dose: '0.7', unit: 'ml', obs: '', date: today }); addAplicacao({ compound: 'Anastrozol', dose: '0.5', unit: 'mg', obs: '', date: today }) }}>Registrar Aplicação</Btn>
        </Card>
      )}
      {isInjDay && alreadyInjected && (
        <Card color={T.ok}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><CheckCheck size={28} color={T.ok} strokeWidth={2} /><div><div style={{ fontSize: 14, fontWeight: 800, color: T.ok }}>Aplicação Registrada</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Testo + Anastrozol — hoje</div></div></div></Card>
      )}

      {/* SUPLS */}
      <Card>
        <Lbl>Suplementos — {suplDone}/{SUPLS.length}</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SUPLS.map(s => { const done = isSuplDone(s.id); return (
            <button key={s.id} onClick={() => toggleSupl(s.id)} style={{ background: done ? s.color + '18' : T.faint, border: `1px solid ${done ? s.color : T.border2}`, borderRadius: 16, padding: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .2s', boxShadow: done ? `0 0 12px ${s.color}30` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <s.Icon size={16} color={done ? s.color : T.muted} strokeWidth={1.5} />
                {done && <CheckCircle size={14} color={T.ok} />}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: done ? s.color : T.muted, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{s.dose} · {s.time}</div>
            </button>
          )})}
        </div>
      </Card>

      {/* BF + CHART */}
      {bfAtual > bfMeta && (
        <Card color={T.metrica}>
          <Lbl>Previsão BF%</Lbl>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: T.alert, fontWeight: 800 }}>{bfAtual}%</span><ArrowRight size={14} color={T.muted} /><span style={{ color: T.ok, fontWeight: 800 }}>{bfMeta}%</span></div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -2 }}>~{semanas} sem</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: T.metrica, letterSpacing: -3, lineHeight: 1 }}>{(bfAtual - bfMeta).toFixed(1)}</div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700 }}>% a perder</div>
            </div>
          </div>
        </Card>
      )}
      {chartData.length > 1 && (
        <Card>
          <Lbl>Evolução — Peso & BF%</Lbl>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gKg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.treino} stopOpacity={0.3} /><stop offset="95%" stopColor={T.treino} stopOpacity={0} /></linearGradient>
                <linearGradient id="gBf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.metrica} stopOpacity={0.3} /><stop offset="95%" stopColor={T.metrica} stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="n" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, fontSize: 11, color: T.text }} />
              <Area type="monotone" dataKey="kg" stroke={T.treino} strokeWidth={2.5} fill="url(#gKg)" dot={false} connectNulls name="Peso" />
              <Area type="monotone" dataKey="bf" stroke={T.metrica} strokeWidth={2.5} fill="url(#gBf)" dot={false} connectNulls name="BF%" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
      <Card>
        <Lbl>Plano de Fases</Lbl>
        {[{ fase: 'Fase 1 — Cutting', period: 'Abr → Jul 2026', active: true }, { fase: 'Fase 2 — Recomp', period: 'Ago → Out 2026', active: false }, { fase: 'Fase 3 — Bulk', period: 'Nov 2026 → Mar 2027', active: false }, { fase: 'Fase 4 — Cutting', period: 'Abr → Jun 2027', active: false }].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: f.active ? T.treino : T.border2, boxShadow: f.active ? `0 0 10px ${T.treino}` : 'none' }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: f.active ? 800 : 500, color: f.active ? T.text : T.muted }}>{f.fase}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{f.period}</div></div>
            {f.active && <Tag color={T.treino}>Ativo</Tag>}
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── TREINO ───────────────────────────────────────────────────────────────────
function TreinoTab({ workout, addItem, editItem, removeItem, onStartMode, cardioLogs }) {
  const [sel, setSel] = useState(null); const [loads, setLoads] = useState({}); const [editing, setEditing] = useState(null); const [exFilter, setExFilter] = useState(null)
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const saveLoad = (name, kg, reps, dayId) => { if (!kg) return; addItem({ exercise: name, kg, reps, date: new Date().toLocaleDateString('pt-BR'), day: dayId }); setLoads(l => ({ ...l, [name + '-kg']: '', [name + '-reps']: '' })) }
  const getHist = (name) => [...workout].filter(l => l.exercise === name).sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1).slice(0, 5)

  if (sel && exFilter) {
    const session = SPLIT.find(s => s.id === sel); const ex = EXERCISES[sel]?.find(e => e.name === exFilter); if (!ex) return null
    const hist = getHist(ex.name); const chartData = hist.slice().reverse().map((h, i) => ({ n: `${i + 1}`, kg: parseFloat(h.kg) || null }))
    return (
      <div>
        <button onClick={() => setExFilter(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 20, fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><ChevronLeft size={16} /> Voltar</button>
        <Tag color={session.color} small>{ex.muscle}</Tag>
        <div style={{ fontSize: 26, fontWeight: 900, color: session.color, marginTop: 10, marginBottom: 4, letterSpacing: -1 }}>{ex.name}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[{ l: 'Séries', v: ex.sets, Icon: RotateCcw }, { l: 'Reps', v: ex.reps, Icon: Target }, { l: 'Pausa', v: ex.rest > 0 ? `${ex.rest}s` : '—', Icon: Clock }].map(s => (
            <div key={s.l} style={{ flex: 1, background: T.faint, borderRadius: 14, padding: '12px', textAlign: 'center' }}>
              <s.Icon size={14} color={session.color} strokeWidth={1.5} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 17, fontWeight: 900, color: session.color, letterSpacing: -1 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontWeight: 700 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: T.faint, borderLeft: `3px solid ${session.color}`, borderRadius: '0 14px 14px 0', padding: '12px 16px', fontSize: 12, color: T.muted, lineHeight: 1.8, marginBottom: 16 }}>💡 {ex.cue}</div>
        {chartData.length > 1 && (<Card><Lbl>Evolução de Carga</Lbl><ResponsiveContainer width="100%" height={90}><AreaChart data={chartData}><defs><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={session.color} stopOpacity={0.25} /><stop offset="95%" stopColor={session.color} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="n" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, fontSize: 11, color: T.text }} /><Area type="monotone" dataKey="kg" stroke={session.color} strokeWidth={2.5} fill="url(#gl)" dot={{ fill: session.color, r: 3 }} connectNulls name="kg" /></AreaChart></ResponsiveContainer></Card>)}
        <Card>
          <Lbl>Registrar Carga</Lbl>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Inp placeholder="kg" value={loads[ex.name + '-kg'] || ''} onChange={v => setLoads({ ...loads, [ex.name + '-kg']: v })} type="number" style={{ flex: 1, fontSize: 20, padding: '14px', textAlign: 'center', fontWeight: 800 }} />
            <Inp placeholder="reps" value={loads[ex.name + '-reps'] || ''} onChange={v => setLoads({ ...loads, [ex.name + '-reps']: v })} type="number" style={{ flex: 1, fontSize: 20, padding: '14px', textAlign: 'center', fontWeight: 800 }} />
          </div>
          <Btn full color={session.color} style={{ color: T.bg }} onClick={() => saveLoad(ex.name, loads[ex.name + '-kg'], loads[ex.name + '-reps'], sel)}>+ Salvar</Btn>
        </Card>
        {hist.length > 0 && (<Card><Lbl>Histórico</Lbl>{hist.map((h, i) => (<div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: i < hist.length - 1 ? `1px solid ${T.border}` : 'none' }}>{editing?.id === h.id ? (<><Inp value={editing.kg} onChange={v => setEditing({ ...editing, kg: v })} placeholder="kg" style={{ width: 70 }} /><Inp value={editing.reps} onChange={v => setEditing({ ...editing, reps: v })} placeholder="reps" style={{ width: 70 }} /><Btn small color={T.ok} style={{ color: T.bg }} onClick={() => { editItem(editing.id, { kg: editing.kg, reps: editing.reps }); setEditing(null) }}>✓</Btn><Btn small ghost color={T.muted} onClick={() => setEditing(null)}>✕</Btn></>) : (<><span style={{ flex: 1, background: session.color + '15', color: session.color, fontSize: 12, padding: '8px 14px', borderRadius: 12, fontWeight: 700 }}>{h.date} · {h.kg}kg × {h.reps}{h.obs ? ` · ${h.obs}` : ''}</span><button onClick={() => setEditing({ id: h.id, kg: h.kg, reps: h.reps })} style={{ background: 'none', border: 'none', color: T.horm, cursor: 'pointer', fontSize: 15 }}>✏️</button><button onClick={() => removeItem(h.id, `${ex.name} ${h.date}`)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer' }}><X size={15} /></button></>)}</div>))}</Card>)}
      </div>
    )
  }

  if (sel) {
    const session = SPLIT.find(s => s.id === sel)
    if (sel === 'off') return (<div><button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 20, fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><ChevronLeft size={16} /> Voltar</button><div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: 64, marginBottom: 16 }}>⚽</div><div style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: -1 }}>Dia de Futebol</div><div style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>Descanso ativo. Aproveita!</div></div></div>)
    return (
      <div>
        <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: 20, fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><ChevronLeft size={16} /> Voltar</button>
        <div style={{ fontSize: 28, fontWeight: 900, color: session.color, marginBottom: 4, letterSpacing: -1 }}>{session.icon} {session.label}</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, fontWeight: 600 }}>{session.tag}</div>
        <Btn full color={session.color} style={{ marginBottom: 16, color: T.bg }} onClick={() => onStartMode(session, EXERCISES[sel] || [])}><Play size={16} fill={T.bg} /> MODO TREINO — TELA CHEIA</Btn>
        {(EXERCISES[sel] || []).map((ex, i) => { const isCardio = ex.name.includes('Cardio'); const hist = getHist(ex.name); const lastLoad = hist[0]; return (
          <Card key={i} color={isCardio ? T.nutri : session.color} onClick={() => setExFilter(ex.name)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Tag color={isCardio ? T.nutri : session.color} small>{ex.muscle}</Tag>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8, marginBottom: 4 }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{ex.sets}×{ex.reps} · {ex.rest > 0 ? `${ex.rest}s pausa` : 'sem pausa'}</div>
                {lastLoad && <div style={{ fontSize: 11, color: session.color, marginTop: 6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={11} /> Última: {lastLoad.kg}kg × {lastLoad.reps}</div>}
              </div>
              <ChevronRight size={20} color={T.muted} />
            </div>
          </Card>
        )})}
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}><Dumbbell size={26} color={T.treino} strokeWidth={1.5} /> Treinos</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 18, fontWeight: 600 }}>PPL · 6×/semana</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {SPLIT.map((s, i) => { const isToday = i === todayIdx; return (
          <div key={s.id} onClick={() => setSel(s.id)} style={{ flexShrink: 0, width: 58, background: isToday ? s.color : T.card, border: `1px solid ${isToday ? s.color : T.border}`, borderRadius: 16, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', boxShadow: isToday ? `0 0 14px ${s.color}50` : 'none' }}>
            <div style={{ fontSize: 9, color: isToday ? T.bg : T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, fontWeight: 800 }}>{s.day}</div>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 8, color: isToday ? T.bg : T.muted, marginTop: 5, lineHeight: 1.3, fontWeight: 700 }}>{s.label}</div>
          </div>
        )})}
      </div>
      {SPLIT.map(s => (
        <Card key={s.id} color={s.color} onClick={() => setSel(s.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: 18, fontWeight: 900, color: s.color, letterSpacing: -.5 }}>{s.icon} {s.label}</div><div style={{ fontSize: 12, color: T.muted, marginTop: 3, fontWeight: 600 }}>{s.tag}</div>{EXERCISES[s.id] && <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>{EXERCISES[s.id].length} exercícios</div>}</div>
            <ChevronRight size={22} color={T.muted} />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── NUTRI ────────────────────────────────────────────────────────────────────
function NutriTab({ nutrition, mealLog, dietaLogs, addMeal, removeMeal, addDietaLog }) {
  const [log, setLog] = useState({ time: '', desc: '', kcal: '', prot: '', carb: '', fat: '' })
  const [showCorrection, setShowCorrection] = useState(null)
  const [corrDesc, setCorrDesc] = useState('')
  const today = new Date().toISOString().slice(0, 10); const todayDate = new Date().toLocaleDateString('pt-BR')
  const todayDieta = dietaLogs.filter(d => d.date === today || d.created_at?.slice(0, 10) === today)
  const getMealStatus = (mealId) => todayDieta.find(d => d.meal_id === mealId)
  const toggleMeal = (meal, ate) => { if (getMealStatus(meal.id)) return; addDietaLog({ meal_id: meal.id, meal_label: meal.label, ate, kcal: ate ? meal.kcal : 0, prot: ate ? meal.prot : 0, carb: ate ? meal.carb : 0, fat: ate ? meal.fat : 0, date: today }) }
  const todayKcal = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.kcal || 0), 0)
  const todayProt = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.prot || 0), 0)
  const todayCarb = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.carb || 0), 0)
  const todayFat  = todayDieta.filter(d => d.ate).reduce((s, d) => s + (d.fat || 0), 0)
  const addMealLog = () => { if (!log.desc) return; addMeal({ ...log, date: todayDate }); setLog({ time: '', desc: '', kcal: '', prot: '', carb: '', fat: '' }) }
  const currentHour = new Date().getHours() + new Date().getMinutes() / 60
  const getUrg = (t) => { const [h, m] = t.split(':').map(Number); const d = (h + m / 60) - currentHour; if (d < 0 && d > -1) return 'now'; if (d >= 0 && d < 1) return 'soon'; return 'normal' }

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}><Utensils size={24} color={T.nutri} strokeWidth={1.5} /> Dieta</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, fontWeight: 600 }}>~2.100 kcal · 190g proteína</div>

      {/* Macros do dia */}
      <Card color={T.nutri}>
        <Lbl color={T.nutri}>Macros de Hoje</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[{ l: 'Kcal', v: todayKcal, meta: nutrition.calories, u: '', c: T.nutri }, { l: 'Prot', v: todayProt, meta: nutrition.protein, u: 'g', c: T.treino }, { l: 'Carb', v: todayCarb, meta: nutrition.carbs, u: 'g', c: T.warn }, { l: 'Fat', v: todayFat, meta: nutrition.fat, u: 'g', c: T.metrica }].map(m => (
            <div key={m.l} style={{ background: T.faint, borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: m.c, letterSpacing: -1 }}>{m.v}<span style={{ fontSize: 9 }}>{m.u}</span></div>
              <div style={{ fontSize: 8, color: T.muted, marginTop: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</div>
              <div style={{ background: T.border, borderRadius: 3, height: 3, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${Math.min((m.v / m.meta) * 100, 100)}%`, height: '100%', background: m.c, transition: 'width 1s ease' }} /></div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Lbl>Refeições de Hoje</Lbl>
        {DIET.map((meal, i) => { const status = getMealStatus(meal.id); const urg = getUrg(meal.time); return (
          <div key={meal.id} style={{ padding: '12px 0', borderBottom: i < DIET.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  {urg === 'now' && !status && <Tag color={T.warn} small>Agora</Tag>}
                  {urg === 'soon' && !status && <Tag color={T.nutri} small>Em breve</Tag>}
                  <span style={{ fontSize: 11, color: T.nutri, fontWeight: 800 }}>{meal.time}</span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{meal.label}</span>
                </div>
                <div style={{ fontSize: 10, color: T.muted }}>{meal.kcal}kcal · P:{meal.prot}g · C:{meal.carb}g · G:{meal.fat}g</div>
              </div>
              {status ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag color={status.ate ? T.ok : T.alert} small>{status.ate ? '✓ Comi' : '✗ Não'}</Tag>
                  <button onClick={() => setShowCorrection(meal.id)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }}>✏️</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleMeal(meal, true)} style={{ background: T.ok + '18', color: T.ok, border: `1px solid ${T.ok}35`, borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
                  <button onClick={() => toggleMeal(meal, false)} style={{ background: T.alert + '18', color: T.alert, border: `1px solid ${T.alert}35`, borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>✗</button>
                </div>
              )}
            </div>
            {showCorrection === meal.id && (
              <div style={{ background: T.faint, borderRadius: 12, padding: '12px', marginTop: 8 }}>
                <div style={{ fontSize: 11, color: T.warn, fontWeight: 700, marginBottom: 8 }}>Corrigir registro</div>
                <Inp placeholder="O que aconteceu de diferente?" value={corrDesc} onChange={setCorrDesc} style={{ width: '100%', marginBottom: 8, fontSize: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn small ghost color={T.muted} onClick={() => { setShowCorrection(null); setCorrDesc('') }}>Cancelar</Btn>
                  <Btn small color={T.warn} style={{ color: T.bg }} onClick={() => { addMeal({ desc: `[CORREÇÃO] ${meal.label}: ${corrDesc}`, kcal: 0, prot: 0, carb: 0, fat: 0, date: todayDate, time: meal.time }); setShowCorrection(null); setCorrDesc('') }}>Salvar Correção</Btn>
                </div>
              </div>
            )}
            {meal.options.map((op, j) => <div key={j} style={{ fontSize: 10, color: T.muted, lineHeight: 1.7, paddingLeft: 12, borderLeft: `2px solid ${T.nutri}25`, marginTop: 3 }}>{op}</div>)}
          </div>
        )})}
      </Card>

      <Card color={T.treino}>
        <Lbl color={T.treino}>Registro Livre</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <Inp placeholder="Horário" value={log.time} onChange={v => setLog({ ...log, time: v })} style={{ width: '100%' }} />
          <Inp placeholder="Kcal" type="number" value={log.kcal} onChange={v => setLog({ ...log, kcal: v })} style={{ width: '100%' }} />
        </div>
        <Inp placeholder="O que você comeu?" value={log.desc} onChange={v => setLog({ ...log, desc: v })} style={{ width: '100%', marginBottom: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
          <Inp placeholder="Prot(g)" type="number" value={log.prot} onChange={v => setLog({ ...log, prot: v })} style={{ width: '100%' }} />
          <Inp placeholder="Carb(g)" type="number" value={log.carb} onChange={v => setLog({ ...log, carb: v })} style={{ width: '100%' }} />
          <Inp placeholder="Fat(g)" type="number" value={log.fat} onChange={v => setLog({ ...log, fat: v })} style={{ width: '100%' }} />
        </div>
        <Btn full color={T.treino} style={{ color: T.bg }} onClick={addMealLog}>+ Adicionar</Btn>
      </Card>

      {mealLog.filter(m => m.date === todayDate).length > 0 && (
        <Card><Lbl>Livres de Hoje</Lbl>{mealLog.filter(m => m.date === todayDate).map((m, i, arr) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: m.desc?.includes('[CORREÇÃO]') ? T.warn : T.text }}>{m.desc}</div><div style={{ fontSize: 10, color: T.muted }}>{m.time}</div></div>
            <div style={{ textAlign: 'right', marginRight: 10 }}><div style={{ fontSize: 11, color: T.nutri, fontWeight: 800 }}>{m.kcal}kcal</div></div>
            <button onClick={() => removeMeal(m.id, m.desc)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer' }}><X size={15} /></button>
          </div>
        ))}</Card>
      )}
    </div>
  )
}

// ─── SAÚDE ────────────────────────────────────────────────────────────────────
function HormTab({ labLog, addLab, removeLab, aplicacoes, addAplicacao, removeAplicacao, compounds, saveCompounds }) {
  const [labForm, setLabForm] = useState({ marker: '', value: '', unit: '', date: '' })
  const [appForm, setAppForm] = useState({ compound: '', dose: '', unit: 'ml', obs: '', date: '' })
  const [editDose, setEditDose] = useState(null); const [showApp, setShowApp] = useState(false); const [showLab, setShowLab] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)
  const fileRef = useRef(null)
  const today = new Date().toISOString().slice(0, 10)

  const getStatus = (marker, val) => { const ref = LAB_REFS[marker]; if (!ref) return 'ok'; const v = parseFloat(val); if (isNaN(v)) return 'ok'; if (ref.alert === 'high' && v > ref.max) return 'alert'; if (ref.alert === 'low' && v < ref.min) return 'alert'; if (v < ref.min || v > ref.max) return 'warn'; return 'ok' }
  const getTrend = (marker) => { const h = labLog.filter(l => l.marker === marker).sort((a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date)); if (h.length < 2) return null; const l = parseFloat(h[h.length - 1].value), p = parseFloat(h[h.length - 2].value); if (isNaN(l) || isNaN(p)) return null; if (l > p) return 'up'; if (l < p) return 'down'; return 'eq' }
  const getAlerts = () => { const latest = {}; labLog.forEach(l => { if (!latest[l.marker] || new Date(l.created_at || l.date) > new Date(latest[l.marker].created_at || latest[l.marker].date)) latest[l.marker] = l }); return Object.values(latest).filter(l => getStatus(l.marker, l.value) !== 'ok') }
  const alerts = getAlerts(); const appsGrouped = {}; aplicacoes.forEach(a => { if (!appsGrouped[a.compound]) appsGrouped[a.compound] = []; appsGrouped[a.compound].push(a) })

  const handlePdf = (e) => { const f = e.target.files[0]; if (f) setPdfFile(f) }
  const saveLab = () => {
    if (!labForm.marker || !labForm.value) return
    addLab({ ...labForm, date: labForm.date || today, pdf_name: pdfFile?.name || null })
    setLabForm({ marker: '', value: '', unit: '', date: '' }); setPdfFile(null); setShowLab(false)
  }

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}><Heart size={24} color={T.horm} strokeWidth={1.5} /> Saúde</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, fontWeight: 600 }}>Protocolo · Aplicações · Exames</div>
      {alerts.length > 0 && (
        <Card color={T.alert}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><AlertTriangle size={16} color={T.alert} /><Lbl color={T.alert}>Alertas</Lbl></div>
          {alerts.map((a, i) => { const ref = LAB_REFS[a.marker]; const st = getStatus(a.marker, a.value); return (<div key={i} style={{ display: 'flex', alignItems: 'flex-start', padding: '7px 0', borderBottom: i < alerts.length - 1 ? `1px solid ${T.border}` : 'none' }}><StatusDot status={st} /><div><div style={{ fontSize: 12, fontWeight: 800 }}>{a.marker}: {a.value}</div><div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{st === 'alert' && ref?.alert === 'high' ? `Acima (>${ref.max}${ref.unit})` : `Abaixo (<${ref.min}${ref.unit})`}</div></div></div>) })}
        </Card>
      )}
      <Card color={T.horm}>
        <Lbl color={T.horm}>Protocolo Ativo</Lbl>
        {compounds.map((c, idx) => (
          <div key={c.id} style={{ padding: '12px 0', borderBottom: idx < compounds.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: 13, fontWeight: 800 }}>{c.name}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={10} /> {c.schedule} · {c.weekly}/sem</div></div>
              {editDose?.idx === idx ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Inp value={editDose.dose} onChange={v => setEditDose({ ...editDose, dose: v })} style={{ width: 60 }} /><span style={{ fontSize: 11, color: T.muted }}>{c.unit}</span><Btn small color={T.ok} style={{ color: T.bg }} onClick={() => { saveCompounds(compounds.map((x, i) => i === idx ? { ...x, dose: editDose.dose } : x)); setEditDose(null) }}>✓</Btn><Btn small ghost color={T.muted} onClick={() => setEditDose(null)}>✕</Btn></div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Tag color={c.color}>{c.dose}{c.unit}</Tag><button onClick={() => setEditDose({ idx, dose: c.dose })} style={{ background: 'none', border: 'none', color: T.horm, cursor: 'pointer', fontSize: 15 }}>✏️</button></div>
              )}
            </div>
            {appsGrouped[c.name]?.slice(0, 2).map((ap, j) => <div key={j} style={{ fontSize: 10, color: T.muted, marginTop: 5, paddingLeft: 8 }}>→ {ap.date}: {ap.dose}{ap.unit}{ap.obs ? ` · ${ap.obs}` : ''}</div>)}
          </div>
        ))}
      </Card>
      <div style={{ marginBottom: 10 }}><Btn full color={T.horm} style={{ color: T.bg }} onClick={() => setShowApp(!showApp)}><Syringe size={16} /> {showApp ? 'Cancelar' : 'Registrar Aplicação'}</Btn></div>
      {showApp && (
        <Card color={T.horm}>
          <Lbl>Nova Aplicação</Lbl>
          <select value={appForm.compound} onChange={e => setAppForm({ ...appForm, compound: e.target.value })} style={{ width: '100%', background: T.faint, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: T.text, outline: 'none', marginBottom: 8, fontFamily: 'inherit' }}><option value="">Selecionar…</option>{compounds.map(c => <option key={c.id}>{c.name}</option>)}</select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}><Inp placeholder="Dose" value={appForm.dose} onChange={v => setAppForm({ ...appForm, dose: v })} style={{ width: '100%' }} /><select value={appForm.unit} onChange={e => setAppForm({ ...appForm, unit: e.target.value })} style={{ background: T.faint, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 8px', fontSize: 13, color: T.text, outline: 'none', fontFamily: 'inherit' }}><option value="ml">ml</option><option value="mg">mg</option><option value="UI">UI</option></select><Inp type="date" value={appForm.date} onChange={v => setAppForm({ ...appForm, date: v })} style={{ width: '100%' }} /></div>
          <Inp placeholder="Obs" value={appForm.obs} onChange={v => setAppForm({ ...appForm, obs: v })} style={{ width: '100%', marginBottom: 12 }} />
          <Btn full color={T.horm} style={{ color: T.bg }} onClick={() => { if (!appForm.compound || !appForm.dose) return; addAplicacao({ ...appForm, date: appForm.date || today }); setAppForm({ compound: '', dose: '', unit: 'ml', obs: '', date: '' }); setShowApp(false) }}>Salvar</Btn>
        </Card>
      )}
      {aplicacoes.length > 0 && (<Card><Lbl>Histórico de Aplicações</Lbl>{[...aplicacoes].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 10).map((a, i) => (<div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}><div><div style={{ fontSize: 12, fontWeight: 800 }}>{a.compound}</div><div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{a.date}{a.obs ? ` · ${a.obs}` : ''}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Tag color={T.horm}>{a.dose}{a.unit}</Tag><button onClick={() => removeAplicacao(a.id, `${a.compound} ${a.date}`)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer' }}><X size={14} /></button></div></div>))}</Card>)}

      <div style={{ marginBottom: 10, marginTop: 6 }}><Btn full color={T.nutri} style={{ color: T.bg }} onClick={() => setShowLab(!showLab)}><FlaskConical size={16} /> {showLab ? 'Cancelar' : 'Registrar Exame'}</Btn></div>
      {showLab && (
        <Card color={T.nutri}>
          <Lbl>Novo Exame</Lbl>
          <select value={labForm.marker} onChange={e => { const ref = LAB_REFS[e.target.value]; setLabForm({ ...labForm, marker: e.target.value, unit: ref?.unit || '' }) }} style={{ width: '100%', background: T.faint, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: T.text, outline: 'none', marginBottom: 8, fontFamily: 'inherit' }}><option value="">Selecionar marcador…</option>{Object.keys(LAB_REFS).map(k => <option key={k}>{k}</option>)}<option>Outro</option></select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}><Inp placeholder="Valor" value={labForm.value} onChange={v => setLabForm({ ...labForm, value: v })} style={{ width: '100%' }} /><Inp placeholder="Unidade" value={labForm.unit} onChange={v => setLabForm({ ...labForm, unit: v })} style={{ width: '100%' }} /><Inp type="date" value={labForm.date} onChange={v => setLabForm({ ...labForm, date: v })} style={{ width: '100%' }} /></div>
          {/* Upload PDF */}
          <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdf} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', background: T.faint, border: `1px dashed ${T.border2}`, borderRadius: 12, padding: '12px', color: pdfFile ? T.ok : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Upload size={16} /> {pdfFile ? `PDF: ${pdfFile.name}` : 'Anexar PDF do exame (opcional)'}
          </button>
          <Btn full color={T.horm} style={{ color: T.bg }} onClick={saveLab}>Salvar Exame</Btn>
        </Card>
      )}
      {labLog.length > 0 && (<Card><Lbl>Histórico de Exames</Lbl>{[...labLog].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 20).map((l, i) => { const st = getStatus(l.marker, l.value); const trend = getTrend(l.marker); const ref = LAB_REFS[l.marker]; const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus; const trendColor = trend === 'up' ? T.alert : trend === 'down' ? T.ok : T.muted; return (<div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}><StatusDot status={st} /><div style={{ flex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12, fontWeight: 800 }}>{l.marker}{l.pdf_name ? ' 📄' : ''}</div><div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{l.date || l.created_at?.slice(0, 10)}{ref ? ` · ${ref.min}–${ref.max}${ref.unit}` : ''}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{trend && <TrendIcon size={13} color={trendColor} />}<span style={{ fontSize: 13, fontWeight: 800, color: st === 'ok' ? T.ok : st === 'warn' ? T.warn : T.alert }}>{l.value}{l.unit ? ` ${l.unit}` : ''}</span><button onClick={() => removeLab(l.id, l.marker)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer' }}><X size={13} /></button></div></div></div></div>) })}</Card>)}
      <Card color={T.treino}>
        <Lbl color={T.treino}>Suplementação</Lbl>
        {[{ s: 'Vitamina D3+K2', d: '2.000–4.000 UI/dia', status: 'alert', note: 'Deficiente no exame fev/26' }, { s: 'Vitamina B12', d: '1.000 mcg/dia', status: 'warn', note: 'Baixo-moderado. Monitorar.' }, { s: 'Creatina', d: '3–5g pós-treino', status: 'ok', note: 'Manutenção de força no cutting.' }, { s: 'Ômega 3', d: '2–4g/dia', status: 'warn', note: 'Auxilia no HDL baixo.' }].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
            <StatusDot status={s.status} />
            <div><div style={{ fontSize: 13, fontWeight: 800 }}>{s.s}</div><div style={{ fontSize: 11, color: T.horm, fontWeight: 700, marginTop: 1 }}>{s.d}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{s.note}</div></div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── CORPO (com fotos integradas) ─────────────────────────────────────────────
function BodyTab({ metrics, profile, addMetric, editMetric, removeMetric, photos, addPhoto, removePhoto }) {
  const [entry, setEntry] = useState({ date: '', weight: '', bf: '', waist: '', armL: '', armR: '', chest: '', notes: '' })
  const [editing, setEditing] = useState(null)
  const [tag, setTag] = useState('frente')
  const [viewCompare, setViewCompare] = useState(false)
  const [selectedA, setSelectedA] = useState(null)
  const [selectedB, setSelectedB] = useState(null)
  const fileRef = useRef(null)
  const TAGS = ['frente', 'costas', 'lateral', 'geral']
  const sorted = [...metrics].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
  const last = sorted[sorted.length - 1]
  const chartData = sorted.slice(-12).map((m, i) => ({ n: (m.date || '').slice(0, 5) || `${i + 1}`, kg: parseFloat(m.weight) || null, bf: parseFloat(m.bf) || null }))
  const add = () => { if (!entry.weight && !entry.bf) return; addMetric({ ...entry, date: entry.date || new Date().toLocaleDateString('pt-BR') }); setEntry({ date: '', weight: '', bf: '', waist: '', armL: '', armR: '', chest: '', notes: '' }) }
  const photosSorted = [...photos].sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0))
  const byTag = (t) => photosSorted.filter(p => p.tag === t)
  const handleFile = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { addPhoto({ id: genId(), src: ev.target.result, date: new Date().toLocaleDateString('pt-BR'), isoDate: new Date().toISOString().slice(0, 10), tag, notes: '' }) }; reader.readAsDataURL(file); e.target.value = '' }

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, marginBottom: 16 }}>Corpo & Fotos</div>

      {/* BF */}
      <Card color={T.metrica}>
        <Lbl color={T.metrica}>BF% — Atual → Meta</Lbl>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, textAlign: 'center', background: T.faint, borderRadius: 14, padding: '16px 10px' }}><div style={{ fontSize: 34, fontWeight: 900, color: T.alert, letterSpacing: -2 }}>{last?.bf || '—'}%</div><div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 2, marginTop: 5, fontWeight: 700 }}>Atual</div></div>
          <ArrowRight size={22} color={T.muted} />
          <div style={{ flex: 1, textAlign: 'center', background: T.faint, borderRadius: 14, padding: '16px 10px' }}><div style={{ fontSize: 34, fontWeight: 900, color: T.ok, letterSpacing: -2 }}>{profile.bfMeta || 12}%</div><div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 2, marginTop: 5, fontWeight: 700 }}>Meta</div></div>
        </div>
      </Card>

      {last && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>{[{ l: 'Peso', v: `${last.weight}kg`, c: T.treino }, { l: 'BF%', v: `${last.bf}%`, c: T.metrica }, { l: 'Cintura', v: last.waist ? `${last.waist}cm` : '—', c: T.nutri }].map(s => (<div key={s.l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 900, color: s.c, letterSpacing: -1 }}>{s.v}</div><div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 5, fontWeight: 700 }}>{s.l}</div></div>))}</div>)}

      <Card color={T.metrica}>
        <Lbl color={T.metrica}>Nova Medição</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[{ l: 'Peso (kg)', k: 'weight', p: '91.5' }, { l: 'BF%', k: 'bf', p: '20' }, { l: 'Cintura (cm)', k: 'waist', p: '88' }, { l: 'Peito (cm)', k: 'chest', p: '104' }, { l: 'Braço Esq', k: 'armL', p: '38' }, { l: 'Braço Dir', k: 'armR', p: '38.5' }].map(f => (
            <div key={f.k}><Lbl>{f.l}</Lbl><Inp placeholder={f.p} value={entry[f.k]} onChange={v => setEntry({ ...entry, [f.k]: v })} style={{ width: '100%' }} /></div>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}><Lbl>Obs</Lbl><Inp placeholder="Em jejum, horário…" value={entry.notes} onChange={v => setEntry({ ...entry, notes: v })} style={{ width: '100%' }} /></div>
        <Btn full color={T.metrica} style={{ color: T.bg }} onClick={add}>+ Salvar Medição</Btn>
      </Card>

      {chartData.length > 1 && (<Card><Lbl>Evolução</Lbl><ResponsiveContainer width="100%" height={120}><AreaChart data={chartData}><defs><linearGradient id="gk2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.treino} stopOpacity={.2} /><stop offset="95%" stopColor={T.treino} stopOpacity={0} /></linearGradient><linearGradient id="gm2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.metrica} stopOpacity={.2} /><stop offset="95%" stopColor={T.metrica} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="n" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, fontSize: 11, color: T.text }} /><Area type="monotone" dataKey="kg" stroke={T.treino} strokeWidth={2.5} fill="url(#gk2)" dot={{ fill: T.treino, r: 3 }} connectNulls name="Peso" /><Area type="monotone" dataKey="bf" stroke={T.metrica} strokeWidth={2.5} fill="url(#gm2)" dot={{ fill: T.metrica, r: 3 }} connectNulls name="BF%" /></AreaChart></ResponsiveContainer></Card>)}

      {/* FOTOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>Fotos · {photos.length}</div>
        {photos.length >= 2 && <Btn small color={T.gold} style={{ color: T.bg }} onClick={() => setViewCompare(!viewCompare)}>⇔ Comparar</Btn>}
      </div>

      {viewCompare && !selectedA && <div style={{ fontSize: 13, color: T.gold, marginBottom: 12, fontWeight: 700 }}>Selecione ANTES:</div>}
      {viewCompare && selectedA && !selectedB && <div style={{ fontSize: 13, color: T.gold, marginBottom: 12, fontWeight: 700 }}>Selecione DEPOIS:</div>}
      {viewCompare && selectedA && selectedB && (
        <div style={{ marginBottom: 16 }}>
          <PhotoSlider before={selectedA.src} after={selectedB.src} />
          <Btn small ghost color={T.muted} onClick={() => { setSelectedA(null); setSelectedB(null) }} style={{ marginTop: 10 }}>Resetar</Btn>
        </div>
      )}

      <Card color={T.gold}>
        <Lbl color={T.gold}>Nova Foto</Lbl>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {TAGS.map(t => <button key={t} onClick={() => setTag(t)} style={{ background: tag === t ? T.gold + '22' : T.faint, border: `1px solid ${tag === t ? T.gold : T.border2}`, color: tag === t ? T.gold : T.muted, borderRadius: 10, padding: '7px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all .2s' }}>{t}</button>)}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn full color={T.gold} style={{ color: T.bg }} onClick={() => fileRef.current?.click()}><Camera size={15} /> Câmera</Btn>
          <Btn full ghost color={T.gold} onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current?.click(); setTimeout(() => fileRef.current?.setAttribute('capture', 'environment'), 500) }}><FolderOpen size={15} /> Galeria</Btn>
        </div>
      </Card>

      {TAGS.filter(t => byTag(t).length > 0).map(t => (
        <div key={t} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t} · {byTag(t).length}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {byTag(t).map(p => {
              const isA = selectedA?.id === p.id; const isB = selectedB?.id === p.id
              return (
                <div key={p.id} onClick={() => { if (viewCompare) { if (!selectedA) setSelectedA(p); else if (!selectedB && p.id !== selectedA.id) setSelectedB(p) } }} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden', border: `2px solid ${isA ? T.warn : isB ? T.ok : T.border}`, cursor: viewCompare ? 'pointer' : 'default' }}>
                  <img src={p.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 60%,rgba(0,0,0,.8))' }} />
                  {isA && <div style={{ position: 'absolute', top: 8, left: 8, background: T.warn, color: T.bg, fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>ANTES</div>}
                  {isB && <div style={{ position: 'absolute', top: 8, left: 8, background: T.ok, color: T.bg, fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>DEPOIS</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px' }}><div style={{ fontSize: 11, color: 'white', fontWeight: 800 }}>{p.date}</div></div>
                  <button onClick={(e) => { e.stopPropagation(); removePhoto(p.id) }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.7)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {sorted.length > 0 && (
        <Card>
          <Lbl>Histórico de Medições</Lbl>
          {[...sorted].reverse().map(m => (
            <div key={m.id}>
              {editing?.id === m.id ? (
                <div style={{ padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                    {[{ l: 'Peso', k: 'weight' }, { l: 'BF%', k: 'bf' }, { l: 'Cintura', k: 'waist' }, { l: 'Peito', k: 'chest' }, { l: 'B.Esq', k: 'armL' }, { l: 'B.Dir', k: 'armR' }].map(f => (
                      <div key={f.k}><div style={{ fontSize: 9, color: T.muted, marginBottom: 3, fontWeight: 700 }}>{f.l}</div><Inp value={editing[f.k] || ''} onChange={v => setEditing({ ...editing, [f.k]: v })} style={{ width: '100%' }} /></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}><Btn small color={T.ok} style={{ color: T.bg }} onClick={() => { editMetric(editing.id, { weight: editing.weight, bf: editing.bf, waist: editing.waist, armL: editing.armL, armR: editing.armR, chest: editing.chest }); setEditing(null) }}>✓ Salvar</Btn><Btn small ghost color={T.muted} onClick={() => setEditing(null)}>Cancelar</Btn></div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><span style={{ fontSize: 10, color: T.muted, minWidth: 58, fontWeight: 600 }}>{m.date}</span><span style={{ fontWeight: 800, color: T.treino, fontSize: 12 }}>{m.weight}kg</span><span style={{ color: T.metrica, fontSize: 12, fontWeight: 800 }}>{m.bf}%</span>{m.waist && <span style={{ fontSize: 10, color: T.muted }}>C:{m.waist}</span>}</div>
                  <button onClick={() => setEditing({ ...m })} style={{ background: 'none', border: 'none', color: T.horm, cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => removeMetric(m.id, `Medição ${m.date}`)} style={{ background: 'none', border: 'none', color: T.alert, cursor: 'pointer' }}><X size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─── ANÁLISE ──────────────────────────────────────────────────────────────────
function AnaliseTab({ metrics, workout, cardioLogs, dietaLogs, nutrition }) {
  const sorted = [...metrics].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
  const last = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]

  // Últimos 7 dias
  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().slice(0, 10) }).reverse()
  const treinosUlt7 = days7.filter(d => workout.some(w => w.created_at?.slice(0, 10) === d)).length
  const cardioUlt7  = days7.filter(d => cardioLogs.some(c => c.date === d || c.created_at?.slice(0, 10) === d)).length
  const dietaUlt7   = days7.filter(d => dietaLogs.some(dl => (dl.date === d || dl.created_at?.slice(0, 10) === d) && dl.ate)).length

  const consistTreino = Math.round((treinosUlt7 / 6) * 100)
  const consistCardio = Math.round((cardioUlt7  / 5) * 100)
  const consistDieta  = Math.round((dietaUlt7   / 7) * 100)

  // Alertas
  const alertas = []
  if (consistTreino < 50) alertas.push({ msg: 'Consistência de treino abaixo de 50% na semana', level: 'alert' })
  if (consistCardio < 40) alertas.push({ msg: 'Cardio insuficiente — menos de 2x na semana', level: 'warn' })
  if (consistDieta < 60) alertas.push({ msg: 'Dieta irregular — marque suas refeições', level: 'warn' })
  if (last && prev) {
    const diffBf = parseFloat(last.bf) - parseFloat(prev.bf)
    const diffKg = parseFloat(last.weight) - parseFloat(prev.weight)
    if (diffBf > 0.5) alertas.push({ msg: `BF% subiu ${diffBf.toFixed(1)}% desde a última medição`, level: 'alert' })
    if (diffKg > 1.5) alertas.push({ msg: `Peso subiu ${diffKg.toFixed(1)}kg — avaliar retenção`, level: 'warn' })
    if (diffBf < -0.3 && diffKg < 0) alertas.push({ msg: `Evolução positiva: -${Math.abs(diffBf).toFixed(1)}% BF e -${Math.abs(diffKg).toFixed(1)}kg`, level: 'ok' })
  }

  const chartData = days7.map(d => ({
    n: d.slice(5),
    treino: workout.filter(w => w.created_at?.slice(0, 10) === d).length > 0 ? 1 : 0,
    cardio: cardioLogs.filter(c => c.date === d || c.created_at?.slice(0, 10) === d).length > 0 ? 1 : 0,
  }))

  const tendencia = () => {
    if (!last || !prev) return null
    const bf = parseFloat(last.bf) - parseFloat(prev.bf)
    const kg = parseFloat(last.weight) - parseFloat(prev.weight)
    if (bf < 0 && kg < 0) return { label: 'Cutting ativo', color: T.ok, icon: '🔥' }
    if (bf < 0 && kg > 0) return { label: 'Recomposição', color: T.treino, icon: '⚡' }
    if (kg > 0) return { label: 'Ganho de massa', color: T.horm, icon: '📈' }
    return { label: 'Estável', color: T.muted, icon: '→' }
  }
  const tend = tendencia()

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}><BarChart2 size={24} color={T.gold} strokeWidth={1.5} /> Análise</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 16, fontWeight: 600 }}>Últimos 7 dias</div>

      {/* Tendência */}
      {tend && (
        <Card color={tend.color}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 36 }}>{tend.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Tendência atual</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: tend.color, letterSpacing: -1 }}>{tend.label}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card>
          <Lbl>Alertas & Insights</Lbl>
          {alertas.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < alertas.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <StatusDot status={a.level} />
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{a.msg}</div>
            </div>
          ))}
        </Card>
      )}

      {/* Consistência */}
      <Card>
        <Lbl>Consistência — 7 dias</Lbl>
        {[{ l: 'Treinos', v: consistTreino, sub: `${treinosUlt7}/6 sessões`, c: T.treino }, { l: 'Cardio', v: consistCardio, sub: `${cardioUlt7}/5 sessões`, c: T.ok }, { l: 'Dieta', v: consistDieta, sub: `${dietaUlt7}/7 dias`, c: T.nutri }].map(s => (
          <div key={s.l} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
              <span style={{ color: T.text }}>{s.l} <span style={{ color: T.muted, fontWeight: 500, fontSize: 11 }}>{s.sub}</span></span>
              <span style={{ color: s.c }}>{s.v}%</span>
            </div>
            <div style={{ background: T.faint, borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${s.v}%`, height: '100%', background: `linear-gradient(90deg,${s.c}CC,${s.c})`, borderRadius: 4, transition: 'width 1s ease', boxShadow: s.v > 0 ? `0 0 6px ${s.c}60` : 'none' }} />
            </div>
          </div>
        ))}
      </Card>

      {/* Atividade 7 dias */}
      <Card>
        <Lbl>Atividade — 7 dias</Lbl>
        <div style={{ display: 'flex', gap: 6 }}>
          {chartData.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 3, marginBottom: 6 }}>
                <div style={{ height: d.treino ? 20 : 0, background: T.treino, borderRadius: 4, transition: 'height .5s ease', opacity: d.treino ? 1 : 0.2, minHeight: 4 }} />
                <div style={{ height: d.cardio ? 16 : 0, background: T.ok, borderRadius: 4, transition: 'height .5s ease', opacity: d.cardio ? 1 : 0.2, minHeight: 4 }} />
              </div>
              <div style={{ fontSize: 8, color: T.muted, fontWeight: 700 }}>{d.n.slice(3)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 10, background: T.treino, borderRadius: 2 }} /><span style={{ fontSize: 10, color: T.muted }}>Treino</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 10, background: T.ok, borderRadius: 2 }} /><span style={{ fontSize: 10, color: T.muted }}>Cardio</span></div>
        </div>
      </Card>

      {/* Evolução corporal */}
      {last && prev && (
        <Card color={T.metrica}>
          <Lbl color={T.metrica}>Variação Corporal</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ l: 'Peso', cur: last.weight, ant: prev.weight, u: 'kg', c: T.treino }, { l: 'BF%', cur: last.bf, ant: prev.bf, u: '%', c: T.metrica }].map(s => {
              const diff = (parseFloat(s.cur) - parseFloat(s.ant)).toFixed(1)
              const up = parseFloat(diff) > 0
              return (
                <div key={s.l} style={{ background: T.faint, borderRadius: 14, padding: '14px' }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.c, letterSpacing: -1 }}>{s.cur}{s.u}</div>
                  <div style={{ fontSize: 11, color: up ? T.alert : T.ok, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {up ? '+' : ''}{diff}{s.u}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────
function PerfilTab({ profile, setProfile }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...profile })
  const fileRef = useRef(null)

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setForm(f => ({ ...f, photo: ev.target.result })) }
    reader.readAsDataURL(file)
  }

  const save = () => { setProfile(form); setEditing(false) }

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1.5, marginBottom: 20 }}>Perfil</div>

      {/* Avatar grande */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: form.photo ? 'transparent' : `linear-gradient(135deg,${T.treino},#8BC34A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.bg, fontWeight: 900, fontSize: 36, overflow: 'hidden', border: `3px solid ${T.treino}50`, boxShadow: `0 0 24px ${T.treino}30` }}>
            {form.photo ? <img src={form.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : form.name[0]}
          </div>
          {editing && (
            <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: T.treino, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={16} color={T.bg} />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        {!editing && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{profile.goal || 'Objetivo não definido'}</div>
          </div>
        )}
      </div>

      {editing ? (
        <Card>
          <Lbl>Editar Perfil</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><Lbl>Nome</Lbl><Inp value={form.name} onChange={v => setForm({ ...form, name: v })} style={{ width: '100%' }} /></div>
            <div><Lbl>Objetivo</Lbl>
              <select value={form.goal || ''} onChange={e => setForm({ ...form, goal: e.target.value })} style={{ width: '100%', background: T.faint, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: T.text, outline: 'none', fontFamily: 'inherit' }}>
                <option value="Cutting">Cutting — perda de gordura</option>
                <option value="Recomposição">Recomposição corporal</option>
                <option value="Bulk">Bulk — ganho de massa</option>
                <option value="Manutenção">Manutenção</option>
              </select>
            </div>
            <div><Lbl>Fase</Lbl><Inp value={form.phase} onChange={v => setForm({ ...form, phase: v })} style={{ width: '100%' }} /></div>
            <div><Lbl>Fim da fase</Lbl><Inp value={form.phaseEnd} onChange={v => setForm({ ...form, phaseEnd: v })} style={{ width: '100%' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><Lbl>Peso (kg)</Lbl><Inp value={form.weight} onChange={v => setForm({ ...form, weight: v })} style={{ width: '100%' }} /></div>
              <div><Lbl>Meta BF%</Lbl><Inp value={form.bfMeta} onChange={v => setForm({ ...form, bfMeta: v })} style={{ width: '100%' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Btn full ghost color={T.muted} onClick={() => { setForm({ ...profile }); setEditing(false) }} small>Cancelar</Btn>
              <Btn full color={T.treino} onClick={save} small>Salvar</Btn>
            </div>
          </div>
        </Card>
      ) : (
        <div>
          <Card>
            <Lbl>Informações</Lbl>
            {[{ l: 'Fase', v: profile.phase }, { l: 'Fim da fase', v: profile.phaseEnd }, { l: 'Objetivo', v: profile.goal || '—' }, { l: 'Peso atual', v: `${profile.weight}kg` }, { l: 'Meta BF%', v: `${profile.bfMeta}%` }].map((r, i, arr) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{r.l}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{r.v}</span>
              </div>
            ))}
          </Card>
          <Btn full color={T.treino} style={{ color: T.bg }} onClick={() => setEditing(true)}><User size={16} /> Editar Perfil</Btn>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { LucideDumbbell, LucideUtensils, LucideActivity, LucideUser, LucidePlus, LucideCheckCircle2, LucideTimer, LucideTrendingUp, LucideCalendar, LucideChevronRight, LucideX, LucideDroplets, LucideScale, LucideCamera } from 'lucide-react'
import { dbSelect, dbInsert, dbUpdate, dbDelete, USER_ID } from './lib/supabaseClient'

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ─── TEMA NEON (AQUI ESTÃO AS CORES QUE VOCÊ PERGUNTOU) ────────────────────────
const T = {
  bg: '#000000',
  surface: '#0A0A0A',
  card: 'rgba(20, 20, 20, 0.7)',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#18FF5B', // Verde Neon para Treino
  text: '#FFFFFF',
  muted: '#888888',
  treino: '#18FF5B',
  nutri: '#FF8C5A', // Laranja para Dieta
  horm: '#60B4FF',  // Azul para Saúde
  metrica: '#D87AE8', // Roxo para Corpo
  gold: '#FFD166',
  alert: '#FF5A5A',
}

// ─── SEUS DADOS ORIGINAIS (EXERCÍCIOS, DIETA, PROTOCOLO) ─────────────────────
const SPLIT = [
  { id: 'legs', label: 'Legs', tag: 'Quad · Post · Glúteo', color: T.treino, emoji: '🦵', day: 'Seg' },
  { id: 'push_a', label: 'Push A', tag: 'Peito · Ombro · Tríceps', color: '#A8E870', emoji: '💪', day: 'Ter' },
  { id: 'pull_a', label: 'Pull A', tag: 'Costas · Bíceps', color: T.horm, emoji: '🔵', day: 'Qua' },
  { id: 'off', label: 'Futebol', tag: 'Descanso ativo', color: T.muted, emoji: '⚽', day: 'Qui' },
  { id: 'push_b', label: 'Push B', tag: 'Peito · Ombro · Tríceps', color: '#A8E870', emoji: '💪', day: 'Sex' },
  { id: 'arms', label: 'Braço+Peito', tag: 'Bíceps · Tríceps · Peito', color: T.nutri, emoji: '💪', day: 'Sáb' },
  { id: 'pull_b', label: 'Pull B', tag: 'Costas · Bíceps', color: T.horm, emoji: '🔵', day: 'Dom' },
]

const EXERCISES = {
  legs: [
    { name: 'Agachamento Livre', sets: 4, reps: '6–8', rest: 180, muscle: 'Quad', cue: 'Abaixo do paralelo.' },
    { name: 'Leg Press 45°', sets: 3, reps: '10–12', rest: 120, muscle: 'Quad', cue: 'Não trave o joelho.' },
    { name: 'Stiff Barra', sets: 4, reps: '8–10', rest: 120, muscle: 'Post.', cue: 'Quadril para trás.' },
  ],
  push_a: [
    { name: 'Supino Reto Barra', sets: 4, reps: '6–8', rest: 150, muscle: 'Peito', cue: 'Escápulas retraídas.' },
    { name: 'Desenvolvimento Militar', sets: 4, reps: '6–8', rest: 150, muscle: 'Ombro', cue: 'Core contraído.' },
  ],
  // ... (As outras listas serão mantidas na versão final)
}

const DIET = [
  { id: 'cafe', time: '06:30', label: 'Café da Manhã', kcal: 470, prot: 36, options: ['1 whey + 30g aveia + ½ banana'] },
  { id: 'almoco', time: '12:30', label: 'Almoço', kcal: 450, prot: 45, options: ['150g frango + 40g arroz + 60g batata'] },
]

// ─── COMPONENTES VISUAIS (ESTILO VIDRO) ──────────────────────────────────────
const Card = ({ children, color, onClick }) => (
  <div onClick={onClick} style={{
    background: T.card, backdropFilter: 'blur(12px)',
    border: `1px solid ${T.border}`, borderRadius: 24, padding: '20px',
    marginBottom: 12, borderLeft: color ? `4px solid ${color}` : `1px solid ${T.border}`,
    cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease'
  }}>{children}</div>
)

const Btn = ({ children, onClick, color, full, icon: Icon }) => (
  <button onClick={onClick} style={{
    background: color || T.accent, color: '#000', border: 'none', borderRadius: 16,
    padding: '16px 24px', fontSize: 14, fontWeight: 800, width: full ? '100%' : 'auto',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
  }}>
    {Icon && <Icon size={18} />} {children}
  </button>
)

// ─── INÍCIO DO APP E LOGICA DO SUPABASE ──────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dash');
  const [syncMsg, setSyncMsg] = useState('Conectando...');
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    Promise.all([dbSelect('workout_logs'), dbSelect('body_metrics')])
      .then(([wl, bm]) => {
        setWorkoutLogs(wl);
        setMetrics(bm.length > 0 ? bm : [{ weight: '91.5', date: '02/05/2026' }]);
        setSyncMsg('● Online');
      }).catch(() => setSyncMsg('⚠ Offline'));
  }, []);

  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todaySession = SPLIT[todayIdx];

  // (Continua na Parte 2...)
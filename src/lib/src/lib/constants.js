// ─── CONSTANTES ESTÁTICAS DO APP ─────────────────────────────────────────────
// Extraídas do App.jsx para facilitar manutenção.
// Para usar: import { SPLIT, EXERCISES, DIET, ... } from './lib/constants'

// ─── TEMA ─────────────────────────────────────────────────────────────────────
export const T = {
  bg: '#111010', surface: '#1A1917', card: '#201E1B', border: '#2E2A24',
  text: '#EDE8E0', muted: '#7A7268', faint: '#252220',
  treino: '#7DBF8E', nutri: '#D4916A', horm: '#85A8C8', metrica: '#C497B0',
  ok: '#7DBF8E', warn: '#D4916A', alert: '#C97070', gold: '#C9A96E',
}

// ─── SPLIT SEMANAL ────────────────────────────────────────────────────────────
export const SPLIT = [
  { id: 'legs',   label: 'Legs',        tag: 'Quadríceps · Posterior · Glúteo', color: T.treino,  emoji: '🦵', day: 'Seg' },
  { id: 'push_a', label: 'Push A',      tag: 'Peito · Ombro · Tríceps',         color: '#9EC4A0', emoji: '💪', day: 'Ter' },
  { id: 'pull_a', label: 'Pull A',      tag: 'Costas · Bíceps',                 color: T.horm,    emoji: '🔵', day: 'Qua' },
  { id: 'off',    label: 'Futebol',     tag: 'Descanso ativo — Quinta',         color: T.muted,   emoji: '⚽', day: 'Qui' },
  { id: 'push_b', label: 'Push B',      tag: 'Peito · Ombro · Tríceps',         color: '#9EC4A0', emoji: '💪', day: 'Sex' },
  { id: 'arms',   label: 'Braço+Peito', tag: 'Bíceps · Tríceps · Peito',        color: T.nutri,   emoji: '💪', day: 'Sáb' },
  { id: 'pull_b', label: 'Pull B',      tag: 'Costas · Bíceps',                 color: T.horm,    emoji: '🔵', day: 'Dom' },
]

// ─── EXERCÍCIOS ───────────────────────────────────────────────────────────────
export const EXERCISES = {
  legs: [
    { name: 'Agachamento Livre',        sets: 4, reps: '6–8',   rest: 180, muscle: 'Quad',    cue: 'Abaixo do paralelo. Joelhos na linha dos pés.' },
    { name: 'Leg Press 45°',            sets: 3, reps: '10–12', rest: 120, muscle: 'Quad',    cue: 'Não trave o joelho no topo.' },
    { name: 'Cadeira Extensora',        sets: 3, reps: '12–15', rest: 60,  muscle: 'Quad',    cue: 'Pausa 1s na contração.' },
    { name: 'Stiff Barra',              sets: 4, reps: '8–10',  rest: 120, muscle: 'Post.',   cue: 'Quadril para trás. Sente o alongamento.' },
    { name: 'Leg Curl Deitado',         sets: 3, reps: '10–12', rest: 90,  muscle: 'Post.',   cue: 'Quadril grudado no banco.' },
    { name: 'Hip Thrust Barra',         sets: 4, reps: '10–12', rest: 90,  muscle: 'Glúteo',  cue: 'Pausa 1s no topo. Extensão completa.' },
    { name: 'Panturrilha em Pé',        sets: 4, reps: '15–20', rest: 60,  muscle: 'Pantur.', cue: 'Amplitude total. Pausa no topo e fundo.' },
    { name: '🏃 Cardio — Escada',       sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',  cue: '130–150bpm. Intensidade moderada.' },
  ],
  push_a: [
    { name: 'Supino Reto Barra',         sets: 4, reps: '6–8',   rest: 150, muscle: 'Peito',   cue: 'Escápulas retraídas. Desça 2s controlado.' },
    { name: 'Supino Inclinado Halteres', sets: 3, reps: '8–10',  rest: 90,  muscle: 'Peito',   cue: '30–45°. Porção clavicular.' },
    { name: 'Desenvolvimento Militar',   sets: 4, reps: '6–8',   rest: 150, muscle: 'Ombro',   cue: 'Core contraído. Sem hiperlordose.' },
    { name: 'Elevação Lateral',          sets: 4, reps: '12–15', rest: 60,  muscle: 'Ombro',   cue: 'Cotovelo levemente flexionado.' },
    { name: 'Tríceps Corda Polia',       sets: 3, reps: '10–12', rest: 60,  muscle: 'Tríceps', cue: 'Cotovelos fixos. Extensão total.' },
    { name: 'Tríceps Francês',           sets: 3, reps: '10–12', rest: 60,  muscle: 'Tríceps', cue: 'Não abra o cotovelo.' },
    { name: '🏃 Cardio — Escada',        sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  pull_a: [
    { name: 'Barra Fixa Pronada',         sets: 4, reps: '6–8',   rest: 150, muscle: 'Costas', cue: 'Amplitude total. Peito até a barra.' },
    { name: 'Remada Curvada Barra',       sets: 4, reps: '6–8',   rest: 120, muscle: 'Costas', cue: '45°. Puxe para o umbigo.' },
    { name: 'Puxada Aberta Polia',        sets: 3, reps: '10–12', rest: 90,  muscle: 'Costas', cue: 'Cotovelos para baixo e para trás.' },
    { name: 'Remada Unilateral Haltere',  sets: 3, reps: '10–12', rest: 60,  muscle: 'Costas', cue: 'Não rotacione o tronco.' },
    { name: 'Rosca Direta Barra',         sets: 3, reps: '8–10',  rest: 90,  muscle: 'Bíceps', cue: 'Supinação completa no topo.' },
    { name: 'Rosca Martelo',              sets: 3, reps: '10–12', rest: 60,  muscle: 'Bíceps', cue: 'Pegada neutra. Braquial.' },
    { name: '🏃 Cardio — Escada',         sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio', cue: '130–150bpm.' },
  ],
  push_b: [
    { name: 'Supino Inclinado Barra',    sets: 4, reps: '8–10',  rest: 120, muscle: 'Peito',   cue: 'Mais volume no peitoral superior.' },
    { name: 'Crossover Polia Alta',      sets: 3, reps: '12–15', rest: 60,  muscle: 'Peito',   cue: 'Adução completa. Contração central.' },
    { name: 'Desenvolvimento Halteres',  sets: 4, reps: '8–10',  rest: 90,  muscle: 'Ombro',   cue: 'Maior amplitude. Rotação neutra no fundo.' },
    { name: 'Elevação Frontal',          sets: 3, reps: '12–15', rest: 60,  muscle: 'Ombro',   cue: 'Sem impulso. Alternado.' },
    { name: 'Mergulho Paralelas',        sets: 3, reps: '8–12',  rest: 90,  muscle: 'Tríceps', cue: 'Tronco levemente à frente.' },
    { name: 'Extensão Tríceps Overhead', sets: 3, reps: '12–15', rest: 60,  muscle: 'Tríceps', cue: 'Cotovelos junto à cabeça.' },
    { name: '🏃 Cardio — Escada',        sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  arms: [
    { name: 'Rosca Scott Barra W',     sets: 4, reps: '8–10',  rest: 90, muscle: 'Bíceps',  cue: 'Elimina o impulso. Amplitude total.' },
    { name: 'Rosca Concentrada',       sets: 3, reps: '12–15', rest: 60, muscle: 'Bíceps',  cue: 'Cúbito no interior da coxa.' },
    { name: 'Rosca Alternada Haltere', sets: 3, reps: '10–12', rest: 60, muscle: 'Bíceps',  cue: 'Supinação no topo. Sem impulso.' },
    { name: 'Tríceps Corda Polia',     sets: 4, reps: '12–15', rest: 60, muscle: 'Tríceps', cue: 'Cotovelos fixos. Extensão total.' },
    { name: 'Tríceps Francês Haltere', sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps', cue: 'Não abra o cotovelo.' },
    { name: 'Mergulho Paralelas',      sets: 3, reps: '10–12', rest: 90, muscle: 'Tríceps', cue: 'Corpo mais vertical para tríceps.' },
    { name: 'Crossover / Fly Cabo',    sets: 3, reps: '15–20', rest: 60, muscle: 'Peito',   cue: 'Estímulo leve de peito. Contração central.' },
    { name: '🏃 Cardio — Escada',      sets: 1, reps: '25min', rest: 0,  muscle: 'Cardio',  cue: '130–150bpm.' },
  ],
  pull_b: [
    { name: 'Remada T-bar',           sets: 4, reps: '8–10',  rest: 120, muscle: 'Costas',   cue: 'Puxe para o plexo. Escápulas no topo.' },
    { name: 'Puxada Triângulo Neutro',sets: 3, reps: '10–12', rest: 90,  muscle: 'Costas',   cue: 'Puxe para o esterno.' },
    { name: 'Pullover Haltere',       sets: 3, reps: '12–15', rest: 60,  muscle: 'Costas',   cue: 'Cotovelo levemente flexionado.' },
    { name: 'Face Pull',              sets: 3, reps: '15–20', rest: 60,  muscle: 'Ombro P.', cue: 'Essencial para manguito rotador.' },
    { name: 'Rosca Scott Barra W',    sets: 3, reps: '10–12', rest: 60,  muscle: 'Bíceps',   cue: 'Elimina o impulso.' },
    { name: 'Rosca Martelo',          sets: 3, reps: '10–12', rest: 60,  muscle: 'Bíceps',   cue: 'Pegada neutra. Braquial.' },
    { name: '🏃 Cardio — Escada',     sets: 1, reps: '25min', rest: 0,   muscle: 'Cardio',   cue: '130–150bpm.' },
  ],
}

// ─── REFERÊNCIAS DE EXAMES ───────────────────────────────────────────────────
export const LAB_REFS = {
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

// ─── PLANO ALIMENTAR ─────────────────────────────────────────────────────────
export const DIET = [
  { id: 'cafe',      time: '06:30', label: 'Café da Manhã',   kcal: 470, prot: 36, options: ['A: 1 ovo + 1 whey + 200ml leite desnatado + 30g aveia + ½ banana', 'B: 2 ovos mexidos + 1 pão francês + 1 whey + 200ml leite desnatado'] },
  { id: 'lanche1',   time: '10:00', label: 'Lanche da Manhã', kcal: 150, prot: 3,  options: ['A: 1 fruta (maçã ou pera)', 'B: 1 fruta + 3 castanhas-do-pará'] },
  { id: 'almoco',    time: '12:30', label: 'Almoço',          kcal: 450, prot: 45, options: ['FIXO: 150g frango + 40g arroz + 60g batata + 100g abóbora + vegetais + fio de azeite'] },
  { id: 'lanche2',   time: '16:00', label: 'Lanche da Tarde', kcal: 300, prot: 33, options: ['A: 1 whey + 10g aveia + 1 banana', 'B: 1 iogurte desnatado + 1 whey + 1 fruta pequena'] },
  { id: 'pretreino', time: '19:30', label: 'Pré-Treino',      kcal: 280, prot: 28, options: ['FIXO: 100g frango + 80g batata ou 60g arroz'] },
  { id: 'postreino', time: '22:15', label: 'Pós-Treino',      kcal: 115, prot: 15, options: ['A: ½ dose whey com água', 'B: ½ whey + 3g creatina'] },
  { id: 'jantar',    time: '23:00', label: 'Jantar',          kcal: 370, prot: 30, options: ['FIXO: 150g frango + 2 ovos cozidos + 100g abóbora + vegetais refogados + fio de azeite'] },
]

// ─── PROTOCOLO ───────────────────────────────────────────────────────────────
export const PROTOCOL_COMPOUNDS = [
  { id: 'testo', name: 'Testosterona Enantato', dose: '0.7', unit: 'ml', schedule: 'Seg + Qui', color: '#85A8C8', weekly: '350mg' },
  { id: 'ana',   name: 'Anastrozol',            dose: '0.5', unit: 'mg', schedule: 'Seg + Qui', color: '#C497B0', weekly: '1mg'   },
  { id: 'tirze', name: 'Tirzepatida',           dose: '1.5', unit: 'mg', schedule: 'Semanal',   color: '#D4916A', weekly: '1.5mg' },
]

// ─── SUPLEMENTOS ─────────────────────────────────────────────────────────────
export const SUPLS = [
  { id: 'vitd',  name: 'Vitamina D3+K2', dose: '4.000 UI', time: 'Manhã',      color: '#D4916A' },
  { id: 'b12',   name: 'Vitamina B12',   dose: '1.000mcg', time: 'Manhã',      color: '#D4916A' },
  { id: 'creat', name: 'Creatina',       dose: '5g',        time: 'Pós-treino', color: '#7DBF8E' },
  { id: 'omega', name: 'Ômega 3',        dose: '3g',        time: 'Almoço',     color: '#85A8C8' },
]

// ─── PERFIL DO USUÁRIO ───────────────────────────────────────────────────────
// Centralizado aqui para futura migração para banco de dados
export const USER_PROFILE = {
  name:     'Thomas',
  age:      35,
  weight:   '91.5',
  height:   '1.75',
  phase:    'Fase 1 — Cutting',
  phaseEnd: 'Julho 2026',
  bfMeta:   '12',
}

// ─── METAS NUTRICIONAIS ──────────────────────────────────────────────────────
export const NUTRITION_GOALS = {
  calories: 2100,
  protein:  190,
  carbs:    160,
  fat:      58,
}


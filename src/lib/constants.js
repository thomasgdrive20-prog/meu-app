// ─── TEMA PREMIUM ─────────────────────────────────────────────────────────────
export const T = {
  bg:       '#080807',
  surface:  '#0F0E0C',
  card:     '#141210',
  cardHigh: '#1A1815',
  border:   '#242018',
  borderHi: '#2E2920',
  text:     '#F0EBE1',
  muted:    '#5A554E',
  subtle:   '#3A3630',
  gold:     '#C9A96E',
  goldHi:   '#DFC08A',
  goldLow:  '#8A6E40',
  treino:   '#5A9E6A',
  nutri:    '#B8764A',
  horm:     '#6088A8',
  metrica:  '#A07898',
  ok:       '#5A9E6A',
  warn:     '#B8764A',
  alert:    '#A05858',
  gradGold: 'linear-gradient(135deg, #C9A96E22, #C9A96E08)',
  gradCard: 'linear-gradient(160deg, #1A1815, #0F0E0C)',
}

// ─── SPLIT SEMANAL ────────────────────────────────────────────────────────────
export const SPLIT = [
  { id: 'legs',    label: 'Legs',            tag: 'Quadríceps · Posterior · Glúteo · Panturrilha',    color: '#5A9E6A', emoji: '🦵', day: 'Seg', focus: 'Dia mais distante dos esportes — explore carga máxima nos compostos.', cardio: 'Escada 25min · Zona 2 · FC 120–140bpm', sport: null },
  { id: 'push_a',  label: 'Push A',           tag: 'Peito · Ombro · Tríceps',                          color: '#9EC4A0', emoji: '💪', day: 'Ter', focus: 'Prioridade: Deltóide Lateral (7 séries). Elevação Frontal REMOVIDA.', cardio: 'Escada 25min · Zona 2 · FC 120–140bpm', sport: null },
  { id: 'pull_a',  label: 'Pull A',           tag: 'Costas · Bíceps · Deltóide Posterior',             color: '#6088A8', emoji: '🔵', day: 'Qua', focus: 'Véspera do futebol: finalize com energia. Ombro posterior entra aqui.', cardio: 'Escada 20min apenas (véspera de futebol)', sport: null },
  { id: 'futebol', label: 'Futebol',          tag: 'Descanso de musculação · Alta intensidade metabólica', color: '#5A554E', emoji: '⚽', day: 'Qui', focus: 'Equivalente a HIIT natural. Não adicionar musculação pesada.', cardio: null, sport: 'futebol',
    sportInfo: { duracao: '~60min de jogo · ~45min em movimento efetivo', demanda: 'Quadríceps · Posterior · Glúteo · Cardiovascular', preJogo: 'Carboidrato 1h antes: banana, batata ou arroz.', posJogo: 'Proteína + carbo em até 60min: 150g frango + arroz ou batata.', hidratacao: 'Mínimo 1L durante + 500ml pós-jogo.' } },
  { id: 'volei',   label: 'Vôlei',            tag: 'Esporte · Descanso de musculação pesada',          color: '#5A554E', emoji: '🏐', day: 'Sex', focus: 'Ombros já treinaram terça (Push A). Push B está no sábado.', cardio: null, sport: 'volei',
    sportInfo: { duracao: 'Variável', demanda: 'Ombro · Joelho · Tornozelo · Saltos repetitivos', musculacaoOpcional: 'Rosca + Martelo + Tríceps Corda — 3 séries cada — 30min total' } },
  { id: 'push_b',  label: 'Push B',           tag: 'Peito · Ombro · Tríceps',                          color: '#9EC4A0', emoji: '💪', day: 'Sáb', focus: '2ª frequência de Deltóide Lateral (7 séries). Maior alavanca estética.', cardio: 'Escada 25min · Zona 2 · FC 120–140bpm', sport: null },
  { id: 'pull_b',  label: 'Pull B + Posterior', tag: 'Costas · Deltóide Posterior · Bíceps',           color: '#6088A8', emoji: '🔵', day: 'Dom', focus: 'Fecha o ombro posterior (2ª frequência — 7 séries).', cardio: 'Escada 25min ou Caminhada 40min (opcional)', sport: null },
]

// ─── EXERCÍCIOS ───────────────────────────────────────────────────────────────
export const EXERCISES = {
  legs: [
    { name: 'Agachamento Livre', alt: 'Hack Squat ou Leg Press 45° pés altos', sets: 4, reps: '6–8', rest: 180, muscle: 'Quad', cue: 'Abaixo do paralelo. Joelhos na linha dos pés. Excêntrico 2s controlado.', tecnica: 'RIR 1–2. Se sentir dor aguda no joelho: use a alternativa imediatamente.', warmup: true },
    { name: 'Leg Press 45°', alt: 'Prensa Horizontal ou Hack Squat', sets: 3, reps: '10–12', rest: 120, muscle: 'Quad', cue: 'Pés na largura do quadril. Amplitude máxima sem travar o joelho no topo.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Cadeira Extensora', alt: 'Extensora unilateral se disponível', sets: 3, reps: '12–15', rest: 60, muscle: 'Quad', cue: 'Segure 2s no pico da contração. Amplitude completa.', tecnica: 'Último set: Drop Set.', warmup: false },
    { name: 'Stiff Barra', alt: 'Stiff Halteres ou Stiff Máquina', sets: 4, reps: '8–10', rest: 120, muscle: 'Post.', cue: 'Quadril para trás. Sinta o alongamento dos isquiotibiais. Excêntrico 3s.', tecnica: 'RIR 1–2.', warmup: true },
    { name: 'Leg Curl Deitado', alt: 'Leg Curl Sentado ou em Pé', sets: 3, reps: '10–12', rest: 90, muscle: 'Post.', cue: 'Quadril grudado no banco. Excêntrico lento 2s.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Hip Thrust Barra', alt: 'Hip Thrust Máquina ou Glúteo no Cabo', sets: 4, reps: '10–12', rest: 90, muscle: 'Glúteo', cue: 'Pausa 1s no topo com extensão completa. Queixo no peito.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Panturrilha em Pé', alt: 'Panturrilha no Leg Press ou Sentada', sets: 5, reps: '15–20', rest: 60, muscle: 'Pantur.', cue: 'Amplitude total: segure 1s no estiramento e 1s na contração. Excêntrico 3s.', tecnica: 'RIR 1–2.', warmup: false },
    { name: '🏃 Cardio — Escada', alt: null, sets: 1, reps: '25min', rest: 0, muscle: 'Cardio', cue: 'Zona 2 — FC 120–140bpm. Ritmo conversacional. Pós-treino.', tecnica: null, warmup: false },
  ],
  push_a: [
    { name: 'Supino Reto Barra', alt: 'Máquina de Supino Horizontal', sets: 4, reps: '6–8', rest: 150, muscle: 'Peito', cue: 'Escápulas retraídas e deprimidas. Excêntrico 2s controlado.', tecnica: 'RIR 1–2.', warmup: true },
    { name: 'Supino Inclinado Halteres', alt: 'Supino Inclinado Máquina ou Cabo', sets: 3, reps: '8–10', rest: 90, muscle: 'Peito', cue: '30–45°. Foco na porção clavicular. Não deixe os ombros subirem.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Desenvolvimento Militar Barra', alt: 'Desenvolvimento Smith Machine', sets: 4, reps: '6–8', rest: 150, muscle: 'Ombro', cue: 'Core contraído. Sem hiperlordose lombar.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Elevação Lateral Halteres', alt: 'Elevação Lateral no Cabo', sets: 4, reps: '12–15', rest: 60, muscle: 'Ombro Lat.', cue: 'Cotovelo levemente flexionado. Eleve até a altura do ombro. Sem impulso de tronco.', tecnica: 'Última série: Myo-reps.', warmup: true },
    { name: 'Elevação Lateral Cabo (de frente ao cabo)', alt: 'Elevação Lateral Máquina / Peck Deck Lateral', sets: 3, reps: '15–20', rest: 45, muscle: 'Ombro Lat.', cue: 'Tensão constante no alongamento. Unilateral se possível.', tecnica: 'RIR 1–2. Sem balanço.', warmup: false },
    { name: 'Tríceps Corda Polia', alt: 'Tríceps Barra V ou Barra Reta', sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps', cue: 'Cotovelos fixos ao lado do corpo. Abra a corda no final.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Tríceps Francês (barra W ou haltere)', alt: 'Extensão Overhead no Cabo', sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps', cue: 'Cúbito fixo. Foco na cabeça longa.', tecnica: 'RIR 1–2.', warmup: false },
    { name: '🏃 Cardio — Escada', alt: null, sets: 1, reps: '25min', rest: 0, muscle: 'Cardio', cue: 'Zona 2 — FC 120–140bpm. Ritmo conversacional. Pós-treino.', tecnica: null, warmup: false },
  ],
  pull_a: [
    { name: 'Barra Fixa Pronada (pegada larga)', alt: 'Puxada Aberta no Pulley', sets: 4, reps: '6–8', rest: 150, muscle: 'Costas', cue: 'Amplitude total. Deprima a escápula antes de puxar.', tecnica: 'RIR 1–2.', warmup: true },
    { name: 'Remada Curvada Barra (pronada)', alt: 'Remada Máquina ou T-bar', sets: 4, reps: '6–8', rest: 120, muscle: 'Costas', cue: '45° de inclinação. Cotovelo rente ao corpo. Não arredonde a lombar.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Puxada Aberta Polia (triângulo ou neutra)', alt: 'Pulldown Máquina Articulada', sets: 3, reps: '10–12', rest: 90, muscle: 'Costas', cue: 'Cotovelos para baixo e para trás — puxe para o esterno.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Remada Unilateral Haltere', alt: 'Remada Serrote no Cabo', sets: 3, reps: '10–12', rest: 60, muscle: 'Costas', cue: 'Maximize amplitude e rotação torácica.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Crucifixo Invertido no Cabo (polia baixa cruzada)', alt: 'Peck Deck Invertido ou Haltere Curvado', sets: 3, reps: '15–20', rest: 60, muscle: 'Ombro Post.', cue: 'Fique curvado a 45–90°. Cotovelo levemente flexionado. Sem balanço.', tecnica: 'RIR 1–2.', warmup: true },
    { name: 'Face Pull no Cabo (corda — altura dos olhos)', alt: 'Face Pull com Elástico', sets: 3, reps: '15–20', rest: 60, muscle: 'Ombro Post.', cue: 'Cotovelos para cima e para fora. Rotação externa máxima no final.', tecnica: 'Última série: Drop Set.', warmup: false },
    { name: 'Rosca Direta Barra', alt: 'Rosca EZ ou Máquina de Bíceps', sets: 3, reps: '8–10', rest: 90, muscle: 'Bíceps', cue: 'Supinação completa no topo. Sem impulso de tronco.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Rosca Martelo Halteres', alt: 'Rosca Martelo no Cabo', sets: 3, reps: '10–12', rest: 60, muscle: 'Bíceps', cue: 'Pegada neutra. Foco no braquial e braquiorradial.', tecnica: 'RIR 1–2.', warmup: false },
    { name: '🏃 Cardio — Escada', alt: null, sets: 1, reps: '20min', rest: 0, muscle: 'Cardio', cue: 'Zona 2 — FC 120–140bpm. 20min apenas (véspera de futebol).', tecnica: null, warmup: false },
  ],
  push_b: [
    { name: 'Supino Inclinado Barra (30–45°)', alt: 'Supino Inclinado Máquina', sets: 4, reps: '8–10', rest: 120, muscle: 'Peito', cue: 'Foco na porção clavicular. Escápulas retraídas.', tecnica: 'RIR 1–2.', warmup: true },
    { name: 'Crossover Polia Alta (ou Fly no Cabo)', alt: 'Peck Deck ou Crossover Alto', sets: 3, reps: '12–15', rest: 60, muscle: 'Peito', cue: 'Adução completa — segure a contração 1s.', tecnica: 'Última série: Drop Set.', warmup: false },
    { name: 'Desenvolvimento Halteres', alt: 'Desenvolvimento Máquina ou Smith', sets: 3, reps: '8–10', rest: 90, muscle: 'Ombro', cue: 'Maior amplitude que a barra — rotação neutra no fundo.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Elevação Lateral Halteres', alt: 'Elevação Lateral no Cabo', sets: 4, reps: '12–15', rest: 60, muscle: 'Ombro Lat.', cue: 'Cotovelo levemente flexionado. Eleve até a altura do ombro.', tecnica: 'Última série: Myo-reps.', warmup: true },
    { name: 'Elevação Lateral Cabo (unilateral — de frente)', alt: 'Peck Deck Lateral se disponível', sets: 3, reps: '15–20', rest: 45, muscle: 'Ombro Lat.', cue: 'Tensão contínua. Posição unilateral garante maior isolamento.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Mergulho Paralelas (pesos adicionais se possível)', alt: 'Mergulho Máquina ou Dip Assistido', sets: 3, reps: '8–12', rest: 90, muscle: 'Tríceps', cue: 'Cotovelo para trás. Tronco levemente inclinado à frente.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Extensão Tríceps Overhead (cabo ou haltere)', alt: 'Tríceps Francês Haltere', sets: 3, reps: '12–15', rest: 60, muscle: 'Tríceps', cue: 'Cotovelos juntos. Foco na cabeça longa.', tecnica: 'RIR 1–2.', warmup: false },
    { name: '🏃 Cardio — Escada', alt: null, sets: 1, reps: '25min', rest: 0, muscle: 'Cardio', cue: 'Zona 2 — FC 120–140bpm. Pós-treino.', tecnica: null, warmup: false },
  ],
  pull_b: [
    { name: 'Remada T-bar (peitoral apoiado)', alt: 'Remada Máquina ou Remada Curvada Haltere', sets: 4, reps: '8–10', rest: 120, muscle: 'Costas', cue: 'Puxe para o plexo solar. Retraia a escápula no topo — segure 1s.', tecnica: 'RIR 1–2.', warmup: true },
    { name: 'Puxada Triângulo Neutro (pegada supinada)', alt: 'Puxada Supinada ou Barra Fixa Neutra', sets: 3, reps: '10–12', rest: 90, muscle: 'Costas', cue: 'Puxe para o esterno. Pegada neutra diferencia do Pull A.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Pullover Haltere', alt: 'Pullover no Cabo ou Máquina', sets: 3, reps: '12–15', rest: 60, muscle: 'Costas', cue: 'Pense em EXPANDIR a caixa torácica. Excêntrico controlado.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Face Pull no Cabo (corda — altura dos olhos)', alt: 'Face Pull Elástico ou Polia Alta', sets: 4, reps: '15–20', rest: 60, muscle: 'Ombro Post.', cue: 'Cotovelos para cima e para fora. Puxe até a testa.', tecnica: 'Última série: Drop Set.', warmup: true },
    { name: 'Crucifixo Invertido Haltere (tronco paralelo ao solo)', alt: 'Peck Deck Invertido ou Cabo Baixo Cruzado', sets: 3, reps: '15–20', rest: 60, muscle: 'Ombro Post.', cue: 'Cotovelo levemente flexionado. Sem balançar o tronco.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Rosca Scott Barra W', alt: 'Rosca Scott Máquina ou Cabo', sets: 3, reps: '8–10', rest: 90, muscle: 'Bíceps', cue: 'Amplitude total. Elimina o impulso completamente. Excêntrico 2s.', tecnica: 'RIR 1–2.', warmup: false },
    { name: 'Rosca Alternada Haltere', alt: 'Rosca Concentrada ou Cabo Unilateral', sets: 3, reps: '10–12', rest: 60, muscle: 'Bíceps', cue: 'Supinação máxima no topo — segure 1s. Sem impulso de ombro.', tecnica: 'Última série: Drop Set.', warmup: false },
    { name: '🏃 Cardio — Escada', alt: 'Caminhada 40min (opção mais leve no domingo)', sets: 1, reps: '25min', rest: 0, muscle: 'Cardio', cue: 'Zona 2 — FC 120–140bpm. Opcional: caminhada de 40min substitui a escada.', tecnica: null, warmup: false },
  ],
}

// ─── AQUECIMENTOS ─────────────────────────────────────────────────────────────
export const WARMUPS = {
  legs: [
    { exercicio: 'Bicicleta ergométrica ou Esteira', series: '5min', obs: 'Ritmo leve — só elevar temperatura corporal.' },
    { exercicio: 'Agachamento com peso corporal', series: '2 × 15', obs: 'Ative glúteo e core. Sem carga. Qualidade total.' },
    { exercicio: 'Agachamento Livre — barra vazia', series: '1 × 10', obs: 'Padrão de movimento. Sem carga.' },
    { exercicio: 'Agachamento Livre — 70% da carga', series: '1 × 6', obs: '70–75% da carga de trabalho. Não conta como série efetiva.' },
    { exercicio: 'Cadeira Extensora — leve', series: '1 × 15', obs: 'Lubrifica a patela. Amplitude completa.' },
    { exercicio: 'Stiff sem carga ou levíssimo', series: '1 × 10', obs: 'Sentir o alongamento. Ativar isquiotibiais.' },
  ],
  push_a: [
    { exercicio: 'Rotação de ombro com elástico ou cabo leve', series: '2 × 15', obs: 'Ativar manguito rotador.' },
    { exercicio: 'Supino Reto Barra — barra vazia', series: '1 × 12', obs: 'Padrão de movimento.' },
    { exercicio: 'Supino Reto Barra — 50% da carga', series: '1 × 8', obs: 'Prepare o SNC para a carga de trabalho.' },
    { exercicio: 'Elevação Lateral Haltere — leve', series: '1 × 15', obs: '30–40% da carga de trabalho.' },
  ],
  pull_a: [
    { exercicio: 'Rotação interna/externa com elástico', series: '2 × 15', obs: 'Ativar manguito rotador. Proteção do labrum.' },
    { exercicio: 'Puxada Aberta — 50% da carga', series: '1 × 10', obs: 'Deprima a escápula antes de puxar.' },
    { exercicio: 'Remada no cabo — leve', series: '1 × 12', obs: 'Sinta a retração escapular.' },
    { exercicio: 'Rosca com haltere — leve', series: '1 × 15', obs: 'Ativar bíceps.' },
  ],
  push_b: [
    { exercicio: 'Rotação de ombro com elástico ou cabo leve', series: '2 × 15', obs: 'Mesmo protocolo do Push A.' },
    { exercicio: 'Supino Inclinado Barra — barra vazia ou leve', series: '1 × 10', obs: 'Ativar peitoral clavicular.' },
    { exercicio: 'Elevação Lateral Haltere — leve', series: '1 × 15', obs: '30–40% — prepare as fibras laterais.' },
  ],
  pull_b: [
    { exercicio: 'Rotação com elástico', series: '2 × 15', obs: 'Manguito rotador — prioridade neste dia.' },
    { exercicio: 'Remada leve no cabo', series: '1 × 12', obs: 'Ativar retração escapular.' },
    { exercicio: 'Face Pull leve', series: '1 × 15', obs: 'Prepare o deltóide posterior.' },
  ],
}

// ─── VOLUME SEMANAL ───────────────────────────────────────────────────────────
export const WEEKLY_VOLUME = {
  'Deltóide Lateral':   { series: 14, meta: '10–16', status: 'ok', nota: '2 frequências semanais (Push A + Push B)' },
  'Deltóide Posterior': { series: 13, meta: '10–16', status: 'ok', nota: '2 frequências semanais (Pull A + Pull B)' },
  'Deltóide Anterior':  { series: 4,  meta: '4–6',   status: 'ok', nota: 'Indireto via supinos e desenvolvimento' },
  'Costas Largura':     { series: 14, meta: '12–20', status: 'ok', nota: 'Barra fixa + puxadas' },
  'Costas Espessura':   { series: 11, meta: '10–18', status: 'ok', nota: 'Remadas + T-bar' },
  'Bíceps':             { series: 13, meta: '10–16', status: 'ok', nota: 'Reduzido de 18 — elimina junk volume' },
  'Tríceps':            { series: 13, meta: '10–16', status: 'ok', nota: 'Reduzido de 18 — elimina junk volume' },
  'Peito':              { series: 10, meta: '8–14',  status: 'ok', nota: 'Reduzido — V-taper prioriza costas/ombro' },
  'Quadríceps':         { series: 10, meta: '10–16', status: 'ok', nota: 'Composto + isolador + isometria' },
  'Posterior/Glúteo':   { series: 11, meta: '10–16', status: 'ok', nota: 'Stiff + Leg Curl + Hip Thrust' },
  'Panturrilha':        { series: 5,  meta: '4–8',   status: 'ok', nota: 'Aumentada de 4 — músculo de resposta lenta' },
}

export const TECNICAS = {
  'RIR 1–2': 'Pare 1–2 repetições antes da falha.',
  'Myo-reps': '1 série de 15 reps → pausa 5s → 5 reps → pausa 5s → 5 reps.',
  'Drop Set': 'Execute até RIR 0, reduza 20–25% da carga, continue até a falha.',
  'Rest-Pause': 'Execute até RIR 0 → pausa 15s → mais 2–4 reps.',
  'Progressão': 'Adicione 1,25–2,5kg quando completar todas as reps com RIR 1.',
}

export const PROGRAM_SCHEDULE = {
  nome: 'Cutting Phase 1 — V-Taper', inicio: '2026-05-01', fim: '2026-07-31', semanas: 12,
  fases: [
    { nome: 'Adaptação',    semanas: '1–4',  foco: 'Aprender padrão de movimento do novo volume. Não force PR.',      carga: 'Conservadora', revisao: 'Avaliar dor no joelho e resposta do ombro posterior.' },
    { nome: 'Progressão',   semanas: '5–8',  foco: 'Progredir carga nos compostos. Volume estável.',                   carga: 'Progressiva',  revisao: 'Avaliar performance e disposição. Monitorar overreaching.' },
    { nome: 'Consolidação', semanas: '9–12', foco: 'Manter força. Se cair >15%: revise calorias antes do treino.',     carga: 'Manutenção',   revisao: 'Exames Junho: testosterona, estradiol, HDL, hematócrito, PSA.' },
  ],
}

// ─── EXAMES ───────────────────────────────────────────────────────────────────
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

// ─── DIETA ────────────────────────────────────────────────────────────────────
export const DIET = [
  { id: 'cafe',      time: '06:30', label: 'Café da Manhã',   kcal: 470, prot: 36, options: ['A: 1 ovo + 1 whey + 200ml leite desnatado + 30g aveia + ½ banana', 'B: 2 ovos mexidos + 1 pão francês + 1 whey + 200ml leite desnatado'] },
  { id: 'lanche1',   time: '10:00', label: 'Lanche da Manhã', kcal: 150, prot: 3,  options: ['A: 1 fruta (maçã ou pera)', 'B: 1 fruta + 3 castanhas-do-pará'] },
  { id: 'almoco',    time: '12:30', label: 'Almoço',          kcal: 450, prot: 45, options: ['FIXO: 150g frango + 40g arroz + 60g batata + 100g abóbora + vegetais + fio de azeite'] },
  { id: 'lanche2',   time: '16:00', label: 'Lanche da Tarde', kcal: 300, prot: 33, options: ['A: 1 whey + 10g aveia + 1 banana', 'B: 1 iogurte desnatado + 1 whey + 1 fruta pequena'] },
  { id: 'pretreino', time: '19:30', label: 'Pré-Treino',      kcal: 280, prot: 28, options: ['FIXO: 100g frango + 80g batata ou 60g arroz'] },
  { id: 'postreino', time: '22:15', label: 'Pós-Treino',      kcal: 115, prot: 15, options: ['A: ½ dose whey com água', 'B: ½ whey + 5g creatina'] },
  { id: 'jantar',    time: '23:00', label: 'Jantar',          kcal: 370, prot: 30, options: ['FIXO: 150g frango + 2 ovos cozidos + 100g abóbora + vegetais refogados + fio de azeite'] },
]

// ─── PROTOCOLO HORMONAL ───────────────────────────────────────────────────────
export const PROTOCOL_COMPOUNDS = [
  { id: 'testo', name: 'Testosterona Enantato', dose: '0.7', unit: 'ml', schedule: 'Seg + Qui', color: '#6088A8', weekly: '350mg', obs: 'Proteção muscular em déficit. Exame Junho: testo + hematócrito.' },
  { id: 'ana',   name: 'Anastrozol',            dose: '0.5', unit: 'mg', schedule: 'Seg + Qui', color: '#A07898', weekly: '1mg',   obs: 'Monitorar: dor no joelho = E2 suprimido.' },
  { id: 'tirze', name: 'Tirzepatida',           dose: '2.5', unit: 'mg', schedule: 'Semanal',   color: '#B8764A', weekly: '2.5mg', obs: 'GLP-1/GIP. Pode causar queda de energia em dias de baixo carbo.' },
  { id: 'tadal', name: 'Tadalafila',            dose: '5',   unit: 'mg', schedule: 'Diário',    color: '#5A9E6A', weekly: '35mg',  obs: 'Fluxo sanguíneo e recuperação.' },
]

// ─── SUPLEMENTOS ─────────────────────────────────────────────────────────────
export const SUPLS = [
  { id: 'vitd',  name: 'Vitamina D3+K2', dose: '4.000 UI', time: 'Manhã',    color: '#B8764A', obs: 'Com gordura para absorção.' },
  { id: 'b12',   name: 'Vitamina B12',   dose: '1.000mcg', time: 'Manhã',    color: '#B8764A', obs: 'Verificar no exame de Junho.' },
  { id: 'creat', name: 'Creatina',       dose: '5g',       time: 'Qualquer', color: '#5A9E6A', obs: 'Retomada imediata. Consistência diária > timing.' },
  { id: 'omega', name: 'Ômega 3',        dose: '3g',       time: 'Almoço',   color: '#6088A8', obs: 'Suporte cardiovascular e anti-inflamatório.' },
]

export const PILARES = [
  { id: 'agua',   emoji: '💧', titulo: 'Hidratação', meta: '4+ litros/dia',  alerta: 'Atualmente em 1,5–2L — crítico.' },
  { id: 'sono',   emoji: '😴', titulo: 'Sono',       meta: '7h/noite mín.', alerta: 'Atualmente em 6h — aumenta cortisol crônico.' },
  { id: 'creat2', emoji: '💊', titulo: 'Creatina',   meta: '5g/dia sempre', alerta: 'Retomar imediatamente.' },
  { id: 'joelho', emoji: '🦵', titulo: 'Joelho',     meta: 'Monitorar',     alerta: 'Dor = sinal de E2 baixo por anastrozol.' },
]

// ─── PERFIL ───────────────────────────────────────────────────────────────────
export const USER_PROFILE = {
  name: 'Thomas', age: 35, weight: '91.5', height: '1.85',
  phase: 'Fase 1 — Cutting', phaseStart: '2026-05-01', phaseEnd: '2026-07-31',
  bfMeta: '12', objetivo: 'V-Taper · Ombros 3D · Densidade · Cutting agressivo mantendo massa',
}

export const NUTRITION_GOALS = { calories: 2350, protein: 215, carbs: 220, fat: 65 }

// ─── CARDIO ───────────────────────────────────────────────────────────────────
// Tipos de cardio disponíveis para registro
export const CARDIO_TYPES = [
  { id: 'escada',       label: 'Escada',          emoji: '🪜', met: 8.5,  desc: 'Escada rolante / step' },
  { id: 'esteira',      label: 'Esteira',          emoji: '🏃', met: 7.0,  desc: 'Caminhada/corrida na esteira' },
  { id: 'bike_rua',     label: 'Bike rua',         emoji: '🚴', met: 7.5,  desc: 'Ciclismo ao ar livre' },
  { id: 'bike_mecanica',label: 'Bike mecânica',    emoji: '🚲', met: 6.5,  desc: 'Bicicleta ergométrica' },
  { id: 'caminhada',    label: 'Caminhada rua',    emoji: '🚶', met: 4.0,  desc: 'Caminhada ao ar livre' },
  { id: 'futebol',      label: 'Futebol',          emoji: '⚽', met: 9.0,  desc: 'Jogo de futebol' },
  { id: 'volei',        label: 'Vôlei',            emoji: '🏐', met: 6.0,  desc: 'Jogo de vôlei' },
]

export const CARDIO_ZONES = [
  { id: 1, label: 'Zona 1', desc: 'Recuperação ativa',   fc: '< 120bpm',  color: '#6088A8' },
  { id: 2, label: 'Zona 2', desc: 'Aeróbico base / fat burning', fc: '120–140bpm', color: '#5A9E6A' },
  { id: 3, label: 'Zona 3', desc: 'Aeróbico intenso',    fc: '140–160bpm', color: '#C9A96E' },
]

// Meta semanal de cardio para cutting (minutos por zona)
export const CARDIO_META_SEMANAL = {
  zona2_min: 150,   // 150min/semana Zona 2 = padrão cutting eficiente
  zona3_min: 30,    // opcional — até 30min intenso por semana
  obs: 'Meta: 150min/semana em Zona 2. Cardio diário em jejum (escada 20–25min) + esportes contam.',
}

// ─── CONSTANTES ESTÁTICAS DO APP ─────────────────────────────────────────────
// Atlas Fitness — Thomas Altenhofen
// Atualizado: Maio 2026 — PPL Reestruturado (V-Taper / Cutting Fase 1)
// Para usar: import { SPLIT, EXERCISES, DIET, ... } from './lib/constants'

// ─── TEMA ─────────────────────────────────────────────────────────────────────
export const T = {
  bg: '#111010', surface: '#1A1917', card: '#201E1B', border: '#2E2A24',
  text: '#EDE8E0', muted: '#7A7268', faint: '#252220',
  treino: '#7DBF8E', nutri: '#D4916A', horm: '#85A8C8', metrica: '#C497B0',
  ok: '#7DBF8E', warn: '#D4916A', alert: '#C97070', gold: '#C9A96E',
}

// ─── SPLIT SEMANAL ────────────────────────────────────────────────────────────
// LÓGICA DE DISTRIBUIÇÃO:
// - Futebol (Qui) e Vôlei (Sex) são dias de esporte fixo.
// - Legs na Seg = máxima distância dos dois esportes.
// - Pull A na Qua = véspera do futebol, sem perna.
// - Push B no Sáb = 2ª frequência de deltóide lateral (driver principal do V-taper).
// - Pull B + Posterior no Dom = fecha ombro posterior (13 séries semanais totais).
// - Dia de Braço+Peito ELIMINADO — era junk volume em déficit.
// REGRA DE ANTECIPAÇÃO: Se precisar mover um dia, Legs pode ir para Dom.
//   Push e Pull podem trocar entre si. NUNCA Legs na Qua nem Push pesado na Qui.
export const SPLIT = [
  {
    id: 'legs',
    label: 'Legs',
    tag: 'Quadríceps · Posterior · Glúteo · Panturrilha',
    color: T.treino,
    emoji: '🦵',
    day: 'Seg',
    focus: 'Dia mais distante dos esportes — explore carga máxima nos compostos.',
    cardio: 'Escada 25min · Zona 2 · FC 120–140bpm',
    sport: null,
  },
  {
    id: 'push_a',
    label: 'Push A',
    tag: 'Peito · Ombro · Tríceps',
    color: '#9EC4A0',
    emoji: '💪',
    day: 'Ter',
    focus: 'Prioridade: Deltóide Lateral (7 séries). Elevação Frontal REMOVIDA — anterior já sobrecarregado pelo supino + desenvolvimento.',
    cardio: 'Escada 25min · Zona 2 · FC 120–140bpm',
    sport: null,
  },
  {
    id: 'pull_a',
    label: 'Pull A',
    tag: 'Costas · Bíceps · Deltóide Posterior',
    color: T.horm,
    emoji: '🔵',
    day: 'Qua',
    focus: 'Véspera do futebol: finalize com energia. Ombro posterior entra aqui (1ª frequência — 6 séries).',
    cardio: 'Escada 20min apenas (véspera de futebol — preserve glicogênio)',
    sport: null,
  },
  {
    id: 'futebol',
    label: 'Futebol',
    tag: 'Descanso de musculação · Alta intensidade metabólica',
    color: T.muted,
    emoji: '⚽',
    day: 'Qui',
    focus: 'Equivalente a HIIT natural. Não adicionar musculação. Se quiser treinar pela manhã: braço leve apenas (30–40min), sem perna nem ombro.',
    cardio: null,
    sport: 'futebol',
    sportInfo: {
      duracao: '~60min de jogo · ~45min em movimento efetivo',
      demanda: 'Quadríceps · Posterior · Glúteo · Cardiovascular',
      preJogo: 'Carboidrato 1h antes: banana, batata ou arroz. Não vá em jejum.',
      posJogo: 'Proteína + carbo em até 60min: 150g frango + arroz ou batata.',
      hidratacao: 'Mínimo 1L durante + 500ml pós-jogo.',
    },
  },
  {
    id: 'volei',
    label: 'Vôlei',
    tag: 'Esporte · Descanso de musculação pesada',
    color: T.muted,
    emoji: '🏐',
    day: 'Sex',
    focus: 'Ombros já treinaram terça (Push A). Push B está no sábado para garantir recuperação. Se fizer musculação: braço isolado apenas — sem ombro, sem peito.',
    cardio: null,
    sport: 'volei',
    sportInfo: {
      duracao: 'Variável',
      demanda: 'Ombro · Joelho · Tornozelo · Saltos repetitivos',
      musculacaoOpcional: 'Rosca + Martelo + Tríceps Corda — 3 séries cada — 30min total',
    },
  },
  {
    id: 'push_b',
    label: 'Push B',
    tag: 'Peito · Ombro · Tríceps',
    color: '#9EC4A0',
    emoji: '💪',
    day: 'Sáb',
    focus: '2ª frequência de Deltóide Lateral (7 séries). Total semanal: 14 séries de lateral vs. 4 no programa anterior. Maior alavanca estética do programa.',
    cardio: 'Escada 25min · Zona 2 · FC 120–140bpm',
    sport: null,
  },
  {
    id: 'pull_b',
    label: 'Pull B + Posterior',
    tag: 'Costas · Deltóide Posterior · Bíceps',
    color: T.horm,
    emoji: '🔵',
    day: 'Dom',
    focus: 'Fecha o ombro posterior (2ª frequência — 7 séries). Total posterior semanal: 13 séries. Pullover para expansão torácica e serrátil.',
    cardio: 'Escada 25min ou Caminhada 40min (opcional no domingo)',
    sport: null,
  },
]

// ─── EXERCÍCIOS ───────────────────────────────────────────────────────────────
// Schema de cada exercício:
// {
//   name: string,              — nome principal
//   alt: string,               — exercício alternativo (mesma biomecânica)
//   sets: number,
//   reps: string,
//   rest: number,              — segundos
//   muscle: string,            — grupo muscular
//   cue: string,               — dica técnica principal
//   tecnica: string,           — técnica de intensidade (RIR, myo-reps, drop set, etc.)
//   warmup: boolean,           — se este exercício precisa de aquecimento específico
// }
export const EXERCISES = {

  // ─── SEGUNDA — LEGS ───────────────────────────────────────────────────────
  // Aquecimento: 5min bicicleta leve → Agachamento corporal 2x15 → Barra vazia 1x10 → 70% 1x6 → Extensora leve 1x15 → Stiff sem carga 1x10
  legs: [
    {
      name: 'Agachamento Livre',
      alt: 'Hack Squat ou Leg Press 45° pés altos',
      sets: 4, reps: '6–8', rest: 180, muscle: 'Quad',
      cue: 'Abaixo do paralelo. Joelhos na linha dos pés. Excêntrico 2s controlado.',
      tecnica: 'RIR 1–2. Se sentir dor aguda no joelho: use a alternativa imediatamente.',
      warmup: true,
    },
    {
      name: 'Leg Press 45°',
      alt: 'Prensa Horizontal ou Hack Squat',
      sets: 3, reps: '10–12', rest: 120, muscle: 'Quad',
      cue: 'Pés na largura do quadril. Amplitude máxima sem travar o joelho no topo.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Cadeira Extensora',
      alt: 'Extensora unilateral se disponível',
      sets: 3, reps: '12–15', rest: 60, muscle: 'Quad',
      cue: 'Segure 2s no pico da contração. Amplitude completa.',
      tecnica: 'Último set: Drop Set (reduza 20–25% da carga imediatamente após a falha, continue até falha).',
      warmup: false,
    },
    {
      name: 'Stiff Barra',
      alt: 'Stiff Halteres ou Stiff Máquina',
      sets: 4, reps: '8–10', rest: 120, muscle: 'Post.',
      cue: 'Quadril para trás. Sinta o alongamento dos isquiotibiais. Excêntrico 3s controlado.',
      tecnica: 'RIR 1–2.',
      warmup: true,
    },
    {
      name: 'Leg Curl Deitado',
      alt: 'Leg Curl Sentado ou em Pé',
      sets: 3, reps: '10–12', rest: 90, muscle: 'Post.',
      cue: 'Quadril grudado no banco. Excêntrico lento 2s.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Hip Thrust Barra',
      alt: 'Hip Thrust Máquina ou Glúteo no Cabo',
      sets: 4, reps: '10–12', rest: 90, muscle: 'Glúteo',
      cue: 'Pausa 1s no topo com extensão completa. Queixo no peito — não hiperestenda o pescoço.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Panturrilha em Pé',
      alt: 'Panturrilha no Leg Press ou Sentada',
      sets: 5, reps: '15–20', rest: 60, muscle: 'Pantur.',
      cue: 'Amplitude total: segure 1s no estiramento (fundo) e 1s na contração (topo). Excêntrico 3s.',
      tecnica: 'RIR 1–2. Músculo de resposta lenta — não pule reps.',
      warmup: false,
    },
    {
      name: '🏃 Cardio — Escada',
      alt: null,
      sets: 1, reps: '25min', rest: 0, muscle: 'Cardio',
      cue: 'Zona 2 — FC 120–140bpm. Ritmo conversacional. Pós-treino.',
      tecnica: null,
      warmup: false,
    },
  ],

  // ─── TERÇA — PUSH A ───────────────────────────────────────────────────────
  // Aquecimento: Rotação de ombro com elástico 2x15 → Supino barra vazia 1x12 → Supino 50% carga 1x8 → Elevação lateral leve 1x15
  // ATENÇÃO: Elevação Frontal REMOVIDA. Deltóide anterior sobrecarregado via supinos + desenvolvimento.
  push_a: [
    {
      name: 'Supino Reto Barra',
      alt: 'Máquina de Supino Horizontal',
      sets: 4, reps: '6–8', rest: 150, muscle: 'Peito',
      cue: 'Escápulas retraídas e deprimidas. Excêntrico 2s controlado. Não trave cotovelo no topo.',
      tecnica: 'RIR 1–2.',
      warmup: true,
    },
    {
      name: 'Supino Inclinado Halteres',
      alt: 'Supino Inclinado Máquina ou Cabo',
      sets: 3, reps: '8–10', rest: 90, muscle: 'Peito',
      cue: '30–45°. Foco na porção clavicular. Não deixe os ombros subirem.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Desenvolvimento Militar Barra',
      alt: 'Desenvolvimento Smith Machine',
      sets: 4, reps: '6–8', rest: 150, muscle: 'Ombro',
      cue: 'Core contraído. Sem hiperlordose lombar. Não trave cotovelo no topo.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Elevação Lateral Halteres',
      alt: 'Elevação Lateral no Cabo',
      sets: 4, reps: '12–15', rest: 60, muscle: 'Ombro Lat.',
      cue: 'Cotovelo levemente flexionado. Eleve até a altura do ombro — não acima. Sem impulso de tronco.',
      tecnica: 'Última série: Myo-reps — execute 15 reps, pause 5s, faça 5 reps, pause 5s, faça 5 reps. RIR 1 nas primeiras 3 séries.',
      warmup: true,
    },
    {
      name: 'Elevação Lateral Cabo (de frente ao cabo)',
      alt: 'Elevação Lateral Máquina / Peck Deck Lateral',
      sets: 3, reps: '15–20', rest: 45, muscle: 'Ombro Lat.',
      cue: 'Fique de frente ao cabo com o cabo cruzando na frente do corpo. Tensão constante no alongamento — superior ao haltere neste ângulo. Unilateral se possível.',
      tecnica: 'RIR 1–2. Sem balanço.',
      warmup: false,
    },
    {
      name: 'Tríceps Corda Polia',
      alt: 'Tríceps Barra V ou Barra Reta',
      sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps',
      cue: 'Cotovelos fixos ao lado do corpo. Abra a corda no final para máxima contração da cabeça lateral.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Tríceps Francês (barra W ou haltere)',
      alt: 'Extensão Overhead no Cabo',
      sets: 3, reps: '10–12', rest: 60, muscle: 'Tríceps',
      cue: 'Cúbito fixo — não abra o cotovelo. Foco na cabeça longa (maior porção do tríceps).',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: '🏃 Cardio — Escada',
      alt: null,
      sets: 1, reps: '25min', rest: 0, muscle: 'Cardio',
      cue: 'Zona 2 — FC 120–140bpm. Ritmo conversacional. Pós-treino.',
      tecnica: null,
      warmup: false,
    },
  ],

  // ─── QUARTA — PULL A ──────────────────────────────────────────────────────
  // Aquecimento: Rotação interna/externa com elástico 2x15 → Puxada aberta 50% 1x10 → Remada leve no cabo 1x12 → Rosca leve 1x15
  // IMPORTANTE: Ombro posterior entra neste dia — 1ª frequência semanal.
  pull_a: [
    {
      name: 'Barra Fixa Pronada (pegada larga)',
      alt: 'Puxada Aberta no Pulley',
      sets: 4, reps: '6–8', rest: 150, muscle: 'Costas',
      cue: 'Amplitude total — braços completamente estendidos no fundo. Deprima a escápula antes de puxar. Puxe o peito até a barra.',
      tecnica: 'RIR 1–2.',
      warmup: true,
    },
    {
      name: 'Remada Curvada Barra (pronada)',
      alt: 'Remada Máquina ou T-bar',
      sets: 4, reps: '6–8', rest: 120, muscle: 'Costas',
      cue: '45° de inclinação. Cotovelo rente ao corpo — puxe para o umbigo. Não arredonde a lombar.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Puxada Aberta Polia (triângulo ou neutra)',
      alt: 'Pulldown Máquina Articulada',
      sets: 3, reps: '10–12', rest: 90, muscle: 'Costas',
      cue: 'Cotovelos para baixo e para trás — puxe para o esterno. Varie a pegada vs. Pull A da semana anterior.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Remada Unilateral Haltere',
      alt: 'Remada Serrote no Cabo',
      sets: 3, reps: '10–12', rest: 60, muscle: 'Costas',
      cue: 'Maximize amplitude e rotação torácica. Puxe o cotovelo acima da linha do tronco no topo.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Crucifixo Invertido no Cabo (polia baixa cruzada)',
      alt: 'Peck Deck Invertido ou Haltere Curvado',
      sets: 3, reps: '15–20', rest: 60, muscle: 'Ombro Post.',
      cue: 'Fique curvado a 45–90°. Pense em "abrir o peito ao contrário". Cotovelo levemente flexionado. Sem balanço de tronco.',
      tecnica: 'RIR 1–2. Tensão constante — superior ao haltere neste exercício.',
      warmup: true,
    },
    {
      name: 'Face Pull no Cabo (corda — altura dos olhos)',
      alt: 'Face Pull com Elástico',
      sets: 3, reps: '15–20', rest: 60, muscle: 'Ombro Post.',
      cue: 'Cotovelos para cima e para fora. Puxe a corda até a altura da testa — NÃO é uma remada. Rotação externa máxima no final.',
      tecnica: 'Última série: Drop Set. Foco em rotação, não em carga.',
      warmup: false,
    },
    {
      name: 'Rosca Direta Barra',
      alt: 'Rosca EZ ou Máquina de Bíceps',
      sets: 3, reps: '8–10', rest: 90, muscle: 'Bíceps',
      cue: 'Supinação completa no topo. Sem impulso de tronco — cotovelos fixos.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Rosca Martelo Halteres',
      alt: 'Rosca Martelo no Cabo',
      sets: 3, reps: '10–12', rest: 60, muscle: 'Bíceps',
      cue: 'Pegada neutra. Foco no braquial e braquiorradial — dá espessura ao braço visto de frente.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: '🏃 Cardio — Escada',
      alt: null,
      sets: 1, reps: '20min', rest: 0, muscle: 'Cardio',
      cue: 'Zona 2 — FC 120–140bpm. 20min apenas (véspera de futebol — preserve glicogênio). Jante com carboidrato após.',
      tecnica: null,
      warmup: false,
    },
  ],

  // ─── SÁBADO — PUSH B ──────────────────────────────────────────────────────
  // Aquecimento: Rotação de ombro com elástico 2x15 → Supino Inclinado barra vazia 1x10 → Elevação lateral leve 1x15
  // 2ª frequência de deltóide lateral — driver principal do V-taper.
  push_b: [
    {
      name: 'Supino Inclinado Barra (30–45°)',
      alt: 'Supino Inclinado Máquina',
      sets: 4, reps: '8–10', rest: 120, muscle: 'Peito',
      cue: 'Foco na porção clavicular. Não abra excessivamente — proteja o ombro. Escápulas retraídas.',
      tecnica: 'RIR 1–2.',
      warmup: true,
    },
    {
      name: 'Crossover Polia Alta (ou Fly no Cabo)',
      alt: 'Peck Deck ou Crossover Alto',
      sets: 3, reps: '12–15', rest: 60, muscle: 'Peito',
      cue: 'Adução completa — segure a contração 1s. Tensão constante durante todo o movimento.',
      tecnica: 'Última série: Drop Set (reduza 20–25% e continue até falha).',
      warmup: false,
    },
    {
      name: 'Desenvolvimento Halteres',
      alt: 'Desenvolvimento Máquina ou Smith',
      sets: 3, reps: '8–10', rest: 90, muscle: 'Ombro',
      cue: 'Maior amplitude que a barra — rotação neutra no fundo. 1 série a menos que Push A pois o ombro já vem com fadiga acumulada da semana.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Elevação Lateral Halteres',
      alt: 'Elevação Lateral no Cabo',
      sets: 4, reps: '12–15', rest: 60, muscle: 'Ombro Lat.',
      cue: 'Cotovelo levemente flexionado. Eleve até a altura do ombro. Sem impulso de tronco.',
      tecnica: 'Última série: Myo-reps — execute 15 reps, pause 5s, faça 5 reps, pause 5s, faça 5 reps.',
      warmup: true,
    },
    {
      name: 'Elevação Lateral Cabo (unilateral — de frente)',
      alt: 'Peck Deck Lateral se disponível',
      sets: 3, reps: '15–20', rest: 45, muscle: 'Ombro Lat.',
      cue: 'Tensão contínua — não use impulso de tronco. Posição unilateral garante maior isolamento.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Mergulho Paralelas (pesos adicionais se possível)',
      alt: 'Mergulho Máquina ou Dip Assistido',
      sets: 3, reps: '8–12', rest: 90, muscle: 'Tríceps',
      cue: 'Cotovelo para trás — tronco levemente inclinado à frente. Foco no tríceps, não no peito.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Extensão Tríceps Overhead (cabo ou haltere)',
      alt: 'Tríceps Francês Haltere',
      sets: 3, reps: '12–15', rest: 60, muscle: 'Tríceps',
      cue: 'Braço atrás da cabeça. Cotovelos juntos — não abra. Foco na cabeça longa (maior porção).',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: '🏃 Cardio — Escada',
      alt: null,
      sets: 1, reps: '25min', rest: 0, muscle: 'Cardio',
      cue: 'Zona 2 — FC 120–140bpm. Ritmo conversacional. Pós-treino.',
      tecnica: null,
      warmup: false,
    },
  ],

  // ─── DOMINGO — PULL B + POSTERIOR ────────────────────────────────────────
  // Aquecimento: Rotação com elástico 2x15 → Remada leve no cabo 1x12 → Face pull leve 1x15
  // Fecha o ombro posterior: 2ª frequência semanal (7 séries aqui + 6 na Qua = 13 total).
  pull_b: [
    {
      name: 'Remada T-bar (peitoral apoiado)',
      alt: 'Remada Máquina ou Remada Curvada Haltere',
      sets: 4, reps: '8–10', rest: 120, muscle: 'Costas',
      cue: 'Puxe para o plexo solar. Retraia a escápula no topo — segure 1s. Cotovelo acima da linha do tronco.',
      tecnica: 'RIR 1–2.',
      warmup: true,
    },
    {
      name: 'Puxada Triângulo Neutro (pegada supinada)',
      alt: 'Puxada Supinada ou Barra Fixa Neutra',
      sets: 3, reps: '10–12', rest: 90, muscle: 'Costas',
      cue: 'Puxe para o esterno. Pegada neutra diferencia do Pull A — varie intencionalmente.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Pullover Haltere',
      alt: 'Pullover no Cabo ou Máquina',
      sets: 3, reps: '12–15', rest: 60, muscle: 'Costas',
      cue: 'Cotovelo levemente flexionado. Não é um exercício de bíceps — é serrátil anterior e grande dorsal em alongamento. Pense em EXPANDIR a caixa torácica.',
      tecnica: 'RIR 1–2. Excêntrico controlado.',
      warmup: false,
    },
    {
      name: 'Face Pull no Cabo (corda — altura dos olhos)',
      alt: 'Face Pull Elástico ou Polia Alta',
      sets: 4, reps: '15–20', rest: 60, muscle: 'Ombro Post.',
      cue: 'Cotovelos para cima e para fora. Puxe até a testa. Rotação externa máxima no final. Não é remada.',
      tecnica: 'Última série: Drop Set.',
      warmup: true,
    },
    {
      name: 'Crucifixo Invertido Haltere (tronco paralelo ao solo)',
      alt: 'Peck Deck Invertido ou Cabo Baixo Cruzado',
      sets: 3, reps: '15–20', rest: 60, muscle: 'Ombro Post.',
      cue: 'Cotovelo levemente flexionado. Eleve lateralmente até a linha do ombro. Sem balançar o tronco.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Rosca Scott Barra W',
      alt: 'Rosca Scott Máquina ou Cabo',
      sets: 3, reps: '8–10', rest: 90, muscle: 'Bíceps',
      cue: 'Amplitude total — não trave no topo. Elimina o impulso completamente. Excêntrico 2s.',
      tecnica: 'RIR 1–2.',
      warmup: false,
    },
    {
      name: 'Rosca Alternada Haltere',
      alt: 'Rosca Concentrada ou Cabo Unilateral',
      sets: 3, reps: '10–12', rest: 60, muscle: 'Bíceps',
      cue: 'Supinação máxima no topo — segure 1s. Sem impulso de ombro.',
      tecnica: 'Última série: Drop Set.',
      warmup: false,
    },
    {
      name: '🏃 Cardio — Escada',
      alt: 'Caminhada 40min (opção mais leve no domingo)',
      sets: 1, reps: '25min', rest: 0, muscle: 'Cardio',
      cue: 'Zona 2 — FC 120–140bpm. Opcional: caminhada de 40min substitui a escada no domingo.',
      tecnica: null,
      warmup: false,
    },
  ],
}

// ─── AQUECIMENTOS ─────────────────────────────────────────────────────────────
// Usado pelo WorkoutManager para exibir o aquecimento de cada dia.
// Aquecimentos NÃO contam como séries efetivas.
export const WARMUPS = {
  legs: [
    { exercicio: 'Bicicleta ergométrica ou Esteira', series: '5min', obs: 'Ritmo leve — só elevar temperatura corporal.' },
    { exercicio: 'Agachamento com peso corporal', series: '2 × 15', obs: 'Ative glúteo e core. Sem carga. Qualidade total.' },
    { exercicio: 'Agachamento Livre — barra vazia', series: '1 × 10', obs: 'Padrão de movimento. Sem carga.' },
    { exercicio: 'Agachamento Livre — 70% da carga', series: '1 × 6', obs: '70–75% da carga de trabalho. Não conta como série efetiva.' },
    { exercicio: 'Cadeira Extensora — leve', series: '1 × 15', obs: 'Lubrifica a patela. Amplitude completa. Abandone se sentir dor.' },
    { exercicio: 'Stiff sem carga ou levíssimo', series: '1 × 10', obs: 'Sentir o alongamento. Ativar isquiotibiais.' },
  ],
  push_a: [
    { exercicio: 'Rotação de ombro com elástico ou cabo leve', series: '2 × 15', obs: 'Ativar manguito rotador. Movimento circular controlado.' },
    { exercicio: 'Supino Reto Barra — barra vazia', series: '1 × 12', obs: 'Padrão de movimento. Sinta o peitoral — não o ombro.' },
    { exercicio: 'Supino Reto Barra — 50% da carga', series: '1 × 8', obs: 'Prepare o SNC para a carga de trabalho.' },
    { exercicio: 'Elevação Lateral Haltere — leve', series: '1 × 15', obs: '30–40% da carga de trabalho. Ativar fibras do deltóide lateral.' },
  ],
  pull_a: [
    { exercicio: 'Rotação interna/externa com elástico', series: '2 × 15', obs: 'Ativar manguito rotador. Proteção do labrum.' },
    { exercicio: 'Puxada Aberta — 50% da carga', series: '1 × 10', obs: 'Deprima a escápula antes de puxar. Qualidade total.' },
    { exercicio: 'Remada no cabo — leve', series: '1 × 12', obs: 'Sinta a retração escapular. Prepare as costas.' },
    { exercicio: 'Rosca com haltere — leve', series: '1 × 15', obs: 'Ativar bíceps. Não fatigue antes das séries principais.' },
  ],
  push_b: [
    { exercicio: 'Rotação de ombro com elástico ou cabo leve', series: '2 × 15', obs: 'Mesmo protocolo do Push A.' },
    { exercicio: 'Supino Inclinado Barra — barra vazia ou leve', series: '1 × 10', obs: 'Ativar peitoral clavicular.' },
    { exercicio: 'Elevação Lateral Haltere — leve', series: '1 × 15', obs: '30–40% — prepare as fibras laterais para 2ª frequência.' },
  ],
  pull_b: [
    { exercicio: 'Rotação com elástico', series: '2 × 15', obs: 'Manguito rotador — prioridade neste dia de ombro posterior.' },
    { exercicio: 'Remada leve no cabo', series: '1 × 12', obs: 'Ativar retração escapular.' },
    { exercicio: 'Face Pull leve', series: '1 × 15', obs: 'Prepare o deltóide posterior antes das séries pesadas.' },
  ],
}

// ─── VOLUME SEMANAL (referência para analytics) ───────────────────────────────
export const WEEKLY_VOLUME = {
  'Deltóide Lateral':    { series: 14, meta: '10–16', status: 'ok',   nota: '2 frequências semanais (Push A + Push B)' },
  'Deltóide Posterior':  { series: 13, meta: '10–16', status: 'ok',   nota: '2 frequências semanais (Pull A + Pull B)' },
  'Deltóide Anterior':   { series: 4,  meta: '4–6',   status: 'ok',   nota: 'Indireto via supinos e desenvolvimento' },
  'Costas Largura':      { series: 14, meta: '12–20', status: 'ok',   nota: 'Barra fixa + puxadas' },
  'Costas Espessura':    { series: 11, meta: '10–18', status: 'ok',   nota: 'Remadas + T-bar' },
  'Bíceps':              { series: 13, meta: '10–16', status: 'ok',   nota: 'Reduzido de 18 — elimina junk volume' },
  'Tríceps':             { series: 13, meta: '10–16', status: 'ok',   nota: 'Reduzido de 18 — elimina junk volume' },
  'Peito':               { series: 10, meta: '8–14',  status: 'ok',   nota: 'Reduzido — V-taper prioriza costas/ombro' },
  'Quadríceps':          { series: 10, meta: '10–16', status: 'ok',   nota: 'Composto + isolador + isometria' },
  'Posterior/Glúteo':    { series: 11, meta: '10–16', status: 'ok',   nota: 'Stiff + Leg Curl + Hip Thrust' },
  'Panturrilha':         { series: 5,  meta: '4–8',   status: 'ok',   nota: 'Aumentada de 4 — músculo de resposta lenta' },
}

// ─── TÉCNICAS DE INTENSIDADE (referência) ─────────────────────────────────────
export const TECNICAS = {
  'RIR 1–2': 'Pare 1–2 repetições antes da falha. Padrão da maioria das séries em cutting.',
  'Myo-reps': '1 série de 15 reps → pausa 5s → 5 reps → pausa 5s → 5 reps. Ideal para deltóide lateral (fibras oxidativas).',
  'Drop Set': 'Execute até RIR 0, reduza 20–25% da carga imediatamente, continue até a falha. Máximo 1x por exercício/semana.',
  'Rest-Pause': 'Execute até RIR 0 → pausa 15s → mais 2–4 reps. Opcional nos compostos.',
  'Progressão': 'Adicione 1,25–2,5kg quando completar todas as reps de todas as séries com RIR 1. Em cutting: manutenção de carga é sucesso.',
}

// ─── CRONOGRAMA DE 12 SEMANAS ─────────────────────────────────────────────────
export const PROGRAM_SCHEDULE = {
  nome: 'Cutting Phase 1 — V-Taper',
  inicio: '2026-05-01',
  fim: '2026-07-31',
  semanas: 12,
  fases: [
    {
      nome: 'Adaptação',
      semanas: '1–4',
      foco: 'Aprender padrão de movimento do novo volume de ombro posterior e lateral. Não force PR.',
      carga: 'Conservadora',
      revisao: 'Avaliar dor no joelho (anastrozol) e resposta do ombro posterior.',
    },
    {
      nome: 'Progressão',
      semanas: '5–8',
      foco: 'Progredir carga nos compostos (+1,25–2,5kg quando completar todas as reps). Volume estável.',
      carga: 'Progressiva',
      revisao: 'Avaliar performance e disposição geral. Monitorar sinais de overreaching.',
    },
    {
      nome: 'Consolidação',
      semanas: '9–12',
      foco: 'Manter força. Se cair >15%: revise calorias antes de mexer no treino.',
      carga: 'Manutenção',
      revisao: 'Exames Junho: testosterona, estradiol, HDL, hematócrito, PSA.',
    },
  ],
}

// ─── REFERÊNCIAS DE EXAMES ───────────────────────────────────────────────────
export const LAB_REFS = {
  'Testosterona Total': { min: 175,  max: 781,  unit: 'ng/dL', alert: 'high' },
  'Estradiol (E2)':     { min: 0,    max: 33,   unit: 'pg/mL', alert: 'high' },
  'HDL':                { min: 45,   max: 999,  unit: 'mg/dL', alert: 'low'  },
  'Hematócrito':        { min: 41,   max: 50,   unit: '%',     alert: 'high' },
  'SHBG':               { min: 13,   max: 90,   unit: 'nmol/L',alert: 'none' },
  'Vitamina D':         { min: 30,   max: 100,  unit: 'ng/mL', alert: 'low'  },
  'Vitamina B12':       { min: 300,  max: 914,  unit: 'pg/mL', alert: 'low'  },
  'Colesterol Total':   { min: 0,    max: 180,  unit: 'mg/dL', alert: 'high' },
  'LDL':                { min: 0,    max: 100,  unit: 'mg/dL', alert: 'high' },
  'Triglicerídeos':     { min: 0,    max: 150,  unit: 'mg/dL', alert: 'high' },
  'TGO (AST)':          { min: 13,   max: 39,   unit: 'U/L',   alert: 'high' },
  'TGP (ALT)':          { min: 7,    max: 52,   unit: 'U/L',   alert: 'high' },
  'GGT':                { min: 9,    max: 64,   unit: 'U/L',   alert: 'high' },
  'PSA':                { min: 0,    max: 1.5,  unit: 'ng/mL', alert: 'high' },
}

// ─── PLANO ALIMENTAR ─────────────────────────────────────────────────────────
export const DIET = [
  { id: 'cafe',      time: '06:30', label: 'Café da Manhã',   kcal: 470, prot: 36, options: ['A: 1 ovo + 1 whey + 200ml leite desnatado + 30g aveia + ½ banana', 'B: 2 ovos mexidos + 1 pão francês + 1 whey + 200ml leite desnatado'] },
  { id: 'lanche1',   time: '10:00', label: 'Lanche da Manhã', kcal: 150, prot: 3,  options: ['A: 1 fruta (maçã ou pera)', 'B: 1 fruta + 3 castanhas-do-pará'] },
  { id: 'almoco',    time: '12:30', label: 'Almoço',          kcal: 450, prot: 45, options: ['FIXO: 150g frango + 40g arroz + 60g batata + 100g abóbora + vegetais + fio de azeite'] },
  { id: 'lanche2',   time: '16:00', label: 'Lanche da Tarde', kcal: 300, prot: 33, options: ['A: 1 whey + 10g aveia + 1 banana', 'B: 1 iogurte desnatado + 1 whey + 1 fruta pequena'] },
  { id: 'pretreino', time: '19:30', label: 'Pré-Treino',      kcal: 280, prot: 28, options: ['FIXO: 100g frango + 80g batata ou 60g arroz'] },
  { id: 'postreino', time: '22:15', label: 'Pós-Treino',      kcal: 115, prot: 15, options: ['A: ½ dose whey com água', 'B: ½ whey + 5g creatina'] },
  { id: 'jantar',    time: '23:00', label: 'Jantar',          kcal: 370, prot: 30, options: ['FIXO: 150g frango + 2 ovos cozidos + 100g abóbora + vegetais refogados + fio de azeite'] },
]

// ─── PROTOCOLO ───────────────────────────────────────────────────────────────
export const PROTOCOL_COMPOUNDS = [
  { id: 'testo', name: 'Testosterona Enantato', dose: '0.7',  unit: 'ml',  schedule: 'Seg + Qui', color: '#85A8C8', weekly: '350mg',  obs: 'Proteção muscular em déficit. Exame Junho: testo + hematócrito.' },
  { id: 'ana',   name: 'Anastrozol',            dose: '0.5',  unit: 'mg',  schedule: 'Seg + Qui', color: '#C497B0', weekly: '1mg',    obs: 'Monitorar: dor no joelho = E2 suprimido. Considerar migrar para exemestane em Junho.' },
  { id: 'tirze', name: 'Tirzepatida',           dose: '2.5',  unit: 'mg',  schedule: 'Semanal',   color: '#D4916A', weekly: '2.5mg',  obs: 'GLP-1/GIP. Pode causar queda de energia nos últimos exercícios em dias de baixo carbo.' },
  { id: 'tadal', name: 'Tadalafila',            dose: '5',    unit: 'mg',  schedule: 'Diário',    color: '#7DBF8E', weekly: '35mg',   obs: 'Fluxo sanguíneo e recuperação.' },
]

// ─── SUPLEMENTOS ─────────────────────────────────────────────────────────────
export const SUPLS = [
  { id: 'vitd',  name: 'Vitamina D3+K2', dose: '4.000 UI', time: 'Manhã',      color: '#D4916A', obs: 'Com gordura para absorção.' },
  { id: 'b12',   name: 'Vitamina B12',   dose: '1.000mcg', time: 'Manhã',      color: '#D4916A', obs: 'Verificar no exame de Junho.' },
  { id: 'creat', name: 'Creatina',       dose: '5g',       time: 'Qualquer',   color: '#7DBF8E', obs: 'Retomada imediata. Consistência diária > timing. Anti-catabólico via hidratação intracelular.' },
  { id: 'omega', name: 'Ômega 3',        dose: '3g',       time: 'Almoço',     color: '#85A8C8', obs: 'Suporte cardiovascular e anti-inflamatório.' },
]

// ─── PILARES INEGOCIÁVEIS ─────────────────────────────────────────────────────
export const PILARES = [
  { id: 'agua',    emoji: '💧', titulo: 'Hidratação',  meta: '4+ litros/dia', alerta: 'Atualmente em 1,5–2L — crítico. Músculo desidratado parece menor e perde força.' },
  { id: 'sono',    emoji: '😴', titulo: 'Sono',        meta: '7h/noite mín.', alerta: 'Atualmente em 6h — aumenta cortisol crônico e catabolismo muscular em déficit.' },
  { id: 'creat2',  emoji: '💊', titulo: 'Creatina',    meta: '5g/dia sempre', alerta: 'Retomar imediatamente. Maior ROI em suplementação durante cutting.' },
  { id: 'joelho',  emoji: '🦵', titulo: 'Joelho',      meta: 'Monitorar',     alerta: 'Dor = sinal de E2 baixo por anastrozol. Avaliar migrar para exemestane em Junho.' },
  { id: 'clem',    emoji: '🌡', titulo: 'Clembuterol', meta: 'Semana 4–5',    alerta: 'Não empilhar clem + tirzepatida + déficit agressivo no início. Iniciar apenas na semana 4–5.' },
]

// ─── PERFIL DO USUÁRIO ───────────────────────────────────────────────────────
export const USER_PROFILE = {
  name:     'Thomas',
  age:      35,
  weight:   '91.5',
  height:   '1.85',
  phase:    'Fase 1 — Cutting',
  phaseStart: '2026-05-01',
  phaseEnd: '2026-07-31',
  bfMeta:   '12',
  objetivo: 'V-Taper · Ombros 3D · Densidade · Cutting agressivo mantendo massa',
}

// ─── METAS NUTRICIONAIS ──────────────────────────────────────────────────────
export const NUTRITION_GOALS = {
  calories: 2350,
  protein:  215,
  carbs:    220,
  fat:      65,
}

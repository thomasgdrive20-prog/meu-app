export const USER_PROFILE = {
  name: "Atlas",
  height: 1.85,
  weight: 92,
  phaseStart: '2026-05-01',
  currentPhase: 'Hipertrofia II',
  protocol: {
    medication: "Tirzepatida",
    dosage: "2.5mg",
    frequency: "Semanal",
    additional: ["Tadalafila"]
  }
};

export const PROGRAM_SCHEDULE = {
  phases: [
    { id: 'hipertrofia_2', name: 'Hipertrofia II', start: '2026-05-01', end: '2026-06-12' }
  ]
};

export const SPLIT = [
  { id: 'push_a', label: 'Seg - Push A' },
  { id: 'pull_a', label: 'Ter - Pull A' },
  { id: 'legs_a', label: 'Qua - Legs A' },
  { id: 'sport_1', label: 'Qui - Futebol' },
  { id: 'sport_2', label: 'Sex - Vôlei' },
  { id: 'push_b', label: 'Sáb - Push B' },
  { id: 'pull_b', label: 'Dom - Pull B' }
];

export const EXERCISES = {
  push_a: [{ name: 'Supino Inclinado', sets: 4, reps: '8-10', rest: '2 min', tech: 'RIR 1-2' }],
  pull_a: [{ name: 'Puxada Alta', sets: 4, reps: '10-12', rest: '2 min', tech: 'Myo-reps' }],
  push_b: [], pull_b: [], legs_a: [], sport_1: [], sport_2: []
};

export const PILARES = [
  { label: 'Sono', status: '8h/dia' },
  { label: 'Hidratação', status: '4L/dia' }
];

export const LAB_REFS = {
  'Testosterona': { min: 300, max: 900, unit: 'ng/dL' }
};
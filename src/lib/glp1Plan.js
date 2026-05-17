/**
 * Plano alimentar adaptado para dias com Tirzepatida ativa.
 * Lógica: reduz carbo/gordura ~20%, mantém proteína, refeições mais leves.
 */

export const DIET_GLP1 = [
  {
    id: 'cafe',
    time: '06:30',
    label: 'Café da Manhã',
    kcal: 350,
    prot: 34,
    carbs: 35,
    fat: 6,
    options: [
      'Shake: 1 dose whey + 30g aveia + 1 banana + 200ml leite desnatado',
      'Alternativa leve: 2 ovos mexidos + 1 torrada integral + café',
    ],
    glp1_note: 'Prefira o shake — mais fácil de consumir com saciedade alta.',
  },
  {
    id: 'lanche1',
    time: '10:00',
    label: 'Lanche da Manhã',
    kcal: 100,
    prot: 3,
    carbs: 18,
    fat: 2,
    options: [
      'A: 1 fruta pequena (maçã ou pera)',
      'B: Pule se não tiver fome — o GLP-1 suprime naturalmente.',
    ],
    glp1_note: 'Se não tiver fome, pode pular este lanche sem culpa.',
  },
  {
    id: 'almoco',
    time: '12:30',
    label: 'Almoço',
    kcal: 380,
    prot: 38,
    carbs: 30,
    fat: 8,
    options: [
      '100–120g frango grelhado + 80g arroz + salada/legumes à vontade',
      '100g frango + 60g batata cozida + 100g abóbora + vegetais',
    ],
    glp1_note: 'Porção menor que o normal — coma devagar, saciedade vem antes.',
  },
  {
    id: 'lanche2',
    time: '16:00',
    label: 'Lanche da Tarde',
    kcal: 220,
    prot: 28,
    carbs: 18,
    fat: 3,
    options: [
      'A: 1 whey + 1 fruta pequena',
      'B: Bolo proteico pequeno OU 2 ovos + 1 torrada',
      'C: Pão simples + ovo cozido',
    ],
    glp1_note: 'Foco em proteína. Evite refeições muito densas aqui.',
  },
  {
    id: 'pretreino',
    time: '19:30',
    label: 'Pré-Treino',
    kcal: 180,
    prot: 15,
    carbs: 28,
    fat: 2,
    options: [
      'A: 1 banana + ½ dose whey',
      'B: 1 pão simples + 1 ovo cozido',
      'C: 1 whey com água (se não tiver apetite)',
    ],
    glp1_note: 'Mais leve que o normal — carboidrato simples para energia no treino.',
  },
  {
    id: 'postreino',
    time: '22:15',
    label: 'Pós-Treino',
    kcal: 200,
    prot: 30,
    carbs: 18,
    fat: 4,
    options: [
      'A: 1 dose whey + leite desnatado 200ml',
      'B: 2 ovos + 60g arroz',
      'C: 100g frango pequeno + salada',
    ],
    glp1_note: 'Priorize proteína. Evite refeição muito pesada — digestão mais lenta com GLP-1.',
  },
  {
    id: 'jantar',
    time: '23:00',
    label: 'Jantar',
    kcal: 280,
    prot: 28,
    carbs: 15,
    fat: 8,
    options: [
      '120g frango + 1 ovo cozido + 80g abóbora + salada folhosa + fio de azeite',
      '100g frango + legumes refogados + fio de azeite',
    ],
    glp1_note: 'Refeição leve. Se não tiver fome, pode reduzir ainda mais o carbo.',
  },
]

// Totais do dia GLP-1
export const GLP1_TOTALS = {
  kcal: DIET_GLP1.reduce((s, m) => s + m.kcal, 0),  // ~1.710 kcal
  prot: DIET_GLP1.reduce((s, m) => s + m.prot, 0),  // ~176g
  carbs: DIET_GLP1.reduce((s, m) => s + (m.carbs || 0), 0),
  fat: DIET_GLP1.reduce((s, m) => s + (m.fat || 0), 0),
}

export const GLP1_META = {
  kcal: { min: 1700, max: 2100 },
  prot: { min: 150,  max: 180  },
  carbs:{ min: 140,  max: 190  },
  fat:  { min: 45,   max: 65   },
  obs: 'Em dias com tirzepatida: priorize proteína, reduza carbo/gordura naturalmente, não force refeições se não tiver fome.',
}
import React, { useState } from 'react';

/**
 * NOTA DE INTEGRAÇÃO:
 * No seu ambiente local (VS Code), o import abaixo deve ser:
 * import { SPLIT, EXERCISES } from '../lib/constants';
 * * Para esta demonstração, usaremos dados mockados para evitar erros de compilação.
 */

const MOCK_SPLIT = [
  { id: 'push_a', label: 'Seg - Push A' },
  { id: 'pull_a', label: 'Ter - Pull A' },
  { id: 'legs_a', label: 'Qua - Legs A' },
  { id: 'sport_1', label: 'Qui - Futebol' },
  { id: 'sport_2', label: 'Sex - Vôlei' },
  { id: 'push_b', label: 'Sáb - Push B' },
  { id: 'pull_b', label: 'Dom - Pull B' },
];

const MOCK_EXERCISES = {
  push_a: [
    { name: 'Supino Inclinado (Halter)', sets: 4, reps: '8-10', rest: '2 min', tech: 'Top Set' },
    { name: 'Desenvolvimento Militar', sets: 3, reps: '10-12', rest: '90s', tech: '' },
    { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60s', tech: 'Drop Set' },
  ],
  pull_a: [
    { name: 'Puxada Aberta', sets: 4, reps: '10-12', rest: '2 min', tech: '' },
    { name: 'Remada Curvada', sets: 3, reps: '8-10', rest: '90s', tech: '' },
    { name: 'Rosca Direta', sets: 3, reps: '12-15', rest: '60s', tech: 'Rest-Pause' },
  ]
};

export default function WorkoutManager() {
  const [activeTab, setActiveTab] = useState('push_a');

  // No seu VS Code, use SPLIT e EXERCISES vindos do import
  const currentSplit = MOCK_SPLIT;
  const currentExercises = MOCK_EXERCISES[activeTab] || [];

  return (
    <div className="p-4 bg-zinc-950/50 rounded-3xl border border-white/5">
      {/* Navegação por Abas (Dias da Semana) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar scroll-smooth">
        {currentSplit.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveTab(day.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
              activeTab === day.id 
                ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                : 'bg-white/5 text-zinc-500 hover:bg-white/10 border border-transparent hover:border-white/10'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Lista de Exercícios do Dia Selecionado */}
      <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {currentExercises.length > 0 ? (
          currentExercises.map((ex, idx) => (
            <div 
              key={idx} 
              className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl hover:border-amber-500/30 transition-all duration-300 group hover:translate-x-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                      <strong className="text-zinc-200">{ex.sets}</strong> séries
                    </span>
                    <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                      <strong className="text-zinc-200">{ex.reps}</strong> reps
                    </span>
                    <span className="text-xs text-zinc-500 border-l border-zinc-800 pl-3">
                      Descanso: {ex.rest}
                    </span>
                  </div>
                </div>
                {ex.tech && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 font-black uppercase tracking-tighter shadow-sm">
                    {ex.tech}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-zinc-600 text-sm italic">Dia de descanso ou atividade desportiva.</p>
          </div>
        )}
      </div>

      {/* Footer Informativo */}
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
        <span>Volume Semanal: Alto</span>
        <span className="text-amber-500/50">PPL Reestruturado 2026</span>
      </div>
    </div>
  );
}
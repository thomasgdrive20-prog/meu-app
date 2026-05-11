import React from 'react';
import MainLayout from "../layouts/MainLayout";
import PhaseProgressCard from '../components/PhaseProgressCard';
import WorkoutManager from '../components/WorkoutManager';
import { USER_PROFILE, PILARES } from '../lib/constants';

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4">
        
        {/* 1. BARRA DE PROGRESSO (Aparecerá no topo) */}
        <PhaseProgressCard />

        {/* 2. CARDS DE PESO E BF (Lendo das suas constants) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 text-center">Peso Atual</p>
            <p className="text-3xl font-bold text-white text-center">{USER_PROFILE.weight} <span className="text-sm text-zinc-500">kg</span></p>
          </div>
          
          <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 text-center">BF Estimado</p>
            <p className="text-3xl font-bold text-amber-500 text-center">20 <span className="text-sm text-zinc-500">%</span></p>
          </div>

          {/* 3. PILARES (Sono e Hidratação) */}
          {PILARES.map((pilar, idx) => (
            <div key={idx} className="p-6 bg-zinc-900 border border-white/5 rounded-3xl">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 text-center">{pilar.label}</p>
              <p className="text-lg font-bold text-white text-center italic">{pilar.status}</p>
            </div>
          ))}
        </div>

        {/* 4. GESTOR DE TREINO (Onde você vai ver o Futebol e Vôlei) */}
        <section className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Planeamento Semanal</h3>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Fase: {USER_PROFILE.currentPhase}</span>
          </div>
          <div className="p-4">
            <WorkoutManager />
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
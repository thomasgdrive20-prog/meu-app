import React from 'react';
import MainLayout from "../layouts/MainLayout";
import PhaseProgressCard from '../components/PhaseProgressCard';
import WorkoutManager from '../components/WorkoutManager';
import { USER_PROFILE, PILARES } from '../lib/constants';

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-24 p-4">
        
        {/* BARRA DE PROGRESSO - Ocupa o topo todo */}
        <PhaseProgressCard />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PESO */}
          <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-sm">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Peso Atual</p>
            <p className="text-3xl font-bold text-white">{USER_PROFILE.weight}kg</p>
          </div>
          
          {/* BF */}
          <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-sm">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">BF%</p>
            <p className="text-3xl font-bold text-amber-500">20%</p>
          </div>

          {/* PILARES (Sono e Hidratação que estão no constants) */}
          {PILARES.map((pilar, idx) => (
            <div key={idx} className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-sm">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">{pilar.label}</p>
              <p className="text-lg font-bold text-white italic">{pilar.status}</p>
            </div>
          ))}
        </div>

        {/* GESTOR DE TREINOS - O novo componente interativo */}
        <section className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-2">
          <div className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Próximos Treinos</h3>
            <WorkoutManager />
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
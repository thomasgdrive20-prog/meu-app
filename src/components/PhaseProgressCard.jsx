import React from 'react';

/**
 * NOTA DE INTEGRAÇÃO:
 * No seu ambiente local (VS Code), o import abaixo deve ser:
 * import { USER_PROFILE } from '../lib/constants';
 * * Para esta demonstração, usaremos dados locais para evitar erros de compilação.
 */

export default function PhaseProgressCard() {
  // Dados simulados baseados no seu constants.js para evitar erro de 'Could not resolve'
  const USER_PROFILE = {
    phaseStart: '2026-05-01',
    currentPhase: 'Hipertrofia II'
  };

  // Lógica de cálculo de progresso
  const startDate = new Date(USER_PROFILE.phaseStart);
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.ceil(diffDays / 7);
  const totalDaysPhase = 42; // 6 semanas
  const progress = Math.min(Math.round((diffDays / totalDaysPhase) * 100), 100);

  return (
    <div className="p-8 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-900/20 border border-white/10 rounded-3xl mb-8 shadow-2xl relative overflow-hidden group">
      {/* Marca d'água decorativa */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <div className="text-8xl font-black text-white select-none">ATLAS</div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold tracking-[0.2em] uppercase">
              Fase Atual: {USER_PROFILE.currentPhase}
            </span>
            <h2 className="text-4xl font-bold text-white mt-4 tracking-tight">
              Semana <span className="text-amber-500">{currentWeek}</span> de 6
            </h2>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <p className="text-3xl font-mono font-bold text-amber-500">{progress}%</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 font-medium">Conclusão da Fase</p>
          </div>
        </div>

        {/* Barra de Progresso Estilizada */}
        <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm p-0.5">
          <div 
            className="bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-4 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
          <span>Início: {startDate.toLocaleDateString('pt-BR')}</span>
          <span className="hidden sm:inline text-amber-500/50 italic font-normal">Foco: Volume Máximo Adaptativo</span>
          <span>Previsão: 12/06/2026</span>
        </div>
      </div>
    </div>
  );
}
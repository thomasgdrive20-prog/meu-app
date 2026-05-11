import React from 'react';

export default function HealthDashboard() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="text-white font-bold">Importar Exames (PDF)</h4>
        <p className="text-zinc-500 text-sm mt-2 text-center max-w-[200px]">
          Arraste seu PDF aqui para analisar biomarcadores automaticamente.
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors">
          Selecionar Arquivo
        </button>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Protocolo</p>
          <p className="text-lg font-bold text-white mt-1">Tirzepatida</p>
          <p className="text-blue-500 font-mono text-sm">2.5mg / semana</p>
        </div>
        <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Suplementação</p>
          <p className="text-lg font-bold text-white mt-1">Creatina</p>
          <p className="text-blue-500 font-mono text-sm">5g / diário</p>
        </div>
      </div>
    </div>
  );
}
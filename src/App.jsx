import React, { useState } from 'react';
import {
  Dumbbell, Play, History, User, TrendingUp, Calendar,
  ChevronRight, Clock, LayoutDashboard, Plus
} from 'lucide-react';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    body { margin: 0; font-family: 'Inter', sans-serif; background-color: #0a0a0a; color: #ffffff; }
    .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
    .btn-primary { background: #39FF14; color: #000; font-weight: 800; transition: all 0.2s ease; box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); border: none; cursor: pointer; }
    .btn-primary:hover { transform: scale(1.02); box-shadow: 0 0 30px rgba(57, 255, 20, 0.4); }
    .nav-item { color: #666; cursor: pointer; }
    .nav-item.active { color: #39FF14; }
    .stat-value { font-size: 24px; font-weight: 800; }
  `}</style>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <GlobalStyles />
      <header style={{ padding: '40px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>FOCO TOTAL</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '14px' }}>Segunda-feira, 8 de Maio</p>
        </div>
        <div className="glass-card" style={{ padding: '10px', borderRadius: '50%' }}><User size={24} /></div>
      </header>

      <section style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <TrendingUp size={20} color="#39FF14" style={{ marginBottom: '12px' }} />
          <div className="stat-value">12.4k</div>
          <div style={{ fontSize: '10px', color: '#666' }}>VOLUME TOTAL (KG)</div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <Calendar size={20} color="#39FF14" style={{ marginBottom: '12px' }} />
          <div className="stat-value">18</div>
          <div style={{ fontSize: '10px', color: '#666' }}>TREINOS NO MÊS</div>
        </div>
      </section>

      <section style={{ padding: '0 24px' }}>
        <button className="btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px' }}>
          <Play fill="black" size={20} /> INICIAR TREINO
        </button>
      </section>

      <section style={{ padding: '32px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Últimas Atividades</h2>
          <span style={{ color: '#39FF14', fontSize: '14px' }}>Ver todos</span>
        </div>
        {[
          { name: 'Push Day - Peito', duration: '54min', icon: <Dumbbell size={18} /> },
          { name: 'Leg Day Killer', duration: '1h 10min', icon: <History size={18} /> }
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '10px', borderRadius: '12px', color: '#39FF14' }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.duration} • Ontem</div>
            </div>
            <ChevronRight size={18} color="#444" />
          </div>
        ))}
      </section>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px', background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }}>
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><LayoutDashboard size={24} /></div>
        <div className="nav-item">
          <div style={{ background: '#39FF14', color: '#000', padding: '12px', borderRadius: '50%', marginTop: '-40px', boxShadow: '0 8px 20px rgba(57, 255, 20, 0.3)', border: '4px solid #0a0a0a' }}>
            <Plus size={28} strokeWidth={3} />
          </div>
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><User size={24} /></div>
      </nav>
    </div>
  );
};

export default App;
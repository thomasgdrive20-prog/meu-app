import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import BottomNav from './components/navigation/BottomNav'
import HomePage from './pages/HomePage'
import TreinoPage from './pages/TreinoPage'
import NutriPage from './pages/NutriPage'
import SaudePage from './pages/SaudePage'
import PerfilPage from './pages/PerfilPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) return (
    <div style={{ background: '#111010', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #C9A96E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!session) return (
    <div style={{
      background: '#111010', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', fontFamily: "'Lato', sans-serif",
    }}>
      <div style={{ fontSize: 11, color: '#C9A96E', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
        Atlas
      </div>
      <div style={{ fontSize: 32, color: '#EDE8E0', fontWeight: 800, marginBottom: 8 }}>
        Fitness
      </div>
      <div style={{ fontSize: 14, color: '#7A7268', marginBottom: 48, textAlign: 'center' }}>
        Seu sistema de performance pessoal
      </div>

      <button onClick={handleGoogle} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 28px', borderRadius: 14,
        background: '#EDE8E0', border: 'none',
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        color: '#111010', width: '100%', maxWidth: 320,
        justifyContent: 'center',
      }}>
        <img src="https://www.google.com/favicon.ico" width={20} height={20} alt="Google" />
        Entrar com Google
      </button>

      <div style={{ fontSize: 11, color: '#7A7268', marginTop: 24, textAlign: 'center', lineHeight: 1.6 }}>
        Seus dados ficam salvos na nuvem<br />e sincronizados em todos os dispositivos
      </div>
    </div>
  )

  const props = { session, setPage, handleLogout }

  return (
    <div style={{
      background: '#111010',
      minHeight: '100vh',
      maxWidth: 428,
      margin: '0 auto',
      fontFamily: "'Lato', sans-serif",
      paddingBottom: 80,
      position: 'relative',
    }}>
      {page === 'home'   && <HomePage   {...props} />}
      {page === 'treino' && <TreinoPage {...props} />}
      {page === 'nutri'  && <NutriPage  {...props} />}
      {page === 'saude'  && <SaudePage  {...props} />}
      {page === 'perfil' && <PerfilPage {...props} />}
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
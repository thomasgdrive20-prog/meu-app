import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabaseClient'
import useAppStore from './stores/useAppStore'
import { checkDailyReset } from './lib/resetDaily'
import BottomNav from './components/navigation/BottomNav'
import HomePage from './pages/HomePage'
import TreinoPage from './pages/TreinoPage'
import NutriPage from './pages/NutriPage'
import SaudePage from './pages/SaudePage'
import PerfilPage from './pages/PerfilPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { T } from './lib/constants'
import CardioPage from './pages/CardioPage'

const PAGE_ORDER = ['home', 'treino', 'nutri', 'saude', 'analytics', 'perfil']

const pageVariants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page, setPage] = useState('home')
  const [prevPage, setPrevPage] = useState('home')
  const { boot, reset, syncMsg, loading } = useAppStore()

  const direction = PAGE_ORDER.indexOf(page) - PAGE_ORDER.indexOf(prevPage)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      // Verifica reset diário antes de carregar
      checkDailyReset(useAppStore)
      // Limpa dados em cache e recarrega do Supabase
      useAppStore.setState({ weights: [], metrics: [], healthLogs: [], exams: [], workoutLogs: [] })
      boot(session.user.id)
    } else if (!session && !authLoading) {
      reset()
    }
  }, [session?.user?.id])

  const navigate = (p) => { setPrevPage(page); setPage(p) }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    setSession(null)
    setPage('home')
  }

  if (authLoading) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <div style={{ width: 32, height: 32, border: `2.5px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!session) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${T.gold}0E 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', zIndex: 1, width: '100%', maxWidth: 340 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: `${T.gold}18`, border: `1px solid ${T.gold}35`, marginBottom: 18 }}>
            <span style={{ fontSize: 26 }}>⚡</span>
          </div>
          <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>Atlas</div>
          <div style={{ fontSize: 34, color: T.text, fontWeight: 800, letterSpacing: -1 }}>Fitness</div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 8 }}>Seu sistema de performance pessoal</div>
        </div>
        <button onClick={handleGoogle} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 24px', borderRadius: 14, background: T.text, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', color: T.bg, width: '100%', justifyContent: 'center' }}>
          <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="" />
          Entrar com Google
        </button>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 16 }}>Dados sincronizados na nuvem · Privado</div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const pageProps = { session, setPage: navigate, handleLogout }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', maxWidth: 428, margin: '0 auto', fontFamily: "'DM Sans', 'Lato', sans-serif", paddingBottom: 80, position: 'relative', overflowX: 'hidden' }}>

      {/* Flash */}
      <AnimatePresence>
        {syncMsg && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top) + 10px)', left: '50%', transform: 'translateX(-50%)', background: `${T.card}F0`, backdropFilter: 'blur(12px)', border: `1px solid ${T.border}`, borderRadius: 20, padding: '5px 14px', fontSize: 11, color: T.gold, fontWeight: 600, zIndex: 9999, whiteSpace: 'nowrap' }}>
            {syncMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: `${T.bg}CC`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8888 }}>
          <div style={{ width: 28, height: 28, border: `2.5px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Páginas */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={page} custom={direction} variants={pageVariants}
          initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          style={{ minHeight: '100vh' }}>
          {page === 'home'      && <HomePage      {...pageProps} />}
          {page === 'treino'    && <TreinoPage    {...pageProps} />}
          {page === 'cardio' && <CardioPage {...pageProps} />}
          {page === 'nutri'     && <NutriPage     {...pageProps} />}
          {page === 'saude'     && <SaudePage     {...pageProps} />}
          {page === 'analytics' && <AnalyticsPage {...pageProps} />}
          {page === 'perfil'    && <PerfilPage    {...pageProps} />}
        </motion.div>
      </AnimatePresence>

      <BottomNav page={page} setPage={navigate} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

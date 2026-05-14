import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabaseClient'
import useAppStore from './stores/useAppStore'
import BottomNav from './components/navigation/BottomNav'
import HomePage from './pages/HomePage'
import TreinoPage from './pages/TreinoPage'
import NutriPage from './pages/NutriPage'
import SaudePage from './pages/SaudePage'
import PerfilPage from './pages/PerfilPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { T } from './lib/constants'

const PAGE_ORDER = ['home', 'treino', 'nutri', 'saude', 'analytics', 'perfil']

const pageVariants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page, setPage] = useState('home')
  const [prevPage, setPrevPage] = useState('home')
  const { boot, reset, setSyncMsg, syncMsg, loading } = useAppStore()

  const direction = PAGE_ORDER.indexOf(page) - PAGE_ORDER.indexOf(prevPage)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Boot do store quando sessão muda — sempre re-busca do Supabase
  useEffect(() => {
    if (session?.user?.id) {
      useAppStore.setState({
        weights: [], metrics: [], healthLogs: [], exams: [], workoutLogs: [],
      })
      boot(session.user.id)
    } else if (!session) {
      reset()
    }
  }, [session?.user?.id])

  const navigate = (newPage) => {
    setPrevPage(page)
    setPage(newPage)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    setSession(null)
    setPage('home')
  }

  // ── Loading inicial ──────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{
      background: T.bg, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${T.gold}`,
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
        Atlas
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // ── Tela de login ────────────────────────────────────────────────────────────
  if (!session) return (
    <div style={{
      background: T.bg, minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', fontFamily: "'DM Sans', 'Lato', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fundo decorativo */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${T.gold}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', zIndex: 1, width: '100%', maxWidth: 360 }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 20,
            background: `linear-gradient(135deg, ${T.gold}33, ${T.gold}11)`,
            border: `1px solid ${T.gold}44`, marginBottom: 20,
          }}>
            <span style={{ fontSize: 28 }}>⚡</span>
          </div>
          <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 }}>
            Atlas
          </div>
          <div style={{ fontSize: 36, color: T.text, fontWeight: 800, letterSpacing: -1 }}>
            Fitness
          </div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
            Seu sistema de performance pessoal
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {[
            ['📊', 'Analytics avançados de evolução'],
            ['🏋️', 'Treinos com timer e histórico'],
            ['💊', 'Protocolo e suplementação'],
          ].map(([icon, text]) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', borderRadius: 12,
              background: `${T.gold}08`, border: `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 13, color: T.muted }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={handleGoogle} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 28px', borderRadius: 16,
          background: T.text, border: 'none',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          color: T.bg, width: '100%', justifyContent: 'center',
          boxShadow: `0 0 40px ${T.gold}22`,
        }}>
          <img src="https://www.google.com/favicon.ico" width={20} height={20} alt="Google" />
          Entrar com Google
        </button>

        <div style={{ fontSize: 11, color: T.muted, marginTop: 20, lineHeight: 1.7 }}>
          Dados sincronizados na nuvem · Privado e seguro
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const pageProps = { session, setPage: navigate, handleLogout }

  // ── App principal ────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: T.bg, minHeight: '100vh',
      maxWidth: 428, margin: '0 auto',
      fontFamily: "'DM Sans', 'Lato', sans-serif",
      paddingBottom: 80, position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Flash de sincronização */}
      <AnimatePresence>
        {syncMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 'calc(env(safe-area-inset-top) + 12px)',
              left: '50%', transform: 'translateX(-50%)',
              background: `${T.card}EE`, backdropFilter: 'blur(12px)',
              border: `1px solid ${T.border}`, borderRadius: 20,
              padding: '6px 16px', fontSize: 12, color: T.gold,
              fontWeight: 600, zIndex: 9999, whiteSpace: 'nowrap',
            }}
          >
            {syncMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay pós-boot */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: `${T.bg}CC`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8888,
        }}>
          <div style={{
            width: 32, height: 32, border: `3px solid ${T.gold}`,
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Páginas com transição */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ minHeight: '100vh' }}
        >
          {page === 'home'      && <HomePage      {...pageProps} />}
          {page === 'treino'    && <TreinoPage    {...pageProps} />}
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

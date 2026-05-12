import { useState } from 'react'
import Sidebar from './components/navigation/Sidebar'
import Dashboard from './pages/Dashboard'
import { T } from './lib/constants'

export default function App() {
  const [section, setSection] = useState('treino')

  return (
    <div style={{
      display: 'flex',
      background: T.bg,
      minHeight: '100vh',
      color: T.text,
      fontFamily: "'Lato', sans-serif",
    }}>
      <Sidebar section={section} setSection={setSection} />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <Dashboard section={section} setSection={setSection} />
      </main>
    </div>
  )
}
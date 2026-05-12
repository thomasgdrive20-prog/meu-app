import { useState } from 'react'
import Sidebar from './components/navigation/Sidebar'
import Dashboard from './pages/Dashboard'
import { T } from './lib/constants'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div style={{
      display: 'flex',
      background: T.bg,
      minHeight: '100vh',
      color: T.text,
      fontFamily: "'Lato', sans-serif",
    }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <Dashboard setPage={setPage} activePage={page} />
      </main>
    </div>
  )
}
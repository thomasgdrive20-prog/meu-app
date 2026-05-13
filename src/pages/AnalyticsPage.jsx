import { T } from '../lib/constants'

export default function AnalyticsPage() {
  return (
    <div style={{ padding: '20px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
      <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Analytics</div>
      <div style={{ fontSize: 22, color: T.text, fontWeight: 800, marginTop: 4 }}>Em breve</div>
    </div>
  )
}
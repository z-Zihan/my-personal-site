// Component added by Ansh - github.com/ansh-dhanani
import GradualBlur from './components/effects/GradualBlur'

import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Analytics />

      {/* Gradual Blur Effect at Bottom - Fixed */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '7rem', zIndex: 40, pointerEvents: 'none' }}>
        <GradualBlur
          target="page"
          position="bottom"
          height="7rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential
          opacity={1}
        />
      </div>
    </div>
  )
}

export default App

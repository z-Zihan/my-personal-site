import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Analytics />
    </div>
  )
}

export default App

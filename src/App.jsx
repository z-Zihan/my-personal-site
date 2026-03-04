import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="pt-10">
        <Outlet />
      </main>
      <Footer />
      <Analytics />
    </div>
  )
}

export default App

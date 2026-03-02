import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useThemeStore } from './store/themeStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const { initTheme } = useThemeStore()

  useEffect(() => {
    // 初始化主题
    initTheme()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
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

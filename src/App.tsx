// Component added by Ansh - github.com/ansh-dhanani
import GradualBlur from './components/effects/GradualBlur'

import { Outlet, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import BackToTop from './components/common/BackToTop'
import { useState, useEffect } from 'react'

interface HeaderVisibilityDetail {
  visible: boolean
}

function App() {
  const location = useLocation()
  const [globalHeaderVisible, setGlobalHeaderVisible] = useState(true)

  // 判断是否在文章详情页
  const isBlogDetailPage = location.pathname.startsWith('/blog/')

  // 监听自定义事件来控制 header 显示状态
  useEffect(() => {
    const handleHeaderVisibilityChange = (e: Event) => {
      if (isBlogDetailPage) {
        setGlobalHeaderVisible((e as CustomEvent<HeaderVisibilityDetail>).detail.visible)
      }
    }

    window.addEventListener('header-visibility-change' as any, handleHeaderVisibilityChange)
    return () => window.removeEventListener('header-visibility-change' as any, handleHeaderVisibilityChange)
  }, [isBlogDetailPage])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 文章详情页向下滚动时隐藏 Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isBlogDetailPage && !globalHeaderVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <Navbar />
      </div>
      <main className="pt-16">
        <Outlet />
      </main>
      <Analytics />
      <BackToTop />

      {/* Gradual Blur Effect at Bottom - 文章详情页向下滚动时隐藏 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '7rem',
          zIndex: 40,
          pointerEvents: 'none',
          opacity: isBlogDetailPage && !globalHeaderVisible ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <GradualBlur target="page" position="bottom" height="7rem" strength={2} divCount={5} curve="bezier" exponential opacity={1} />
      </div>
    </div>
  )
}

export default App

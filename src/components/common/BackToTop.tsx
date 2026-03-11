import { useState, useEffect } from 'react'
import { ArrowUpOutlined } from '@ant-design/icons'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-50 w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer p-0"
      aria-label="回到顶部"
    >
      <ArrowUpOutlined />
    </button>
  )
}

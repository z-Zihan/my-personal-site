import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { useLanguage } from '../../utils/useLanguage'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { t } = useLanguage()

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
      className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white shadow-lg shadow-purple-500/40 ring-2 ring-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer p-0"
      aria-label={t('backToTop')}
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  )
}

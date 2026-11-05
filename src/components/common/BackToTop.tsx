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
      className="fixed bottom-10 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white shadow-xl shadow-purple-500/50 ring-2 ring-white/30 flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-110 active:scale-95 cursor-pointer p-0"
      aria-label={t('backToTop')}
      title={t('backToTop')}
    >
      <ArrowUp size={26} strokeWidth={2.5} />
      <span className="text-[10px] leading-none font-medium opacity-90">{t('top')}</span>
    </button>
  )
}

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Globe } from 'lucide-react'
import Avatar from './common/Avatar'
import Magnet from './effects/Magnet'
import { trackEvent } from '../utils/analytics'
import { useLanguage } from '../utils/useLanguage'
import { Language } from '../utils/i18n'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visitorId, setVisitorId] = useState('')
  const location = useLocation()
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    let vid = localStorage.getItem('visitor_id')
    if (!vid) {
      vid = 'visitor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('visitor_id', vid)
    }
    setVisitorId(vid)
  }, [])

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/blog', label: t('blog') },
    { path: '/hot-news', label: t('hotNews') },
    { path: '/message', label: t('message') },
  ]

  const isActive = (path: string) => location.pathname === path

  // 导航点击埋点
  const handleNavClick = (label: string) => {
    trackEvent('nav_click', 'navigation', {
      nav_item: label,
      page_path: window.location.pathname,
    })
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 语言切换（中/EN 一次点击来回切）
  const handleToggleLanguage = () => {
    const next: Language = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
    trackEvent('language_switch', 'settings', {
      from: lang,
      to: next,
      page_path: window.location.pathname,
    })
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/60 backdrop-blur-xl"
      suppressHydrationWarning
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl sm:text-2xl font-bold relative group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-cyan-200">
                MY BLOG
              </span>
              {/* 下划线光效 */}
              <motion.div
                className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </Link>

            {/* Desktop Menu - 增大热区 */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {navLinks.map((link) => (
                <Magnet key={link.path} padding={80} strength={0.4} active={true}>
                  <Link
                    to={link.path}
                    onClick={() => handleNavClick(link.label)}
                    className={`relative px-4 py-3 rounded-xl text-sm lg:text-base transition-all duration-300 ${
                      isActive(link.path)
                        ? 'text-white font-semibold'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {/* 激活状态背景 */}
                    {isActive(link.path) && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {/* Hover 光效 - 增大范围 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-cyan-500/15 rounded-xl opacity-0 border border-transparent"
                      whileHover={{
                        opacity: 1,
                        border: '1px solid rgba(168,85,247,0.3)',
                        boxShadow: '0 0 20px rgba(168,85,247,0.2)'
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </Magnet>
              ))}
              {/* 语言切换按钮：样式与主题按钮（ThemeToggle）一致 */}
              <button
                onClick={handleToggleLanguage}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center"
                aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
                title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
              >
                <Globe className="w-5 h-5 text-cyan-200" />
                <span className="ml-1 text-xs font-semibold tracking-wide">
                  {lang === 'zh' ? 'EN' : '中'}
                </span>
              </button>
              {/* 个人中心 - 增大热区 */}
              <Magnet padding={0} strength={0.4} active={true}>
                <Link
                  to="/profile"
                  onClick={() => handleNavClick(t('profile'))}
                  className={`p-2 rounded-full transition-all relative group flex items-center justify-center ${
                    isActive('/profile') ? 'ring-2 ring-purple-400' : ''
                  }`}
                  title={t('profile')}
                >
                  <Avatar userId={visitorId} size={36} isSelf />
                  {/* 激活状态光晕 */}
                  {isActive('/profile') && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-md" />
                  )}
                  {/* Hover 光晕效果 */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
                </Link>
              </Magnet>
            </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            {/* 移动端语言切换 */}
            <button
              onClick={handleToggleLanguage}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer flex items-center justify-center"
              aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
            >
              <Globe className="w-5 h-5 text-cyan-200" />
              <span className="ml-1 text-xs font-semibold tracking-wide">
                {lang === 'zh' ? 'EN' : '中'}
              </span>
            </button>
            <button
              className="p-2 text-primary cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 bg-gray-900/60 backdrop-blur-xl"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-white/90 hover:text-white transition-colors ${
                    isActive(link.path) ? 'font-semibold text-white' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/profile"
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Avatar userId={visitorId} size={32} isSelf />
                <span className="text-white/90">{t('profile')}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import Avatar from './common/Avatar'
import Magnet from './effects/Magnet'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visitorId, setVisitorId] = useState('')
  const location = useLocation()

  useEffect(() => {
    let vid = localStorage.getItem('visitor_id')
    if (!vid) {
      vid = 'visitor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('visitor_id', vid)
    }
    setVisitorId(vid)
  }, [])

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/blog', label: '文章' },
    { path: '/hot-news', label: '热点' },
    { path: '/message', label: '留言' },
  ]

  const isActive = (path) => location.pathname === path

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
              {/* 个人中心 - 增大热区 */}
              <Magnet padding={0} strength={0.4} active={true}>
                <Link
                  to="/profile"
                  className="p-3 rounded-full transition-all relative group"
                  title="个人中心"
                >
                  <Avatar userId={visitorId} size={36} />
                  <motion.div
                    className="absolute inset-0 ring-2 ring-purple-400 rounded-full opacity-0 "
                    transition={{ duration: 0.2 }}
                  />
                  {/* 头像光晕效果 */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
                </Link>
              </Magnet>
            </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 bg-gray-900/95 backdrop-blur-lg"
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
                <Avatar userId={visitorId} size={32} />
                <span className="text-white/90">个人中心</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar

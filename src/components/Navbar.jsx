import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BuildInfoBar from './common/BuildInfoBar'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <BuildInfoBar />
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ paddingTop: 0 }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl sm:text-2xl font-bold neon-text text-primary">
            MY BLOG
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/" className="hover:text-primary transition-colors text-sm lg:text-base">
              首页
            </Link>
            <Link to="/blog" className="hover:text-primary transition-colors text-sm lg:text-base">
              文章
            </Link>
            <Link to="/hot-news" className="hover:text-primary transition-colors text-sm lg:text-base">
              热点
            </Link>
            <Link to="/message" className="hover:text-primary transition-colors text-sm lg:text-base">
              留言
            </Link>
            <Link
              to="/profile"
              className="text-2xl hover:text-primary transition-colors"
              title="个人中心"
            >
              👤
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary"
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
            className="md:hidden py-4"
          >
            <div className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                首页
              </Link>
              <Link to="/blog" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                文章
              </Link>
              <Link to="/hot-news" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                热点
              </Link>
              <Link to="/message" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                留言
              </Link>
              <Link to="/profile" className="hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                👤 个人中心
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar

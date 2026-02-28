import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold neon-text text-primary">
            MY BLOG
          </Link>

          <div className="flex items-center space-x-8">
            <Link to="/" className="hover:text-primary transition-colors">
              首页
            </Link>
            <Link to="/blog" className="hover:text-primary transition-colors">
              文章
            </Link>
            <Link to="/hot-news" className="hover:text-primary transition-colors">
              热点
            </Link>
            <Link to="/message" className="hover:text-primary transition-colors">
              留言
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-dark transition-all"
            >
              管理
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar

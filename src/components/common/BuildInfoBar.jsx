import { useState } from 'react'
import { motion } from 'framer-motion'
import { CloseOutlined } from '@ant-design/icons'

// 构建信息（由 Vite 插件注入）
const BUILD_INFO = typeof __BUILD_INFO__ !== 'undefined' ? __BUILD_INFO__ : {
  buildTime: 'unknown',
  commitHash: 'unknown',
  branch: 'unknown',
}

export default function BuildInfoBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs py-1.5 px-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <span className="font-medium">
            📦 v{BUILD_INFO.branch === 'main' ? 'prod' : 'dev'}-{BUILD_INFO.commitHash}
          </span>
          <span className="hidden sm:inline text-white/70">|</span>
          <span className="hidden sm:inline text-white/70">
            🕐 {BUILD_INFO.buildTime}
          </span>
          <span className="sm:hidden text-white/70">|</span>
          <span className="text-white/70">
            🔧 {BUILD_INFO.branch}
          </span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="关闭"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>
    </motion.div>
  )
}

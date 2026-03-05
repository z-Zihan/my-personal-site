import { motion } from 'framer-motion'

export default function NeonText({ text, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* 发光层 */}
      <div
        className="absolute inset-0 blur-2xl opacity-50 animate-pulse"
        style={{
          background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4)',
          WebkitMask: `text`,
          mask: `text`,
          maskImage: `text`
        }}
      >
        <span className="text-transparent">{text}</span>
      </div>

      {/* 主体文字 */}
      <motion.h1
        className="relative bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent font-bold"
        style={{
          textShadow: '0 0 40px rgba(255,255,255,0.5)'
        }}
        animate={{
          y: [0, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {text}
      </motion.h1>

      {/* 底部光晕 */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-purple-500/30 blur-2xl rounded-full" />
    </div>
  )
}

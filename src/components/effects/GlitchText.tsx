import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface GlitchTextProps {
  children: string
  speed?: number
  enableShadows?: boolean
  enableOnHover?: boolean
  className?: string
}

const GlitchText = ({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = false,
  className = '',
}: GlitchTextProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [glitching, setGlitching] = useState(false)

  const shouldGlitch = enableOnHover ? isHovered : true

  useEffect(() => {
    if (shouldGlitch) {
      const interval = setInterval(() => {
        setGlitching(true)
        setTimeout(() => setGlitching(false), 100 + Math.random() * 200)
      }, 2000 / speed)

      return () => clearInterval(interval)
    }
  }, [shouldGlitch, speed])

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const generateGlitchText = () => {
    if (!shouldGlitch || !glitching) return children
    return children
      .split('')
      .map((char) =>
        char === ' '
          ? ' '
          : glitchChars[Math.floor(Math.random() * glitchChars.length)]
      )
      .join('')
  }

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={
        glitching
          ? {
              x: [0, -2, 2, -1, 1, 0],
              y: [0, -1, 1, -1, 1, 0],
            }
          : {}
      }
      transition={{ duration: 0.2 }}
    >
      {/* 主文字 */}
      <span className="relative z-10">{children}</span>

      {/* 故障重影 - 红色 */}
      {(shouldGlitch || enableShadows) && (
        <span
          className="absolute top-0 left-0 -z-10 text-red-500 opacity-70"
          style={{
            clipPath: 'inset(20% 0 30% 0)',
            transform: 'translate(-2px, 1px)',
          }}
        >
          {generateGlitchText()}
        </span>
      )}

      {/* 故障重影 - 蓝色 */}
      {(shouldGlitch || enableShadows) && (
        <span
          className="absolute top-0 left-0 -z-10 text-cyan-500 opacity-70"
          style={{
            clipPath: 'inset(60% 0 10% 0)',
            transform: 'translate(2px, -1px)',
          }}
        >
          {generateGlitchText()}
        </span>
      )}

      {/* 扫描线效果 */}
      {shouldGlitch && glitching && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent z-20 pointer-events-none"
          initial={{ y: '-100%' }}
          animate={{ y: '100%' }}
          transition={{ duration: 0.3, repeat: 1 }}
        />
      )}
    </motion.span>
  )
}

export default GlitchText

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function AnimatedCard({ children, className = '', onClick }: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), { damping: 20, stiffness: 300 })
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), { damping: 20, stiffness: 300 })

  const glowX = useTransform(mouseX, [0, 1], ['0%', '100%'])
  const glowY = useTransform(mouseY, [0, 1], ['0%', '100%'])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.article
      ref={ref}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 10,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* 动态光晕效果 */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${glowX} ${glowY}, rgba(139, 92, 246, 0.15), transparent 40%)`,
        }}
      />
      {children}
    </motion.article>
  )
}

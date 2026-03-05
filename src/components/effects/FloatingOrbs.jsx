import { motion } from 'framer-motion'

/**
 * 浮动光球背景 - 适用于文章页面
 * 创建柔和的浮动光球效果，营造沉浸式阅读氛围
 */
export default function FloatingOrbs({
  colors = ['#8b5cf6', '#ec4899', '#06b6d4'],
  count = 5,
  blur = 'blur-3xl',
  opacity = 0.15,
  speed = 'slow'
}) {
  const durationMap = {
    slow: 25,
    medium: 18,
    fast: 12
  }

  const positions = [
    { top: '10%', left: '10%' },
    { top: '20%', right: '15%' },
    { bottom: '30%', left: '20%' },
    { bottom: '10%', right: '25%' },
    { top: '50%', left: '50%' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${blur}`}
          style={{
            background: `radial-gradient(circle, ${colors[i % colors.length]}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
            width: `${Math.random() * 200 + 150}px`,
            height: `${Math.random() * 200 + 150}px`,
            ...positions[i % positions.length]
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2 + Math.random() * 0.3, 1],
            opacity: [opacity * 0.5, opacity, opacity * 0.5]
          }}
          transition={{
            duration: durationMap[speed] + Math.random() * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2
          }}
        />
      ))}
    </div>
  )
}

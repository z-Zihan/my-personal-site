import { motion } from 'framer-motion'

function ParticleBackground() {
  return (
    <div className="particle-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 主粒子 */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
        />
      ))}

      {/* 漂浮光点 */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute w-2 h-2 bg-purple-400/40 rounded-full blur-sm"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50
          }}
          animate={{
            y: -window.innerHeight - 50,
            x: `calc(${Math.random() * 100}vw + ${Math.random() * 200 - 100}px)`
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 10
          }}
        />
      ))}

      {/* 闪光粒子 */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 2, 0]
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground

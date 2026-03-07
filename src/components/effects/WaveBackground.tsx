import { motion } from 'framer-motion'

/**
 * 波浪背景 - 适用于留言板页面
 * 创建流动的波浪效果，象征信息的流动
 */
export default function WaveBackground({
  colors = ['#8b5cf6', '#ec4899', '#06b6d4'],
  waveCount = 5,
  speed = 'medium'
}) {
  const durationMap = {
    slow: 8,
    medium: 5,
    fast: 3
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 多层波浪 */}
      {Array.from({ length: waveCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[200%] h-96 -left-1/2"
          style={{
            top: `${20 + i * 15}%`,
            background: `linear-gradient(180deg, ${colors[i % colors.length]}30, transparent)`,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            filter: 'blur(20px)',
            transform: 'translateX(-25%)'
          }}
          animate={{
            rotate: [0, 360],
            borderRadius: [
              '40% 60% 70% 30% / 40% 50% 60% 50%',
              '60% 40% 50% 70% / 50% 60% 40% 50%',
              '40% 60% 70% 30% / 40% 50% 60% 50%'
            ]
          }}
          transition={{
            duration: durationMap[speed] + i,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}

      {/* 底部波浪层 */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
          <motion.path
            d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z"
            fill={`${colors[0]}20`}
            animate={{
              d: [
                'M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z',
                'M0,80 C480,20 960,100 1440,40 L1440,120 L0,120 Z',
                'M0,50 C480,100 960,30 1440,80 L1440,120 L0,120 Z',
                'M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z'
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.path
            d="M0,80 C480,20 960,100 1440,40 L1440,120 L0,120 Z"
            fill={`${colors[1]}15`}
            animate={{
              d: [
                'M0,80 C480,20 960,100 1440,40 L1440,120 L0,120 Z',
                'M0,50 C480,100 960,30 1440,80 L1440,120 L0,120 Z',
                'M0,70 C480,40 960,90 1440,50 L1440,120 L0,120 Z',
                'M0,80 C480,20 960,100 1440,40 L1440,120 L0,120 Z'
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
          />
        </svg>
      </div>

      {/* 浮动气泡 */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/20"
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            left: `${Math.random() * 100}%`,
            bottom: '-60px',
            background: `linear-gradient(135deg, ${colors[i % colors.length]}40, transparent)`
          }}
          animate={{
            y: -window.innerHeight - 100,
            rotate: 360,
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

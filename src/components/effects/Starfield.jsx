import { motion } from 'framer-motion'

/**
 * 星空背景 - 适用于个人中心页面
 * 创建深邃的星空效果，营造个人空间的氛围
 */
export default function Starfield({
  starCount = 150,
  twinkleSpeed = 'medium',
  constellationLines = true
}) {
  const durationMap = {
    slow: 4,
    medium: 2,
    fast: 1
  }

  // 生成随机星星位置
  const stars = Array.from({ length: starCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-pink-900/20" />

      {/* 星星 */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: durationMap[twinkleSpeed] + Math.random(),
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* 星座连线 */}
      {constellationLines && (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.g
            stroke="rgba(139, 92, 246, 0.15)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            {/* 连接附近的星星 */}
            {stars.slice(0, 20).map((star, i) => {
              const nextStar = stars[(i + 1) % 20]
              const distance = Math.sqrt(
                Math.pow(star.x - nextStar.x, 2) + Math.pow(star.y - nextStar.y, 2)
              )
              if (distance < 20) {
                return (
                  <motion.line
                    key={`line-${star.id}`}
                    x1={`${star.x}%`}
                    y1={`${star.y}%`}
                    x2={`${nextStar.x}%`}
                    y2={`${nextStar.y}%`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.2 }}
                    transition={{
                      duration: 3,
                      delay: star.delay + 1,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  />
                )
              }
              return null
            })}
          </motion.g>
        </svg>
      )}

      {/* 中心光晕 - 象征用户中心 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* 流星效果 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`meteor-${i}`}
          className="absolute w-32 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, white, transparent)'
          }}
          initial={{
            x: '100%',
            y: Math.random() * 50 + '%',
            opacity: 0
          }}
          animate={{
            x: '-100%',
            y: [null, Math.random() * 100 + '%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 3 + Math.random() * 2,
            ease: 'linear'
          }}
        />
      ))}

      {/* 极光效果 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-64"
        style={{
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1), transparent)'
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}

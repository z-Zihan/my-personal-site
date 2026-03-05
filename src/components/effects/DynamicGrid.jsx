import { motion } from 'framer-motion'

/**
 * 动态网格背景 - 适用于热点/新闻页面
 * 创建科技感十足的动态网格效果
 */
export default function DynamicGrid({
  color = '#8b5cf6',
  gridSize = 50,
  opacity = 0.1,
  animateLines = true,
  glowIntensity = 0.5
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 基础网格 */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={`${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`}
              strokeWidth="1"
            />
          </pattern>

          {/* 发光渐变 */}
          <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={glowIntensity} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* 动态扫描线 */}
        {animateLines && (
          <>
            <motion.line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke={`${color}40`}
              strokeWidth="2"
              initial={{ y1: 0, y2: 0 }}
              animate={{ y1: '100%', y2: '100%' }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <motion.line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              stroke={`${color}40`}
              strokeWidth="2"
              initial={{ x1: 0, x2: 0 }}
              animate={{ x1: '100%', x2: '100%' }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                delay: 1
              }}
            />
          </>
        )}
      </svg>

      {/* 四角光晕 */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64"
        style={{
          background: `radial-gradient(circle at top left, ${color}60, transparent 70%)`
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64"
        style={{
          background: `radial-gradient(circle at bottom right, #ec489960, transparent 70%)`
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute top-0 right-0 w-48 h-48"
        style={{
          background: `radial-gradient(circle at top right, #06b6d460, transparent 70%)`
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-48 h-48"
        style={{
          background: `radial-gradient(circle at bottom left, #10b98160, transparent 70%)`
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
      />

      {/* 浮动粒子 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100 + Math.random() * -50],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  )
}

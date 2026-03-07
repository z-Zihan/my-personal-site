import { useMemo } from 'react';
import { motion } from 'framer-motion';

function ParticleBackground() {
  // 使用 useMemo 缓存随机值，避免在渲染时调用 impure 函数
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      initialX: Math.random() * window.innerWidth,
      initialY: Math.random() * window.innerHeight,
      animateY: Math.random() * -200 - 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
    }));
  }, []);

  const floatParticles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      initialX: Math.random() * window.innerWidth,
      endX: Math.random() * 200 - 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 10,
    }));
  }, []);

  const sparkles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="particle-bg fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 主粒子 */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: p.initialX,
            y: p.initialY,
            opacity: 0
          }}
          animate={{
            y: [null, p.animateY],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear'
          }}
        />
      ))}

      {/* 漂浮光点 */}
      {floatParticles.map((p) => (
        <motion.div
          key={`float-${p.id}`}
          className="absolute w-2 h-2 bg-purple-400/40 rounded-full blur-sm"
          initial={{
            x: p.initialX,
            y: window.innerHeight + 50
          }}
          animate={{
            y: -window.innerHeight - 50,
            x: `calc(${p.initialX}px + ${p.endX}px)`
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay
          }}
        />
      ))}

      {/* 闪光粒子 */}
      {sparkles.map((s) => (
        <motion.div
          key={`sparkle-${s.id}`}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          style={{
            left: s.left,
            top: s.top
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 2, 0]
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground

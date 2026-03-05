import { motion } from 'framer-motion';

const Aurora = ({
  colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'],
  blur = 'blur-3xl',
  opacity = 0.3,
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${blur}`} style={{ opacity }}>
        {/* 光带 1 - 紫色 */}
        <motion.div
          className="absolute w-full h-full"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${colors[0]}40, transparent)`,
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 光带 2 - 粉色 */}
        <motion.div
          className="absolute w-full h-full"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 80% 50%, ${colors[1]}40, transparent)`,
          }}
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 30, -30, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* 光带 3 - 青色 */}
        <motion.div
          className="absolute w-full h-full"
          style={{
            background: `radial-gradient(ellipse 70% 45% at 20% 60%, ${colors[2]}40, transparent)`,
          }}
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -40, 40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />

        {/* 光带 4 - 绿色 */}
        <motion.div
          className="absolute w-full h-full"
          style={{
            background: `radial-gradient(ellipse 50% 35% at 60% 80%, ${colors[3]}30, transparent)`,
          }}
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 20, -20, 0],
            scale: [1, 1.15, 0.85, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* 噪点纹理 overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default Aurora;

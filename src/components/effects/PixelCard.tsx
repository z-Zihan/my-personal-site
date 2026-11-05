import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface PixelCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'pink' | 'cyan' | 'purple' | 'green' | 'orange' | 'gold'
  pixelSize?: number
  hoverIntensity?: number
  onClick?: () => void
}

/**
 * 像素光斑卡片
 * 性能说明：旧实现 hover 时渲染 400 个绝对定位 div（20x20 网格），
 * 列表页 12 张卡 = 4800 个节点，是首页卡顿主因之一。
 * 现改为单个 radial-gradient 光斑跟随鼠标（CSS 变量驱动，不触发 React 重渲染），
 * 视觉上保留「像素光斑 + 发光边框 + 角标」的核心效果，DOM 节点从 400/卡 降到 2/卡。
 */
const PixelCard = ({
  children,
  className = '',
  variant = 'default',
  pixelSize = 8,
  hoverIntensity = 1,
  onClick
}: PixelCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const variants: Record<string, {
    border: string
    glow: string
    pixel: string
  }> = {
    default: {
      border: 'rgba(139, 92, 246, 0.5)',
      glow: 'rgba(139, 92, 246, 0.3)',
      pixel: 'rgba(139, 92, 246, 0.6)'
    },
    pink: {
      border: 'rgba(236, 72, 153, 0.5)',
      glow: 'rgba(236, 72, 153, 0.3)',
      pixel: 'rgba(236, 72, 153, 0.6)'
    },
    cyan: {
      border: 'rgba(6, 182, 212, 0.5)',
      glow: 'rgba(6, 182, 212, 0.3)',
      pixel: 'rgba(6, 182, 212, 0.6)'
    },
    purple: {
      border: 'rgba(139, 92, 246, 0.5)',
      glow: 'rgba(139, 92, 246, 0.3)',
      pixel: 'rgba(139, 92, 246, 0.6)'
    },
    green: {
      border: 'rgba(34, 197, 94, 0.5)',
      glow: 'rgba(34, 197, 94, 0.3)',
      pixel: 'rgba(34, 197, 94, 0.6)'
    },
    orange: {
      border: 'rgba(249, 115, 22, 0.5)',
      glow: 'rgba(249, 115, 22, 0.3)',
      pixel: 'rgba(249, 115, 22, 0.6)'
    },
    gold: {
      border: 'rgba(251, 191, 36, 0.5)',
      glow: 'rgba(251, 191, 36, 0.3)',
      pixel: 'rgba(251, 191, 36, 0.6)'
    }
  };

  const colors = variants[variant as string] || variants.default;

  // 鼠标位置写入 CSS 变量，光斑跟随；不经过 setState，避免高频重渲染
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--px', String((e.clientX - rect.left) / Math.max(rect.width, 1)));
    card.style.setProperty('--py', String((e.clientY - rect.top) / Math.max(rect.height, 1)));
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border transition-all duration-300 ${className}`}
      style={{
        borderColor: isHovered ? colors.border : 'rgba(255,255,255,0.1)',
        boxShadow: isHovered
          ? `0 0 30px ${colors.glow}, inset 0 0 30px ${colors.glow}`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 像素光斑效果层：radial-gradient 跟随鼠标（--px/--py 由 mousemove 直接写入） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at calc(var(--px, 0.5) * 100%) calc(var(--py, 0.5) * 100%), ${colors.pixel} 0%, transparent 45%)`,
          opacity: isHovered ? Math.min(0.45 * hoverIntensity, 1) : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* 像素化网格纹理（静态 repeating 渐变，零 JS 开销） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: `${pixelSize * 2}% ${pixelSize * 2}%`,
          opacity: isHovered ? 0.08 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* 角落像素装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 左上角 */}
        <div
          className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 transition-all duration-300"
          style={{
            borderColor: colors.border,
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? `0 0 10px ${colors.glow}` : 'none'
          }}
        />
        {/* 右下角 */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 transition-all duration-300"
          style={{
            borderColor: colors.border,
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? `0 0 10px ${colors.glow}` : 'none'
          }}
        />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default PixelCard;

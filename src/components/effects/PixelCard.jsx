import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const PixelCard = ({
  children,
  className = '',
  variant = 'default',
  pixelSize = 8,
  hoverIntensity = 1,
  onClick
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const variants = {
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

  const colors = variants[variant] || variants.default;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 生成像素网格效果
  const renderPixelGrid = () => {
    const pixels = [];
    const cols = 20;
    const rows = 20;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const distance = Math.sqrt(
          Math.pow(i / cols - mousePosition.x, 2) + Math.pow(j / rows - mousePosition.y, 2)
        );
        const maxDistance = 0.5;
        const opacity = isHovered
          ? Math.max(0, 1 - distance / maxDistance) * hoverIntensity * 0.5
          : 0;

        pixels.push(
          <div
            key={`${i}-${j}`}
            className="absolute pointer-events-none"
            style={{
              left: `${(i / cols) * 100}%`,
              top: `${(j / rows) * 100}%`,
              width: `${100 / cols}%`,
              height: `${100 / rows}%`,
              backgroundColor: colors.pixel,
              opacity: opacity,
              transition: 'opacity 0.3s ease'
            }}
          />
        );
      }
    }
    return pixels;
  };

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
      {/* 像素网格效果层 */}
      <div className="absolute inset-0 overflow-hidden">
        {renderPixelGrid()}
      </div>

      {/* 像素化边框效果 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(90deg, transparent 0%, transparent ${100 - pixelSize}%, ${colors.border} ${100 - pixelSize}%, transparent 100%),
            linear-gradient(180deg, transparent 0%, transparent ${100 - pixelSize}%, ${colors.border} ${100 - pixelSize}%, transparent 100%)
          `,
          backgroundSize: `${pixelSize * 2}% ${pixelSize * 2}%`,
          opacity: isHovered ? 0.3 : 0,
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

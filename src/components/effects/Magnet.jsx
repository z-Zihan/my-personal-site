import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';

const Magnet = ({
  children,
  className = '',
  padding = 100,
  strength = 0.5,
  active = true,
}) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!active || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const isWithinPadding =
      Math.abs(distanceX) < padding && Math.abs(distanceY) < padding;

    if (isWithinPadding) {
      setIsHovered(true);
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    } else {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
    >
      {children}
    </motion.div>
  );
};

export default Magnet;

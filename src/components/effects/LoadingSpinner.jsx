import { motion } from 'framer-motion';
import { useEffect } from 'react';

const LoadingSpinner = () => {
  // Loading 时禁止 body 滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // 重置滚动位置到顶部
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        {/* 外圈旋转环 */}
        <motion.div
          className="w-20 h-20 border-4 border-purple-200 dark:border-purple-900 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ borderLeftColor: '#8b5cf6', borderTopColor: '#ec4899' }}
        />

        {/* 内圈反向旋转 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-pink-200 dark:border-pink-900 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ borderRightColor: '#ec4899', borderBottomColor: '#06b6d4' }}
        />

        {/* 中心光点 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 周围粒子 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full"
            style={{
              x: -4,
              y: -4,
            }}
            animate={{
              x: [0, Math.cos((i * Math.PI) / 4) * 50],
              y: [0, Math.sin((i * Math.PI) / 4) * 50],
              opacity: [1, 0, 1],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* 加载文字 - 带波浪动画 */}
        <motion.div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-1 items-center justify-center">
            {['w', 'a', 'i', 't'].map((char, i) => (
              <motion.span
                key={i}
                className="text-gray-600 dark:text-gray-400 text-sm font-medium"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              >
                {char}
              </motion.span>
            ))}
            {/* 动态省略号 */}
            <div className="flex gap-0.5 ml-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 bg-purple-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

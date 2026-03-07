import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 404 数字动画 */}
        <motion.div
          className="text-9xl font-bold text-white mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          404
        </motion.div>

        {/* 漂浮的装饰元素 */}
        <div className="relative mb-8">
          {/* 背景光晕 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />

          {/* SVG 插图 - 迷失的星球 */}
          <svg
            className="w-48 h-48 mx-auto text-white/80 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>

          {/* 浮动小点装饰 */}
          <motion.div
            className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-2 h-2 bg-white/60 rounded-full"
            animate={{
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/2 -right-8 w-1.5 h-1.5 bg-white/80 rounded-full"
            animate={{
              x: [0, 10, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* 错误消息 */}
        <motion.h1
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          页面走丢了
        </motion.h1>

        <motion.p
          className="text-white/80 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          抱歉，您访问的页面不存在
          <br />
          <span className="text-sm opacity-70">可能是链接已失效或页面已被删除</span>
        </motion.p>

        {/* 操作按钮 */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
          >
            ← 返回首页
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
          >
            返回上一页
          </button>
        </motion.div>

        {/* 倒计时自动跳转提示 */}
        <motion.p
          className="text-white/60 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          或等待 5 秒自动返回首页...
        </motion.p>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUpLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { articleApi, Article } from '../../api/article';

interface ArticleNavProps {
  currentArticleId: string;
}

interface NavArticle {
  id: string | number;
  title: string;
}

export default function ArticleNav({ currentArticleId }: ArticleNavProps) {
  const navigate = useNavigate();
  const [prevArticle, setPrevArticle] = useState<NavArticle | null>(null);
  const [nextArticle, setNextArticle] = useState<NavArticle | null>(null);
  const [showBackHint, setShowBackHint] = useState(false);

  useEffect(() => {
    fetchAdjacentArticles();
  }, [currentArticleId]);

  const fetchAdjacentArticles = async () => {
    try {
      const response = await articleApi.getList({ limit: 100, status: 'published' });
      const articles = response.data || response;

      if (Array.isArray(articles)) {
        const currentIndex = articles.findIndex(
          (a: Article) => String(a.id) === String(currentArticleId)
        );

        if (currentIndex > -1) {
          // 上一篇是列表中的前一个（更新的文章）
          if (currentIndex > 0) {
            const prev = articles[currentIndex - 1];
            setPrevArticle({ id: prev.id, title: prev.title });
          }
          // 下一篇是列表中的后一个（较旧的文章）
          if (currentIndex < articles.length - 1) {
            const next = articles[currentIndex + 1];
            setNextArticle({ id: next.id, title: next.title });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch adjacent articles:', error);
    }
  };

  const handleBack = () => {
    // 判断是否有历史记录可以返回
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/blog');
    }
  };

  // 截断标题
  const truncateTitle = (title: string, maxLen: number = 20) => {
    if (title.length <= maxLen) return title;
    return title.slice(0, maxLen) + '...';
  };

  return (
    <>
      {/* 返回按钮 - 悬浮玻璃态风格 */}
      <motion.button
        onClick={handleBack}
        onMouseEnter={() => setShowBackHint(true)}
        onMouseLeave={() => setShowBackHint(false)}
        className="fixed top-24 left-6 z-40 group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 霓虹光晕 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500" />

        {/* 按钮主体 */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full
          bg-white/80 dark:bg-gray-800/80
          backdrop-blur-md
          border border-white/50 dark:border-gray-600/50
          shadow-lg shadow-purple-500/10 dark:shadow-purple-900/30
          group-hover:border-purple-400/50 dark:group-hover:border-purple-500/50
          transition-all duration-300">
          <ArrowLeft
            className="w-5 h-5 text-gray-700 dark:text-gray-200
              group-hover:text-purple-600 dark:group-hover:text-purple-400
              transition-colors duration-300"
          />

          {/* 悬停时的箭头动画 */}
          <motion.div
            className="absolute -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: 0 }}
            whileHover={{ x: -2 }}
          >
            <ArrowUpLeft className="w-3 h-3 text-purple-500" />
          </motion.div>
        </div>

        {/* 提示文字 */}
        <AnimatePresence>
          {showBackHint && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1/2 -translate-y-1/2 left-full ml-3
                px-3 py-1.5 rounded-lg
                bg-gray-900/90 dark:bg-white/10
                text-white text-sm font-medium whitespace-nowrap
                backdrop-blur-sm"
            >
              返回列表
              {/* 小三角 */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-1
                w-2 h-2 rotate-45
                bg-gray-900/90 dark:bg-white/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 上一篇/下一篇导航 */}
      <motion.div
        className="mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* 上一篇 */}
          <motion.div
            className="flex-1 max-w-[45%]"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            {prevArticle ? (
              <button
                onClick={() => navigate(`/blog/${prevArticle.id}`)}
                className="group relative w-full text-left p-4 rounded-2xl
                  bg-gradient-to-br from-gray-50 to-gray-100
                  dark:from-gray-800/50 dark:to-gray-900/50
                  border border-gray-200/50 dark:border-gray-700/50
                  hover:border-purple-300/50 dark:hover:border-purple-600/50
                  transition-all duration-300 cursor-pointer
                  overflow-hidden"
              >
                {/* 悬停时的背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 角落装饰 */}
                <div className="absolute top-0 left-0 w-16 h-16
                  bg-gradient-to-br from-purple-500/10 to-transparent
                  rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center gap-3">
                  {/* 箭头容器 */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl
                    flex items-center justify-center
                    bg-white dark:bg-gray-700
                    shadow-sm group-hover:shadow-md
                    group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30
                    transition-all duration-300">
                    <ChevronLeft
                      className="w-5 h-5 text-gray-400 group-hover:text-purple-500
                        transition-colors duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-purple-500 dark:text-purple-400
                      tracking-wider uppercase">
                      上一篇
                    </span>
                    <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200
                      truncate group-hover:text-purple-600 dark:group-hover:text-purple-300
                      transition-colors duration-300">
                      {truncateTitle(prevArticle.title)}
                    </p>
                  </div>
                </div>

                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5
                  bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500
                  scale-x-0 group-hover:scale-x-100
                  origin-left transition-transform duration-500" />
              </button>
            ) : (
              <div className="p-4 rounded-2xl
                bg-gray-50/50 dark:bg-gray-800/30
                border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700
                    flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs tracking-wider uppercase">上一篇</span>
                    <p className="mt-0.5 text-sm">已经是最新一篇了</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* 中间装饰 */}
          <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-12">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="absolute -top-3 w-1 h-1 rounded-full bg-purple-400/50" />
              <div className="absolute -bottom-3 w-1 h-1 rounded-full bg-cyan-400/50" />
            </div>
          </div>

          {/* 下一篇 */}
          <motion.div
            className="flex-1 max-w-[45%]"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            {nextArticle ? (
              <button
                onClick={() => navigate(`/blog/${nextArticle.id}`)}
                className="group relative w-full text-right p-4 rounded-2xl
                  bg-gradient-to-bl from-gray-50 to-gray-100
                  dark:from-gray-800/50 dark:to-gray-900/50
                  border border-gray-200/50 dark:border-gray-700/50
                  hover:border-cyan-300/50 dark:hover:border-cyan-600/50
                  transition-all duration-300 cursor-pointer
                  overflow-hidden"
              >
                {/* 悬停时的背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/5 via-pink-500/5 to-purple-500/5
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 角落装饰 */}
                <div className="absolute top-0 right-0 w-16 h-16
                  bg-gradient-to-bl from-cyan-500/10 to-transparent
                  rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center gap-3 justify-end">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-cyan-500 dark:text-cyan-400
                      tracking-wider uppercase">
                      下一篇
                    </span>
                    <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-200
                      truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300
                      transition-colors duration-300">
                      {truncateTitle(nextArticle.title)}
                    </p>
                  </div>

                  {/* 箭头容器 */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl
                    flex items-center justify-center
                    bg-white dark:bg-gray-700
                    shadow-sm group-hover:shadow-md
                    group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30
                    transition-all duration-300">
                    <ChevronRight
                      className="w-5 h-5 text-gray-400 group-hover:text-cyan-500
                        transition-colors duration-300"
                    />
                  </div>
                </div>

                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5
                  bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500
                  scale-x-0 group-hover:scale-x-100
                  origin-right transition-transform duration-500" />
              </button>
            ) : (
              <div className="p-4 rounded-2xl
                bg-gray-50/50 dark:bg-gray-800/30
                border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 justify-end text-gray-400 dark:text-gray-500">
                  <div>
                    <span className="text-xs tracking-wider uppercase">下一篇</span>
                    <p className="mt-0.5 text-sm">已经是最后一篇了</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700
                    flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
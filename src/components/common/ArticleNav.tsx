import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { articleApi, Article } from '../../api/article';
import { useLanguage } from '../../utils/useLanguage';

interface ArticleNavProps {
  currentArticleId: string;
}

interface NavArticle {
  id: string | number;
  title: string;
}

export default function ArticleNav({ currentArticleId }: ArticleNavProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [prevArticle, setPrevArticle] = useState<NavArticle | null>(null);
  const [nextArticle, setNextArticle] = useState<NavArticle | null>(null);
  // 当前文章是否存在于已发布列表中（草稿预览等场景不在列表，此时隐藏上/下一篇导航）
  const [inList, setInList] = useState(true);
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
          setInList(true);
          // 上一篇是列表中的前一个（更新的文章）
          if (currentIndex > 0) {
            const prev = articles[currentIndex - 1];
            setPrevArticle({ id: prev.id, title: prev.title });
          } else {
            setPrevArticle(null);
          }
          // 下一篇是列表中的后一个（较旧的文章）
          if (currentIndex < articles.length - 1) {
            const next = articles[currentIndex + 1];
            setNextArticle({ id: next.id, title: next.title });
          } else {
            setNextArticle(null);
          }
        } else {
          // 当前文章不在列表（如草稿预览），隐藏上/下一篇导航，优雅降级
          setInList(false);
          setPrevArticle(null);
          setNextArticle(null);
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
      {/* 返回按钮 - 炫酷特效版 */}
      <motion.button
        onClick={handleBack}
        onMouseEnter={() => setShowBackHint(true)}
        onMouseLeave={() => setShowBackHint(false)}
        className="fixed top-24 left-6 z-40 group"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* 外层旋转光环 */}
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-[-4px] rounded-full bg-gradient-conic from-emerald-500 via-green-500 via-teal-500 to-emerald-500 animate-spin-slow opacity-75 blur-[1px]" />
          </div>
        </div>

        {/* 脉冲光晕 */}
        <div className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-emerald-500/30 via-green-500/30 to-teal-500/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 animate-pulse" />

        {/* 霓虹扩散效果 */}
        <div className="absolute inset-[-12px] rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-300" />
        <div className="absolute inset-[-16px] rounded-full bg-green-500/0 group-hover:bg-green-500/5 transition-all duration-500 delay-75" />

        {/* 按钮主体 */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full
          bg-gradient-to-br from-emerald-100 via-green-200 to-teal-100
          dark:from-emerald-900/60 dark:via-green-800/60 dark:to-teal-900/60
          backdrop-blur-md
          border-2 border-emerald-300/50 dark:border-emerald-600/50
          shadow-lg shadow-emerald-500/20
          group-hover:border-emerald-400 dark:group-hover:border-emerald-400
          group-hover:shadow-emerald-500/40 dark:group-hover:shadow-emerald-500/30
          transition-all duration-300 overflow-hidden">

          {/* 内部光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-teal-500/0 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-500" />

          {/* 箭头图标容器 */}
          <div className="relative">
            {/* 主箭头 */}
            <motion.div
              animate={{}}
              className="transition-all duration-300"
              style={{ position: 'relative' }}
            >
              <ArrowLeft
                className="w-5 h-5 text-emerald-700 dark:text-emerald-200
                  group-hover:text-emerald-600 dark:group-hover:text-emerald-300
                  transition-colors duration-300 relative z-10"
              />
            </motion.div>
          </div>

          {/* 轨迹动画 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* 提示文字 */}
        <AnimatePresence>
          {showBackHint && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1/2 -translate-y-1/2 left-full ml-4
                px-4 py-2 rounded-xl
                bg-gradient-to-r from-gray-900/95 to-gray-800/95
                dark:from-white/10 dark:to-white/5
                text-white text-sm font-medium whitespace-nowrap
                backdrop-blur-md shadow-lg shadow-emerald-500/20
                border border-white/10"
            >
              <span className="relative z-10">{t('backToList')}</span>
              {/* 小三角 */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5
                w-3 h-3 rotate-45
                bg-gray-900/95 dark:bg-white/10
                border-l border-b border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 上一篇/下一篇导航（当前文章不在列表时不渲染，只保留返回按钮） */}
      {inList && (
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
                      {t('previousArticle')}
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
                    <span className="text-xs tracking-wider uppercase">{t('previousArticle')}</span>
                    <p className="mt-0.5 text-sm">{t('noPrevArticle')}</p>
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
                      {t('nextArticle')}
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
                    <span className="text-xs tracking-wider uppercase">{t('nextArticle')}</span>
                    <p className="mt-0.5 text-sm">{t('noNextArticle')}</p>
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
      )}
    </>
  );
}
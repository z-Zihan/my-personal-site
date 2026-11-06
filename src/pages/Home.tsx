import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, BookOpen, TrendingUp, Newspaper } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import ArticleCard from '../components/ArticleCard';
import type { Article, HotNews, Stats } from '../api';
import { consumeHomeData } from '../api/homePreload';
import Sparkles from '../components/effects/Sparkles';
import BlurText from '../components/effects/BlurText';
import Magnet from '../components/effects/Magnet';
import Aurora from '../components/effects/Aurora';
import LoadingSpinner from '../components/effects/LoadingSpinner';
import CountUpNumber from '../components/effects/CountUp';
import { trackEvent } from '../utils/analytics';
import { useLanguage } from '../utils/useLanguage';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [hotNews, setHotNews] = useState<HotNews[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // 热门资讯点击埋点
  const handleHotNewsClick = (news: HotNews, index: number) => {
    trackEvent('hot_news_click', 'engagement', {
      news_title: news.title,
      news_source: news.source,
      rank: index + 1,
      page_path: window.location.pathname,
    });
  };

  // 查看全部文章按钮点击埋点
  const handleViewAllClick = () => {
    trackEvent('view_all_articles_click', 'navigation', {
      page_path: window.location.pathname,
    });
    navigate('/blog');
  };

  // 去热点资讯按钮点击埋点
  const handleGoHotNewsClick = () => {
    trackEvent('go_hot_news_click', 'navigation', {
      page_path: window.location.pathname,
    });
    navigate('/hot-news');
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 进入页面时滚动复位（轻量处理）
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      // 复用 main.tsx 中提前发起的请求（若有），否则现发
      const [articlesRes, recommendedRes, newsRes, statsRes] = await consumeHomeData();
      const articlesData = (articlesRes as unknown as { data?: Article[] }).data || [];
      // 过滤出发布状态的推荐文章
      const recommendedData = (recommendedRes as unknown as { data?: Article[] }).data || [];
      const publishedRecommended = recommendedData.filter(article => article.status === 'published');
      const newsData = (newsRes as unknown as { data?: HotNews[] }).data || [];
      const statsData = (statsRes as unknown as { data?: Stats }).data || null;
      setArticles(articlesData);
      setRecommendedArticles(publishedRecommended);
      setHotNews(newsData);
      setStats(statsData);
    } catch (error) {
      // 错误由全局错误边界处理
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-24" suppressHydrationWarning>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 py-32" suppressHydrationWarning>
        {/* 只裁剪装饰层，section 本身不 overflow-hidden，否则搜索下拉会被截断 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <Aurora colors={['#8b5cf6', '#ec4899', '#06b6d4']} opacity={0.4} />
          <Sparkles count={80} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 text-center z-10" suppressHydrationWarning>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* 模糊渐显效果标题 */}
            <BlurText
              text="zZihan's Blog"
              delay={100}
              className="text-5xl md:text-7xl font-bold mb-6 text-white"
            />
          </motion.div>
          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              {t('heroTagline')}
            </span>
          </motion.p>

          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar />
          </div>

          {stats && (
            <motion.div
              className="flex justify-center gap-8 text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            >
              <div className="text-center group">
                <motion.div
                  className="text-3xl font-bold group-hover:scale-110 transition-transform"
                  whileHover={{ scale: 1.1 }}
                >
                  <CountUpNumber end={stats.totalArticles || 0} duration={2.5} />
                </motion.div>
                <div className="text-white/70">{t('articlesCount')}</div>
              </div>
              <div className="text-center group">
                <motion.div
                  className="text-3xl font-bold group-hover:scale-110 transition-transform"
                  whileHover={{ scale: 1.1 }}
                >
                  <CountUpNumber end={stats.totalViews || 0} duration={2.5} />
                </motion.div>
                <div className="text-white/70">{t('readsCount')}</div>
              </div>
              <div className="text-center group">
                <motion.div
                  className="text-3xl font-bold group-hover:scale-110 transition-transform"
                  whileHover={{ scale: 1.1 }}
                >
                  <CountUpNumber end={stats.totalMessages || 0} duration={2.5} />
                </motion.div>
                <div className="text-white/70">{t('messagesCount')}</div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 推荐文章 */}
      {recommendedArticles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <motion.h2
            className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Star className="inline w-6 h-6 mr-2" /> {t('recommendedArticles')}
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedArticles.map((article: Article, index: number) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <ArticleCard
                  article={{ ...article, summary: article.summary || '' }}
                  isRecommended
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2
          className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <BookOpen className="inline w-6 h-6 mr-2" /> {t('latestArticles')}
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: Article, index: number) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <ArticleCard
                article={{ ...article, summary: article.summary || '' }}
              />
            </motion.div>
          ))}
        </div>
        {articles.length > 0 && (
          <div className="text-center mt-12">
            <Magnet padding={150} strength={0.3}>
              <motion.button
                onClick={handleViewAllClick}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('viewAllArticles')} →
              </motion.button>
            </Magnet>
          </div>
        )}
      </section>

      {/* Hot News */}
      {hotNews.length > 0 && (
        <section className="py-16 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full mb-4"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">{t('liveUpdates')}</span>
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="inline w-6 h-6 mr-2 text-orange-500" />
                {t('hotNews')}
              </motion.h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{t('hotNewsSubtitle')}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotNews.slice(0, 6).map((news: HotNews, index: number) => (
                <motion.a
                  key={`hot-news-${news.id || news.title}${index}`}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  onClick={() => handleHotNewsClick(news, index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 group-hover:border-orange-200 dark:group-hover:border-orange-800 transition-all duration-300 h-full flex items-start gap-4 group-hover:shadow-lg group-hover:shadow-orange-500/10">
                    {/* 排名徽章 */}
                    <motion.div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                          : index === 2
                          ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {index + 1}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors leading-relaxed">
                        {news.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        {news.source && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                            {news.source}
                          </span>
                        )}
                        <Newspaper className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>

                    {/* 箭头指示 */}
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* 查看更多按钮 */}
            <motion.div
              className="text-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Magnet padding={100} strength={0.3}>
                <motion.button
                  onClick={handleGoHotNewsClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp className="w-4 h-4" />
                  {t('goHotNews')}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </Magnet>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

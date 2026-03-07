import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/common/SearchBar';
import ReadingTime from '../components/common/ReadingTime';
import { getArticleCover } from '../utils/defaultCovers';
import { articleApi, hotNewsApi, statsApi } from '../api';
import Sparkles from '../components/effects/Sparkles';
import BlurText from '../components/effects/BlurText';
import Magnet from '../components/effects/Magnet';
import Aurora from '../components/effects/Aurora';
import LoadingSpinner from '../components/effects/LoadingSpinner';
import PixelCard from '../components/effects/PixelCard';
import CountUpNumber from '../components/effects/CountUp';

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [hotNews, setHotNews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, recommendedRes, newsRes, statsRes] = await Promise.all([
        articleApi.getList({ page: 1, limit: 6, status: 'published' }),
        // 推荐文章必须是发布状态
        articleApi.getList({ page: 1, limit: 6, recommended: true, status: 'published' }),
        hotNewsApi.getList(),
        statsApi.getStats()
      ]);
      setArticles(articlesRes.data || []);
      // 过滤出发布状态的推荐文章
      const publishedRecommended = (recommendedRes.data || []).filter(article => article.status === 'published');
      setRecommendedArticles(publishedRecommended);
      setHotNews(newsRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
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
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 py-32" suppressHydrationWarning>
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <Aurora colors={['#8b5cf6', '#ec4899', '#06b6d4']} opacity={0.4} />
        <Sparkles count={80} />
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
              探索技术 · 记录生活 · 分享思考
            </span>
          </motion.p>

          <div className="max-w-md mx-auto mb-8">
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
                <div className="text-white/70">文章</div>
              </div>
              <div className="text-center group">
                <motion.div
                  className="text-3xl font-bold group-hover:scale-110 transition-transform"
                  whileHover={{ scale: 1.1 }}
                >
                  <CountUpNumber end={stats.totalViews || 0} duration={2.5} />
                </motion.div>
                <div className="text-white/70">阅读</div>
              </div>
              <div className="text-center group">
                <motion.div
                  className="text-3xl font-bold group-hover:scale-110 transition-transform"
                  whileHover={{ scale: 1.1 }}
                >
                  <CountUpNumber end={stats.totalMessages || 0} duration={2.5} />
                </motion.div>
                <div className="text-white/70">留言</div>
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
            ⭐ 推荐文章
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PixelCard
                  className="h-full cursor-pointer"
                  variant="gold"
                >
                  <div onClick={() => navigate(`/blog/${article.id}`)}>
                    <img
                      src={getArticleCover(article)}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
                      }}
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <ReadingTime content={article.content} />
                        <span>👁️ {article.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </PixelCard>
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
          ✨ 最新文章
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <PixelCard
                className="h-full cursor-pointer"
                variant="purple"
              >
                <div onClick={() => navigate(`/blog/${article.id}`)}>
                  <img
                    src={getArticleCover(article)}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
                    }}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <ReadingTime content={article.content} />
                      <span>👁️ {article.views || 0}</span>
                    </div>
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          ))}
        </div>
        {articles.length > 0 && (
          <div className="text-center mt-12">
            <Magnet padding={150} strength={0.3}>
              <motion.button
                onClick={() => navigate('/blog')}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                查看全部文章 →
              </motion.button>
            </Magnet>
          </div>
        )}
      </section>

      {/* Hot News */}
      {hotNews.length > 0 && (
        <section className="bg-gray-100 dark:bg-gray-800 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              🔥 热点资讯
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-4">
              {hotNews.slice(0, 6).map((news, index) => (
                <motion.a
                  key={`hot-news-${news.title}${index}`}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ x: 10, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                >
                  <motion.span
                    className="text-2xl"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    📰
                  </motion.span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-500 transition-colors">
                      {news.title}
                    </h4>
                    <span className="text-sm text-gray-500">{news.source}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

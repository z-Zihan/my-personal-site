import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articlesApi, hotNewsApi } from '../utils/api'
import ParticleBackground from '../components/ParticleBackground'
import ArticleCard from '../components/ArticleCard'

function Home() {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [hotNews, setHotNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, newsRes] = await Promise.all([
          articlesApi.getList({ limit: 6, status: 'published' }),
          hotNewsApi.getList(),
        ])
        setFeaturedArticles(articlesRes.data.data || [])
        setHotNews((newsRes.data.data || []).slice(0, 5))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center z-10"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 neon-text">
            WELCOME TO
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-primary">
            MY PERSONAL BLOG
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            探索技术世界，分享知识经验
          </p>
          <Link
            to="/blog"
            className="inline-block px-8 py-4 bg-primary text-dark font-bold rounded-full hover:bg-secondary hover:text-white transition-all neon-border"
          >
            开始浏览
          </Link>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-12 neon-text"
          >
            精选文章
          </motion.h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-block px-8 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-dark transition-all"
            >
              查看更多
            </Link>
          </div>
        </div>
      </section>

      {/* Hot News */}
      <section className="py-20 px-4 glass">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-12 neon-text"
          >
            热点资讯
          </motion.h2>

          <div className="space-y-4">
            {hotNews.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block glass p-4 rounded-lg hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary mr-4">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.source}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/hot-news"
              className="inline-block px-8 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-dark transition-all"
            >
              查看全部
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

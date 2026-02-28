import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hotNewsApi } from '../utils/api'
import ParticleBackground from '../components/ParticleBackground'

function HotNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await hotNewsApi.getList()
        setNews(data.data || [])
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  return (
    <div className="min-h-screen pt-20 pb-20">
      <ParticleBackground />

      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 neon-text"
        >
          热点资讯
        </motion.h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="glass p-6 rounded-xl animate-pulse h-24" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">暂无热点资讯</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="block glass p-6 rounded-xl hover:bg-primary/10 transition-all neon-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-primary">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {item.source && (
                        <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                          {item.source}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium ml-12">{item.title}</h3>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-500 flex-shrink-0 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HotNews

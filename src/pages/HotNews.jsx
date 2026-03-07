import { useState, useEffect, useRef } from 'react'
import { motion as Motion } from 'framer-motion'
import { hotNewsApi } from '../api/index';
import PixelCard from '../components/effects/PixelCard'
import Crosshair from '../components/effects/Crosshair'

// 前端本地缓存时间：5 分钟
const CLIENT_CACHE_DURATION = 5 * 60 * 1000
const CACHE_KEY = 'hot_news_cache'

function HotNews() {
  const containerRef = useRef(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      // 先尝试从本地缓存获取
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CLIENT_CACHE_DURATION) {
          setNews(data)
          setLoading(false)
          console.log('Using client-side cached news')
          return
        }
      }

      try {
        const { data } = await hotNewsApi.getList()
        const newsData = data.data || []
        setNews(newsData)

        // 更新本地缓存
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: newsData,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error fetching news:', error)
        // 如果请求失败，使用旧缓存（如果有）
        if (cached) {
          const { data } = JSON.parse(cached)
          setNews(data)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen pt-20 pb-20">
      <Crosshair color="#f97316" containerRef={containerRef} />
      <div className="max-w-4xl mx-auto px-4">
        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-12 neon-text"
        >
          热点资讯
        </Motion.h1>

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
              <Motion.a
                key={`hot_news_${item.id}${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="block"
              >
                <PixelCard variant="orange" className="p-6 hover:bg-primary/10 transition-all">
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
                </PixelCard>
              </Motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HotNews

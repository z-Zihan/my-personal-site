import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articlesApi } from '../utils/api'
import { formatDate } from '../utils/helpers'
import ParticleBackground from '../components/ParticleBackground'

function BlogDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await articlesApi.getDetail(id)
        setArticle(data.data)
      } catch (err) {
        setError('文章不存在或已被删除')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-primary text-xl">加载中...</div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-8">{error || '文章不存在'}</p>
          <Link
            to="/blog"
            className="px-6 py-3 border border-primary text-primary rounded hover:bg-primary hover:text-dark transition-all"
          >
            返回文章列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <ParticleBackground />

      <article className="max-w-4xl mx-auto px-4">
        <Link
          to="/blog"
          className="inline-flex items-center mb-8 text-primary hover:underline"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8 neon-border"
        >
          {article.cover && (
            <img
              src={article.cover}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-400">
            <span>{formatDate(article.created_at)}</span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {article.views} 阅读
            </span>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-8"
        >
          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
          />
        </motion.div>
      </article>
    </div>
  )
}

export default BlogDetail

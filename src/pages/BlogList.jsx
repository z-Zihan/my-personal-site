import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import ArticleCard from '../components/ArticleCard'
import PixelCard from '../components/effects/PixelCard'
import axios from 'axios'
import { API_BASE } from '../constants/apiConstants'

function BlogList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([{ id: 'all', name: '全部' }])
  const [recommendedArticles, setRecommendedArticles] = useState([])
  const [recLoading, setRecLoading] = useState(true)
  const { articles, loading, pagination, refetch } = useArticles({ status: 'published', category_id: selectedCategory !== 'all' ? selectedCategory : undefined })

  useEffect(() => {
    fetchRecommended()
    fetchCategories()
  }, [])

  useEffect(() => {
    // 当分类变化时，重置页码并重新获取文章
    refetch({ page: 1, category_id: selectedCategory !== 'all' ? selectedCategory : undefined })
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`)
      if (data.data && data.data.length > 0) {
        setCategories([{ id: 'all', name: '全部' }, ...data.data])
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  const fetchRecommended = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/articles?page=1&limit=10&recommended=true`)
      setRecommendedArticles(data.data || [])
    } catch (error) {
      console.error('Fetch recommended error:', error)
    } finally {
      setRecLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage)
      refetch({ page: newPage })
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-12 neon-text">
          全部文章
        </h1>

        {/* 推荐文章模块 */}
        {!recLoading && recommendedArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 neon-text">
              ⭐ 推荐文章
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} isRecommended />
              ))}
            </div>
          </div>
        )}

        {/* 最新文章列表 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 neon-text">
            📚 最新文章
          </h2>

          {/* 分类 Tab */}
          <div className="flex justify-center flex-wrap gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setPage(1)
                }}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-dark font-bold'
                    : 'border border-primary text-primary hover:bg-primary hover:text-dark'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <PixelCard key={i} variant="purple" className="h-80 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">暂无文章</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-dark transition-all"
                >
                  上一页
                </button>
                <span className="text-gray-400">
                  第 {page} / {pagination.totalPages} 页
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-dark transition-all"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default BlogList

import { useNavigate } from 'react-router-dom'
import ReadingTime from './common/ReadingTime'
import { getArticleCover } from '../utils/defaultCovers'
import PixelCard from './effects/PixelCard'

function ArticleCard({ article, isRecommended }) {
  const navigate = useNavigate()

  if (!article) return null

  const coverUrl = getArticleCover(article)

  return (
    <PixelCard
      variant="purple"
      className="overflow-hidden cursor-pointer relative"
      onClick={() => navigate(`/blog/${article.id}`)}
    >
      {isRecommended && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
          ⭐ 推荐
        </div>
      )}
      {/* 浅色背景层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
      <img
        src={coverUrl}
        alt={article.title}
        className="w-full h-48 object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
        }}
      />
      <div className="p-6 relative z-10">
        {article.categories && article.categories.name && (
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold mb-3 shadow-lg shadow-purple-500/30">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {article.categories.name}
          </span>
        )}
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-400 mb-4 line-clamp-2">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <ReadingTime content={article.content} />
          <span>👁️ {article.views || 0}</span>
        </div>
      </div>
    </PixelCard>
  )
}

export default ArticleCard

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
      <img
        src={coverUrl}
        alt={article.title}
        className="w-full h-48 object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
        }}
      />
      <div className="p-6">
        {article.categories && article.categories.name && (
          <span className="inline-block bg-primary/20 text-primary px-2 py-1 rounded text-xs mb-2">
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

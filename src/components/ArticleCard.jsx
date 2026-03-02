import { useNavigate } from 'react-router-dom'
import ReadingTime from './common/ReadingTime'

function ArticleCard({ article }) {
  const navigate = useNavigate()

  if (!article) return null

  return (
    <article
      onClick={() => navigate(`/blog/${article.id}`)}
      className="glass rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
    >
      {article.cover && (
        <img
          src={article.cover}
          alt={article.title}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      )}
      <div className="p-6">
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
    </article>
  )
}

export default ArticleCard

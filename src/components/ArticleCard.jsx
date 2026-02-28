import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { formatDate, truncateText } from '../utils/helpers'

function ArticleCard({ article }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass rounded-xl overflow-hidden neon-border"
    >
      {article.cover && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          <Link
            to={`/blog/${article.id}`}
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {truncateText(article.summary || article.content, 120)}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDate(article.created_at)}</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {article.views || 0}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export default ArticleCard

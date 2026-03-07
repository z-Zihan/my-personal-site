import React from 'react'
import { useNavigate } from 'react-router-dom'
import ReadingTime from './common/ReadingTime'
import { getArticleCover } from '../utils/defaultCovers'
import PixelCard from './effects/PixelCard'
import RandomTag from './common/Tag'
import { EyeIcon, HeartIcon } from 'lucide-react'
import { trackEvent } from '../utils/analytics'

export interface Article {
  id: number | string
  title: string
  summary: string
  content: string
  cover?: string
  views?: number
  likes?: number
  categories?: {
    name: string
  }
  [key: string]: unknown
}

interface ArticleCardProps {
  article: Article
  isRecommended: boolean
}

function ArticleCard({ article, isRecommended }: ArticleCardProps) {
  const navigate = useNavigate()

  if (!article) return null

  const coverUrl = getArticleCover(article)

  return (
    <PixelCard
      variant="purple"
      className="overflow-hidden cursor-pointer relative"
      onClick={() => {
        // 文章卡片点击埋点
        trackEvent('article_card_click', 'engagement', {
          article_id: article.id,
          article_title: article.title,
          page_path: window.location.pathname,
        })
        navigate(`/blog/${article.id}`)
      }}
    >
      {isRecommended && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
          ⭐ 推荐
        </div>
      )}
      {/* 浅色背景层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
      <img
        src={coverUrl}
        alt={article.title}
        className="w-full h-48 object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop'
        }}
      />
      <div className="p-6 relative z-10">
        {/* 分类标签 */}
        {article.categories && (article.categories as { name: string }).name && (
          <div className="mb-3 absolute top-3 right-3">
            <RandomTag>{(article.categories as { name: string }).name}</RandomTag>
          </div>
        )}
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-400 mb-4 line-clamp-2">{article.summary}</p>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <ReadingTime content={article.content} />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {article.views || 0}
            </span>
            <span className="flex items-center gap-1  text-red-500">
              <HeartIcon className="w-4 h-4 fill-red-500" />
              {article.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </PixelCard>
  )
}

export default ArticleCard

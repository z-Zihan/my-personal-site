import React from 'react'
import { toast } from '../../utils/toast'
import { trackEvent } from '../../utils/analytics'

interface ShareButtonsProps {
  title: string
  url: string
  articleId?: string
}

export default function ShareButtons({ title, url, articleId }: ShareButtonsProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      // 复制链接埋点
      trackEvent('share_copy_link', 'engagement', {
        article_id: articleId,
        page_path: window.location.pathname,
      })
      toast.success('链接已复制')
    } catch (err) {
      toast.error('复制失败')
    }
  }

  const handleShare = (platform: 'weibo' | 'twitter') => {
    const urls = {
      weibo: `https://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    }
    // 分享埋点
    trackEvent('article_share', 'engagement', {
      article_id: articleId,
      platform: platform,
      page_path: window.location.pathname,
    })
    window.open(urls[platform], '_blank')
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleShare('weibo')}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
      >
        微博
      </button>
      <button
        onClick={() => handleShare('twitter')}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Twitter
      </button>
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
      >
        复制链接
      </button>
    </div>
  )
}

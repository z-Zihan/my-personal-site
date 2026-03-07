// 默认封面图片（使用 Unsplash 随机图）
export const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
]

// 简单哈希函数
const hashCode = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

// 获取文章 ID 获取默认封面
export const getDefaultCover = (articleId: number | string): string => {
  if (!articleId) return DEFAULT_COVERS[0]
  const index = Math.abs(hashCode(String(articleId))) % DEFAULT_COVERS.length
  return DEFAULT_COVERS[index]
}

// 检查 URL 是否有效
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export interface Article {
  id: number | string
  cover?: string
  [key: string]: unknown
}

// 获取文章封面（有默认值）
export const getArticleCover = (article: Article): string => {
  if (isValidImageUrl(article.cover)) {
    return article.cover as string
  }
  return getDefaultCover(article.id)
}

export default {
  DEFAULT_COVERS,
  getDefaultCover,
  getArticleCover,
}

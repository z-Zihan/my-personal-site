import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Article, Like } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return errorResponse('Article ID is required', 400)
    }

    // 1. 先获取文章（包含当前 views）
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !article) {
      console.error('Supabase fetch error:', fetchError)
      return errorResponse('Database error: ' + (fetchError?.message || 'Article not found'), 500)
    }

    // 2. 计算新的浏览量
    const newViewCount = (article.views || 0) + 1

    // 3. 并行执行：更新浏览量 + 更新每日访问量 + 查询点赞数
    const today = new Date().toISOString().split('T')[0]

    const [, , { count: likeCount }] = await Promise.all([
      // 更新文章浏览量（不阻塞响应）
      supabase
        .from('articles')
        .update({ views: newViewCount })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('View update error:', error)
        }),
      // 更新每日访问量
      supabase
        .from('daily_views')
        .upsert({ date: today, count: 1 }, { onConflict: 'date' })
        .then(({ error }) => {
          if (error) console.error('Daily view update error:', error)
        }),
      // 查询点赞数
      supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', article.id),
    ])

    // 4. 返回文章数据
    const articleWithLikes: Article & { likes: number } = {
      ...article,
      views: newViewCount,
      likes: likeCount || 0
    }

    return jsonResponse({ data: articleWithLikes })
  } catch (error) {
    console.error('Error fetching article:', error)
    return errorResponse('Internal server error: ' + (error as Error).message, 500)
  }
}

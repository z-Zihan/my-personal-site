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

    // 3. 更新浏览量（异步，不阻塞响应）
    const updatePromise = supabase
      .from('articles')
      .update({ views: newViewCount })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('View update error:', error)
        }
      })
      .catch(err => console.error('View update catch error:', err))

    // 4. 同时更新每日访问量
    const today = new Date().toISOString().split('T')[0]
    const dailyViewPromise = supabase
      .from('daily_views')
      .upsert({
        date: today,
        count: 1
      }, {
        onConflict: 'date'
      })
      .then(({ error }) => {
        if (error) {
          console.error('Daily view update error:', error)
        }
      })
      .catch(err => console.error('Daily view catch error:', err))

    // 等待两个更新操作（但不阻塞，如果太慢会超时）
    try {
      await Promise.race([
        Promise.all([updatePromise, dailyViewPromise]),
        new Promise(resolve => setTimeout(resolve, 500)) // 最多等 500ms
      ])
    } catch (e) {
      console.error('Update timeout or error, but continuing...', e)
    }

    // 5. 计算点赞数
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', article.id)

    // 6. 返回文章数据（使用新的浏览量）
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

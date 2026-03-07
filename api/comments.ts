import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { Comment } from '../src/types/database'

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
    const article_id = url.searchParams.get('article_id')
    const all = url.searchParams.get('all')

    if (all === 'true') {
      // 获取所有评论，带文章标题
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          articles!inner (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 格式化数据
      const formattedData = data.map((item: Comment & { articles: { title: string } }) => ({
        ...item,
        article_title: item.articles.title
      }))

      return jsonResponse({ data: formattedData })
    }

    // 获取单篇文章的评论
    if (!article_id) {
      return errorResponse('Article ID required', 400)
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', article_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return jsonResponse({ data })
  } catch (error) {
    console.error('Fetch comments error:', error)
    return errorResponse('Failed to fetch comments', 500)
  }
}

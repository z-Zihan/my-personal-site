import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const body = await req.json()
    const { article_id, visitor_id } = body

    if (!article_id || !visitor_id) {
      return errorResponse('Missing required fields', 400)
    }

    // 插入点赞记录（会触发 trigger 自动增加文章点赞数）
    const { error } = await supabase
      .from('likes')
      .insert({ article_id, visitor_id })

    if (error) {
      if (error.code === '23505') { // Unique violation
        return errorResponse('Already liked', 400)
      }
      throw error
    }

    // 获取最新点赞数
    const { data: article } = await supabase
      .from('articles')
      .select('likes')
      .eq('id', article_id)
      .single()

    return jsonResponse({ success: true, likes: article?.likes || 0 })
  } catch (error) {
    console.error('Like article error:', error)
    return errorResponse('Failed to like article', 500)
  }
}

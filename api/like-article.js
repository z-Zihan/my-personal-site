import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  try {
    const body = await req.json()
    const { article_id, visitor_id } = body

    if (!article_id || !visitor_id) {
      return errorResponse('Missing required fields', 400)
    }

    if (req.method === 'POST') {
      // 点赞
      const { error } = await supabase
        .from('likes')
        .insert({ article_id, visitor_id })

      if (error) {
        if (error.code === '23505') {
          return errorResponse('Already liked', 400)
        }
        throw error
      }

      const { data: article } = await supabase
        .from('articles')
        .select('likes')
        .eq('id', article_id)
        .single()

      return jsonResponse({ success: true, likes: article?.likes || 0 })
    }
    
    if (req.method === 'DELETE') {
      // 取消点赞
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', article_id)
        .eq('visitor_id', visitor_id)

      if (error) throw error

      const { data: article } = await supabase
        .from('articles')
        .select('likes')
        .eq('id', article_id)
        .single()

      return jsonResponse({ success: true, likes: article?.likes || 0 })
    }

    return errorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Like article error:', error)
    return errorResponse('Failed to like article', 500)
  }
}

import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { article_id, visitor_id } = body

    // 如果是 DELETE 请求，从 query 中获取参数
    const query = req.nextUrl.searchParams
    const queryArticleId = query.get('article_id')
    const queryVisitorId = query.get('visitor_id')

    const finalArticleId = article_id || queryArticleId
    const finalVisitorId = visitor_id || queryVisitorId

    if (!finalArticleId || !finalVisitorId) {
      return errorResponse('Missing required fields: article_id and visitor_id', 400)
    }

    if (req.method === 'POST') {
      // 点赞
      const { data: likeData, error: insertError } = await supabase
        .from('likes')
        .insert({ article_id: finalArticleId, visitor_id: finalVisitorId })
        .select()
        .single()

      if (insertError) {
        console.error('Insert like error:', insertError)
        if (insertError.code === '23505') {
          return errorResponse('Already liked', 400)
        }
        if (insertError.code === '23503') {
          return errorResponse('Invalid article_id: the article does not exist', 400)
        }
        return errorResponse('Insert failed: ' + insertError.message, 500)
      }

      // 计算点赞数（从 likes 表统计）
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', finalArticleId)

      return jsonResponse({ success: true, likes: count || 0 })
    }

    if (req.method === 'DELETE') {
      // 取消点赞 - 删除该用户对该文章的所有点赞记录
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', finalArticleId)
        .eq('visitor_id', finalVisitorId)

      if (deleteError) {
        console.error('Delete like error:', deleteError)
        return errorResponse('Delete failed: ' + deleteError.message, 500)
      }

      // 计算点赞数（从 likes 表统计）
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', finalArticleId)

      return jsonResponse({ success: true, likes: count || 0 })
    }

    return errorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Like article error:', error)
    return errorResponse('Failed to like article', 500)
  }
}

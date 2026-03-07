import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  try {
    // 统一从 query 中获取参数
    const url = new URL(req.url)
    const query = url.searchParams
    const articleId = query.get('article_id')
    const visitorId = query.get('visitor_id')

    // GET 请求：检查用户是否已点赞
    if (req.method === 'GET') {
      if (!articleId || !visitorId) {
        return errorResponse('Missing required fields: article_id and visitor_id', 400)
      }

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('visitor_id', visitorId)
        .maybeSingle()

      if (error) {
        console.error('Check like error:', error)
        return errorResponse('Failed to check like status', 500)
      }

      return jsonResponse({ data: { liked: !!data } })
    }

    // 解析请求体
    let body = {}
    if (req.method === 'POST' || req.method === 'DELETE') {
      try {
        body = await req.json()
      } catch {
        // ignore parse error
      }
    }

    const { article_id: bodyArticleId, visitor_id: bodyVisitorId } = body

    // 优先使用 body 中的参数，没有则使用 query 参数
    const finalArticleId = bodyArticleId || articleId
    const finalVisitorId = bodyVisitorId || visitorId

    if (!finalArticleId || !finalVisitorId) {
      return errorResponse('Missing required fields: article_id and visitor_id', 400)
    }

    // POST 请求：点赞
    if (req.method === 'POST') {
      // 先检查是否已点赞
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', finalArticleId)
        .eq('visitor_id', finalVisitorId)
        .maybeSingle()

      if (existingLike) {
        return errorResponse('Already liked', 400)
      }

      // 插入点赞记录
      const { error: insertError } = await supabase
        .from('likes')
        .insert({ article_id: finalArticleId, visitor_id: finalVisitorId })

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

      // 统计点赞数
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', finalArticleId)

      return jsonResponse({ data: { success: true, likes: count || 0 } })
    }

    // DELETE 请求：取消点赞
    if (req.method === 'DELETE') {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', finalArticleId)
        .eq('visitor_id', finalVisitorId)

      if (deleteError) {
        console.error('Delete like error:', deleteError)
        return errorResponse('Delete failed: ' + deleteError.message, 500)
      }

      // 统计点赞数
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', finalArticleId)

      return jsonResponse({ data: { success: true, likes: count || 0 } })
    }

    return errorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Like article error:', error)
    return errorResponse('Failed to like article', 500)
  }
}

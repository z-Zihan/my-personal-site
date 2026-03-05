import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
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

    // 获取文章详情
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      return errorResponse('Database error: ' + fetchError.message, 500)
    }

    if (!article) {
      return errorResponse('Article not found', 404)
    }

    // 计算点赞数
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', article.id)

    const articleWithLikes = {
      ...article,
      likes: likeCount || 0
    }

    // 增加阅读量（异步，不阻塞响应）
    supabase
      .from('articles')
      .update({ views: article.views + 1 })
      .eq('id', id)
      .then(() => {
        // 增加每日访问量
        return supabase
          .from('daily_views')
          .upsert({
            date: new Date().toISOString().split('T')[0],
            count: 1
          }, {
            onConflict: 'date'
          })
      })
      .catch(err => console.error('View increment error:', err))

    return jsonResponse({ data: articleWithLikes })
  } catch (error) {
    console.error('Error fetching article:', error)
    return errorResponse('Internal server error: ' + error.message, 500)
  }
}

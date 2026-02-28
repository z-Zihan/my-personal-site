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
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !article) {
      return errorResponse('Article not found', 404)
    }

    // 增加阅读量
    await supabase
      .from('articles')
      .update({ views: article.views + 1 })
      .eq('id', id)

    // 增加每日访问量
    await supabase.rpc('increment_daily_views').catch(() => {
      // 如果存储过程不存在，手动插入
      return null
    })

    return jsonResponse({ data: article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return errorResponse('Internal server error', 500)
  }
}

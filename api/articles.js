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
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status')

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    // 默认显示所有状态的文章（包括草稿和已发布）

    const { data, error, count } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    // 为每篇文章添加点赞数和评论数统计
    const articlesWithStats = await Promise.all(
      data.map(async (article) => {
        const { count: likeCount, error: likeError } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', article.id)

        const { count: commentCount, error: commentError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', article.id)

        console.log(`Article ${article.id}: likes=${likeCount}, comments=${commentCount}`)

        return {
          ...article,
          likes: likeCount || 0,
          comment_count: commentCount || 0
        }
      })
    )

    return jsonResponse({
      data: articlesWithStats,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return errorResponse('Internal server error', 500)
  }
}

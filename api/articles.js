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
    const limit = parseInt(url.searchParams.get('limit') || '15')
    const status = url.searchParams.get('status')
    const recommended = url.searchParams.get('recommended')
    const category_id = url.searchParams.get('category_id')

    let query = supabase
      .from('articles')
      .select('*, categories(name, id)', { count: 'exact' })

    // 如果是获取推荐文章
    if (recommended === 'true') {
      query = query.eq('is_recommended', true)
        .order('recommend_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else if (category_id) {
      // 指定分类的文章列表
      query = query.eq('category_id', category_id)
        .order('created_at', { ascending: false })
    } else {
      // 普通文章列表，按创建时间倒序
      query = query.order('created_at', { ascending: false })
    }

    query = query.range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    // 如果指定了分类 ID
    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    const { data, error, count } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    // 批量获取点赞数和评论数（优化 N+1 查询）
    const articleIds = data.map(article => article.id)

    // 批量查询点赞数
    let likeCounts = []
    if (articleIds.length > 0) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('article_id')
        .in('article_id', articleIds)
        .rpc('count_by_article_id')

      // 如果 RPC 不存在，使用普通查询
      if (!likeData) {
        const { data: fallbackData } = await supabase
          .from('likes')
          .select('article_id')
          .in('article_id', articleIds)

        // 统计每个文章的点赞数
        likeCounts = fallbackData?.reduce((acc, like) => {
          acc[like.article_id] = (acc[like.article_id] || 0) + 1
          return acc
        }, {}) || {}
      } else {
        likeCounts = likeData
      }
    }

    // 批量查询评论数
    let commentCounts = []
    if (articleIds.length > 0) {
      const { data: commentData } = await supabase
        .from('comments')
        .select('article_id')
        .in('article_id', articleIds)

      // 统计每个文章的评论数
      commentCounts = commentData?.reduce((acc, comment) => {
        acc[comment.article_id] = (acc[comment.article_id] || 0) + 1
        return acc
      }, {}) || {}
    }

    // 合并统计数据
    const articlesWithStats = data.map(article => ({
      ...article,
      likes: likeCounts[article.id] || 0,
      comment_count: commentCounts[article.id] || 0
    }))

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

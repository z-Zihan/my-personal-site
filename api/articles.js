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
        // 综合评分排序：推荐顺序 + (点赞数 * 10) + (浏览量 * 0.1)
        .order('recommend_order', { ascending: true })
        .order('likes', { ascending: false })
        .order('views', { ascending: false })
        .order('created_at', { ascending: false })
    } else if (category_id) {
      // 指定分类的文章列表，按分类内推荐顺序排序
      query = query.eq('category_id', category_id)
        .order('is_recommended', { ascending: false })
        .order('recommend_order', { ascending: true })
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

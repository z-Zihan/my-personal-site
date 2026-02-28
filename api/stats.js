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
    // 总文章数
    const { count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    // 总阅读量
    const { data: viewsData } = await supabase
      .from('articles')
      .select('views')

    const totalViews = viewsData?.reduce((sum, a) => sum + a.views, 0) || 0

    // 总留言数
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    // 热点数
    const { count: newsCount } = await supabase
      .from('hot_news')
      .select('*', { count: 'exact', head: true })

    // 最近 7 天访问量
    const { data: dailyViews } = await supabase
      .from('daily_views')
      .select('date, count')
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true })

    // 已发布文章数
    const { count: publishedCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    return jsonResponse({
      data: {
        totalArticles: articlesCount || 0,
        publishedArticles: publishedCount || 0,
        totalViews,
        totalMessages: messagesCount || 0,
        totalNews: newsCount || 0,
        dailyViews: dailyViews || [],
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return errorResponse('Internal server error', 500)
  }
}

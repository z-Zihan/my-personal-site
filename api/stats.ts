import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 并行查询所有统计数据
    const [
      { count: articlesCount },
      { data: viewsData },
      { count: messagesCount },
      { count: newsCount },
      { data: dailyViews },
      { count: publishedCount }
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('views'),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('hot_news').select('*', { count: 'exact', head: true }),
      supabase
        .from('daily_views')
        .select('date, count')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published')
    ])

    const totalViews = viewsData?.reduce((sum: number, a: { views: number }) => sum + a.views, 0) || 0

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

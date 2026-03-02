import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 热门 API 源（模拟实时热点）
const NEWS_SOURCES = [
  { name: '36Kr', url: 'https://36kr.com' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'GitHub Trending', url: 'https://github.com/trending' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com' },
  { name: 'TechCrunch', url: 'https://techcrunch.com' },
]

// 模拟热点标题（实际应该调用 API 获取）
const generateDailyNews = () => {
  const today = new Date().toLocaleDateString('zh-CN')
  return [
    {
      title: `今日科技热点：AI 技术新突破 - ${today}`,
      link: 'https://github.com/trending',
      source: 'GitHub Trending',
    },
    {
      title: `前端开发趋势报告 ${new Date().getFullYear()} 年 ${new Date().getMonth() + 1}月`,
      link: 'https://36kr.com',
      source: '36Kr',
    },
    {
      title: '开源项目推荐：本周最值得关注的 10 个 GitHub 项目',
      link: 'https://github.com/trending/weekly',
      source: 'GitHub',
    },
    {
      title: 'Vercel 发布新一代部署工具，性能提升 50%',
      link: 'https://vercel.com',
      source: 'Vercel',
    },
    {
      title: 'React 19 新特性抢先看',
      link: 'https://react.dev',
      source: 'React Official',
    },
  ]
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 先尝试从数据库获取
    const { data: dbNews, error } = await supabase
      .from('hot_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Fetch hot news error:', error)
    }

    // 如果数据库有数据，返回数据库的
    if (dbNews && dbNews.length > 0) {
      return jsonResponse({ data: dbNews })
    }

    // 否则返回每日生成的热点
    const dailyNews = generateDailyNews()
    
    // 尝试插入数据库（可选）
    try {
      await supabase.from('hot_news').insert(
        dailyNews.map(news => ({
          title: news.title,
          link: news.link,
          source: news.source,
        }))
      )
    } catch (e) {
      // 插入失败不影响返回
    }

    return jsonResponse({ data: dailyNews })
  } catch (error) {
    console.error('Error fetching hot news:', error)
    return errorResponse('Internal server error', 500)
  }
}

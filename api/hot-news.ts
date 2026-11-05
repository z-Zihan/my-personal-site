import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { HotNews } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

// 缓存时间：30 分钟（秒）
const CACHE_DURATION = 30 * 60

// 免费热榜 API 列表
const HOT_APIS = [
  {
    name: '微博热搜',
    url: 'https://api.vvhan.com/api/hotlist/wbHot',
    parser: (data: Record<string, unknown>) => {
      if (data.success && Array.isArray(data.data)) {
        return data.data.slice(0, 10).map((item: Record<string, unknown>) => ({
          title: item.title || item.name,
          link: item.url || `https://s.weibo.com/weibo?q=${encodeURIComponent(String(item.title || item.name || ''))}`,
          source: '微博热搜',
          hot: item.hot || item.num,
        }))
      }
      return []
    },
  },
  {
    name: '知乎热榜',
    url: 'https://api.vvhan.com/api/hotlist/zhihuHot',
    parser: (data: Record<string, unknown>) => {
      if (data.success && Array.isArray(data.data)) {
        return data.data.slice(0, 10).map((item: Record<string, unknown>) => ({
          title: item.title || item.name,
          link: item.url || 'https://www.zhihu.com/hot',
          source: '知乎热榜',
          hot: item.hot,
        }))
      }
      return []
    },
  },
  {
    name: '抖音热点',
    url: 'https://api.vvhan.com/api/hotlist/douyinHot',
    parser: (data: Record<string, unknown>) => {
      if (data.success && Array.isArray(data.data)) {
        return data.data.slice(0, 10).map((item: Record<string, unknown>) => ({
          title: item.title || item.name,
          link: item.url || 'https://www.douyin.com/hot',
          source: '抖音热点',
          hot: item.hot,
        }))
      }
      return []
    },
  },
  {
    name: '今日头条',
    url: 'https://api.vvhan.com/api/hotlist/toutiao',
    parser: (data: Record<string, unknown>) => {
      if (data.success && Array.isArray(data.data)) {
        return data.data.slice(0, 10).map((item: Record<string, unknown>) => ({
          title: item.title || item.name,
          link: item.url || 'https://www.toutiao.com/',
          source: '今日头条',
          hot: item.hot,
        }))
      }
      return []
    },
  },
]

// 模拟热点数据（作为 fallback）
const FALLBACK_NEWS: HotNews[] = [
  { title: 'GitHub 今日 trending 项目推荐', link: 'https://github.com/trending', source: 'GitHub' },
  { title: 'AI 技术最新进展汇总', link: 'https://github.com/topics/artificial-intelligence', source: 'GitHub Topics' },
  { title: '前端开发工具链演进', link: 'https://github.com/topics/frontend', source: 'Dev Community' },
  { title: '开源项目最佳实践指南', link: 'https://opensource.guide/', source: 'Open Source' },
  { title: '云原生技术趋势分析', link: 'https://github.com/topics/cloud-native', source: 'Cloud Native' },
]

// 从多个热榜 API 获取实时数据
async function fetchFromHotAPIs(): Promise<HotNews[]> {
  const allNews: HotNews[] = []

  // 随机选择 2-3 个 API 并行请求
  const shuffled = [...HOT_APIS].sort(() => Math.random() - 0.5)
  const selectedAPIs = shuffled.slice(0, 3)

  const results = await Promise.allSettled(
    selectedAPIs.map(async (api) => {
      try {
        const response = await fetch(api.url, {
          headers: { 'Accept': 'application/json' },
          // 设置超时
          signal: AbortSignal.timeout(5000),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        return api.parser(data as Record<string, unknown>)
      } catch {
        return []
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allNews.push(...result.value)
    }
  }

  // 按热度排序（如果有热度数据）
  allNews.sort((a, b) => (b.hot || 0) - (a.hot || 0))

  // 返回前 15 条
  return allNews.slice(0, 15)
}

// 获取缓存的新闻数据
async function getCachedNews(): Promise<HotNews[] | null> {
  const { data, error } = await supabase
    .from('hot_news_cache')
    .select('*')
    .eq('is_valid', true)
    .single()

  if (error || !data) {
    return null
  }

  // 检查缓存是否过期
  const cacheTime = new Date(data.updated_at).getTime()
  const now = Date.now()

  if (now - cacheTime < CACHE_DURATION * 1000) {
    return JSON.parse(data.news_data) as HotNews[]
  }

  return null
}

// 更新缓存
async function updateCache(newsData: HotNews[]): Promise<void> {
  try {
    // 先清空旧缓存
    await supabase.from('hot_news_cache').update({ is_valid: false }).eq('is_valid', true)

    // 插入新缓存
    await supabase.from('hot_news_cache').insert({
      news_data: JSON.stringify(newsData),
      is_valid: true,
      updated_at: new Date().toISOString()
    })
  } catch (e) {
    console.error('Cache update failed:', e)
  }
}

// 获取手动创建的热点资讯（hot_news 表）
async function getManualNews(): Promise<HotNews[]> {
  try {
    const { data, error } = await supabase
      .from('hot_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    if (error || !data) return []
    return data as HotNews[]
  } catch {
    return []
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 0. 优先合并管理员手动创建的热点（hot_news 表），始终返回
    const manualNews = await getManualNews()

    // 1. 先尝试从缓存获取
    const cachedNews = await getCachedNews()
    if (cachedNews && cachedNews.length > 0) {
      console.log('Returning cached news')
      return jsonResponse({ data: [...manualNews, ...cachedNews] })
    }

    // 2. 缓存失效，尝试获取真实数据
    let newsData = FALLBACK_NEWS

    try {
      newsData = await fetchFromHotAPIs()
      if (newsData.length > 0) {
        console.log('Fetched fresh news from Hot APIs')
        // 更新缓存
        await updateCache(newsData)
      } else {
        console.log('No data from APIs, using fallback')
        newsData = FALLBACK_NEWS
      }
    } catch {
      console.log('Using fallback news data (APIs unavailable)')
      // 使用 fallback 数据
    }

    return jsonResponse({ data: [...manualNews, ...newsData] })
  } catch (error) {
    console.error('Error fetching hot news:', error)
    // 始终返回 fallback 数据作为保底（含手动创建的热点）
    try {
      const manualNews = await getManualNews()
      return jsonResponse({ data: [...manualNews, ...FALLBACK_NEWS] })
    } catch {
      return jsonResponse({ data: FALLBACK_NEWS })
    }
  }
}

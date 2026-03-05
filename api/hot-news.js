import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

// 缓存时间：6 小时（秒）
const CACHE_DURATION = 6 * 60 * 60

// 免费且稳定的新闻源
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url='

// 可用的 RSS 源（科技类）
const RSS_FEEDS = [
  'https://feeds.feedburner.com/Techcrunch',
  'https://www.theverge.com/rss/index.xml',
  'https://github.com/trending.atom',
]

// 模拟热点数据（作为 fallback）
const FALLBACK_NEWS = [
  {
    title: 'GitHub 今日 trending 项目推荐',
    link: 'https://github.com/trending',
    source: 'GitHub',
  },
  {
    title: 'AI 技术最新进展汇总',
    link: 'https://github.com/topics/artificial-intelligence',
    source: 'GitHub Topics',
  },
  {
    title: '前端开发工具链演进',
    link: 'https://github.com/topics/frontend',
    source: 'Dev Community',
  },
  {
    title: '开源项目最佳实践指南',
    link: 'https://opensource.guide/',
    source: 'Open Source',
  },
  {
    title: '云原生技术趋势分析',
    link: 'https://github.com/topics/cloud-native',
    source: 'Cloud Native',
  },
]

// 从 RSS 获取真实热点数据
async function fetchFromRSS() {
  // 随机选择一个 RSS 源
  const feedUrl = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)]
  const response = await fetch(`${RSS_TO_JSON_API}${encodeURIComponent(feedUrl)}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('RSS fetch failed')
  }

  const data = await response.json()

  return data.items.slice(0, 10).map((item, index) => ({
    title: item.title,
    link: item.link,
    source: data.feed?.title || 'Tech News',
  }))
}

// 获取缓存的新闻数据
async function getCachedNews() {
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
    return JSON.parse(data.news_data)
  }

  return null
}

// 更新缓存
async function updateCache(newsData) {
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

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 1. 先尝试从缓存获取
    const cachedNews = await getCachedNews()
    if (cachedNews && cachedNews.length > 0) {
      console.log('Returning cached news')
      return jsonResponse({ data: cachedNews })
    }

    // 2. 缓存失效，尝试获取真实数据
    let newsData = FALLBACK_NEWS

    try {
      newsData = await fetchFromRSS()
      console.log('Fetched fresh news from RSS')

      // 更新缓存
      await updateCache(newsData)
    } catch (rssError) {
      console.warn('RSS fetch failed, using fallback:', rssError.message)
      // 使用 fallback 数据
    }

    return jsonResponse({ data: newsData })
  } catch (error) {
    console.error('Error fetching hot news:', error)
    // 始终返回 fallback 数据作为保底
    return jsonResponse({ data: FALLBACK_NEWS })
  }
}

import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
import type { HotNews } from '../src/types/database'

export const config = {
  runtime: 'edge',
}

// 缓存时间：30 分钟（秒）
const CACHE_DURATION = 30 * 60
// 单源请求超时
const FETCH_TIMEOUT = 5000
// 每个源取的条数（3 源合计 18 条）
const PER_SOURCE = 6

type SourceName = 'GitHub' | 'Hacker News' | 'V2EX'

// 兜底数据：只放真实可访问的通用入口，不编造新闻标题
const FALLBACK_NEWS: HotNews[] = [
  { title: 'GitHub Trending', link: 'https://github.com/trending', source: 'GitHub' },
  { title: 'Hacker News — Top Stories', link: 'https://news.ycombinator.com/', source: 'Hacker News' },
  { title: 'V2EX — 今日热议', link: 'https://www.v2ex.com/?tab=hot', source: 'V2EX' },
  { title: 'zZihan Blog — Latest Posts', link: 'https://zzihanaini.vercel.app/blog', source: 'Blog' },
]

async function fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', ...headers },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`)
  return (await response.json()) as T
}

const unixToIso = (seconds?: number): string | undefined =>
  typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : undefined

// GitHub：近 7 天新建仓库按 star 排序（新仓库爆星榜）
async function fetchGitHub(): Promise<HotNews[]> {
  try {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'zzihan-blog-hot-news',
    }
    const token = process.env.GITHUB_TOKEN
    if (token) headers.Authorization = `Bearer ${token}`

    const data = await fetchJson<{
      items?: Array<{ full_name: string; html_url: string; stargazers_count: number; created_at?: string }>
    }>(
      `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=${PER_SOURCE}`,
      headers
    )
    return (data.items || []).slice(0, PER_SOURCE).map((repo) => ({
      title: repo.full_name,
      link: repo.html_url,
      hot: repo.stargazers_count,
      source: 'GitHub' satisfies SourceName,
      created_at: repo.created_at,
    }))
  } catch (e) {
    console.error('GitHub source failed:', e)
    return []
  }
}

// Hacker News：Top Stories 前 N 条，并发拉详情
async function fetchHackerNews(): Promise<HotNews[]> {
  try {
    const ids = await fetchJson<number[]>('https://hacker-news.firebaseio.com/v0/topstories.json')
    const items = await Promise.allSettled(
      ids.slice(0, PER_SOURCE).map((id) =>
        fetchJson<{ id: number; title?: string; url?: string; score?: number; time?: number }>(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        )
      )
    )
    return items
      .filter((r): r is PromiseFulfilledResult<{ id: number; title?: string; url?: string; score?: number; time?: number }> =>
        r.status === 'fulfilled' && !!r.value?.title
      )
      .map(({ value: item }) => ({
        title: item.title as string,
        link: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        hot: item.score,
        source: 'Hacker News' satisfies SourceName,
        created_at: unixToIso(item.time),
      }))
  } catch (e) {
    console.error('Hacker News source failed:', e)
    return []
  }
}

// V2EX：全站热帖
async function fetchV2EX(): Promise<HotNews[]> {
  try {
    const topics = await fetchJson<
      Array<{ title: string; url: string; replies?: number; created?: number }>
    >('https://www.v2ex.com/api/topics/hot.json')
    return (topics || []).slice(0, PER_SOURCE).map((topic) => ({
      title: topic.title,
      link: topic.url,
      hot: topic.replies,
      source: 'V2EX' satisfies SourceName,
      created_at: unixToIso(topic.created),
    }))
  } catch (e) {
    console.error('V2EX source failed:', e)
    return []
  }
}

// 三源并行，单源失败不影响其它；各源内部按 hot 排序后轮流穿插（不同源的热度量纲不可比）
async function fetchLiveNews(): Promise<HotNews[]> {
  const results = await Promise.allSettled([fetchGitHub(), fetchHackerNews(), fetchV2EX()])
  const lists = results.map((r) =>
    r.status === 'fulfilled' ? [...r.value].sort((a, b) => (b.hot || 0) - (a.hot || 0)) : []
  )

  const merged: HotNews[] = []
  const maxLen = Math.max(0, ...lists.map((l) => l.length))
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) {
      if (list[i]) merged.push(list[i])
    }
  }
  return merged
}

// 获取缓存的新闻数据（多行 valid 时取最新一行，避免 .single() 报错）
async function getCachedNews(): Promise<HotNews[] | null> {
  try {
    const { data, error } = await supabase
      .from('hot_news_cache')
      .select('*')
      .eq('is_valid', true)
      .order('updated_at', { ascending: false })
      .limit(1)

    const row = data?.[0]
    if (error || !row) return null

    const cacheTime = new Date(row.updated_at).getTime()
    if (Date.now() - cacheTime < CACHE_DURATION * 1000) {
      const parsed = typeof row.news_data === 'string' ? JSON.parse(row.news_data) : row.news_data
      return Array.isArray(parsed) ? (parsed as HotNews[]) : null
    }
    return null
  } catch (e) {
    console.error('Cache read failed:', e)
    return null
  }
}

// 更新缓存：旧的有效行全部置为失效，再插入新行
async function updateCache(newsData: HotNews[]): Promise<void> {
  try {
    await supabase.from('hot_news_cache').update({ is_valid: false }).eq('is_valid', true)
    await supabase.from('hot_news_cache').insert({
      news_data: JSON.stringify(newsData),
      is_valid: true,
      updated_at: new Date().toISOString(),
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

// 手动热点在前，按链接去重
function mergeNews(manual: HotNews[], live: HotNews[]): HotNews[] {
  const seen = new Set<string>()
  return [...manual, ...live].filter((item) => {
    const key = item.link || item.title
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const [manualNews, cachedNews] = await Promise.all([getManualNews(), getCachedNews()])

    if (cachedNews && cachedNews.length > 0) {
      return jsonResponse({ data: mergeNews(manualNews, cachedNews) })
    }

    const liveNews = await fetchLiveNews()
    if (liveNews.length > 0) {
      await updateCache(liveNews)
      return jsonResponse({ data: mergeNews(manualNews, liveNews) })
    }

    console.log('No data from live sources, using fallback')
    return jsonResponse({ data: mergeNews(manualNews, FALLBACK_NEWS) })
  } catch (error) {
    console.error('Error fetching hot news:', error)
    return jsonResponse({ data: FALLBACK_NEWS })
  }
}

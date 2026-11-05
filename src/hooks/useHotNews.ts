import { useEffect, useState } from 'react'
import { hotNewsApi, HotNews as HotNewsType } from '../api/index'

export interface HotNewsItem {
  id?: number
  title: string
  url: string
  source: string
  created_at?: string
  [key: string]: unknown
}

export function useHotNews() {
  const [news, setNews] = useState<HotNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await hotNewsApi.getList()
      const newsData = data as unknown as HotNewsType[]
      setNews(newsData.map(item => ({
        ...item,
        id: typeof item.id === 'number' ? item.id : 0,
        title: item.title || '',
        url: item.url || '',
        source: item.source || '',
      })) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return { news, loading, error, refetch: fetchNews }
}

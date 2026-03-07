import { useEffect, useState } from 'react'
import { hotNewsApi } from '../api/index'

interface HotNewsItem {
  id: number
  title: string
  url: string
  source: string
  created_at?: string
  [key: string]: unknown
}

interface HotNewsResponse {
  data: HotNewsItem[]
}

export function useHotNews() {
  const [news, setNews] = useState<HotNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await hotNewsApi.getList()
      setNews((data as HotNewsResponse)?.data || [])
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

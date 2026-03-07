import { useEffect, useState } from 'react'
import { statsApi } from '../api/index'

interface Stats {
  totalArticles?: number
  totalComments?: number
  totalMessages?: number
  totalViews?: number
  [key: string]: unknown
}

interface StatsResponse {
  data: Stats
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await statsApi.getStats()
      setStats((data as StatsResponse)?.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

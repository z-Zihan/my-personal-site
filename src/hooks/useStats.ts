import { useEffect, useState } from 'react'
import { statsApi, Stats as StatsType } from '../api/index'

export interface Stats {
  totalArticles?: number
  totalComments?: number
  totalMessages?: number
  totalViews?: number
  [key: string]: unknown
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await statsApi.getStats()
      setStats((data as unknown as StatsType) || null)
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

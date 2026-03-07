import { useEffect, useState } from 'react'
import { hotNewsApi } from '../api/index'

export function useHotNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await hotNewsApi.getList()
      setNews(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return { news, loading, error, refetch: fetchNews }
}

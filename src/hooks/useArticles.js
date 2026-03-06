import { useEffect, useState } from 'react'
import { articlesApi } from '../utils/api'

export function useArticles(initialParams = {}) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialParams.limit || 18,
    total: 0,
    totalPages: 0,
  })

  const fetchArticles = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await articlesApi.getList({ ...initialParams, ...params })
      setArticles(data.data || [])
      setPagination(data.pagination || pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [initialParams.category_id, initialParams.limit])

  return { articles, loading, error, pagination, refetch: fetchArticles }
}

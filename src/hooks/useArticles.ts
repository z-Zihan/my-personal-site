/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { articleApi } from "../api/index"

export interface Article {
  id: number
  title: string
  content: string
  summary?: string
  cover?: string
  author_id?: number
  category_id?: number
  views?: number
  likes?: number
  status?: number
  is_recommend?: boolean
  created_at?: string
  updated_at?: string
  category?: {
    id: number
    name: string
  }
  [key: string]: unknown
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ArticleFilters {
  category_id?: number
  limit?: number
  page?: number
  [key: string]: unknown
}

interface ArticlesResponse {
  data: Article[]
  pagination: Pagination
}

export function useArticles(initialParams: ArticleFilters = {}) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: initialParams.limit || 18,
    total: 0,
    totalPages: 0,
  })

  const fetchArticles = async (params: ArticleFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await articleApi.getList({
        ...initialParams,
        ...params,
      })
      const response = result as ArticlesResponse
      setArticles(response.data || [])
      setPagination(response.pagination || pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [initialParams.category_id, initialParams.limit])

  return { articles, loading, error, pagination, refetch: fetchArticles }
}

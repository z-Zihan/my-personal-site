import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchApi } from '../../api/search'
import { sanitizeInput, inputRules } from '../../utils/sanitize'
import { trackEvent } from '../../utils/analytics'
import { useLanguage } from '../../utils/useLanguage'

interface SearchResult {
  id: number
  title: string
  summary?: string
  created_at?: string
  [key: string]: unknown
}

interface SearchBarProps {
  onSearchResults?: (results: SearchResult[]) => void
}

export default function SearchBar({ onSearchResults }: SearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  // 点击外部区域关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ctrl/Cmd + K 快捷键聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 1) {
        setLoading(true)
        try {
          const res = await searchApi.search(query)
          const searchResults = (res as { data?: SearchResult[] }).data || []
          setResults(searchResults)
          setIsOpen(true)
          if (onSearchResults) {
            onSearchResults(searchResults)
          }
        } catch (error) {
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearchResults])

  const handleSelect = (articleId: number) => {
    // 搜索结果点击埋点
    trackEvent('search_click', 'engagement', {
      article_id: articleId,
      search_query: query,
      page_path: window.location.pathname,
    })
    setQuery('')
    setIsOpen(false)
    navigate(`/blog/${articleId}`)
  }

  // 格式化发布日期为 YYYY-MM-DD
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(sanitizeInput(e.target.value))}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          placeholder={t('searchPlaceholder')}
          maxLength={inputRules.searchMaxLength}
          className="w-full md:w-64 px-4 py-2 pl-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-4 text-center text-gray-500">{t('searching')}</div>
          ) : results.length > 0 ? (
            results.map((article) => (
              <div
                key={article.id}
                onClick={() => handleSelect(article.id)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{article.summary}</p>
                {formatDate(article.created_at as string | undefined) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                    <span>🗓️</span>
                    {formatDate(article.created_at as string | undefined)}
                  </p>
                )}
              </div>
            ))
          ) : query.length >= 1 ? (
            <div className="p-4 text-center text-gray-500">{t('noResults')}</div>
          ) : null}
        </div>
      )}
    </div>
  )
}

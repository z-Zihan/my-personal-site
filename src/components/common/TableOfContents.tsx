import React, { useEffect, useState, RefObject } from 'react'
import { ChevronRight, List } from 'lucide-react'
import { useLanguage } from '../../utils/useLanguage'

interface HeadingData {
  id: string
  text: string | null
  level: string
}

interface TableOfContentsProps {
  contentRef: RefObject<HTMLElement | null>
}

const TOC_COLLAPSED_KEY = 'toc-collapsed'

export default function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingData[]>([])
  const [activeId, setActiveId] = useState('')
  const { t } = useLanguage()
  // 折叠状态：localStorage 有用户选择则沿用；否则窄屏（<2xl）默认收起、宽屏默认展开
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(TOC_COLLAPSED_KEY)
      if (saved === '1') return true
      if (saved === '0') return false
    } catch {
      /* ignore */
    }
    return window.innerWidth < 1536
  })

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(TOC_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  useEffect(() => {
    if (contentRef?.current) {
      const elements = contentRef.current.querySelectorAll('h2, h3')
      const headingData = Array.from(elements).map((heading, index) => ({
        id: heading.id || `heading-${index}`,
        text: heading.textContent,
        level: heading.tagName.toLowerCase(),
      }))
      // 设置 ID
      elements.forEach((heading, index) => {
        heading.id = headingData[index].id
      })
      setHeadings(headingData)
    }
  }, [contentRef])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -60% 0%' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  // 文章没有 h2/h3 时不渲染目录（空面板/悬浮按钮都没意义）
  if (headings.length === 0) return null

  // 收起态：右缘小圆按钮，点击展开
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleCollapsed}
        title={t('toc')}
        aria-label={t('toc')}
        aria-expanded={false}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200/60 bg-white/80 text-gray-500 shadow-lg backdrop-blur-sm transition-colors hover:text-purple-500 dark:border-gray-700/60 dark:bg-gray-900/80 dark:text-gray-400"
      >
        <List className="h-5 w-5" />
      </button>
    )
  }

  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 w-64 max-h-[80vh] overflow-y-auto rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('toc')}</h4>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={t('toc')}
          aria-label={t('toc')}
          aria-expanded={true}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-500 dark:text-gray-500 dark:hover:bg-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={`${level === 'h3' ? 'pl-4' : ''} transition-all duration-200`}>
            <a
              href={`#${id}`}
              className={`text-sm hover:text-purple-500 transition-colors ${
                activeId === id ? 'text-purple-500 font-medium' : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import React, { useEffect, useState, RefObject } from 'react'

interface HeadingData {
  id: string
  text: string | null
  level: string
}

interface TableOfContentsProps {
  contentRef: RefObject<HTMLElement | null>
}

export default function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingData[]>([])
  const [activeId, setActiveId] = useState('')

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

  return (
    <nav className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-64 max-h-[80vh] overflow-y-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">目录</h4>
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

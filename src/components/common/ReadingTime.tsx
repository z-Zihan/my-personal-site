import React from 'react'
import { Clock } from 'lucide-react'
import { useLanguage } from '../../utils/useLanguage'

interface ReadingTimeProps {
  content?: string
}

export default function ReadingTime({ content }: ReadingTimeProps) {
  const { t } = useLanguage()

  const getReadingTime = () => {
    if (!content) return 1
    const wordsPerMinute = 300
    const chineseChars = content.match(/[\u4e00-\u9fa5]/g)?.length || 0
    const englishWords = content.match(/\b\w+\b/g)?.length || 0
    const totalWords = chineseChars + englishWords / 2
    return Math.ceil(totalWords / wordsPerMinute) || 1
  }

  const minutes = getReadingTime()

  return (
    <span className="flex items-center text-sm">
      <Clock className="w-4 h-4 mr-1" />
      {t('minRead', { min: minutes })}
    </span>
  )
}

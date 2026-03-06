import React from 'react';

export default function ReadingTime({ content }) {
  const getReadingTime = () => {
    if (!content) return 1;
    const wordsPerMinute = 300;
    const chineseChars = content.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = content.match(/\b\w+\b/g)?.length || 0;
    const totalWords = chineseChars + englishWords / 2;
    return Math.ceil(totalWords / wordsPerMinute) || 1;
  };

  const minutes = getReadingTime();

  return (
    <span className="flex items-center text-sm">
      <span className="mr-1">📖</span>
      预计阅读 {minutes} 分钟
    </span>
  );
}

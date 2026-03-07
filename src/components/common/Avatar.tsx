import React, { useMemo } from 'react'

interface AvatarProps {
  userId?: string
  size?: number
  className?: string
}

/**
 * 用户头像组件
 * @param userId - 用户 ID，用于生成唯一的头像
 * @param size - 头像大小（像素），默认 40
 * @param className - 额外的 CSS 类名
 */
export default function Avatar({ userId, size = 40, className = '' }: AvatarProps) {
  const { letter, backgroundColor } = useMemo(() => generateAvatar(userId), [userId])

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.floor(size * 0.5),
        backgroundColor,
      }}
    >
      {letter}
    </div>
  )
}

/**
 * 根据用户 ID 生成唯一的字母和背景色
 */
function generateAvatar(userId: string | null | undefined) {
  if (!userId) {
    return { letter: '?', backgroundColor: '#999999' }
  }

  // 计算哈希值
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }

  // 26 个大写英文字母
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letterIndex = Math.abs(hash) % 26
  const letter = letters[letterIndex]

  // 使用 HSL 生成随机鲜艳的背景色
  // 色相：基于哈希值，范围 0-360
  // 饱和度：60%-80% 之间随机，让颜色鲜艳
  // 亮度：45%-55% 之间随机，保证足够的对比度
  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash >> 8) % 21) // 60-80
  const lightness = 45 + (Math.abs(hash >> 16) % 11) // 45-55
  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`

  return { letter, backgroundColor }
}

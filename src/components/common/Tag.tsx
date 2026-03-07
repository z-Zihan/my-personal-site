import { Tag } from 'antd'
import { useMemo } from 'react'

const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple']

const variants = ['filled', 'solid', 'outlined']

interface RandomTagProps {
  children: string
  color?: string
  variant?: 'filled' | 'solid' | 'outlined' | string
}

/**
 * 标签组件 - 随机选择颜色和样式
 * @param children - 标签内容
 * @param color - 可选的固定颜色，不传则随机
 * @param variant - 可选的固定样式，不传则随机
 */
function RandomTag({ children, color, variant }: RandomTagProps) {
  const tagConfig = useMemo(
    () => ({
      randomColor: color || colors[Math.floor(Math.random() * colors.length)],
      randomVariant: variant || variants[Math.floor(Math.random() * variants.length)],
    }),
    [color, variant]
  )

  return (
    <Tag color={tagConfig.randomColor} variant={tagConfig.randomVariant}>
      {children}
    </Tag>
  )
}

export default RandomTag

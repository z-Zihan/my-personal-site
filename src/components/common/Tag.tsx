import { useMemo } from 'react'

// antd 预设色板的 CSS 等价实现（原实现引入整个 antd 只为一个 Tag，
// 导致所有用文章卡片的页面被迫加载 1MB 的 antd chunk）
const colorMap: Record<string, string> = {
  magenta: '#eb2f96',
  red: '#f5222d',
  volcano: '#fa541c',
  orange: '#fa8c16',
  gold: '#faad14',
  lime: '#a0d911',
  green: '#52c41a',
  cyan: '#13c2c2',
  blue: '#1677ff',
  geekblue: '#2f54eb',
  purple: '#722ed1',
}

const variantList = ['filled', 'solid', 'outlined'] as const

interface RandomTagProps {
  children: string
  color?: string
  variant?: 'filled' | 'solid' | 'outlined' | string
}

/**
 * 标签组件 - 随机选择颜色和样式（纯 CSS 版，不依赖 antd）
 * @param children - 标签内容
 * @param color - 可选的固定颜色（antd 预设色名），不传则随机
 * @param variant - 可选的固定样式：filled / solid / outlined，不传则随机
 */
function RandomTag({ children, color, variant }: RandomTagProps) {
  const tagConfig = useMemo(() => {
    const names = Object.keys(colorMap)
    const name = color && colorMap[color] ? color : names[Math.floor(Math.random() * names.length)]
    const v = variantList.includes(variant as (typeof variantList)[number])
      ? (variant as (typeof variantList)[number])
      : variantList[Math.floor(Math.random() * variantList.length)]
    return { hex: colorMap[name], variant: v }
  }, [color, variant])

  const { hex, variant: v } = tagConfig

  const style: React.CSSProperties =
    v === 'solid'
      ? { backgroundColor: hex, color: '#fff' }
      : v === 'filled'
        ? { backgroundColor: `${hex}1f`, color: hex }
        : { backgroundColor: 'transparent', color: hex }

  return (
    <span
      style={{ ...style, borderColor: hex }}
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs leading-5 whitespace-nowrap"
    >
      {children}
    </span>
  )
}

export default RandomTag

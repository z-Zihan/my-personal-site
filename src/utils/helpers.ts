export function formatDate(dateString: string | number | Date): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateString: string | number | Date): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return formatDate(dateString)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// 常见中文国名 -> 英文，用于规范化「中文国名+英文城市」格式的位置
const COUNTRY_NAME_MAPPING: Record<string, string> = {
  阿根廷: 'Argentina', 丹麦: 'Denmark', 土耳其: 'Turkey', 哥伦比亚: 'Colombia',
  波兰: 'Poland', 美国: 'USA', 英国: 'UK', 德国: 'Germany', 法国: 'France',
  日本: 'Japan', 韩国: 'South Korea', 澳大利亚: 'Australia', 加拿大: 'Canada',
  印度: 'India', 巴西: 'Brazil', 墨西哥: 'Mexico', 荷兰: 'Netherlands',
  西班牙: 'Spain', 意大利: 'Italy', 瑞典: 'Sweden', 挪威: 'Norway', 芬兰: 'Finland',
  新加坡: 'Singapore', 泰国: 'Thailand', 马来西亚: 'Malaysia', 菲律宾: 'Philippines',
  印尼: 'Indonesia', 印度尼西亚: 'Indonesia', 越南: 'Vietnam', 俄罗斯: 'Russia',
  埃及: 'Egypt', 南非: 'South Africa', 新西兰: 'New Zealand', 爱尔兰: 'Ireland',
  瑞士: 'Switzerland', 奥地利: 'Austria', 比利时: 'Belgium', 葡萄牙: 'Portugal',
  希腊: 'Greece', 捷克: 'Czechia', 以色列: 'Israel', 阿联酋: 'UAE', 智利: 'Chile',
  阿鲁巴: 'Aruba', 中国: 'China', 香港: 'Hong Kong', 台湾: 'Taiwan', 澳门: 'Macau',
  秘鲁: 'Peru', 乌克兰: 'Ukraine', 匈牙利: 'Hungary', 罗马尼亚: 'Romania',
  沙特阿拉伯: 'Saudi Arabia', 巴基斯坦: 'Pakistan', 孟加拉国: 'Bangladesh',
}

/**
 * 规范化位置显示：
 * - 「中文国名+英文城市」（如 阿根廷Buenos Aires）-> 'Buenos Aires, Argentina'
 * - 国名不在映射表、纯中文（青岛 市南区）、已是英文（Rome, Italy）原样返回
 */
export function formatLocation(location: string | null | undefined): string {
  if (!location) return ''
  const trimmed = location.trim()
  const match = trimmed.match(/^([\u4e00-\u9fff]+)\s*([A-Za-z].*)$/)
  if (!match) return trimmed
  const country = COUNTRY_NAME_MAPPING[match[1]]
  if (!country) return trimmed
  const city = match[2].trim().replace(/^,\s*/, '')
  return `${city}, ${country}`
}

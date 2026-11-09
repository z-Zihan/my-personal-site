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

/**
 * 相对时间：30 天内显示「N天前 / Nd ago」，超过 30 天显示 YYYY/MM/DD
 * @param lang - 文案语言，默认 zh
 */
export function formatRelativeTime(
  dateString: string | number | Date,
  lang: 'zh' | 'en' = 'zh'
): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diff = Math.max(0, now.getTime() - date.getTime())

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const isZh = lang === 'zh'

  if (minutes < 1) return isZh ? '刚刚' : 'just now'
  if (minutes < 60) return isZh ? `${minutes}分钟前` : `${minutes}m ago`
  if (hours < 24) return isZh ? `${hours}小时前` : `${hours}h ago`
  if (days <= 30) return isZh ? `${days}天前` : `${days}d ago`

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
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

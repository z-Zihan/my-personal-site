// 国家代码/英文名 → 中文名映射(后台展示用)
// ISO 3166-1 alpha-2 两位码 + 常见英文国名,覆盖 Vercel 地理头返回的主要国家

const COUNTRY_ZH: Record<string, string> = {
  // 两位代码
  CN: '中国', TW: '中国台湾', HK: '中国香港', MO: '中国澳门',
  US: '美国', GB: '英国', JP: '日本', KR: '韩国', SG: '新加坡',
  DE: '德国', FR: '法国', IT: '意大利', ES: '西班牙', PT: '葡萄牙',
  NL: '荷兰', BE: '比利时', CH: '瑞士', AT: '奥地利', SE: '瑞典',
  NO: '挪威', DK: '丹麦', FI: '芬兰', IS: '冰岛', IE: '爱尔兰',
  PL: '波兰', CZ: '捷克', SK: '斯洛伐克', HU: '匈牙利', RO: '罗马尼亚',
  BG: '保加利亚', GR: '希腊', RU: '俄罗斯', UA: '乌克兰',
  IN: '印度', ID: '印度尼西亚', MY: '马来西亚', TH: '泰国', VN: '越南',
  PH: '菲律宾', MM: '缅甸', KH: '柬埔寨', LA: '老挝', BD: '孟加拉国',
  LK: '斯里兰卡', NP: '尼泊尔', PK: '巴基斯坦',
  CA: '加拿大', MX: '墨西哥', BR: '巴西', AR: '阿根廷', CL: '智利',
  CO: '哥伦比亚', PE: '秘鲁', UY: '乌拉圭',
  AU: '澳大利亚', NZ: '新西兰',
  ZA: '南非', EG: '埃及', NG: '尼日利亚', KE: '肯尼亚', MA: '摩洛哥',
  AE: '阿联酋', SA: '沙特阿拉伯', IL: '以色列', TR: '土耳其', IR: '伊朗',
  QA: '卡塔尔', KW: '科威特',
  // 常见英文国名(ECharts 地图/老数据用)
  China: '中国', 'United States': '美国', USA: '美国', Japan: '日本',
  'United Kingdom': '英国', Germany: '德国', France: '法国', Korea: '韩国',
  'South Korea': '韩国', Singapore: '新加坡', Canada: '加拿大',
  Australia: '澳大利亚', Brazil: '巴西', India: '印度', Russia: '俄罗斯',
  Netherlands: '荷兰', Italy: '意大利', Spain: '西班牙', Mexico: '墨西哥',
  Indonesia: '印度尼西亚', Malaysia: '马来西亚', Thailand: '泰国',
  Vietnam: '越南', Philippines: '菲律宾', 'Saudi Arabia': '沙特阿拉伯',
  'United Arab Emirates': '阿联酋', Turkey: '土耳其', Switzerland: '瑞士',
  Sweden: '瑞典', Norway: '挪威', Denmark: '丹麦', Finland: '芬兰',
  Poland: '波兰', Israel: '以色列', 'Hong Kong': '中国香港',
  Taiwan: '中国台湾', 'South Africa': '南非', Egypt: '埃及',
  'New Zealand': '新西兰', Argentina: '阿根廷', Portugal: '葡萄牙',
  Ireland: '爱尔兰', Belgium: '比利时', Austria: '奥地利',
  Ukraine: '乌克兰', Pakistan: '巴基斯坦', 'Sri Lanka': '斯里兰卡',
  Cambodia: '柬埔寨', Myanmar: '缅甸', Laos: '老挝', Nepal: '尼泊尔',
}

/** 国家代码/英文名 → 中文名;未收录时返回原值 */
export function countryToZh(name: string | null | undefined): string {
  if (!name) return '未知'
  const key = name.trim()
  if (!key || key.toLowerCase() === 'unknown') return '未知'
  return COUNTRY_ZH[key] || COUNTRY_ZH[key.toUpperCase()] || key
}

export default COUNTRY_ZH

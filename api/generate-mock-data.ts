import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

// ============================================
// 地理位置数据（与 moke-data.sql 保持一致，覆盖全球 40+ 国家）
// ============================================
interface RegionData {
  name: string
  cities: string[]
  timezone?: string
}

interface GeographicData {
  country: string
  countryCn: string
  language: string
  timezone: string
  regions: RegionData[]
  ipPrefixes: string[]
}

const geographicData: GeographicData[] = [
  {
    country: 'China',
    countryCn: '中国',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    regions: [
      { name: 'Beijing', cities: ['Beijing'] },
      { name: 'Shanghai', cities: ['Shanghai'] },
      { name: 'Guangdong', cities: ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan'] },
      { name: 'Zhejiang', cities: ['Hangzhou', 'Ningbo', 'Wenzhou'] },
      { name: 'Jiangsu', cities: ['Nanjing', 'Suzhou', 'Wuxi'] },
      { name: 'Sichuan', cities: ['Chengdu', 'Mianyang'] },
      { name: 'Hubei', cities: ['Wuhan', 'Yichang'] },
      { name: 'Shaanxi', cities: ['Xian', 'Baoji'] },
      { name: 'Shandong', cities: ['Qingdao', 'Jinan', 'Yantai'] },
      { name: 'Fujian', cities: ['Xiamen', 'Fuzhou'] },
      { name: 'Hunan', cities: ['Changsha', 'Zhuzhou'] },
      { name: 'Henan', cities: ['Zhengzhou', 'Luoyang'] },
    ],
    ipPrefixes: ['116', '118', '120', '119', '121', '122', '123', '124', '125', '126'],
  },
  {
    country: 'United States',
    countryCn: '美国',
    language: 'en-US',
    timezone: 'America/New_York',
    regions: [
      { name: 'California', cities: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose'], timezone: 'America/Los_Angeles' },
      { name: 'New York', cities: ['New York', 'Buffalo', 'Brooklyn'], timezone: 'America/New_York' },
      { name: 'Washington', cities: ['Seattle', 'Tacoma', 'Bellevue'], timezone: 'America/Los_Angeles' },
      { name: 'Texas', cities: ['Austin', 'Houston', 'Dallas', 'San Antonio'], timezone: 'America/Chicago' },
      { name: 'Massachusetts', cities: ['Boston', 'Cambridge'], timezone: 'America/New_York' },
      { name: 'Illinois', cities: ['Chicago', 'Springfield'], timezone: 'America/Chicago' },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa'], timezone: 'America/New_York' },
      { name: 'Colorado', cities: ['Denver', 'Boulder'], timezone: 'America/Denver' },
      { name: 'Arizona', cities: ['Phoenix', 'Tucson'], timezone: 'America/Phoenix' },
      { name: 'Georgia', cities: ['Atlanta', 'Savannah'], timezone: 'America/New_York' },
    ],
    ipPrefixes: ['192.168', '10.0', '172.16', '8.8', '8.10'],
  },
  {
    country: 'Japan',
    countryCn: '日本',
    language: 'ja-JP',
    timezone: 'Asia/Tokyo',
    regions: [
      { name: 'Tokyo', cities: ['Tokyo', 'Shinjuku', 'Shibuya', 'Ginza'] },
      { name: 'Osaka', cities: ['Osaka', 'Sakai'] },
      { name: 'Kyoto', cities: ['Kyoto'] },
      { name: 'Hokkaido', cities: ['Sapporo', 'Otaru'] },
      { name: 'Fukuoka', cities: ['Fukuoka', 'Kitakyushu'] },
      { name: 'Aichi', cities: ['Nagoya'] },
    ],
    ipPrefixes: ['133.1', '133.2', '133.3', '133.4'],
  },
  {
    country: 'South Korea',
    countryCn: '韩国',
    language: 'ko-KR',
    timezone: 'Asia/Seoul',
    regions: [
      { name: 'Seoul', cities: ['Seoul', 'Gangnam'] },
      { name: 'Busan', cities: ['Busan'] },
      { name: 'Incheon', cities: ['Incheon'] },
      { name: 'Daegu', cities: ['Daegu'] },
      { name: 'Daejeon', cities: ['Daejeon'] },
    ],
    ipPrefixes: ['14.1', '14.2', '14.3', '14.4'],
  },
  {
    country: 'Germany',
    countryCn: '德国',
    language: 'de-DE',
    timezone: 'Europe/Berlin',
    regions: [
      { name: 'Berlin', cities: ['Berlin'] },
      { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Stuttgart'] },
      { name: 'Hamburg', cities: ['Hamburg'] },
      { name: 'Hesse', cities: ['Frankfurt'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Dusseldorf', 'Dortmund'] },
    ],
    ipPrefixes: ['217.1', '217.2', '217.3', '217.4'],
  },
  {
    country: 'United Kingdom',
    countryCn: '英国',
    language: 'en-GB',
    timezone: 'Europe/London',
    regions: [
      { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow'] },
      { name: 'Wales', cities: ['Cardiff'] },
    ],
    ipPrefixes: ['51.1', '51.2', '51.3', '51.4'],
  },
  {
    country: 'France',
    countryCn: '法国',
    language: 'fr-FR',
    timezone: 'Europe/Paris',
    regions: [
      { name: 'Ile-de-France', cities: ['Paris'] },
      { name: 'Auvergne-Rhone-Alpes', cities: ['Lyon', 'Grenoble'] },
      { name: 'Provence-Alpes-Cote dAzur', cities: ['Marseille', 'Nice', 'Cannes'] },
      { name: 'Occitanie', cities: ['Toulouse', 'Montpellier'] },
    ],
    ipPrefixes: ['163.1', '163.2', '163.3'],
  },
  {
    country: 'India',
    countryCn: '印度',
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
    regions: [
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune'] },
      { name: 'Karnataka', cities: ['Bangalore'] },
      { name: 'Delhi', cities: ['New Delhi'] },
      { name: 'Tamil Nadu', cities: ['Chennai'] },
      { name: 'West Bengal', cities: ['Kolkata'] },
      { name: 'Telangana', cities: ['Hyderabad'] },
      { name: 'Gujarat', cities: ['Ahmedabad'] },
    ],
    ipPrefixes: ['103.1', '103.2', '103.3', '103.4', '103.5'],
  },
  {
    country: 'Australia',
    countryCn: '澳大利亚',
    language: 'en-AU',
    timezone: 'Australia/Sydney',
    regions: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle'], timezone: 'Australia/Sydney' },
      { name: 'Victoria', cities: ['Melbourne'], timezone: 'Australia/Melbourne' },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast'], timezone: 'Australia/Brisbane' },
      { name: 'Western Australia', cities: ['Perth'], timezone: 'Australia/Perth' },
    ],
    ipPrefixes: ['203.1', '203.2', '203.3'],
  },
  {
    country: 'Canada',
    countryCn: '加拿大',
    language: 'en-CA',
    timezone: 'America/Toronto',
    regions: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa'], timezone: 'America/Toronto' },
      { name: 'British Columbia', cities: ['Vancouver', 'Victoria'], timezone: 'America/Vancouver' },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City'], timezone: 'America/Montreal' },
      { name: 'Alberta', cities: ['Calgary', 'Edmonton'], timezone: 'America/Edmonton' },
    ],
    ipPrefixes: ['99.1', '99.2', '99.3'],
  },
  {
    country: 'Brazil',
    countryCn: '巴西',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    regions: [
      { name: 'Sao Paulo', cities: ['Sao Paulo', 'Campinas'] },
      { name: 'Rio de Janeiro', cities: ['Rio de Janeiro'] },
      { name: 'Distrito Federal', cities: ['Brasilia'] },
      { name: 'Minas Gerais', cities: ['Belo Horizonte'] },
    ],
    ipPrefixes: ['177.1', '177.2', '177.3'],
  },
  {
    country: 'Russia',
    countryCn: '俄罗斯',
    language: 'ru-RU',
    timezone: 'Europe/Moscow',
    regions: [
      { name: 'Moscow', cities: ['Moscow'], timezone: 'Europe/Moscow' },
      { name: 'Saint Petersburg', cities: ['Saint Petersburg'], timezone: 'Europe/Moscow' },
      { name: 'Novosibirsk', cities: ['Novosibirsk'], timezone: 'Asia/Novosibirsk' },
      { name: 'Sverdlovsk', cities: ['Yekaterinburg'], timezone: 'Asia/Yekaterinburg' },
    ],
    ipPrefixes: ['5.1', '5.2', '5.3', '5.4'],
  },
  {
    country: 'Singapore',
    countryCn: '新加坡',
    language: 'en-SG',
    timezone: 'Asia/Singapore',
    regions: [
      { name: 'Singapore', cities: ['Singapore'] },
    ],
    ipPrefixes: ['103.10', '103.11', '103.12'],
  },
  {
    country: 'Netherlands',
    countryCn: '荷兰',
    language: 'nl-NL',
    timezone: 'Europe/Amsterdam',
    regions: [
      { name: 'North Holland', cities: ['Amsterdam', 'Haarlem'] },
      { name: 'South Holland', cities: ['Rotterdam', 'The Hague'] },
      { name: 'Utrecht', cities: ['Utrecht'] },
    ],
    ipPrefixes: ['145.1', '145.2'],
  },
  {
    country: 'Spain',
    countryCn: '西班牙',
    language: 'es-ES',
    timezone: 'Europe/Madrid',
    regions: [
      { name: 'Madrid', cities: ['Madrid'] },
      { name: 'Catalonia', cities: ['Barcelona'] },
      { name: 'Andalusia', cities: ['Seville', 'Malaga'] },
      { name: 'Valencia', cities: ['Valencia'] },
    ],
    ipPrefixes: ['88.1', '88.2'],
  },
  {
    country: 'Italy',
    countryCn: '意大利',
    language: 'it-IT',
    timezone: 'Europe/Rome',
    regions: [
      { name: 'Lazio', cities: ['Rome'] },
      { name: 'Lombardy', cities: ['Milan'] },
      { name: 'Tuscany', cities: ['Florence'] },
      { name: 'Veneto', cities: ['Venice'] },
    ],
    ipPrefixes: ['93.1', '93.2'],
  },
  {
    country: 'Poland',
    countryCn: '波兰',
    language: 'pl-PL',
    timezone: 'Europe/Warsaw',
    regions: [
      { name: 'Masovia', cities: ['Warsaw'] },
      { name: 'Lesser Poland', cities: ['Krakow'] },
      { name: 'Silesia', cities: ['Katowice'] },
    ],
    ipPrefixes: ['79.1', '79.2'],
  },
  {
    country: 'Sweden',
    countryCn: '瑞典',
    language: 'sv-SE',
    timezone: 'Europe/Stockholm',
    regions: [
      { name: 'Stockholm', cities: ['Stockholm'] },
      { name: 'Vastra Gotaland', cities: ['Gothenburg'] },
      { name: 'Skane', cities: ['Malmo'] },
    ],
    ipPrefixes: ['185.1', '185.2'],
  },
  {
    country: 'Turkey',
    countryCn: '土耳其',
    language: 'tr-TR',
    timezone: 'Europe/Istanbul',
    regions: [
      { name: 'Istanbul', cities: ['Istanbul'] },
      { name: 'Ankara', cities: ['Ankara'] },
      { name: 'Izmir', cities: ['Izmir'] },
    ],
    ipPrefixes: ['78.1', '78.2'],
  },
  {
    country: 'Mexico',
    countryCn: '墨西哥',
    language: 'es-MX',
    timezone: 'America/Mexico_City',
    regions: [
      { name: 'Mexico City', cities: ['Mexico City'] },
      { name: 'Jalisco', cities: ['Guadalajara'] },
      { name: 'Nuevo Leon', cities: ['Monterrey'] },
    ],
    ipPrefixes: ['189.1', '189.2'],
  },
  {
    country: 'Indonesia',
    countryCn: '印度尼西亚',
    language: 'id-ID',
    timezone: 'Asia/Jakarta',
    regions: [
      { name: 'Jakarta', cities: ['Jakarta'] },
      { name: 'West Java', cities: ['Bandung'] },
      { name: 'East Java', cities: ['Surabaya'] },
      { name: 'Bali', cities: ['Denpasar'] },
    ],
    ipPrefixes: ['202.1', '202.2'],
  },
  {
    country: 'Thailand',
    countryCn: '泰国',
    language: 'th-TH',
    timezone: 'Asia/Bangkok',
    regions: [
      { name: 'Bangkok', cities: ['Bangkok'] },
      { name: 'Chiang Mai', cities: ['Chiang Mai'] },
      { name: 'Phuket', cities: ['Phuket'] },
    ],
    ipPrefixes: ['110.1', '110.2'],
  },
  {
    country: 'Vietnam',
    countryCn: '越南',
    language: 'vi-VN',
    timezone: 'Asia/Ho_Chi_Minh',
    regions: [
      { name: 'Ho Chi Minh', cities: ['Ho Chi Minh City'] },
      { name: 'Hanoi', cities: ['Hanoi'] },
      { name: 'Da Nang', cities: ['Da Nang'] },
    ],
    ipPrefixes: ['113.1', '113.2'],
  },
  {
    country: 'Taiwan',
    countryCn: '台湾',
    language: 'zh-TW',
    timezone: 'Asia/Taipei',
    regions: [
      { name: 'Taipei', cities: ['Taipei', 'New Taipei'] },
      { name: 'Kaohsiung', cities: ['Kaohsiung'] },
      { name: 'Taichung', cities: ['Taichung'] },
    ],
    ipPrefixes: ['61.1', '61.2'],
  },
  {
    country: 'Hong Kong',
    countryCn: '香港',
    language: 'zh-HK',
    timezone: 'Asia/Hong_Kong',
    regions: [
      { name: 'Hong Kong Island', cities: ['Hong Kong'] },
      { name: 'Kowloon', cities: ['Kowloon'] },
    ],
    ipPrefixes: ['203.1', '203.2'],
  },
  {
    country: 'Switzerland',
    countryCn: '瑞士',
    language: 'de-CH',
    timezone: 'Europe/Zurich',
    regions: [
      { name: 'Zurich', cities: ['Zurich'] },
      { name: 'Geneva', cities: ['Geneva'] },
      { name: 'Bern', cities: ['Bern'] },
    ],
    ipPrefixes: ['159.1', '159.2'],
  },
  {
    country: 'Austria',
    countryCn: '奥地利',
    language: 'de-AT',
    timezone: 'Europe/Vienna',
    regions: [
      { name: 'Vienna', cities: ['Vienna'] },
      { name: 'Salzburg', cities: ['Salzburg'] },
      { name: 'Tyrol', cities: ['Innsbruck'] },
    ],
    ipPrefixes: ['77.1', '77.2'],
  },
  {
    country: 'Belgium',
    countryCn: '比利时',
    language: 'nl-BE',
    timezone: 'Europe/Brussels',
    regions: [
      { name: 'Brussels', cities: ['Brussels'] },
      { name: 'Flanders', cities: ['Antwerp', 'Ghent'] },
    ],
    ipPrefixes: ['81.1', '81.2'],
  },
  {
    country: 'Ireland',
    countryCn: '爱尔兰',
    language: 'en-IE',
    timezone: 'Europe/Dublin',
    regions: [
      { name: 'Leinster', cities: ['Dublin'] },
      { name: 'Munster', cities: ['Cork'] },
    ],
    ipPrefixes: ['87.1', '87.2'],
  },
  {
    country: 'Norway',
    countryCn: '挪威',
    language: 'nb-NO',
    timezone: 'Europe/Oslo',
    regions: [
      { name: 'Oslo', cities: ['Oslo'] },
      { name: 'Hordaland', cities: ['Bergen'] },
    ],
    ipPrefixes: ['95.1', '95.2'],
  },
  {
    country: 'Denmark',
    countryCn: '丹麦',
    language: 'da-DK',
    timezone: 'Europe/Copenhagen',
    regions: [
      { name: 'Capital Region', cities: ['Copenhagen'] },
      { name: 'Central Denmark', cities: ['Aarhus'] },
    ],
    ipPrefixes: ['86.1', '86.2'],
  },
  {
    country: 'Finland',
    countryCn: '芬兰',
    language: 'fi-FI',
    timezone: 'Europe/Helsinki',
    regions: [
      { name: 'Uusimaa', cities: ['Helsinki'] },
      { name: 'Pirkanmaa', cities: ['Tampere'] },
    ],
    ipPrefixes: ['91.1', '91.2'],
  },
  {
    country: 'Portugal',
    countryCn: '葡萄牙',
    language: 'pt-PT',
    timezone: 'Europe/Lisbon',
    regions: [
      { name: 'Lisbon', cities: ['Lisbon'] },
      { name: 'Porto', cities: ['Porto'] },
    ],
    ipPrefixes: ['85.1', '85.2'],
  },
  {
    country: 'Czech Republic',
    countryCn: '捷克',
    language: 'cs-CZ',
    timezone: 'Europe/Prague',
    regions: [
      { name: 'Prague', cities: ['Prague'] },
      { name: 'South Moravian', cities: ['Brno'] },
    ],
    ipPrefixes: ['89.1', '89.2'],
  },
  {
    country: 'Argentina',
    countryCn: '阿根廷',
    language: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
    regions: [
      { name: 'Buenos Aires', cities: ['Buenos Aires'] },
      { name: 'Cordoba', cities: ['Cordoba'] },
    ],
    ipPrefixes: ['181.1', '181.2'],
  },
  {
    country: 'Chile',
    countryCn: '智利',
    language: 'es-CL',
    timezone: 'America/Santiago',
    regions: [
      { name: 'Santiago Metropolitan', cities: ['Santiago'] },
      { name: 'Valparaiso', cities: ['Valparaiso'] },
    ],
    ipPrefixes: ['200.1', '200.2'],
  },
  {
    country: 'Colombia',
    countryCn: '哥伦比亚',
    language: 'es-CO',
    timezone: 'America/Bogota',
    regions: [
      { name: 'Bogota', cities: ['Bogota'] },
      { name: 'Antioquia', cities: ['Medellin'] },
    ],
    ipPrefixes: ['186.1', '186.2'],
  },
  {
    country: 'South Africa',
    countryCn: '南非',
    language: 'en-ZA',
    timezone: 'Africa/Johannesburg',
    regions: [
      { name: 'Gauteng', cities: ['Johannesburg', 'Pretoria'] },
      { name: 'Western Cape', cities: ['Cape Town'] },
    ],
    ipPrefixes: ['165.1', '165.2'],
  },
  {
    country: 'UAE',
    countryCn: '阿联酋',
    language: 'ar-AE',
    timezone: 'Asia/Dubai',
    regions: [
      { name: 'Dubai', cities: ['Dubai'] },
      { name: 'Abu Dhabi', cities: ['Abu Dhabi'] },
    ],
    ipPrefixes: ['94.1', '94.2'],
  },
  {
    country: 'Saudi Arabia',
    countryCn: '沙特阿拉伯',
    language: 'ar-SA',
    timezone: 'Asia/Riyadh',
    regions: [
      { name: 'Riyadh', cities: ['Riyadh'] },
      { name: 'Makkah', cities: ['Jeddah', 'Mecca'] },
    ],
    ipPrefixes: ['188.1', '188.2'],
  },
  {
    country: 'Israel',
    countryCn: '以色列',
    language: 'he-IL',
    timezone: 'Asia/Jerusalem',
    regions: [
      { name: 'Tel Aviv', cities: ['Tel Aviv'] },
      { name: 'Jerusalem', cities: ['Jerusalem'] },
    ],
    ipPrefixes: ['109.1', '109.2'],
  },
  {
    country: 'New Zealand',
    countryCn: '新西兰',
    language: 'en-NZ',
    timezone: 'Pacific/Auckland',
    regions: [
      { name: 'Auckland', cities: ['Auckland'] },
      { name: 'Wellington', cities: ['Wellington'] },
    ],
    ipPrefixes: ['156.1', '156.2'],
  },
  {
    country: 'Philippines',
    countryCn: '菲律宾',
    language: 'en-PH',
    timezone: 'Asia/Manila',
    regions: [
      { name: 'Metro Manila', cities: ['Manila'] },
      { name: 'Cebu', cities: ['Cebu City'] },
    ],
    ipPrefixes: ['112.1', '112.2'],
  },
  {
    country: 'Malaysia',
    countryCn: '马来西亚',
    language: 'ms-MY',
    timezone: 'Asia/Kuala_Lumpur',
    regions: [
      { name: 'Kuala Lumpur', cities: ['Kuala Lumpur'] },
      { name: 'Selangor', cities: ['Petaling Jaya'] },
      { name: 'Penang', cities: ['George Town'] },
    ],
    ipPrefixes: ['175.1', '175.2'],
  },
]

// ============================================
// 扩展的随机数据选项
// ============================================

// 留言昵称（更丰富）
const visitorNames = [
  // 中文昵称
  '张三', '李四', '王五', '赵六', '小明', '小红', '小刚', '小芳',
  '游客A', '访客B', '路人甲', '过客', '旅行者', '探索者', '追梦人',
  '码农小张', '前端小白', '后端大神', '全栈工程师', '产品经理',
  '设计师', '测试工程师', '运维小哥', '架构师', '技术总监',
  // 英文昵称
  'John', 'Mike', 'Sarah', 'Emily', 'David', 'Lisa', 'Tom', 'Jerry',
  'Alex', 'Chris', 'Kevin', 'Eric', 'Daniel', 'James', 'Robert',
  'Alice', 'Betty', 'Cathy', 'Diana', 'Emma', 'Fiona', 'Grace',
  // 日文昵称
  'Yuki', 'Sakura', 'Hana', 'Ren', 'Kaito', 'Haruto', 'Sora',
  // 韩文昵称
  'Min-jun', 'Ji-woo', 'Seo-jun', 'Ha-eun', 'Do-yun',
  // 网络昵称
  'Coder2024', 'DevMaster', 'TechLover', 'CodeNinja', 'WebWizard',
  'FrontendFan', 'BackendBoss', 'FullStackPro', 'JavaScriptJedi',
]

// 留言内容（更丰富，分类）
const messageContents = {
  praise: [
    '这个博客真不错！',
    '文章写得很好，学到了很多！',
    '博主厉害！',
    '写得真棒！',
    '这个知识点讲得很清楚',
    '非常感谢博主的分享！',
    '文章质量很高，收藏了！',
    '终于找到了靠谱的教程！',
    '博主加油！持续关注中',
    '界面设计很漂亮，喜欢！',
    '内容充实，干货满满！',
    '这是我看过最好的解释了！',
  ],
  question: [
    '请问这个功能怎么实现的？',
    '能详细解释一下第二点吗？',
    '有没有相关的代码示例？',
    '这个方案有什么缺点吗？',
    '生产环境怎么部署呢？',
    '有没有性能测试数据？',
    '能分享一下项目地址吗？',
    '这个技术栈学习路线是什么？',
  ],
  discussion: [
    '我觉得还可以用另一种方式实现...',
    '我也遇到了类似的问题，分享一下我的解决方案...',
    '关于这个问题，我有一些补充...',
    '之前我也研究过这个，发现...',
    '有个相关的库推荐给大家...',
    '建议博主可以补充一下...',
  ],
  thanks: [
    '感谢分享，已收藏～',
    '刚好解决了我的问题，谢谢！',
    '帮大忙了，非常感谢！',
    '看完豁然开朗，感谢博主！',
    '这个问题困扰我很久，终于解决了！',
    '收藏了，以后用得上',
  ],
  expectation: [
    '期待更多文章～',
    '希望能出更多教程',
    '坐等更新！',
    '博主更新太慢了，催更！',
    '建议写一个系列文章',
    '期待后续深入讲解',
  ],
  casual: [
    '测试一下留言功能',
    '打卡打卡～',
    '从首页路过，留个言',
    '支持一下博主',
    '第一次来，支持！',
    '老粉来报到了',
  ],
}

// 留言位置（使用地理位置数据生成）
const getMessageLocation = (countryData: GeographicData, regionData: RegionData, city: string) => {
  return `${countryData.countryCn}${regionData.name === city ? '' : regionData.name}${city}`
}

// 文章标题（与 moke-data.sql 一致，更丰富）
const articleTitles = [
  'React Hooks 深度解析：从入门到精通',
  'TypeScript 5.0 新特性全面解析',
  'CSS Grid 布局完全指南：打造现代网页布局',
  'Vue 3 Composition API 最佳实践',
  'JavaScript 异步编程：从 Callback 到 Async/Await',
  'Next.js 14 App Router 完全指南',
  'Vite 构建性能优化实战',
  'Tailwind CSS 实战技巧大全',
  '前端安全攻防：XSS 与 CSRF 防护',
  '微前端架构实践：从理论到落地',
  'WebGL 入门教程：打造 3D 网页效果',
  '前端自动化测试实践：Jest 与 Cypress',
  '移动端适配方案总结：从 rem 到 vw',
  '性能监控与优化：打造极速体验',
  '代码规范与团队协作：ESLint 与 Prettier',
  '深入理解 JavaScript 闭包',
  'React 性能优化完全指南',
  'Node.js 性能优化技巧',
  '前端工程化实践总结',
  'Webpack5 配置优化详解',
  'Git 工作流最佳实践',
  'Docker 容器化部署前端应用',
  'GraphQL API 设计与实践',
  'WebSocket 实时通信详解',
  'PWA 渐进式 Web 应用开发',
  'Serverless 架构实战',
  '低代码平台开发实践',
  '前端监控系统搭建',
  '国际化 i18n 解决方案',
  '暗黑模式实现方案',
]

// 文章摘要
const articleSummaries = [
  '本文将深入探讨这个主题的核心概念，帮助读者建立完整的知识体系。',
  '通过实际案例讲解，让你快速掌握这项技术的精髓。',
  '从原理到实践，全面解析技术要点和最佳实践。',
  '结合项目经验，分享实用的技巧和避坑指南。',
  '适合初学者入门，也适合有经验的开发者查漏补缺。',
  '一文带你从零开始掌握这项技术，实战案例丰富。',
  '深度剖析技术原理，助你成为该领域的专家。',
  '汇集多年开发经验，分享实战中的踩坑与解决方案。',
  '从基础概念到高级应用，循序渐进地讲解核心知识点。',
  '对比分析多种方案，帮助你做出最佳技术选型。',
]

// 文章内容模板（更真实的内容结构）
const articleContents = [
  `# 引言

在前端开发中，这是一个非常重要的话题。本文将从基础概念讲起，逐步深入到高级应用场景。

## 核心概念

首先，我们需要理解几个关键概念：

1. **第一个概念** - 这是基础中的基础
2. **第二个概念** - 涉及到更深层的原理
3. **第三个概念** - 实际应用中最为关键

## 实际应用

在实际项目中，我们通常会这样使用：

\`\`\`javascript
const example = () => {
  console.log('Hello World')
  return { success: true }
}
\`\`\`

## 注意事项

- 性能问题：需要注意内存泄漏
- 兼容性问题：需要考虑浏览器支持
- 最佳实践：遵循社区规范

## 总结

通过本文的学习，相信大家已经有了更深入的理解。欢迎在评论区交流讨论！`,

  `# 前言

作为一名前端开发者，掌握这项技能是必不可少的。今天就来分享一下我的学习心得。

## 基础知识

这部分内容相对简单，主要涉及以下几点：

- 要点一：理解基本语法
- 要点二：掌握核心 API
- 要点三：熟悉常见模式

## 进阶技巧

当你熟悉基础后，可以尝试这些高级用法：

\`\`\`typescript
interface Config {
  name: string
  version: string
  options?: Record<string, unknown>
}

const createConfig = (config: Config) => {
  return { ...config, createdAt: Date.now() }
}
\`\`\`

## 实战案例

让我们通过一个实际案例来加深理解：

1. 首先定义需求
2. 然后设计方案
3. 最后实现代码

## 结语

希望这篇文章对你有所帮助，有问题欢迎留言讨论！`,

  `# 概述

现代前端开发中，这个技术已经被广泛应用。让我们一起来了解它的工作原理。

## 技术原理

从底层实现来看，主要包括以下几个步骤：

1. **初始化阶段** - 准备必要的资源和配置
2. **处理阶段** - 执行核心逻辑
3. **输出阶段** - 返回处理结果

## 代码示例

下面是一个简单的示例：

\`\`\`jsx
function App() {
  const [state, setState] = useState(null)

  useEffect(() => {
    // 初始化逻辑
  }, [])

  return <div>Hello World</div>
}
\`\`\`

## 性能优化

在使用过程中，需要注意以下几点：

- 使用 memo 减少不必要的渲染
- 合理使用 useCallback 和 useMemo
- 避免在渲染函数中创建新对象

## 参考资料

- [官方文档](https://example.com)
- [社区讨论](https://example.com)
- [相关书籍]《深入浅出》`,
]

// 文章封面图片
const articleCovers = [
  'https://images.unsplash.com/photo-1633356122102-3fe601e157f1?w=800',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
  'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
]

// 浏览器列表
const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Samsung Internet', 'UC Browser']

// 操作系统列表
const osList = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Chrome OS', 'Windows Phone']

// 设备类型
const deviceTypes = ['desktop', 'mobile', 'tablet']

// 屏幕分辨率
const screenResolutions = ['1920x1080', '2560x1440', '1366x768', '3840x2160', '1536x864', '1440x900', '375x812', '414x896', '768x1024', '1280x720', '2560x1080', '1680x1050']

// 页面路径（与 moke-data.sql 一致，使用 /articles 而非 /blog）
const pagePaths = [
  { path: '/', title: 'MyBlog - 个人博客' },
  { path: '/articles', title: '文章列表 - MyBlog' },
  { path: '/message', title: '留言板 - MyBlog' },
  { path: '/hot-news', title: '热点新闻 - MyBlog' },
  { path: '/profile', title: '个人中心 - MyBlog' },
  { path: '/articles/react-hooks', title: 'React Hooks 深度解析' },
  { path: '/articles/typescript-5', title: 'TypeScript 5.0 新特性' },
  { path: '/articles/nextjs-14', title: 'Next.js 14 完全指南' },
  { path: '/articles/css-grid', title: 'CSS Grid 完全指南' },
  { path: '/articles/vue-3', title: 'Vue 3 Composition API' },
  { path: '/articles/async-js', title: 'JavaScript 异步编程' },
  { path: '/articles/vite', title: 'Vite 构建性能优化' },
  { path: '/articles/tailwind', title: 'Tailwind CSS 指南' },
  { path: '/articles/performance', title: '前端性能优化指南' },
  { path: '/articles/security', title: '前端安全攻防' },
]

// Referrer 来源（与 moke-data.sql 一致）
const referrers = [
  'google.com', 'baidu.com', 'bing.com', 'yahoo.com',
  'github.com', 'twitter.com', 'facebook.com', 'linkedin.com',
  'reddit.com', 'medium.com', 'dev.to', 'stackoverflow.com',
  'google.co.jp', 'google.co.kr', 'naver.com', 'yahoo.co.jp',
  null, // 直接访问
]

// 事件类型
const eventTypes = ['click', 'scroll', 'view', 'submit', 'hover', 'focus', 'blur', 'change']

// 事件名称
const eventNames = [
  'button_click', 'link_click', 'form_submit', 'page_scroll',
  'card_view', 'search', 'share', 'like', 'bookmark',
  'comment_submit', 'theme_toggle', 'language_change',
  'pagination_click', 'filter_apply', 'sort_change',
]

// 元素选择器
const elementSelectors = [
  '#submit-btn', '.article-card', '#search-input', '.nav-link',
  '#like-btn', '.share-btn', '.comment-form', '#load-more',
  '.pagination-btn', '.filter-option', '.sort-select',
  '#theme-toggle', '.menu-item', '.sidebar-link',
]

// ============================================
// Mock 数据生成器
// ============================================
const mockGenerators = {
  // 生成留言数据
  messages: async (count: number) => {
    const messages = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      // 随机选择地理位置
      const countryData = geographicData[Math.floor(Math.random() * geographicData.length)]
      const regionData = countryData.regions[Math.floor(Math.random() * countryData.regions.length)]
      const city = regionData.cities[Math.floor(Math.random() * regionData.cities.length)]

      // 随机选择内容类型和内容
      const contentTypes = Object.keys(messageContents) as (keyof typeof messageContents)[]
      const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)]
      const contents = messageContents[contentType]
      const content = contents[Math.floor(Math.random() * contents.length)]

      // 生成随机时间
      const randomDays = Math.floor(Math.random() * 60)
      const randomHours = Math.floor(Math.random() * 24)
      const randomMinutes = Math.floor(Math.random() * 60)
      const createdAt = new Date(now - randomDays * 24 * 60 * 60 * 1000 - randomHours * 60 * 60 * 1000 - randomMinutes * 60 * 1000)

      messages.push({
        visitor_id: `mock_visitor_${now}_${i}`,
        content,
        visitor_name: visitorNames[Math.floor(Math.random() * visitorNames.length)],
        location: getMessageLocation(countryData, regionData, city),
        created_at: createdAt.toISOString(),
      })
    }

    const { data, error } = await supabase.from('messages').insert(messages).select()
    if (error) throw new Error(error.message)
    return data
  },

  // 生成文章数据
  articles: async (count: number) => {
    // 先获取或创建分类
    const categoryNames = ['技术', '生活', '随笔', '教程', '分享', '前端', '后端', '工具']
    const categoryIds: string[] = []

    for (const cat of categoryNames) {
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .eq('name', cat)
        .single()

      if (existingCat) {
        categoryIds.push(existingCat.id)
      } else {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({ name: cat, slug: cat.toLowerCase(), color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') })
          .select('id')
          .single()
        if (newCat) categoryIds.push(newCat.id)
      }
    }

    const articles = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const randomDays = Math.floor(Math.random() * 180)
      const createdAt = new Date(now - randomDays * 24 * 60 * 60 * 1000)
      const views = Math.floor(Math.random() * 3000) + 100
      const readingTime = Math.floor(Math.random() * 12) + 3

      articles.push({
        title: articleTitles[i % articleTitles.length] + (i >= articleTitles.length ? ` (${Math.floor(i / articleTitles.length) + 1})` : ''),
        content: articleContents[i % articleContents.length],
        summary: articleSummaries[i % articleSummaries.length],
        cover: articleCovers[Math.floor(Math.random() * articleCovers.length)],
        status: Math.random() > 0.25 ? 'published' : 'draft',
        views,
        reading_time: readingTime,
        category_id: categoryIds[Math.floor(Math.random() * categoryIds.length)] || null,
        is_recommended: Math.random() > 0.75,
        created_at: createdAt.toISOString(),
        updated_at: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    const { data, error } = await supabase.from('articles').insert(articles).select()
    if (error) throw new Error(error.message)
    return data
  },

  // 生成访客数据
  visitors: async (count: number) => {
    const visitors = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const countryData = geographicData[Math.floor(Math.random() * geographicData.length)]
      const regionData = countryData.regions[Math.floor(Math.random() * countryData.regions.length)]
      const city = regionData.cities[Math.floor(Math.random() * regionData.cities.length)]
      const timezone = regionData.timezone || countryData.timezone

      const ipPrefix = countryData.ipPrefixes[Math.floor(Math.random() * countryData.ipPrefixes.length)]
      const ipAddress = `${ipPrefix}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

      const randomDays = Math.floor(Math.random() * 365)
      const firstSeen = new Date(now - randomDays * 24 * 60 * 60 * 1000)
      const sessionCount = Math.floor(Math.random() * 30) + 1
      const os = osList[Math.floor(Math.random() * osList.length)]

      visitors.push({
        visitor_id: `mock_v_${now}_${i}`,
        ip_address: ipAddress,
        user_agent: `Mozilla/5.0 (${os === 'Windows' ? 'Windows NT 10.0; Win64; x64' : os === 'macOS' ? 'Macintosh; Intel Mac OS X 10_15_7' : os === 'Linux' ? 'X11; Linux x86_64' : os === 'iOS' ? 'iPhone; CPU iPhone OS 15_0 like Mac OS X' : 'Linux; Android 12'}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 30) + 100}.0.0.0 Safari/537.36`,
        country: countryData.country,
        region: regionData.name,
        city: city,
        language: countryData.language,
        screen_resolution: screenResolutions[Math.floor(Math.random() * screenResolutions.length)],
        timezone: timezone,
        first_seen_at: firstSeen.toISOString(),
        last_seen_at: new Date(firstSeen.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        session_count: sessionCount,
      })
    }

    const { data, error } = await supabase.from('visitors').insert(visitors).select()
    if (error) throw new Error(error.message)
    return data
  },

  // 生成会话数据
  sessions: async (count: number) => {
    const { data: existingVisitors } = await supabase
      .from('visitors')
      .select('visitor_id')
      .limit(200)

    const visitorIds = existingVisitors?.map(v => v.visitor_id) || []
    if (visitorIds.length === 0) {
      throw new Error('请先生成访客数据')
    }

    const sessions = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const countryData = geographicData[Math.floor(Math.random() * geographicData.length)]
      const regionData = countryData.regions[Math.floor(Math.random() * countryData.regions.length)]

      const randomDays = Math.floor(Math.random() * 60)
      const startTime = new Date(now - randomDays * 24 * 60 * 60 * 1000)
      const duration = Math.floor(Math.random() * 5400) + 60 // 1分钟到90分钟
      const endTime = new Date(startTime.getTime() + duration * 1000)

      sessions.push({
        visitor_id: visitorIds[Math.floor(Math.random() * visitorIds.length)],
        session_id: `mock_s_${now}_${i}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
        page_views: Math.floor(Math.random() * 15) + 1,
        bounce: Math.random() > 0.55,
        device_type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        country: countryData.country,
        region: regionData.name,
        city: regionData.cities[Math.floor(Math.random() * regionData.cities.length)],
      })
    }

    const { data, error } = await supabase.from('sessions').insert(sessions).select()
    if (error) throw new Error(error.message)
    return data
  },

  // 生成页面访问数据
  pageViews: async (count: number) => {
    const { data: existingVisitors } = await supabase
      .from('visitors')
      .select('visitor_id')
      .limit(200)

    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('session_id, visitor_id')
      .limit(200)

    const visitorIds = existingVisitors?.map(v => v.visitor_id) || []
    const sessions = existingSessions || []

    if (visitorIds.length === 0) {
      throw new Error('请先生成访客数据')
    }

    const pageViews = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const randomDays = Math.floor(Math.random() * 60)
      const createdAt = new Date(now - randomDays * 24 * 60 * 60 * 1000)
      const page = pagePaths[Math.floor(Math.random() * pagePaths.length)]
      const session = sessions.length > 0 ? sessions[Math.floor(Math.random() * sessions.length)] : null
      const referrer = referrers[Math.floor(Math.random() * referrers.length)]

      pageViews.push({
        visitor_id: session?.visitor_id || visitorIds[Math.floor(Math.random() * visitorIds.length)],
        session_id: session?.session_id || `mock_s_${now}_${i}`,
        page_path: page.path,
        page_title: page.title,
        referrer: referrer,
        entry_path: pagePaths[0].path,
        exit_path: pagePaths[Math.floor(Math.random() * pagePaths.length)].path,
        time_on_page: Math.floor(Math.random() * 600) + 5, // 5秒到10分钟
        device_type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        created_at: createdAt.toISOString(),
      })
    }

    const { data, error } = await supabase.from('page_views').insert(pageViews).select()
    if (error) throw new Error(error.message)
    return data
  },

  // 生成每日访问统计
  dailyViews: async (days: number) => {
    const dailyViews = []
    const now = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      const { data: existing } = await supabase
        .from('daily_views')
        .select('id')
        .eq('date', dateStr)
        .single()

      if (!existing) {
        // 周末流量较低，工作日流量较高
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const baseCount = isWeekend ? 50 : 100
        const variation = isWeekend ? 100 : 300

        dailyViews.push({
          date: dateStr,
          count: Math.floor(Math.random() * variation) + baseCount,
        })
      }
    }

    if (dailyViews.length === 0) {
      return { message: '所有日期的数据已存在' }
    }

    const { data, error } = await supabase.from('daily_views').insert(dailyViews).select()
    if (error) throw new Error(error.message)
    return data
  },

  // 生成事件追踪数据
  events: async (count: number) => {
    const { data: existingVisitors } = await supabase
      .from('visitors')
      .select('visitor_id')
      .limit(200)

    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('session_id, visitor_id')
      .limit(200)

    const visitorIds = existingVisitors?.map(v => v.visitor_id) || []
    const sessions = existingSessions || []

    if (visitorIds.length === 0) {
      throw new Error('请先生成访客数据')
    }

    const events = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const randomDays = Math.floor(Math.random() * 60)
      const createdAt = new Date(now - randomDays * 24 * 60 * 60 * 1000)
      const session = sessions.length > 0 ? sessions[Math.floor(Math.random() * sessions.length)] : null
      const page = pagePaths[Math.floor(Math.random() * pagePaths.length)]

      events.push({
        visitor_id: session?.visitor_id || visitorIds[Math.floor(Math.random() * visitorIds.length)],
        session_id: session?.session_id || `mock_s_${now}_${i}`,
        event_name: eventNames[Math.floor(Math.random() * eventNames.length)],
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        event_data: {
          timestamp: createdAt.getTime(),
          page: page.path,
          userAgent: `Mozilla/5.0 (${osList[Math.floor(Math.random() * osList.length)]})`,
        },
        page_path: page.path,
        element_selector: elementSelectors[Math.floor(Math.random() * elementSelectors.length)],
        element_text: `Element ${Math.floor(Math.random() * 100)}`,
        created_at: createdAt.toISOString(),
      })
    }

    const { data, error } = await supabase.from('events').insert(events).select()
    if (error) throw new Error(error.message)
    return data
  },
}

// 简单的 token 验证函数
function validateToken(token: string | null): boolean {
  if (!token || !token.startsWith('admin_')) {
    return false
  }
  const parts = token.split('_')
  if (parts.length < 3) {
    return false
  }
  const timestamp = parseInt(parts[1])
  if (isNaN(timestamp)) {
    return false
  }
  const expiresAt = timestamp + 7 * 24 * 60 * 60 * 1000
  return Date.now() < expiresAt
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 验证管理员 token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401)
    }
    const token = authHeader.substring(7)
    if (!validateToken(token)) {
      return errorResponse('Invalid or expired token', 401)
    }

    const body = await req.json()
    const { type, count = 10 } = body

    if (!type || !mockGenerators[type as keyof typeof mockGenerators]) {
      return errorResponse(`Invalid type. Available types: ${Object.keys(mockGenerators).join(', ')}`, 400)
    }

    const generator = mockGenerators[type as keyof typeof mockGenerators]
    const data = await generator(count)

    return jsonResponse({
      success: true,
      type,
      count: Array.isArray(data) ? data.length : 1,
      data,
    })
  } catch (error) {
    console.error('Error generating mock data:', error)
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500)
  }
}
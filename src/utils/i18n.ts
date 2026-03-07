// 简单的国际化支持

export type Language = 'zh' | 'en'

export interface Translations {
  // 导航
  home: string
  blog: string
  hotNews: string
  message: string
  admin: string
  login: string
  logout: string
  // 通用
  loading: string
  submit: string
  cancel: string
  save: string
  delete: string
  edit: string
  create: string
  // 主题
  theme: string
  light: string
  dark: string
  // 语言
  language: string
  chinese: string
  english: string
  // 个人管理
  profile: string
  settings: string
  visitorId: string
  myComments: string
  myLikes: string
  // 文章
  readMore: string
  views: string
  likes: string
  comments: string
  share: string
  // 留言
  leaveMessage: string
  allMessages: string
  noMessages: string
  // 错误
  notFound: string
  error: string
  retry: string
}

const translations: Record<Language, Translations> = {
  zh: {
    // 导航
    home: '首页',
    blog: '文章',
    hotNews: '热点',
    message: '留言',
    admin: '管理',
    login: '登录',
    logout: '退出',

    // 通用
    loading: '加载中...',
    submit: '提交',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    create: '创建',

    // 主题
    theme: '主题',
    light: '浅色',
    dark: '暗黑',

    // 语言
    language: '语言',
    chinese: '中文',
    english: 'English',

    // 个人管理
    profile: '个人中心',
    settings: '设置',
    visitorId: '访客 ID',
    myComments: '我的评论',
    myLikes: '我的点赞',

    // 文章
    readMore: '阅读全文',
    views: '阅读',
    likes: '点赞',
    comments: '评论',
    share: '分享',

    // 留言
    leaveMessage: '留言',
    allMessages: '所有留言',
    noMessages: '暂无留言',

    // 错误
    notFound: '未找到',
    error: '错误',
    retry: '重试',
  },
  en: {
    // Navigation
    home: 'Home',
    blog: 'Blog',
    hotNews: 'News',
    message: 'Messages',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',

    // General
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',

    // Theme
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',

    // Language
    language: 'Language',
    chinese: '中文',
    english: 'English',

    // Profile
    profile: 'Profile',
    settings: 'Settings',
    visitorId: 'Visitor ID',
    myComments: 'My Comments',
    myLikes: 'My Likes',

    // Articles
    readMore: 'Read More',
    views: 'Views',
    likes: 'Likes',
    comments: 'Comments',
    share: 'Share',

    // Messages
    leaveMessage: 'Leave Message',
    allMessages: 'All Messages',
    noMessages: 'No messages yet',

    // Errors
    notFound: 'Not Found',
    error: 'Error',
    retry: 'Retry',
  },
}

// 获取当前语言
export const getLanguage = (): Language => {
  return (localStorage.getItem('language') as Language) || 'zh'
}

// 设置语言
export const setLanguage = (lang: Language) => {
  localStorage.setItem('language', lang)
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }))
}

// 获取翻译
export const t = (key: keyof Translations, lang: Language = getLanguage()): string => {
  return translations[lang]?.[key] || translations.zh[key] || key
}

// 获取所有翻译
export const getTranslations = (lang: Language = getLanguage()): Translations => {
  return translations[lang] || translations.zh
}

export default {
  getLanguage,
  setLanguage,
  t,
  getTranslations,
  translations,
}

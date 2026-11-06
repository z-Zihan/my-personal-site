// 简单的国际化支持

export type Language = 'zh' | 'en'

export interface Translations {
  // 导航
  home: string
  blog: string
  hotNews: string
  message: string
  about: string
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
  // 首页
  heroTagline: string
  recommendedArticles: string
  latestArticles: string
  viewAllArticles: string
  goHotNews: string
  liveUpdates: string
  hotNewsSubtitle: string
  articlesCount: string
  readsCount: string
  messagesCount: string
  // 文章列表
  allArticles: string
  allCategory: string
  prevPage: string
  nextPage: string
  pageInfo: string
  noArticles: string
  noArticlesHint: string
  // 文章详情
  viewsSuffix: string
  loadingArticle: string
  backHome: string
  viewArticleList: string
  articleNotFound: string
  articleNotFoundHint: string
  loadFailed: string
  networkErrorHint: string
  noContent: string
  noContentHint: string
  fontSize: string
  fontSizeSmall: string
  fontSizeStandard: string
  fontSizeLarge: string
  tocHint: string
  copied: string
  copyCode: string
  articleOf: string
  previousArticle: string
  nextArticle: string
  backToList: string
  // 404
  pageLost: string
  pageLostHint: string
  pageLostHintSub: string
  backPrevPage: string
  autoRedirect: string
  // 语言切换
  switchToEnglish: string
  switchToChinese: string
  // Footer
  footerBuiltWith: string
  footerNiceDay: string
  // 文章卡片
  recommended: string
  readArticle: string
  // 上一篇/下一篇
  noPrevArticle: string
  noNextArticle: string
  // 评论
  commentTooLong: string
  commentEmpty: string
  unknownLocation: string
  commentSuccess: string
  commentFailed: string
  commentPlaceholder: string
  charCount: string
  postComment: string
  submitting: string
  noCommentsYet: string
  guestUser: string
  // 阅读时长
  minRead: string
  // 点赞
  likeAction: string
  liked: string
  unlike: string
  likeSuccess: string
  unlikeSuccess: string
  operationFailed: string
  // 分享
  linkCopied: string
  copyFailed: string
  copyLink: string
  weibo: string
  // 目录 / 搜索 / 回到顶部
  toc: string
  searchPlaceholder: string
  searching: string
  noResults: string
  backToTop: string
  top: string
  // 语言切换按钮 / 菜单
  langSwitchToEnglish: string
  langSwitchToChinese: string
  menu: string
}

const translations: Record<Language, Translations> = {
  zh: {
    // 导航
    home: '首页',
    blog: '文章',
    hotNews: '热点',
    message: '留言',
    about: '关于',
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

    // 首页
    heroTagline: '探索技术 · 记录生活 · 分享思考',
    recommendedArticles: '推荐文章',
    latestArticles: '最新文章',
    viewAllArticles: '查看全部文章',
    goHotNews: '去热点资讯',
    liveUpdates: '实时更新',
    hotNewsSubtitle: '追踪最新技术动态，把握行业脉搏',
    articlesCount: '文章',
    readsCount: '阅读',
    messagesCount: '留言',

    // 文章列表
    allArticles: '全部文章',
    allCategory: '全部',
    prevPage: '上一页',
    nextPage: '下一页',
    pageInfo: '第 {current} / {total} 页',
    noArticles: '暂无文章',
    noArticlesHint: '这里还没有任何文章\n待博主更新后，精彩内容将在这里展示',

    // 文章详情
    viewsSuffix: '次阅读',
    loadingArticle: '加载文章中...',
    backHome: '返回首页',
    viewArticleList: '查看文章列表',
    articleNotFound: '文章不存在或已删除',
    articleNotFoundHint: '可能的原因：文章已被删除、未发布或链接不正确',
    loadFailed: '加载失败，请稍后重试',
    networkErrorHint: '网络开小差了，请稍后重试',
    noContent: '本文暂无内容',
    noContentHint: '作者可能还在编辑中，稍后再来看看吧',
    fontSize: '字号',
    fontSizeSmall: '小',
    fontSizeStandard: '标准',
    fontSizeLarge: '大',
    tocHint: '长文可用右侧目录快速跳转章节',
    copied: '已复制 ✓',
    copyCode: '复制',
    articleOf: '{index} / {total} 篇',
    previousArticle: '上一篇',
    nextArticle: '下一篇',
    backToList: '返回列表',

    // 404
    pageLost: '页面走丢了',
    pageLostHint: '抱歉，您访问的页面不存在',
    pageLostHintSub: '可能是链接已失效或页面已被删除',
    backPrevPage: '返回上一页',
    autoRedirect: '或等待 {seconds} 秒自动返回首页...',

    // 语言切换
    switchToEnglish: 'Language switched to English',
    switchToChinese: '语言已切换为中文',

    // Footer
    footerBuiltWith: 'Designed & Built with',
    footerNiceDay: 'Have a nice day!',

    // 文章卡片
    recommended: '推荐',
    readArticle: '阅读文章：{title}',

    // 上一篇/下一篇
    noPrevArticle: '已经是最新一篇了',
    noNextArticle: '已经是最后一篇了',

    // 评论
    commentTooLong: '评论长度不能超过 {max} 个字符',
    commentEmpty: '请输入评论内容',
    unknownLocation: '未知',
    commentSuccess: '评论成功',
    commentFailed: '评论失败，请重试',
    commentPlaceholder: '写下你的评论...',
    charCount: '{count}/{max} 字',
    postComment: '发表评论',
    submitting: '提交中...',
    noCommentsYet: '还没有评论，来抢沙发',
    guestUser: '访客 {id}',

    // 阅读时长
    minRead: '预计阅读 {min} 分钟',

    // 点赞
    likeAction: '点赞',
    liked: '已赞',
    unlike: '取消点赞',
    likeSuccess: '点赞成功',
    unlikeSuccess: '已取消点赞',
    operationFailed: '操作失败，请重试',

    // 分享
    linkCopied: '链接已复制',
    copyFailed: '复制失败',
    copyLink: '复制链接',
    weibo: '微博',

    // 目录 / 搜索 / 回到顶部
    toc: '目录',
    searchPlaceholder: '搜索文章... ⌘K',
    searching: '搜索中...',
    noResults: '未找到相关文章',
    backToTop: '回到顶部',
    top: '顶部',

    // 语言切换按钮 / 菜单
    langSwitchToEnglish: '切换为英文',
    langSwitchToChinese: '切换为中文',
    menu: '菜单',
  },
  en: {
    // Navigation
    home: 'Home',
    blog: 'Blog',
    hotNews: 'News',
    message: 'Messages',
    about: 'About',
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

    // Home
    heroTagline: 'Exploring Tech · Living Life · Sharing Ideas',
    recommendedArticles: 'Recommended',
    latestArticles: 'Latest Posts',
    viewAllArticles: 'View All Posts',
    goHotNews: 'Hot News',
    liveUpdates: 'LIVE',
    hotNewsSubtitle: 'Tracking the latest in tech, one pulse at a time',
    articlesCount: 'Posts',
    readsCount: 'Reads',
    messagesCount: 'Messages',

    // Blog list
    allArticles: 'All Posts',
    allCategory: 'All',
    prevPage: 'Previous',
    nextPage: 'Next',
    pageInfo: 'Page {current} of {total}',
    noArticles: 'No posts yet',
    noArticlesHint: 'Nothing here at the moment\nCheck back soon — new posts are on the way',

    // Article detail
    viewsSuffix: 'views',
    loadingArticle: 'Loading article...',
    backHome: 'Back Home',
    viewArticleList: 'All Posts',
    articleNotFound: 'Article not found or deleted',
    articleNotFoundHint: 'It may have been deleted, unpublished, or the link is incorrect',
    loadFailed: 'Failed to load, please try again later',
    networkErrorHint: 'Network hiccup — please try again later',
    noContent: 'Nothing here yet',
    noContentHint: 'The author is probably still writing. Check back soon!',
    fontSize: 'Text size',
    fontSizeSmall: 'S',
    fontSizeStandard: 'M',
    fontSizeLarge: 'L',
    tocHint: 'Long read? Use the outline on the right to jump between sections',
    copied: 'Copied ✓',
    copyCode: 'Copy',
    articleOf: '{index} / {total}',
    previousArticle: 'Previous',
    nextArticle: 'Next',
    backToList: 'Back to list',

    // 404
    pageLost: 'Page Not Found',
    pageLostHint: 'Sorry, the page you are looking for does not exist',
    pageLostHintSub: 'The link may be broken or the page has been removed',
    backPrevPage: 'Go Back',
    autoRedirect: 'Or wait {seconds}s to be redirected home...',

    // Language switch
    switchToEnglish: 'Language switched to English',
    switchToChinese: '语言已切换为中文',

    // Footer
    footerBuiltWith: 'Designed & Built with',
    footerNiceDay: 'Have a nice day!',

    // Article card
    recommended: 'Recommended',
    readArticle: 'Read article: {title}',

    // Prev / next article
    noPrevArticle: 'This is the latest post',
    noNextArticle: 'This is the last post',

    // Comments
    commentTooLong: 'Comment cannot exceed {max} characters',
    commentEmpty: 'Please enter a comment',
    unknownLocation: 'Unknown',
    commentSuccess: 'Comment posted',
    commentFailed: 'Failed to post comment, please retry',
    commentPlaceholder: 'Write a comment...',
    charCount: '{count}/{max}',
    postComment: 'Post Comment',
    submitting: 'Submitting...',
    noCommentsYet: 'No comments yet. Be the first!',
    guestUser: 'Guest {id}',

    // Reading time
    minRead: '{min} min read',

    // Likes
    likeAction: 'Like',
    liked: 'Liked',
    unlike: 'Unlike',
    likeSuccess: 'Liked',
    unlikeSuccess: 'Like removed',
    operationFailed: 'Operation failed, please retry',

    // Share
    linkCopied: 'Link copied',
    copyFailed: 'Copy failed',
    copyLink: 'Copy Link',
    weibo: 'Weibo',

    // TOC / Search / Back to top
    toc: 'Contents',
    searchPlaceholder: 'Search posts... ⌘K',
    searching: 'Searching...',
    noResults: 'No results found',
    backToTop: 'Back to top',
    top: 'TOP',

    // Language toggle button / menu
    langSwitchToEnglish: 'Switch to English',
    langSwitchToChinese: 'Switch to Chinese',
    menu: 'Menu',
  },
}

type TranslationParams = Record<string, string | number>

/** 模板插值：'第 {current} 页' + {current: 2} → '第 2 页' */
const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  )
}

// 检测浏览器语言：zh-* → 中文，其余 → 英文
const detectBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'zh'
  const langs: readonly string[] = navigator.languages || [navigator.language || '']
  return langs.some((l) => l.toLowerCase().startsWith('zh')) ? 'zh' : 'en'
}

// 获取当前语言：localStorage 优先；首次访问按 navigator.language 自动选择（并记住选择）
export const getLanguage = (): Language => {
  try {
    const stored = localStorage.getItem('language')
    if (stored === 'zh' || stored === 'en') return stored
    const detected = detectBrowserLanguage()
    localStorage.setItem('language', detected)
    return detected
  } catch {
    /* localStorage 不可用（隐私模式等），仅按浏览器语言返回 */
    return detectBrowserLanguage()
  }
}

// 同步 <html lang>（读屏与 SEO）
const syncHtmlLang = (lang: Language) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }
}

// 设置语言
export const setLanguage = (lang: Language) => {
  localStorage.setItem('language', lang)
  syncHtmlLang(lang)
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }))
}

// 获取翻译，支持 {key} 插值
export const t = (
  key: keyof Translations,
  lang: Language = getLanguage(),
  params?: TranslationParams
): string => {
  const template = translations[lang]?.[key] || translations.zh[key] || (key as string)
  return interpolate(template, params)
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

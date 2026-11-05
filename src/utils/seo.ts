/**
 * SEO / Open Graph meta 工具
 *
 * SPA 客户端动态更新 document.title 与 og/twitter meta 标签。
 * 注意：X（Twitter）等平台的正式爬虫不执行 JS，此工具主要服务于
 * 浏览器标签页标题、站内 SEO 及支持执行 JS 的预览场景；
 * 社交爬虫场景由 Vercel Edge 的 og-proxy（/api/og-proxy）在服务端注入 meta。
 */

/** 站点默认 SEO 信息（与 index.html 保持一致） */
export const SITE_URL = 'https://zzihanaini.vercel.app'
export const DEFAULT_TITLE = "zZihan'sBlog | 张子涵的个人博客 - 探索技术 · 记录生活 · 分享思考"
export const DEFAULT_DESCRIPTION = '张子涵的个人博客，分享前端开发、React、JavaScript 等技术文章，记录生活感悟和旅行见闻。'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

interface MetaInfo {
  /** og: 用 property，twitter:/标准 meta 用 name */
  key: 'property' | 'name'
  /** 完整键名，如 og:title / twitter:image */
  name: string
  content: string
}

/** 按序 upsert 页面 <title> 与一组 meta 标签 */
function applyMeta(infos: MetaInfo[], title?: string) {
  if (title !== undefined) {
    document.title = title
  }
  for (const info of infos) {
    const selector = info.key === 'property' ? `meta[property="${info.name}"]` : `meta[name="${info.name}"]`
    let el = document.head.querySelector<HTMLMetaElement>(selector)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(info.key, info.name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', info.content)
  }
}

export interface ArticleSeoInput {
  title: string
  summary?: string
  cover?: string
  path?: string
}

/** 文章详情页 SEO：动态写入标题 / 摘要 / 封面 */
export function setArticleSeo(article: ArticleSeoInput) {
  const title = `${article.title} | zZihan'sBlog`
  const description = (article.summary || DEFAULT_DESCRIPTION).trim().slice(0, 160)
  const image = article.cover || DEFAULT_OG_IMAGE
  const url = article.path ? `${SITE_URL}${article.path}` : `${SITE_URL}/`

  applyMeta(
    [
      { key: 'property', name: 'og:type', content: 'article' },
      { key: 'property', name: 'og:url', content: url },
      { key: 'property', name: 'og:title', content: article.title },
      { key: 'property', name: 'og:description', content: description },
      { key: 'property', name: 'og:image', content: image },
      { key: 'name', name: 'twitter:card', content: 'summary_large_image' },
      { key: 'name', name: 'twitter:url', content: url },
      { key: 'name', name: 'twitter:title', content: article.title },
      { key: 'name', name: 'twitter:description', content: description },
      { key: 'name', name: 'twitter:image', content: image },
    ],
    title,
  )
}

/** 恢复为站点默认 SEO（离开文章页时调用） */
export function resetSeo() {
  applyMeta(
    [
      { key: 'property', name: 'og:type', content: 'website' },
      { key: 'property', name: 'og:url', content: `${SITE_URL}/` },
      { key: 'property', name: 'og:title', content: "zZihan'sBlog | 张子涵的个人博客" },
      { key: 'property', name: 'og:description', content: '探索技术 · 记录生活 · 分享思考' },
      { key: 'property', name: 'og:image', content: DEFAULT_OG_IMAGE },
      { key: 'name', name: 'twitter:card', content: 'summary_large_image' },
      { key: 'name', name: 'twitter:url', content: `${SITE_URL}/` },
      { key: 'name', name: 'twitter:title', content: "zZihan'sBlog | 张子涵的个人博客" },
      { key: 'name', name: 'twitter:description', content: '探索技术 · 记录生活 · 分享思考' },
      { key: 'name', name: 'twitter:image', content: DEFAULT_OG_IMAGE },
    ],
    DEFAULT_TITLE,
  )
}

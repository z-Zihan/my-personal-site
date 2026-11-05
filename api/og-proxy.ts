/**
 * OG Proxy - 社交爬虫专用 HTML 注入层（根治 SPA 分享无 OG 的问题）
 *
 * 背景：本站是纯客户端渲染 SPA，所有文章页共享同一份静态 index.html。
 * X（Twitter）/Facebook/Slack 等平台爬虫不执行 JS，抓到的永远是首页 meta，
 * 导致分享文章没有标题/摘要/封面。
 *
 * 原理（配合 vercel.json rewrites）：
 *   /blog/:id → rewrite 到本函数（仅 /blog/* 命中，不影响其他路径）
 *   - 社交爬虫 UA → 查 Supabase 拿文章数据，fetch 线上首页 HTML 的 <head>，
 *     替换其中 og/twitter meta 为文章专属值后返回完整 HTML
 *   - 普通浏览器 → 302 到带绕过标记的原路径，走正常 SPA 渲染
 *
 * 注意死循环问题：rewrite 只匹配 /blog/*，本函数 fetch /index.html 不会再次触发。
 * 本函数只读，不增加文章 views（views 在 article-detail API 里自增）。
 */
import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

const SITE_URL = 'https://zzihanaini.vercel.app'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

/** 常见社交平台爬虫 UA 特征 */
const BOT_KEYWORDS = [
  'twitterbot',
  'facebookexternalhit',
  'linkedinbot',
  'slackbot',
  'slack-img-proxy',
  'discordbot',
  'whatsapp',
  'telegrambot',
  'skypeuripreview',
  'vkshare',
  'pinterestbot',
  'embedly',
  'quora link preview',
  'outbrain',
  'ia_archiver',
  'qingjiaocloud', // 飞书文档预览抓取服务
  'bytedance', // 字节系（抖音/飞书）预览
  'petalbot', // 华为花瓣
]

function isSocialBot(ua: string): boolean {
  const lower = ua.toLowerCase()
  return BOT_KEYWORDS.some((k) => lower.includes(k))
}

function escapeHtml(input: string): string {
  // 属性值统一用双引号包裹，故只需转义 & < > "（不转义单引号，保持 zZihan'sBlog 原样）
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface ArticleRow {
  id: string
  title: string
  summary?: string | null
  cover?: string | null
  created_at?: string | null
}

/** 查文章（只读，不加 views） */
async function fetchArticle(id: string): Promise<ArticleRow | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, summary, cover, created_at')
    .eq('id', id)
    .eq('status', 'published')
    .single()
  if (error || !data) return null
  return data as ArticleRow
}

/**
 * 从线上首页 HTML 提取 SPA 骨架（取 </title> 之前的部分作为基础 <head>），
 * 再替换 og/twitter meta 与 title。线上 HTML 本身已带默认 meta，
 * 直接对整段 HTML 做标签级替换最稳（不依赖 <head> 边界截取）。
 */
function injectMeta(html: string, article: ArticleRow | null): string {
  const title = article ? `${article.title} | zZihan'sBlog` : "zZihan'sBlog | 张子涵的个人博客 - 探索技术 · 记录生活 · 分享思考"
  const ogTitle = article ? article.title : "zZihan'sBlog | 张子涵的个人博客"
  const description = (article?.summary || '探索技术 · 记录生活 · 分享思考').trim().slice(0, 160)
  const image = article?.cover || DEFAULT_IMAGE
  const url = article ? `${SITE_URL}/blog/${encodeURIComponent(article.id)}` : `${SITE_URL}/`

  const out = html
    // <title>
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    // og: 系（property 定位）
    .replace(/<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="article" />`)
    .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${escapeHtml(url)}" />`)
    .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`)
    .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`)
    // twitter: 系（name 定位，兼容 property 写法）
    .replace(/<meta\s+(?:name|property)="twitter:card"[^>]*>/i, `<meta name="twitter:card" content="summary_large_image" />`)
    .replace(/<meta\s+(?:name|property)="twitter:url"[^>]*>/i, `<meta name="twitter:url" content="${escapeHtml(url)}" />`)
    .replace(/<meta\s+(?:name|property)="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`)
    .replace(/<meta\s+(?:name|property)="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+(?:name|property)="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
  return out
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }
  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  const url = new URL(req.url)
  const bypass = url.searchParams.get('_ogb') === '1' // 绕过标记：浏览器 302 后带此参数
  const ua = req.headers.get('user-agent') || ''

  // 浏览器直达（302 回跳带绕过标记）→ 直接透传给 vercel.json 的 SPA rewrite 流程
  // 这里返回 302 到去掉标记的原路径：vercel.json 会再次 rewrite 到本函数，
  // 但此时 UA 是浏览器 + 无标记 → 不应死循环，所以再判断一次：
  // 只有「非爬虫 + 无绕过标记」才 302；「非爬虫 + 有标记」直接返回 SPA HTML。
  if (!isSocialBot(ua)) {
    if (bypass) {
      // 已经绕过一轮，直接返回 SPA HTML（fetch 静态资源，不触发 /blog/* rewrite）
      try {
        const spaRes = await fetch(`${SITE_URL}/index.html`)
        const html = await spaRes.text()
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        })
      } catch {
        // 拉不到静态资源时兜底：让请求回到默认 rewrite（返回 302 到首页）
        return new Response(null, { status: 302, headers: { Location: `${SITE_URL}/` } })
      }
    }
    // 首次浏览器访问 → 302 加绕过标记（rewrites 对带 query 的请求同样命中，
    // 但本函数靠 _ogb=1 识别已处理过）
    const targetPath = url.searchParams.get('url') || '/'
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${targetPath}?_ogb=1`,
        'Cache-Control': 'no-store',
      },
    })
  }

  // ---- 社交爬虫：注入文章 OG ----
  const pagePath = url.searchParams.get('url') || '/'
  let article: ArticleRow | null = null

  // /blog/<id> 形式才查库
  const blogMatch = pagePath.match(/^\/blog\/([^/?#]+)/)
  if (blogMatch) {
    const id = decodeURIComponent(blogMatch[1])
    // 跳过 UUID 形式以外的异常 id，避免无谓查询
    try {
      article = await fetchArticle(id)
    } catch (e) {
      console.error('og-proxy supabase error:', e)
    }
  }
  // 查不到文章（含 404 场景）→ 用默认 meta，绝不 500

  try {
    const siteRes = await fetch(`${SITE_URL}/index.html`)
    const html = await siteRes.text()
    const injected = injectMeta(html, article)
    return new Response(injected, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
      },
    })
  } catch (e) {
    console.error('og-proxy fetch site error:', e)
    return jsonResponse({ error: 'Failed to load site HTML' }, 502)
  }
}

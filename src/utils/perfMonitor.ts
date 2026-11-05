// 性能监控 + 错误监控 SDK
// 与 analytics.ts 埋点体系并行：复用其 visitor_id/session_id（localStorage/sessionStorage 键一致），
// 上报走独立的批量队列 → POST /api/perf-metrics（perf_metrics 单表，type 区分指标/错误）

import { API_BASE } from '../constants/apiConstants'

// ============================================
// 配置
// ============================================
const PERF_CONFIG = {
  enabled: true,
  apiEndpoint: `${API_BASE}/api/perf-metrics`,
  flushInterval: 5000, // 5 秒批量上报一次
  maxQueueSize: 30, // 队列满立即上报
  slowResourceThreshold: 3000, // 慢资源阈值 3s
  slowApiThreshold: 1000, // 慢接口阈值 1s（request.ts 判断，此处供参考）
  apiSampleRate: 0.1, // 正常接口耗时采样率 10%
  errorDedupWindow: 5 * 60 * 1000, // 错误去重窗口 5 分钟
  maxStackLength: 2000, // 堆栈截断
  maxMessageLength: 500, // 消息/摘要截断
}

// 指标类型（与 api/perf-metrics.ts、sql/03-perf-monitoring.sql 保持一致）
export type PerfMetricType =
  | 'web_vital'
  | 'route_timing'
  | 'resource_summary'
  | 'slow_resource'
  | 'api_timing'
  | 'api_slow'
  | 'api_error'
  | 'js_error'
  | 'promise_error'
  | 'resource_error'

interface PerfMetric {
  type: PerfMetricType
  visitor_id: string
  session_id: string
  page_path: string
  data: Record<string, unknown>
  timestamp: string
}

// ============================================
// 访客/会话 ID：与 analytics.ts 复用同一套存储键
// ============================================
const getVisitorId = (): string => {
  try {
    const stored = localStorage.getItem('_vid')
    if (stored) return stored
    const newId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('_vid', newId)
    return newId
  } catch {
    return 'v_unknown'
  }
}

const getSessionId = (): string => {
  try {
    const stored = sessionStorage.getItem('_sid')
    if (stored) return stored
    const newId = 's_' + Date.now().toString(36) + Math.random().toString(36).substring(2)
    sessionStorage.setItem('_sid', newId)
    return newId
  } catch {
    return 's_unknown'
  }
}

// ============================================
// 上报队列
// ============================================
let metricQueue: PerfMetric[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

const flushMetrics = async () => {
  if (metricQueue.length === 0) return

  const metrics = [...metricQueue]
  metricQueue = []

  try {
    await fetch(PERF_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics }),
      keepalive: true,
    })
  } catch {
    // 上报失败静默丢弃（监控本身不能影响业务，也不做重试避免错误风暴）
  }
}

const queueMetric = (type: PerfMetricType, data: Record<string, unknown>) => {
  if (!PERF_CONFIG.enabled) return

  metricQueue.push({
    type,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    page_path: window.location.pathname,
    data,
    timestamp: new Date().toISOString(),
  })

  if (metricQueue.length >= PERF_CONFIG.maxQueueSize) {
    void flushMetrics()
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null
      void flushMetrics()
    }, PERF_CONFIG.flushInterval)
  }
}

// ============================================
// 错误去重：message+source+lineno 指纹，5 分钟内只报一次
// ============================================
const errorFingerprints = new Map<string, number>()

const isDuplicateError = (fingerprint: string): boolean => {
  const now = Date.now()
  const last = errorFingerprints.get(fingerprint)
  if (last && now - last < PERF_CONFIG.errorDedupWindow) return true

  errorFingerprints.set(fingerprint, now)
  // 防止 Map 无限增长：超过 100 条时清理过期项
  if (errorFingerprints.size > 100) {
    const cutoff = now - PERF_CONFIG.errorDedupWindow
    errorFingerprints.forEach((ts, fp) => {
      if (ts < cutoff) errorFingerprints.delete(fp)
    })
  }
  return false
}

// ============================================
// A1. Web Vitals（原生 PerformanceObserver，不引第三方库）
// ============================================

// 阈值参考 Google 标准：LCP <2.5s 绿 / <4s 黄；FCP <1.8s 绿 / <3s 黄；
// CLS <0.1 绿 / <0.25 黄；TTFB <0.8s 绿 / <1.8s 黄；INP <200ms 绿 / <500ms 黄
interface VitalSnapshot {
  lcp?: number
  fcp?: number
  cls?: number
  ttfb?: number
  inp?: number
  dom_ready?: number
  load_time?: number
  dns?: number
  tcp?: number
  request_time?: number
  response_time?: number
  dom_parse?: number
}

const vitals: VitalSnapshot = {}
let clsValue = 0
let inpMax = 0
let vitalsReported = false

// LCP：取最大内容绘制，页面首次交互/隐藏时为最终值；简化：observer 回调里持续更新，上报时取最新
const observeLCP = () => {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number }
      if (last) vitals.lcp = Math.round(last.renderTime || last.loadTime || last.startTime)
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit)
  } catch {
    /* 浏览器不支持则跳过 */
  }
}

// FCP：paint entry
const observeFCP = () => {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          vitals.fcp = Math.round(entry.startTime)
        }
      }
    })
    observer.observe({ type: 'paint', buffered: true } as PerformanceObserverInit)
  } catch {
    /* 不支持则跳过 */
  }
}

// CLS：layout-shift 累计（无 recentInput 才计入）
const observeCLS = () => {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      vitals.cls = Math.round(clsValue * 1000) / 1000
    })
    observer.observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit)
  } catch {
    /* 不支持则跳过 */
  }
}

// INP 尽力近似：取 event timing 中 duration 最长的一次交互
const observeINP = () => {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number }>) {
        if (entry.duration > inpMax) {
          inpMax = entry.duration
          vitals.inp = Math.round(entry.duration)
        }
      }
    })
    observer.observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit)
  } catch {
    /* durationThreshold 不支持时 observer 会抛错，跳过 */
  }
}

// 导航时序：TTFB + DNS/TCP/请求各阶段 + DOM ready / load
const collectNavigationTiming = () => {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (!nav) return

  vitals.ttfb = Math.round(nav.responseStart)
  vitals.dns = Math.round(nav.domainLookupEnd - nav.domainLookupStart)
  vitals.tcp = Math.round(nav.connectEnd - nav.connectStart)
  vitals.request_time = Math.round(nav.responseStart - nav.requestStart)
  vitals.response_time = Math.round(nav.responseEnd - nav.responseStart)
  vitals.dom_parse = Math.round(nav.domInteractive - nav.responseEnd)
  vitals.dom_ready = Math.round(nav.domContentLoadedEventEnd)
  vitals.load_time = Math.round(nav.loadEventEnd > 0 ? nav.loadEventEnd : 0)
}

// 首次上报 Web Vitals：load + 3s 兜底（给 LCP/CLS/INP 足够的窗口），一次性快照
const scheduleVitalsReport = () => {
  const report = () => {
    if (vitalsReported) return
    vitalsReported = true
    collectNavigationTiming()
    queueMetric('web_vital', { ...vitals })
  }

  if (document.readyState === 'complete') {
    setTimeout(report, 3000)
  } else {
    window.addEventListener('load', () => setTimeout(report, 3000), { once: true })
  }
}

// ============================================
// A1. 资源加载耗时 Top 10 + 慢资源（A3）
// ============================================
const collectResourceTimings = () => {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  if (entries.length === 0) return

  // 按 duration 降序取 Top 10，精简字段（name 截断去 query、duration、transferSize）
  const top10 = [...entries]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)
    .map((e) => ({
      name: e.name.split('?')[0].slice(0, 120),
      type: e.initiatorType,
      duration: Math.round(e.duration),
      size: e.transferSize,
    }))

  queueMetric('resource_summary', { top: top10, total: entries.length })

  // 慢资源单独上报（>3s，最多 10 条防止刷队列）
  entries
    .filter((e) => e.duration > PERF_CONFIG.slowResourceThreshold)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)
    .forEach((e) => {
      queueMetric('slow_resource', {
        name: e.name.split('?')[0].slice(0, 200),
        type: e.initiatorType,
        duration: Math.round(e.duration),
        size: e.transferSize,
      })
    })
}

// ============================================
// A2. SPA 路由切换耗时
// ============================================
// 简化策略：路由变化时记录开始时间，requestAnimationFrame 两帧后 +
// PerformanceObserver 静默判定太复杂，这里用「两帧 + 1s 固定采样」：
// 切换后 1s 时认为渲染已稳定，计算 duration。可靠且实现简单。
let routeStart = 0

const reportRouteTiming = (path: string) => {
  const duration = Math.round(performance.now() - routeStart)
  queueMetric('route_timing', { path, duration })
}

const watchRouteChanges = () => {
  const handleRouteChange = () => {
    // 后台页面不埋点（与 analytics.ts 策略一致）
    if (window.location.pathname.startsWith('/admin')) return
    routeStart = performance.now()
    const path = window.location.pathname
    setTimeout(() => reportRouteTiming(path), 1000)
  }

  const originalPushState = history.pushState
  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    handleRouteChange()
  }
  window.addEventListener('popstate', handleRouteChange)
}

// ============================================
// B. 错误捕获
// ============================================

// B1. JS 运行时错误
const setupJsErrorHandler = () => {
  window.addEventListener('error', (event) => {
    // 资源加载错误走单独处理（B3），此处只处理 JS 运行时错误
    const target = event.target as (EventTarget & { tagName?: string }) | null
    if (target && target.tagName && ['IMG', 'SCRIPT', 'LINK'].includes(target.tagName)) {
      handleResourceError(target as EventTarget & { tagName: string; src?: string; href?: string })
      return
    }

    const message = (event.message || 'Unknown error').slice(0, PERF_CONFIG.maxMessageLength)
    const source = (event.filename || '').split('?')[0]
    const fingerprint = `${message}|${source}|${event.lineno}`

    if (isDuplicateError(fingerprint)) return

    queueMetric('js_error', {
      message,
      source,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack ? event.error.stack.slice(0, PERF_CONFIG.maxStackLength) : undefined,
    })
  })
}

// B2. Promise 未处理拒绝
const setupRejectionHandler = () => {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message =
      typeof reason === 'string'
        ? reason
        : reason?.message || JSON.stringify(reason).slice(0, PERF_CONFIG.maxMessageLength) || 'Unknown rejection'
    const fingerprint = `promise|${String(message).slice(0, 200)}`

    if (isDuplicateError(fingerprint.slice(0, 200))) return

    queueMetric('promise_error', {
      message: String(message).slice(0, PERF_CONFIG.maxMessageLength),
      stack: reason?.stack ? String(reason.stack).slice(0, PERF_CONFIG.maxStackLength) : undefined,
    })
  })
}

// B3. 资源加载错误（捕获阶段，img/script/link）
const handleResourceError = (target: EventTarget & { tagName: string; src?: string; href?: string }) => {
  const url = target.src || target.href || ''
  const fingerprint = `resource|${url.split('?')[0]}`

  if (isDuplicateError(fingerprint)) return

  queueMetric('resource_error', {
    tag: target.tagName.toLowerCase(),
    url: url.split('?')[0].slice(0, 200),
  })
}

// ============================================
// 对 request.ts 暴露的接口耗时/错误上报
// ============================================

// 正常接口耗时：按采样率上报（默认 10%）
export const trackApiTiming = (url: string, method: string, duration: number, status: number) => {
  if (duration > PERF_CONFIG.slowApiThreshold) {
    // 慢接口全量上报
    queueMetric('api_slow', { url: url.slice(0, 200), method, duration: Math.round(duration), status })
    return
  }
  // 正常请求按采样率
  if (Math.random() < PERF_CONFIG.apiSampleRate) {
    queueMetric('api_timing', { url: url.slice(0, 200), method, duration: Math.round(duration), status })
  }
}

// 接口错误：全量上报（401 静音——后台 token 过期是正常流程）
export const trackApiError = (url: string, method: string, duration: number, status: number, summary: string) => {
  if (status === 401) return

  const fingerprint = `api|${url}|${status}|${String(summary).slice(0, 100)}`
  if (isDuplicateError(fingerprint)) return

  queueMetric('api_error', {
    url: url.slice(0, 200),
    method,
    duration: Math.round(duration),
    status,
    summary: String(summary).slice(0, PERF_CONFIG.maxMessageLength),
  })
}

// 导出阈值供 request.ts 复用判断
export const PERF_THRESHOLDS = {
  slowApi: PERF_CONFIG.slowApiThreshold,
}

// 页面级渲染计时：供页面自行上报「mount → 数据渲染完成」耗时（复用 route_timing 类型，带 source 标记）
export const trackPageRender = (duration: number) => {
  queueMetric('route_timing', {
    path: window.location.pathname,
    duration: Math.round(duration),
    source: 'page_render',
  })
}

// ============================================
// 初始化入口
// ============================================
export const initPerfMonitor = () => {
  if (!PERF_CONFIG.enabled) return

  // 后台管理页面不启用（与 analytics.ts 策略一致）
  if (window.location.pathname.startsWith('/admin')) return

  // Web Vitals observers
  observeLCP()
  observeFCP()
  observeCLS()
  observeINP()
  scheduleVitalsReport()

  // 资源耗时：load 后采集（此时资源基本加载完）
  if (document.readyState === 'complete') {
    setTimeout(collectResourceTimings, 3500)
  } else {
    window.addEventListener('load', () => setTimeout(collectResourceTimings, 3500), { once: true })
  }

  // SPA 路由耗时
  watchRouteChanges()

  // 错误捕获
  setupJsErrorHandler()
  setupRejectionHandler()

  // 页面卸载时上报剩余队列
  window.addEventListener('beforeunload', () => {
    if (flushTimer) clearTimeout(flushTimer)
    void flushMetrics()
  })
}

export default {
  initPerfMonitor,
  trackApiTiming,
  trackApiError,
}

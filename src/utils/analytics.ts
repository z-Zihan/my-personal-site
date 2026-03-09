// 埋点分析 SDK

interface AnalyticsConfig {
  enabled: boolean
  apiEndpoint: string
  flushInterval: number
  maxQueueSize: number
}

interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  screenResolution: string
  language: string
  timezone: string
}

interface AnalyticsEvent extends DeviceInfo {
  event_name: string
  event_type: string
  page_path?: string
  page_title?: string
  referrer?: string
  element_selector?: string
  element_text?: string
  event_data?: Record<string, unknown>
  visitor_id?: string
  session_id?: string
  timestamp?: string
}

const ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  apiEndpoint: 'https://zzihanaini.vercel.app/api/analytics',
  flushInterval: 5000, // 5 秒上报一次
  maxQueueSize: 50,
}

// 生成访客 ID
const generateVisitorId = (): string => {
  const stored = localStorage.getItem('_vid')
  if (stored) return stored

  const newId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  localStorage.setItem('_vid', newId)
  return newId
}

// 生成会话 ID
const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('_sid')
  if (stored) return stored

  const newId = 's_' + Date.now().toString(36) + Math.random().toString(36).substring(2)
  sessionStorage.setItem('_sid', newId)
  return newId
}

// 获取设备信息
const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent

  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad/i.test(ua) ? 'tablet' : 'mobile'
  }

  let browser = 'Unknown'
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS')) os = 'iOS'

  return {
    deviceType,
    browser,
    os,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

// 事件队列
let eventQueue: AnalyticsEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

// 上报事件
const flushEvents = async () => {
  if (eventQueue.length === 0) return

  const events = [...eventQueue]
  eventQueue = []

  try {
    await fetch(ANALYTICS_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    })
  } catch (error) {
    // 失败时把事件放回队列
    eventQueue = [...events, ...eventQueue]
  }
}

// 添加事件到队列
const queueEvent = (event: Omit<AnalyticsEvent, 'visitor_id' | 'session_id' | 'timestamp'>) => {
  if (!ANALYTICS_CONFIG.enabled) return

  eventQueue.push({
    ...event,
    visitor_id: generateVisitorId(),
    session_id: generateSessionId(),
    timestamp: new Date().toISOString(),
  } as AnalyticsEvent)

  if (eventQueue.length >= ANALYTICS_CONFIG.maxQueueSize) {
    flushEvents()
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushEvents()
      flushTimer = null
    }, ANALYTICS_CONFIG.flushInterval)
  }
}

// 页面浏览事件
export const trackPageView = (pagePath: string, pageTitle: string) => {
  const deviceInfo = getDeviceInfo()
  queueEvent({
    event_name: 'page_view',
    event_type: 'navigation',
    page_path: pagePath,
    page_title: pageTitle,
    referrer: document.referrer,
    ...deviceInfo,
  })
}

// 点击事件
export const trackClick = (element: HTMLElement, pagePath: string) => {
  const deviceInfo = getDeviceInfo()
  queueEvent({
    event_name: 'click',
    event_type: 'interaction',
    page_path: pagePath,
    element_selector:
      element.tagName.toLowerCase() + (element.className ? '.' + String(element.className).split(' ')[0] : ''),
    element_text: element.textContent?.substring(0, 100),
    ...deviceInfo,
  })
}

// 表单提交事件
export const trackFormSubmit = (formName: string, pagePath: string) => {
  const deviceInfo = getDeviceInfo()
  queueEvent({
    event_name: 'form_submit',
    event_type: 'conversion',
    page_path: pagePath,
    event_data: { form_name: formName },
    ...deviceInfo,
  })
}

// 自定义事件
export const trackEvent = (eventName: string, eventType: string, eventData: Record<string, unknown> = {}) => {
  const deviceInfo = getDeviceInfo()
  queueEvent({
    event_name: eventName,
    event_type: eventType,
    ...eventData,
    ...deviceInfo,
  })
}

// 检查是否在后台管理页面
const isAdminPage = (): boolean => {
  return window.location.pathname.startsWith('/admin')
}

// 初始化埋点
export const initAnalytics = () => {
  if (!ANALYTICS_CONFIG.enabled) return

  // 后台管理页面不启用埋点
  if (isAdminPage()) return

  // 自动追踪页面浏览
  trackPageView(window.location.pathname, document.title)

  // 监听页面导航（SPA）
  const originalPushState = history.pushState
  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    setTimeout(() => {
      // 导航后检查是否进入后台页面
      if (!isAdminPage()) {
        trackPageView(window.location.pathname, document.title)
      }
    }, 0)
  }

  // 自动追踪所有点击
  document.addEventListener('click', (e) => {
    // 后台页面不追踪点击
    if (isAdminPage()) return
    const target = (e.target as Element | null)?.closest('a, button, [role="button"]')
    if (target) {
      trackClick(target as HTMLElement, window.location.pathname)
    }
  })

  // 页面卸载时上报剩余事件
  window.addEventListener('beforeunload', () => {
    if (flushTimer) clearTimeout(flushTimer)
    flushEvents()
  })
}

export default {
  initAnalytics,
  trackPageView,
  trackClick,
  trackFormSubmit,
  trackEvent,
}

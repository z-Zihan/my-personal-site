// 埋点分析 SDK

const ANALYTICS_CONFIG = {
  enabled: true,
  apiEndpoint: '/api/analytics',
  flushInterval: 5000, // 5 秒上报一次
  maxQueueSize: 50,
}

// 生成访客 ID
const generateVisitorId = () => {
  const stored = localStorage.getItem('_vid')
  if (stored) return stored
  
  const newId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  localStorage.setItem('_vid', newId)
  return newId
}

// 生成会话 ID
const generateSessionId = () => {
  const stored = sessionStorage.getItem('_sid')
  if (stored) return stored
  
  const newId = 's_' + Date.now().toString(36) + Math.random().toString(36).substring(2)
  sessionStorage.setItem('_sid', newId)
  return newId
}

// 获取设备信息
const getDeviceInfo = () => {
  const ua = navigator.userAgent
  
  let deviceType = 'desktop'
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
let eventQueue = []
let flushTimer = null

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
    console.error('Analytics flush error:', error)
    // 失败时把事件放回队列
    eventQueue = [...events, ...eventQueue]
  }
}

// 添加事件到队列
const queueEvent = (event) => {
  if (!ANALYTICS_CONFIG.enabled) return
  
  eventQueue.push({
    ...event,
    visitor_id: generateVisitorId(),
    session_id: generateSessionId(),
    timestamp: new Date().toISOString(),
  })
  
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
export const trackPageView = (pagePath, pageTitle) => {
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
export const trackClick = (element, pagePath) => {
  queueEvent({
    event_name: 'click',
    event_type: 'interaction',
    page_path: pagePath,
    element_selector: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ')[0] : ''),
    element_text: element.textContent?.substring(0, 100),
  })
}

// 表单提交事件
export const trackFormSubmit = (formName, pagePath) => {
  queueEvent({
    event_name: 'form_submit',
    event_type: 'conversion',
    page_path: pagePath,
    event_data: { form_name: formName },
  })
}

// 自定义事件
export const trackEvent = (eventName, eventType, eventData = {}) => {
  queueEvent({
    event_name: eventName,
    event_type: eventType,
    ...eventData,
  })
}

// 初始化埋点
export const initAnalytics = () => {
  if (!ANALYTICS_CONFIG.enabled) return
  
  // 自动追踪页面浏览
  trackPageView(window.location.pathname, document.title)
  
  // 监听页面导航（SPA）
  const originalPushState = history.pushState
  history.pushState = function(...args) {
    originalPushState.apply(this, args)
    setTimeout(() => {
      trackPageView(window.location.pathname, document.title)
    }, 0)
  }
  
  // 自动追踪所有点击
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, [role="button"]')
    if (target) {
      trackClick(target, window.location.pathname)
    }
  })
  
  // 页面卸载时上报剩余事件
  window.addEventListener('beforeunload', () => {
    if (flushTimer) clearTimeout(flushTimer)
    flushEvents()
  })
  
  console.log('📊 Analytics initialized')
}

export default {
  initAnalytics,
  trackPageView,
  trackClick,
  trackFormSubmit,
  trackEvent,
}

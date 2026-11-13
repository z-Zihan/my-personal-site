import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

interface TrackEvent {
  visitor_id: string
  ip?: string
  country?: string
  region?: string
  city?: string
  language?: string
  screenResolution?: string
  timezone?: string
  session_id: string
  event_name: string
  event_type?: string
  event_data?: Record<string, unknown>
  page_path?: string
  element_selector?: string
  element_text?: string
  page_title?: string
  referrer?: string
  deviceType?: string
  browser?: string
  os?: string
  /** 前端标记的流量环境: prod|dev|bot */
  env?: string
  /** 前端标记的博主登录态 */
  is_owner?: boolean
}

interface DailyStats {
  date: string
  views: number
}

interface PageStats {
  path: string
  title?: string
  views: number
}

interface DeviceStats {
  name: string
  value: number
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method === 'POST') {
    return handleTrack(req)
  }

  if (req.method === 'GET') {
    return handleStats(req)
  }

  return errorResponse('Method not allowed', 405)
}

// 处理事件上报
async function handleTrack(req: Request): Promise<Response> {
  try {
    const { events } = await req.json() as { events: TrackEvent[] }

    if (!events || !Array.isArray(events)) {
      return errorResponse('Invalid events data', 400)
    }

    // ===== 服务端流量分类(2026-11-13) =====
    // 服务端 UA 兜底判定,与前端 env 标记取更严格的结局(bot 优先)。
    // 分类结果三值: real | dev | bot | owner
    const SERVER_BOTS = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|vercel-screenshot|lighthouse|pagespeed|puppeteer|playwright|phantomjs|preview/i
    const uaHeader = (req.headers.get('user-agent') || '').slice(0, 200)
    const uaIsBot = !uaHeader || uaHeader.length < 10 || SERVER_BOTS.test(uaHeader)

    const classify = (event: TrackEvent): 'real' | 'dev' | 'bot' | 'owner' => {
      if (event.is_owner) return 'owner'
      // visitor_id 前缀: v.{env}.{bot|human}.{reason}
      const parts = (event.visitor_id || '').split('.')
      let env = parts.length >= 4 && parts[0] === 'v' ? parts[1] : 'prod'
      let frontendBot = parts.length >= 4 && parts[0] === 'v' ? parts[2] === 'bot' : false
      if (uaIsBot || frontendBot) return 'bot'
      if (env === 'dev') return 'dev'
      return 'real'
    }

    // 按类型分组，使用批量插入代替逐条 await
    const now = new Date().toISOString()
    const visitorUpserts = events.map(event => ({
      visitor_id: event.visitor_id,
      ip_address: event.ip || null,
      country: event.country || null,
      region: event.region || null,
      city: event.city || null,
      language: event.language || null,
      screen_resolution: event.screenResolution || null,
      timezone: event.timezone || null,
      last_seen_at: now,
      user_agent: uaHeader || null,
    }))

    const pageViewInserts = events
      .filter(e => e.event_name === 'page_view')
      .map(event => ({
        visitor_id: event.visitor_id,
        session_id: event.session_id,
        page_path: event.page_path,
        page_title: event.page_title,
        referrer: event.referrer,
        device_type: event.deviceType,
        browser: event.browser,
        os: event.os,
        traffic_class: classify(event),
        user_agent: uaHeader || null,
      }))

    const eventInserts = events
      .filter(e => e.event_name !== 'page_view')
      .map(event => ({
        visitor_id: event.visitor_id,
        session_id: event.session_id,
        event_name: event.event_name,
        event_type: event.event_type,
        event_data: { ...(event.event_data || {}), env: event.env, is_owner: event.is_owner },
        page_path: event.page_path,
        element_selector: event.element_selector,
        element_text: event.element_text,
        traffic_class: classify(event),
      }))

    // 并行批量执行所有数据库操作
    await Promise.all([
      supabase.from('visitors').upsert(visitorUpserts, { onConflict: 'visitor_id' }),
      pageViewInserts.length > 0
        ? supabase.from('page_views').insert(pageViewInserts)
        : Promise.resolve(),
      eventInserts.length > 0
        ? supabase.from('events').insert(eventInserts)
        : Promise.resolve(),
    ])

    return jsonResponse({ data: { success: true } })
  } catch (error) {
    console.error('Analytics track error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// 处理统计数据查询
async function handleStats(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'overview'
    const days = parseInt(url.searchParams.get('days') || '7')
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString()

    let data: unknown

    switch (type) {
      case 'overview': {
        const [visitors, pageViews, sessions, events, realPageViews, botPageViews, devPageViews, ownerPageViews] = await Promise.all([
          supabase
            .from('visitors')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('page_views')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('sessions')
            .select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          // 真实流量口径: 排除爬虫/开发环境/博主本人
          supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('traffic_class', 'real'),
          supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('traffic_class', 'bot'),
          supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('traffic_class', 'dev'),
          supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('traffic_class', 'owner'),
        ])
        data = {
          totalVisitors: visitors.count || 0,
          totalPageViews: pageViews.count || 0,
          totalSessions: sessions.count || 0,
          totalEvents: events.count || 0,
          // 真实流量(2026-11-13 埋点改造后开始累计;旧数据无 traffic_class 默认视为未分类)
          realPageViews: realPageViews.count || 0,
          trafficBreakdown: {
            real: realPageViews.count || 0,
            bot: botPageViews.count || 0,
            dev: devPageViews.count || 0,
            owner: ownerPageViews.count || 0,
            unclassified: (pageViews.count || 0) - (realPageViews.count || 0) - (botPageViews.count || 0) - (devPageViews.count || 0) - (ownerPageViews.count || 0),
          },
        }
        break
      }

      case 'daily':
        // 每日趋势 - 只统计真实流量(排除 bot/dev/owner;旧数据未分类也计入,避免历史曲线塌零)
        {
          const dailyResult = await supabase
            .from('page_views')
            .select('created_at, traffic_class')
            .gte('created_at', startDate)
          const rawDailyData = dailyResult.data || []
          const dailyStats: Record<string, number> = {}
          rawDailyData.forEach((pv: { created_at: string; traffic_class?: string }) => {
            // 排除明确的非真实流量
            if (pv.traffic_class && pv.traffic_class !== 'real') return
            const date = pv.created_at.split('T')[0]
            dailyStats[date] = (dailyStats[date] || 0) + 1
          })
          data = Object.entries(dailyStats).map(([date, views]) => ({ date, views }))
          break
        }

      case 'pages':
        // 热门页面 - 使用聚合查询
        {
          const { data: pagesData, error } = await supabase.rpc('get_top_pages', {
            start_date: startDate,
            limit_count: 10
          })
          if (error && !error.message.includes('Function')) {
            console.error('RPC error:', error)
          }
          // 如果 RPC 函数不存在，回退到普通查询
          if (!pagesData || error) {
            const pagesResult = await supabase
              .from('page_views')
              .select('page_path, page_title')
              .gte('created_at', startDate)
              .order('created_at', { ascending: false })
              .limit(100)
            const pageStats: Record<string, PageStats> = {}
            ;(pagesResult.data || []).forEach((pv: { page_path: string; page_title?: string }) => {
              if (!pageStats[pv.page_path]) {
                pageStats[pv.page_path] = {
                  path: pv.page_path,
                  title: pv.page_title,
                  views: 0,
                }
              }
              if (pageStats[pv.page_path]) {
                pageStats[pv.page_path].views++
              }
            })
            data = Object.values(pageStats)
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
          } else {
            data = pagesData
          }
          break
        }

      case 'devices': {
        const { data: deviceData, error } = await supabase.rpc('get_device_stats', {
          start_date: startDate
        })
        if (error && !error.message.includes('Function')) {
          console.error('RPC error:', error)
        }
        if (!deviceData || error) {
          const deviceResult = await supabase
            .from('page_views')
            .select('device_type')
            .gte('created_at', startDate)
          const deviceStats: Record<string, number> = {}
          ;(deviceResult.data || []).forEach((pv: { device_type?: string }) => {
            const type = pv.device_type || 'unknown'
            deviceStats[type] = (deviceStats[type] || 0) + 1
          })
          data = Object.entries(deviceStats).map(([name, value]) => ({ name, value }))
        } else {
          data = deviceData
        }
        break
      }

      case 'browsers': {
        const { data: browserData, error } = await supabase.rpc('get_browser_stats', {
          start_date: startDate,
          limit_count: 10
        })
        if (error && !error.message.includes('Function')) {
          console.error('RPC error:', error)
        }
        if (!browserData || error) {
          const browserResult = await supabase
            .from('page_views')
            .select('browser')
            .gte('created_at', startDate)
          const browserStats: Record<string, number> = {}
          ;(browserResult.data || []).forEach((pv: { browser?: string }) => {
            const browser = pv.browser || 'Unknown'
            browserStats[browser] = (browserStats[browser] || 0) + 1
          })
          data = Object.entries(browserStats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
        } else {
          data = browserData
        }
        break
      }

      case 'countries': {
        const { data: countryData, error } = await supabase.rpc('get_country_stats', {
          start_date: startDate
        })
        if (error && !error.message.includes('Function')) {
          console.error('RPC error:', error)
        }
        if (!countryData || error) {
          const countryResult = await supabase
            .from('visitors')
            .select('country')
            .gte('created_at', startDate)
          const countryStats: Record<string, number> = {}
          ;(countryResult.data || []).forEach((v: { country?: string }) => {
            const country = v.country || 'Unknown'
            countryStats[country] = (countryStats[country] || 0) + 1
          })
          data = Object.entries(countryStats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        } else {
          data = countryData
        }
        break
      }

      case 'events': {
        // 获取事件统计
        const eventsResult = await supabase
          .from('events')
          .select('event_name')
          .gte('created_at', startDate)
        const eventStats: Record<string, number> = {}
        ;(eventsResult.data || []).forEach((e: { event_name: string }) => {
          eventStats[e.event_name] = (eventStats[e.event_name] || 0) + 1
        })
        data = Object.entries(eventStats)
          .map(([event_name, count]) => ({ event_name, count }))
          .sort((a, b) => b.count - a.count)
        break
      }

      case 'event_detail': {
        // 获取特定事件的详细信息
        const eventName = url.searchParams.get('event_name')
        if (!eventName) {
          return errorResponse('event_name is required', 400)
        }

        // 获取事件列表（包含 visitor_id 用于关联查询）
        const eventsList = await supabase
          .from('events')
          .select('id, visitor_id, page_path, created_at, event_data')
          .eq('event_name', eventName)
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(100)

        const eventRecords = eventsList.data || []

        // 每日趋势
        const dailyStats: Record<string, number> = {}
        eventRecords.forEach((e: { created_at: string }) => {
          const date = e.created_at.split('T')[0]
          dailyStats[date] = (dailyStats[date] || 0) + 1
        })
        const dailyTrend = Object.entries(dailyStats)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))

        // 页面路径分布
        const pathStats: Record<string, number> = {}
        eventRecords.forEach((e: { page_path?: string }) => {
          if (e.page_path) {
            pathStats[e.page_path] = (pathStats[e.page_path] || 0) + 1
          }
        })
        const pagePaths = Object.entries(pathStats)
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        // 获取关联的访客信息用于设备和地域分析
        const visitorIds = [...new Set(eventRecords.map((e: { visitor_id?: string }) => e.visitor_id).filter(Boolean))]
        const visitorsInfo = await supabase
          .from('visitors')
          .select('visitor_id, country')
          .in('visitor_id', visitorIds)

        // 地域分布
        const countryStats: Record<string, number> = {}
        ;(visitorsInfo.data || []).forEach((v: { visitor_id: string; country?: string }) => {
          const country = v.country || 'Unknown'
          countryStats[country] = (countryStats[country] || 0) + 1
        })
        const countries = Object.entries(countryStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)

        // 获取关联的 page_views 用于设备和浏览器分析
        const pageViewsInfo = await supabase
          .from('page_views')
          .select('visitor_id, device_type, browser')
          .in('visitor_id', visitorIds)
          .gte('created_at', startDate)

        // 设备分布
        const deviceStats: Record<string, number> = {}
        ;(pageViewsInfo.data || []).forEach((pv: { device_type?: string }) => {
          const device = pv.device_type || 'unknown'
          deviceStats[device] = (deviceStats[device] || 0) + 1
        })
        const devices = Object.entries(deviceStats)
          .map(([name, value]) => ({ name, value }))

        // 浏览器分布
        const browserStats: Record<string, number> = {}
        ;(pageViewsInfo.data || []).forEach((pv: { browser?: string }) => {
          const browser = pv.browser || 'Unknown'
          browserStats[browser] = (browserStats[browser] || 0) + 1
        })
        const browsers = Object.entries(browserStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)

        // 参数分布统计 - 聚合 event_data 中的各个字段
        const paramStats: Record<string, Record<string, number>> = {}
        eventRecords.forEach((e: { event_data?: Record<string, unknown> }) => {
          if (e.event_data && typeof e.event_data === 'object') {
            Object.entries(e.event_data).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                if (!paramStats[key]) paramStats[key] = {}
                const strValue = String(value)
                paramStats[key][strValue] = (paramStats[key][strValue] || 0) + 1
              }
            })
          }
        })
        const paramDistributions = Object.entries(paramStats).map(([paramName, values]) => ({
          paramName,
          values: Object.entries(values)
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count),
        }))

        data = {
          dailyTrend,
          devices,
          browsers,
          countries,
          pagePaths,
          paramDistributions,
          recentEvents: eventRecords.slice(0, 20).map((e: {
            id: number;
            visitor_id?: string;
            page_path?: string;
            created_at: string;
            event_data?: Record<string, unknown>;
          }) => ({
            id: e.id,
            visitor_id: e.visitor_id || '',
            page_path: e.page_path || '',
            created_at: e.created_at,
            event_data: e.event_data || {},
          })),
        }
        break
      }

      default:
        return errorResponse('Invalid stats type', 400)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Analytics stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}

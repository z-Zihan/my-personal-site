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

    // 批量插入事件
    for (const event of events) {
      // 更新或创建访客
      await supabase.from('visitors').upsert(
        {
          visitor_id: event.visitor_id,
          ip_address: event.ip || null,
          country: event.country || null,
          region: event.region || null,
          city: event.city || null,
          language: event.language || null,
          screen_resolution: event.screenResolution || null,
          timezone: event.timezone || null,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'visitor_id' },
      )

      // 记录页面访问
      if (event.event_name === 'page_view') {
        await supabase.from('page_views').insert({
          visitor_id: event.visitor_id,
          session_id: event.session_id,
          page_path: event.page_path,
          page_title: event.page_title,
          referrer: event.referrer,
          device_type: event.deviceType,
          browser: event.browser,
          os: event.os,
        })
      }

      // 记录事件
      if (event.event_name !== 'page_view') {
        await supabase.from('events').insert({
          visitor_id: event.visitor_id,
          session_id: event.session_id,
          event_name: event.event_name,
          event_type: event.event_type,
          event_data: event.event_data || {},
          page_path: event.page_path,
          element_selector: event.element_selector,
          element_text: event.element_text,
        })
      }
    }

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
        const [visitors, pageViews, sessions, events] = await Promise.all([
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
        ])
        data = {
          totalVisitors: visitors.count || 0,
          totalPageViews: pageViews.count || 0,
          totalSessions: sessions.count || 0,
          totalEvents: events.count || 0,
        }
        break
      }

      case 'daily':
        // 每日趋势 - 使用 aggregate 分组统计
        {
          const { data: dailyData, error } = await supabase.rpc('get_daily_pageviews', {
            start_date: startDate
          })
          if (error && !error.message.includes('Function')) {
            console.error('RPC error:', error)
          }
          // 如果 RPC 函数不存在，回退到普通查询
          if (!dailyData || error) {
            const dailyResult = await supabase
              .from('page_views')
              .select('created_at')
              .gte('created_at', startDate)
            const rawDailyData = dailyResult.data || []
            const dailyStats: Record<string, number> = {}
            rawDailyData.forEach((pv: { created_at: string }) => {
              const date = pv.created_at.split('T')[0]
              dailyStats[date] = (dailyStats[date] || 0) + 1
            })
            data = Object.entries(dailyStats).map(([date, views]) => ({ date, views }))
          } else {
            data = dailyData
          }
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
            (pagesResult.data || []).forEach((pv: { page_path: string; page_title?: string }) => {
              if (!pageStats[pv.page_path]) {
                pageStats[pv.page_path] = {
                  path: pv.page_path,
                  title: pv.page_title,
                  views: 0,
                }
              }
              pageStats[pv.page_path].views++
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
          (deviceResult.data || []).forEach((pv: { device_type?: string }) => {
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
          (browserResult.data || []).forEach((pv: { browser?: string }) => {
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
          (countryResult.data || []).forEach((v: { country?: string }) => {
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

      default:
        return errorResponse('Invalid stats type', 400)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Analytics stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}

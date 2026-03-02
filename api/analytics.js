import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib.js'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
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
async function handleTrack(req) {
  try {
    const { events } = await req.json()
    
    if (!events || !Array.isArray(events)) {
      return errorResponse('Invalid events data', 400)
    }

    // 批量插入事件
    for (const event of events) {
      // 更新或创建访客
      await supabase
        .from('visitors')
        .upsert({
          visitor_id: event.visitor_id,
          ip_address: event.ip || null,
          country: event.country || null,
          region: event.region || null,
          city: event.city || null,
          language: event.language || null,
          screen_resolution: event.screenResolution || null,
          timezone: event.timezone || null,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'visitor_id' })

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

    return jsonResponse({ success: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// 处理统计数据查询
async function handleStats(req) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'overview'
    const days = parseInt(url.searchParams.get('days') || '7')
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    let data

    switch (type) {
      case 'overview':
        // 总体概览
        const [visitors, pageViews, sessions, events] = await Promise.all([
          supabase.from('visitors').select('id', { count: 'exact', head: true }),
          supabase.from('page_views').select('id', { count: 'exact', head: true }),
          supabase.from('sessions').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
        ])
        data = {
          totalVisitors: visitors.count || 0,
          totalPageViews: pageViews.count || 0,
          totalSessions: sessions.count || 0,
          totalEvents: events.count || 0,
        }
        break

      case 'daily':
        // 每日趋势
        const dailyResult = await supabase
          .from('page_views')
          .select('created_at')
          .gte('created_at', startDate)
        const dailyData = dailyResult.data || []
        const dailyStats = {}
        dailyData.forEach(pv => {
          const date = pv.created_at.split('T')[0]
          dailyStats[date] = (dailyStats[date] || 0) + 1
        })
        data = Object.entries(dailyStats).map(([date, views]) => ({ date, views }))
        break

      case 'pages':
        // 热门页面
        const pagesResult = await supabase
          .from('page_views')
          .select('page_path, page_title')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(100)
        const pageStats = {}
        ;(pagesResult.data || []).forEach(pv => {
          if (!pageStats[pv.page_path]) {
            pageStats[pv.page_path] = { path: pv.page_path, title: pv.page_title, views: 0 }
          }
          pageStats[pv.page_path].views++
        })
        data = Object.values(pageStats).sort((a, b) => b.views - a.views).slice(0, 10)
        break

      case 'devices':
        // 设备分布
        const deviceResult = await supabase
          .from('page_views')
          .select('device_type')
          .gte('created_at', startDate)
        const deviceStats = {}
        ;(deviceResult.data || []).forEach(pv => {
          const type = pv.device_type || 'unknown'
          deviceStats[type] = (deviceStats[type] || 0) + 1
        })
        data = Object.entries(deviceStats).map(([name, value]) => ({ name, value }))
        break

      case 'browsers':
        // 浏览器分布
        const browserResult = await supabase
          .from('page_views')
          .select('browser')
          .gte('created_at', startDate)
        const browserStats = {}
        ;(browserResult.data || []).forEach(pv => {
          const browser = pv.browser || 'Unknown'
          browserStats[browser] = (browserStats[browser] || 0) + 1
        })
        data = Object.entries(browserStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
        break

      case 'countries':
        // 地域分布
        const countryResult = await supabase
          .from('visitors')
          .select('country')
          .gte('created_at', startDate)
        const countryStats = {}
        ;(countryResult.data || []).forEach(v => {
          const country = v.country || 'Unknown'
          countryStats[country] = (countryStats[country] || 0) + 1
        })
        data = Object.entries(countryStats)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
        break

      default:
        return errorResponse('Invalid stats type', 400)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Analytics stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}

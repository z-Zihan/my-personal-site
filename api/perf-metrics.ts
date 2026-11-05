import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'
export const config = {
  runtime: 'edge',
}

// 支持的指标类型（与 src/utils/perfMonitor.ts、sql/03-perf-monitoring.sql 保持一致）
const VALID_TYPES = new Set([
  'web_vital',
  'route_timing',
  'resource_summary',
  'slow_resource',
  'api_timing',
  'api_slow',
  'api_error',
  'js_error',
  'promise_error',
  'resource_error',
])

interface PerfMetricPayload {
  type: string
  visitor_id?: string
  session_id?: string
  page_path?: string
  data?: Record<string, unknown>
  timestamp?: string
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

// 处理性能/错误指标上报（支持单条与批量数组）
async function handleTrack(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { metrics?: PerfMetricPayload[] } & PerfMetricPayload

    // 兼容单条对象和 { metrics: [...] } 批量两种格式
    const rawMetrics: PerfMetricPayload[] = Array.isArray(body?.metrics)
      ? body.metrics
      : [body]

    if (rawMetrics.length === 0) {
      return errorResponse('Invalid metrics data', 400)
    }

    // 限幅：单次最多 50 条，超出丢弃并计数
    let dropped = 0
    let metrics = rawMetrics
    if (rawMetrics.length > 50) {
      dropped = rawMetrics.length - 50
      metrics = rawMetrics.slice(0, 50)
    }

    // 过滤非法 type / 缺少 visitor_id 的记录
    const inserts = metrics
      .filter((m) => m && m.type && VALID_TYPES.has(m.type) && m.visitor_id)
      .map((m) => ({
        visitor_id: m.visitor_id!,
        session_id: m.session_id || '',
        type: m.type,
        page_path: m.page_path || '/',
        data: m.data || {},
        // 客户端时间戳优先（跨时区/离线缓冲场景更准确），缺省用服务端时间
        created_at: m.timestamp || new Date().toISOString(),
      }))

    if (inserts.length > 0) {
      const { error } = await supabase.from('perf_metrics').insert(inserts)
      if (error) {
        console.error('Perf metrics insert error:', error)
        return errorResponse('Internal server error', 500)
      }
    }

    return jsonResponse({ data: { success: true, received: inserts.length, dropped } })
  } catch (error) {
    console.error('Perf metrics track error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// 百分位数计算（线性插值）
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  const value = lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
  return Math.round(value * 100) / 100
}

// 处理聚合查询（后台 PerfDashboard 展示用）
async function handleStats(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'overview'
    const days = parseInt(url.searchParams.get('days') || '7')
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    let data: unknown

    switch (type) {
      // 核心概览：Web Vitals P50/P75/P95 + 错误总数 + 路由耗时 P75
      case 'overview': {
        // 拉取时间窗内的关键指标行（个人博客量级可控，一次拉取后内存聚合）
        const [vitalsResult, routeResult, errorCounts] = await Promise.all([
          supabase
            .from('perf_metrics')
            .select('data')
            .eq('type', 'web_vital')
            .gte('created_at', startDate)
            .order('created_at', { ascending: false })
            .limit(2000),
          supabase
            .from('perf_metrics')
            .select('data')
            .eq('type', 'route_timing')
            .gte('created_at', startDate)
            .order('created_at', { ascending: false })
            .limit(2000),
          supabase
            .from('perf_metrics')
            .select('type')
            .in('type', ['js_error', 'promise_error', 'resource_error', 'api_error', 'api_slow', 'slow_resource'])
            .gte('created_at', startDate),
        ])

        const vitalsRows = (vitalsResult.data || []) as Array<{ data: Record<string, unknown> }>
        const routeRows = (routeResult.data || []) as Array<{ data: Record<string, unknown> }>
        const errorRows = (errorCounts.data || []) as Array<{ type: string }>

        const pick = (rows: Array<{ data: Record<string, unknown> }>, key: string): number[] =>
          rows.map((r) => Number(r.data?.[key])).filter((n) => Number.isFinite(n) && n > 0)

        // 每类错误计数
        const errorBreakdown: Record<string, number> = {}
        errorRows.forEach((r) => {
          errorBreakdown[r.type] = (errorBreakdown[r.type] || 0) + 1
        })

        const pct = (key: string) => {
          const values = pick(vitalsRows, key)
          return { p50: percentile(values, 0.5), p75: percentile(values, 0.75), p95: percentile(values, 0.95), count: values.length }
        }

        const routeDurations = pick(routeRows, 'duration')
        data = {
          lcp: pct('lcp'),
          fcp: pct('fcp'),
          cls: pct('cls'),
          ttfb: pct('ttfb'),
          inp: pct('inp'),
          dom_ready: pct('dom_ready'),
          route: { p50: percentile(routeDurations, 0.5), p75: percentile(routeDurations, 0.75), p95: percentile(routeDurations, 0.95), count: routeDurations.length },
          errors: {
            total: errorRows.length,
            breakdown: errorBreakdown,
          },
        }
        break
      }

      // Web Vitals 每日趋势（P75）
      case 'daily': {
        const result = await supabase
          .from('perf_metrics')
          .select('data, created_at')
          .eq('type', 'web_vital')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true })
          .limit(3000)
        const rows = (result.data || []) as Array<{ data: Record<string, unknown>; created_at: string }>

        // 按天分组，每天算 LCP/FCP/CLS/TTFB 的 P75
        const byDay: Record<string, { lcp: number[]; fcp: number[]; cls: number[]; ttfb: number[] }> = {}
        rows.forEach((r) => {
          const date = r.created_at.split('T')[0]
          if (!byDay[date]) byDay[date] = { lcp: [], fcp: [], cls: [], ttfb: [] }
          const num = (key: string) => {
            const n = Number(r.data?.[key])
            return Number.isFinite(n) && n > 0 ? n : null
          }
          const lcp = num('lcp'); if (lcp !== null) byDay[date].lcp.push(lcp)
          const fcp = num('fcp'); if (fcp !== null) byDay[date].fcp.push(fcp)
          const cls = num('cls'); if (cls !== null) byDay[date].cls.push(cls)
          const ttfb = num('ttfb'); if (ttfb !== null) byDay[date].ttfb.push(ttfb)
        })

        data = Object.entries(byDay).map(([date, v]) => ({
          date,
          lcp: percentile(v.lcp, 0.75),
          fcp: percentile(v.fcp, 0.75),
          cls: percentile(v.cls, 0.75),
          ttfb: percentile(v.ttfb, 0.75),
        }))
        break
      }

      // 错误列表（最近 N 条）
      case 'errors': {
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200)
        const result = await supabase
          .from('perf_metrics')
          .select('id, type, page_path, data, created_at')
          .in('type', ['js_error', 'promise_error', 'resource_error', 'api_error'])
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(limit)
        data = result.data || []
        break
      }

      // 慢接口 TopN（api_slow 为主，api_error 附带）
      case 'slow_apis': {
        const result = await supabase
          .from('perf_metrics')
          .select('data, created_at')
          .in('type', ['api_slow', 'api_error'])
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(1000)
        const rows = (result.data || []) as Array<{ data: Record<string, unknown> }>

        // 按 url+method 聚合：次数、平均/P95 耗时、错误次数
        const grouped: Record<string, { url: string; method: string; durations: number[]; errors: number }> = {}
        rows.forEach((r) => {
          const key = `${r.data?.method}|${r.data?.url}`
          if (!grouped[key]) {
            grouped[key] = {
              url: String(r.data?.url || ''),
              method: String(r.data?.method || 'GET'),
              durations: [],
              errors: 0,
            }
          }
          const d = Number(r.data?.duration)
          if (Number.isFinite(d) && d > 0) grouped[key].durations.push(d)
          if (r.data && typeof r.data.summary === 'string') grouped[key].errors++
        })

        data = Object.values(grouped)
          .map((g) => ({
            url: g.url,
            method: g.method,
            count: g.durations.length,
            avg: Math.round(g.durations.reduce((s, d) => s + d, 0) / (g.durations.length || 1)),
            p95: percentile(g.durations, 0.95),
            errors: g.errors,
          }))
          .sort((a, b) => b.p95 - a.p95)
          .slice(0, 10)
        break
      }

      // 慢资源 TopN
      case 'slow_resources': {
        const result = await supabase
          .from('perf_metrics')
          .select('data, created_at')
          .in('type', ['slow_resource'])
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(500)
        const rows = (result.data || []) as Array<{ data: Record<string, unknown> }>

        const grouped: Record<string, { name: string; type: string; durations: number[] }> = {}
        rows.forEach((r) => {
          const name = String(r.data?.name || '')
          if (!grouped[name]) {
            grouped[name] = { name, type: String(r.data?.type || ''), durations: [] }
          }
          const d = Number(r.data?.duration)
          if (Number.isFinite(d) && d > 0) grouped[name].durations.push(d)
        })

        data = Object.values(grouped)
          .map((g) => ({
            name: g.name,
            type: g.type,
            count: g.durations.length,
            avg: Math.round(g.durations.reduce((s, d) => s + d, 0) / (g.durations.length || 1)),
            max: Math.max(...g.durations, 0),
          }))
          .sort((a, b) => b.max - a.max)
          .slice(0, 10)
        break
      }

      // 路由耗时 TopN（最慢页面）
      case 'routes': {
        const result = await supabase
          .from('perf_metrics')
          .select('page_path, data, created_at')
          .eq('type', 'route_timing')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(2000)
        const rows = (result.data || []) as Array<{ page_path: string; data: Record<string, unknown> }>

        const grouped: Record<string, number[]> = {}
        rows.forEach((r) => {
          const d = Number(r.data?.duration)
          if (!Number.isFinite(d) || d <= 0) return
          if (!grouped[r.page_path]) grouped[r.page_path] = []
          grouped[r.page_path].push(d)
        })

        data = Object.entries(grouped)
          .map(([path, durations]) => ({
            path,
            count: durations.length,
            p75: percentile(durations, 0.75),
            p95: percentile(durations, 0.95),
          }))
          .sort((a, b) => b.p75 - a.p75)
          .slice(0, 10)
        break
      }

      // 原始行查询（type 过滤，给后台清理 __test__ 数据用）
      case 'raw': {
        const metricType = url.searchParams.get('metric_type')
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
        let query = supabase
          .from('perf_metrics')
          .select('id, type, page_path, data, visitor_id, created_at')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(limit)
        if (metricType) {
          query = query.eq('type', metricType)
        }
        const result = await query
        data = result.data || []
        break
      }

      // 百分位明细（给 GET 单测/冒烟验证用）
      case 'percentiles': {
        const result = await supabase
          .from('perf_metrics')
          .select('data')
          .eq('type', 'web_vital')
          .gte('created_at', startDate)
          .limit(2000)
        const rows = (result.data || []) as Array<{ data: Record<string, unknown> }>
        const pickNum = (key: string): number[] =>
          rows.map((r) => Number(r.data?.[key])).filter((n) => Number.isFinite(n) && n > 0)
        data = {
          lcp: { p50: percentile(pickNum('lcp'), 0.5), p75: percentile(pickNum('lcp'), 0.75), p95: percentile(pickNum('lcp'), 0.95) },
          fcp: { p50: percentile(pickNum('fcp'), 0.5), p75: percentile(pickNum('fcp'), 0.75), p95: percentile(pickNum('fcp'), 0.95) },
          cls: { p50: percentile(pickNum('cls'), 0.5), p75: percentile(pickNum('cls'), 0.75), p95: percentile(pickNum('cls'), 0.95) },
          ttfb: { p50: percentile(pickNum('ttfb'), 0.5), p75: percentile(pickNum('ttfb'), 0.75), p95: percentile(pickNum('ttfb'), 0.95) },
        }
        break
      }

      default:
        return errorResponse('Invalid stats type', 400)
    }

    return jsonResponse({ data })
  } catch (error) {
    console.error('Perf metrics stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}

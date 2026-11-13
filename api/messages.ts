import { supabase, jsonResponse, errorResponse, optionsResponse } from './_lib'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return optionsResponse()
  }

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') || '10')))
    const sort = (url.searchParams.get('sort') || 'time') as 'time' | 'hot' | 'random'
    const seed = url.searchParams.get('seed') ? parseFloat(url.searchParams.get('seed')!) : null
    // origin=system: 后台"系统留言"专用,返回系统生成的留言(seed/mock),倒序
    const origin = url.searchParams.get('origin')
    const offset = (page - 1) * pageSize

    // 随机排序模式：使用 PostgreSQL setseed + random() 实现可复现的随机分页
    if (sort === 'random') {
      if (seed === null) {
        return errorResponse('seed parameter is required for random sort', 400)
      }

      const clampedSeed = Math.max(0, Math.min(1, seed))

      const { data, error } = await supabase.rpc('get_messages_random', {
        p_seed: clampedSeed,
        p_limit: pageSize,
        p_offset: offset,
      })

      if (error) {
        return errorResponse(error.message, 500)
      }

      const total = data && data.length > 0 ? Number(data[0].total_count) : 0
      const messages = (data || []).map(({ total_count, ...rest }: any) => rest)

      return jsonResponse({
        data: messages,
        total,
        hasMore: (page * pageSize) < total,
      })
    }

    // ---- origin=system: 后台系统留言列表(与前台完全隔离) ----
    if (origin === 'system') {
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        // 系统留言 = 全部 - 真实(^visitor_<13位ts>_) - 博主(owner_*)
        .not('visitor_id', 'match', '^(owner_|visitor_[0-9]{13,}_)')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) {
        return errorResponse(error.message, 500)
      }

      return jsonResponse({
        data: data || [],
        total: count || 0,
        hasMore: (page * pageSize) < (count || 0),
      })
    }

    // 最新 / 热门排序模式：使用 Supabase 查询
    // 2026-11-13 来源隔离：前台只展示真实留言(visitor_<ts>_<rand> 前缀)
    // owner_* / visitor_<纯数字>(seed) / mock_visitor_* / intl_* 都是系统生成,走后台"系统留言"入口管理
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      // PostgREST 正则匹配(match = ~):^visitor_<13位以上数字>_ 才是真实留言
      // (visitorStore 生成 visitor_<Date.now()>_<rand>)
      // 排除 seed(visitor_00N)/mock_visitor_*/intl_*;^ 锚点必须带,否则会误匹配 mock_visitor_*
      .filter('visitor_id', 'match', '^visitor_[0-9]{13,}_')

    // 热门：博主留言（visitor_id 以 owner_ 开头）单独置顶在第 1 页，分页主体排除博主留言
    let ownerMessages: unknown[] = []
    if (sort === 'hot') {
      const { data: owners } = await supabase
        .from('messages')
        .select('*')
        .like('visitor_id', 'owner\\_%')
        .order('created_at', { ascending: false })
      ownerMessages = owners || []
      query = query
        .not('visitor_id', 'like', 'owner\\_%')
        .order('likes', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else {
      // sort === 'time' (默认)
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({
      data: page === 1 ? [...ownerMessages, ...(data || [])] : data || [],
      total: (count || 0) + ownerMessages.length,
      hasMore: (page * pageSize) < (count || 0),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return errorResponse('Internal server error', 500)
  }
}

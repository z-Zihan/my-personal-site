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

    // 最新 / 热门排序模式：使用 Supabase 查询
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })

    if (sort === 'hot') {
      query = query
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
      data: data || [],
      total: count || 0,
      hasMore: (page * pageSize) < (count || 0),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return errorResponse('Internal server error', 500)
  }
}
